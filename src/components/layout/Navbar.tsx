import { Link, useNavigate, useLocation } from "react-router-dom";
import { auth, db } from "../../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useState, useEffect } from "react";
import { Button } from "antd";
import { 
  FileTextOutlined, 
  LogoutOutlined, 
  DashboardOutlined, 
  SafetyOutlined, 
  MenuOutlined, 
  LeftOutlined, 
  RightOutlined,
  AppstoreOutlined,
  SettingOutlined,
  UserOutlined,
  TeamOutlined
} from "@ant-design/icons";
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
    { name: "Dashboard", path: "/dashboard", icon: DashboardOutlined },
    { name: "My Contracts", path: "/my-contracts", icon: FileTextOutlined },
    { name: "Templates", path: "/templates", icon: AppstoreOutlined },
    { name: "Profile", path: "/profile", icon: UserOutlined },
    ...(role === "ADMIN" ? [{ name: "Admin", path: "/admin", icon: SafetyOutlined }] : []),
  ];

  const isActive = (path: string) => location.pathname === path;

  if (!user) return null;

  return (
    <>
      <aside 
        className={`hidden md:flex flex-col fixed left-0 top-0 h-screen bg-white border-r border-slate-200 transition-all duration-300 z-50 ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        <div className="p-6 flex items-center justify-between">
          {!isCollapsed && (
            <Link to="/dashboard" className="flex items-center gap-2 group">
              <div className="bg-brand-600 p-2 rounded-lg group-hover:rotate-12 transition-transform">
                <TeamOutlined className="text-white" style={{ fontSize: 24 }} />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">Trustfy</span>
            </Link>
          )}
          {isCollapsed && (
            <div className="bg-brand-600 p-2 rounded-lg mx-auto">
              <TeamOutlined className="text-white" style={{ fontSize: 24 }} />
            </div>
          )}
        </div>

        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-20 bg-white border border-slate-200 rounded-full p-1 text-slate-400 hover:text-brand-600 shadow-sm transition-colors"
        >
          {isCollapsed ? <RightOutlined /> : <LeftOutlined />}
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
              <item.icon style={{ fontSize: 22 }} className={isActive(item.path) ? "text-brand-600" : "text-slate-400"} />
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
              <LogoutOutlined style={{ fontSize: 22 }} />
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
                <UserOutlined style={{ fontSize: 22 }} />
                {!isCollapsed && <span>Login</span>}
              </Link>
              {!isCollapsed && (
                <Link
                  to="/register"
                  className="w-full"
                >
                  <Button type="primary" block>Get Started</Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </aside>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 z-50 flex justify-between items-center">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center gap-1 transition-all ${
              isActive(item.path) ? "text-brand-600" : "text-slate-400"
            }`}
          >
            <item.icon style={{ fontSize: 24 }} />
            <span className="text-[10px] font-bold uppercase tracking-wider">{item.name}</span>
          </Link>
        ))}
      </nav>

      {user && <div className={`hidden md:block transition-all duration-300 ${isCollapsed ? "w-20" : "w-64"}`} />}
    </>
  );
}