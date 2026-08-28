import "@/App.css";
import { ReactLenis } from "lenis/react";
import { Toaster } from "sonner";
import { Nav } from "@/components/site/Nav";
import { Hero } from "@/components/site/Hero";
import { Marquee } from "@/components/site/Marquee";
import { Manifesto } from "@/components/site/Manifesto";
import { Services } from "@/components/site/Services";
import { Pricing } from "@/components/site/Pricing";
import { About } from "@/components/site/About";
import { BookingForm } from "@/components/site/BookingForm";
import { Footer } from "@/components/site/Footer";

function App() {
  return (
    <ReactLenis root options={{ lerp: 0.08, smoothWheel: true }}>
      <div className="App bg-[#050505] text-zinc-100">
        <Nav />
        <main>
          <Hero />
          <Marquee />
          <Manifesto />
          <Services />
          <Pricing />
          <About />
          <BookingForm />
        </main>
        <Footer />
        <Toaster theme="dark" position="bottom-right" />
      </div>
    </ReactLenis>
  );
}

export default App;
