import { Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { AdminLogin } from "../components/admin/AdminLogin";
import { AdminDashboard } from "../components/admin/AdminDashboard";

export default function AdminPage() {
  const { user } = useAuth();

  if (user === null) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center" data-testid="admin-auth-checking">
        <Loader2 size={28} className="animate-spin text-[#00F0FF]" />
      </div>
    );
  }
  return user ? <AdminDashboard /> : <AdminLogin />;
}
