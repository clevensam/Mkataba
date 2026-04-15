import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useState, useEffect } from "react";
import { FileText, User, LogOut, LayoutDashboard, ShieldCheck } from "lucide-react";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          setRole(userDoc.data().role);
        } else if (currentUser.email === "clevensamwel@gmail.com") {
          setRole("ADMIN");
        }
      } else {
        setRole(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <nav className="glass sticky top-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-brand-600 p-2 rounded-lg group-hover:rotate-12 transition-transform">
            <FileText className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900">Mikataba</span>
        </Link>

        <div className="flex items-center gap-6">
          <Link to="/templates" className="text-slate-600 hover:text-brand-600 font-medium transition-colors">
            Templates
          </Link>
          
          {user ? (
            <div className="flex items-center gap-4">
              <Link to="/dashboard" className="flex items-center gap-2 text-slate-600 hover:text-brand-600 font-medium transition-colors">
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              
              {role === "ADMIN" && (
                <Link to="/admin" className="flex items-center gap-2 text-slate-600 hover:text-brand-600 font-medium transition-colors">
                  <ShieldCheck className="w-4 h-4" />
                  Admin
                </Link>
              )}
              
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 text-slate-600 hover:text-red-600 font-medium transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="btn-secondary">
                Login
              </Link>
              <Link to="/register" className="btn-primary">
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
