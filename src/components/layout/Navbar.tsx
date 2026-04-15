import { Link, useNavigate, useLocation } from "react-router-dom";
import { auth, db } from "../../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useState, useEffect } from "react";
import { 
  FileText, 
  LogOut, 
  LayoutDashboard, 
  ShieldCheck, 
  Menu, 
  ChevronLeft, 
  ChevronRight,
  Home,
  Layers,
  Settings,
  PlusCircle,
  User
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

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

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "My Contracts", path: "/my-contracts", icon: FileText },
    { name: "Templates", path: "/templates", icon: Layers },
    { name: "Profile", path: "/profile", icon: User },
    ...(role === "ADMIN" ? [{ name: "Admin", path: "/admin", icon: ShieldCheck }] : []),
  ];

  const isActive = (path: string) => location.pathname === path;

  // Only show sidebar/bottom bar if logged in
  if (!user) return null;

  return (
    <>
      {/* Desktop Sidebar */}
      <aside 
        className={`hidden md:flex flex-col fixed left-0 top-0 h-screen bg-white border-r border-slate-200 transition-all duration-300 z-50 ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        <div className="p-6 flex items-center justify-between">
          {!isCollapsed && (
            <Link to="/dashboard" className="flex items-center gap-2 group">
              <div className="bg-brand-600 p-2 rounded-lg group-hover:rotate-12 transition-transform">
                <FileText className="text-white w-6 h-6" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">Mikataba</span>
            </Link>
          )}
          {isCollapsed && (
            <div className="bg-brand-600 p-2 rounded-lg mx-auto">
              <FileText className="text-white w-6 h-6" />
            </div>
          )}
        </div>

        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-20 bg-white border border-slate-200 rounded-full p-1 text-slate-400 hover:text-brand-600 shadow-sm transition-colors"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        <nav className="flex-grow px-3 mt-8 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                isActive(item.path)
                  ? "bg-brand-50 text-brand-600"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <item.icon size={22} className={isActive(item.path) ? "text-brand-600" : "text-slate-400"} />
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          {user ? (
            <button
              onClick={handleLogout}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all ${
                isCollapsed ? "justify-center" : ""
              }`}
            >
              <LogOut size={22} />
              {!isCollapsed && <span>Logout</span>}
            </button>
          ) : (
            <div className="space-y-2">
              <Link
                to="/login"
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-slate-600 hover:bg-slate-50 transition-all ${
                  isCollapsed ? "justify-center" : ""
                }`}
              >
                <User size={22} />
                {!isCollapsed && <span>Login</span>}
              </Link>
              {!isCollapsed && (
                <Link
                  to="/register"
                  className="w-full btn-primary flex items-center justify-center gap-2"
                >
                  Get Started
                </Link>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Bottom App Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 z-50 flex justify-between items-center">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center gap-1 transition-all ${
              isActive(item.path) ? "text-brand-600" : "text-slate-400"
            }`}
          >
            <item.icon size={24} />
            <span className="text-[10px] font-bold uppercase tracking-wider">{item.name}</span>
          </Link>
        ))}
        {user ? (
          <button
            onClick={handleLogout}
            className="flex flex-col items-center gap-1 text-slate-400"
          >
            <LogOut size={24} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Exit</span>
          </button>
        ) : (
          <Link
            to="/login"
            className="flex flex-col items-center gap-1 text-slate-400"
          >
            <User size={24} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Login</span>
          </Link>
        )}
      </nav>

      {/* Spacer for desktop sidebar */}
      {user && <div className={`hidden md:block transition-all duration-300 ${isCollapsed ? "w-20" : "w-64"}`} />}
    </>
  );
}
