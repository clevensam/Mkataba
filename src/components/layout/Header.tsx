import { Link } from "react-router-dom";
import { Handshake } from "lucide-react";
import { useState, useEffect } from "react";
import { auth } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function Header() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  // If user is logged in, the Sidebar/BottomBar handles navigation
  if (user) return null;

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-brand-600 p-2 rounded-lg group-hover:rotate-12 transition-transform">
            <Handshake className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900">Trustfy</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link to="/templates" className="text-slate-600 hover:text-brand-600 font-medium transition-colors">
            Templates
          </Link>
          <Link to="/login" className="text-slate-600 hover:text-brand-600 font-medium transition-colors">
            Login
          </Link>
          <Link to="/register" className="btn-primary">
            Get Started
          </Link>
        </nav>

        <div className="md:hidden">
          <Link to="/login" className="btn-primary text-sm">
            Sign In
          </Link>
        </div>
      </div>
    </header>
  );
}
