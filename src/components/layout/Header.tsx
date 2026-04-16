import { Link, useNavigate } from "react-router-dom";
import { Handshake, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { auth } from "../../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-brand-600 p-2 rounded-lg group-hover:rotate-12 transition-transform">
            <Handshake className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900">Trustfy</span>
        </Link>

        {user ? (
          <div className="flex items-center gap-4">
            <button 
              onClick={handleLogout}
              className="md:hidden flex items-center gap-2 text-slate-600 font-bold text-sm bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 hover:text-red-600 transition-colors"
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        ) : (
          <nav className="flex items-center gap-8">
            <div className="hidden md:flex items-center gap-8">
              <Link to="/login" className="text-slate-600 hover:text-brand-600 font-medium transition-colors">
                Login
              </Link>
              <Link to="/register" className="btn-primary">
                Get Started
              </Link>
            </div>
            <div className="md:hidden">
              <Link to="/login" className="btn-primary text-sm px-6 py-2.5">
                Sign In
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
