import os
import re
import ipaddress
import logging
import httpx
from html import escape
from html.parser import HTMLParser
from urllib.parse import urlparse
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

EMAIL_BASE_URL = "https://integrations.emergentagent.com"
EMAIL_KEY = os.environ["EMERGENT_EMAIL_KEY"]
EMAIL_FROM_NAME = os.environ["EMAIL_FROM_NAME"]
EMAIL_REPLY_TO = os.environ.get("EMAIL_REPLY_TO")
OWNER_EMAIL = os.environ["OWNER_EMAIL"]

_SHORTENERS = ("bit.ly", "tinyurl.com", "t.co", "is.gd", "cutt.ly", "goo.gl", "rebrand.ly")
_CRED_ASK = ("reply with your password", "reply with the code", "send your password", "cvv",
             "send us your password", "enter your password below", "confirm your card number",
             "your full card number", "seed phrase", "recovery phrase", "verify your card",
             "social security number", "confirm your bank details")
_HOSTISH = re.compile(r"\b(?:https?://)?((?:[a-z0-9-]+\.)+[a-z]{2,})", re.I)


def _host_ok(host: str) -> bool:
    if not host or "xn--" in host:
        return False
    try:
        ipaddress.ip_address(host)
        return False
    except ValueError:
        pass
    return not any(host == s or host.endswith("." + s) for s in _SHORTENERS)


def _same_site(shown: str, real: str) -> bool:
    return shown == real or real.endswith("." + shown) or shown.endswith("." + real)


class _EmailScan(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tags, self.urls, self.anchors = set(), [], []
        self._href, self._text = None, []

    def handle_starttag(self, tag, attrs):
        self.tags.add(tag.lower())
        self.urls += [v for k, v in attrs if k.lower() in ("href", "src") and v]
        if tag.lower() == "a":
            self._href = dict((k.lower(), v) for k, v in attrs).get("href")
            self._text = []

    def handle_data(self, data):
        if self._href is not None:
            self._text.append(data)

    def handle_endtag(self, tag):
        if tag.lower() == "a" and self._href is not None:
            self.anchors.append((self._href, "".join(self._text)))
            self._href, self._text = None, []


def _assert_safe_email(subject: str, html: str) -> None:
    scan = _EmailScan(); scan.feed(html)
    if scan.tags & {"form", "input", "textarea", "select"}:
        raise ValueError("No forms or input fields in email (G2)")
    body = f"{subject}\n{html}".lower()
    for p in _CRED_ASK:
        if p in body:
            raise ValueError(f"Email asks the recipient for credentials: {p!r} (G2)")
    for url in scan.urls:
        low = url.strip().lower()
        if low.startswith(("mailto:", "tel:", "cid:", "#")):
            continue
        if not low.startswith("https://"):
            raise ValueError(f"Email links/assets must be absolute https: {url!r} (G3)")
        host = urlparse(low).hostname or ""
        if not _host_ok(host) or urlparse(low).username is not None:
            raise ValueError(f"Shortened, numeric-host or credential-bearing URL: {url!r} (G3)")
    for href, text in scan.anchors:
        real = urlparse(href.strip().lower()).hostname or ""
        if not real:
            continue
        for m in _HOSTISH.finditer(text):
            if not _same_site(m.group(1).lower(), real):
                raise ValueError(f"Anchor text {m.group(1)!r} != real link host {real!r} (G3)")


async def send_email(*, to: str, subject: str, html: str) -> str | None:
    _assert_safe_email(subject, html)
    payload = {"to": [to], "subject": subject, "html": html, "from_name": EMAIL_FROM_NAME}
    if EMAIL_REPLY_TO:
        payload["contact_email"] = EMAIL_REPLY_TO
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            f"{EMAIL_BASE_URL}/api/v1/email/send",
            headers={"X-Email-Key": EMAIL_KEY},
            json=payload,
        )
    resp.raise_for_status()
    return resp.json().get("id")


def _row(label: str, value: str) -> str:
    return (f'<tr><td style="padding:8px 12px;font-family:monospace;font-size:11px;'
            f'text-transform:uppercase;letter-spacing:1px;color:#888;width:140px">{escape(label)}</td>'
            f'<td style="padding:8px 12px;font-family:Arial,sans-serif;font-size:14px;color:#111">{escape(value)}</td></tr>')


async def send_new_booking_alert(booking: dict) -> None:
    """Fire-and-forget owner notification. Never raises into the request path."""
    try:
        subject = f"New quote request — {booking.get('service', 'Repair')} ({booking.get('name', 'Unknown')})"
        rows = "".join([
            _row("Name", booking.get("name", "")),
            _row("Email", booking.get("email", "")),
            _row("Phone", booking.get("phone", "") or "—"),
            _row("Device", booking.get("device_type", "")),
            _row("Service", booking.get("service", "")),
            _row("Preferred date", booking.get("preferred_date") or "—"),
            _row("Message", booking.get("message", "") or "—"),
        ])
        html = (f'<table role="presentation" width="100%" style="max-width:600px;border-collapse:collapse">'
                f'<tr><td style="padding:24px 12px;font-family:Arial,sans-serif">'
                f'<p style="font-size:16px;font-weight:bold;margin:0 0 4px">New quote request received</p>'
                f'<p style="font-size:13px;color:#666;margin:0">Sign in to your {escape(EMAIL_FROM_NAME)} owner dashboard to review and reply.</p>'
                f'</td></tr>{rows}'
                f'<tr><td colspan="2" style="padding:16px 12px;font-size:12px;color:#888;font-family:Arial,sans-serif">'
                f'Sent by {escape(EMAIL_FROM_NAME)}. We never ask for your password or card details by email.</td></tr>'
                f'</table>')
        email_id = await send_email(to=OWNER_EMAIL, subject=subject, html=html)
        logger.info(f"Booking alert email sent to owner (id={email_id})")
    except Exception as e:
        logger.error(f"Booking alert email failed (booking still saved): {e}")
