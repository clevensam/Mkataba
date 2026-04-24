import { Link, useNavigate } from "react-router-dom";
import { Button } from "antd";
import { TeamOutlined, LogoutOutlined } from "@ant-design/icons";
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
            <TeamOutlined className="text-white" style={{ fontSize: 24 }} />
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900">Trustfy</span>
        </Link>

        {user ? (
          <div className="flex items-center gap-3">
            <Button 
              onClick={handleLogout}
              icon={<LogoutOutlined />}
              size="small"
            >
              <span className="hidden sm:inline">Logout</span>
            </Button>
            <div className="h-8 w-[1px] bg-slate-100 mx-1" />
            <Link to="/profile" className="flex items-center gap-2 group">
              <div className="w-9 h-9 md:w-10 md:h-10 bg-brand-100 rounded-xl flex items-center justify-center text-brand-600 font-bold border border-brand-200 group-hover:scale-105 transition-transform text-sm md:text-base">
                {user?.displayName?.[0] || user?.email?.[0]?.toUpperCase()}
              </div>
            </Link>
          </div>
        ) : (
          <nav className="flex items-center gap-8">
            <div className="hidden md:flex items-center gap-8">
              <Link to="/login" className="text-slate-600 hover:text-brand-600 font-medium transition-colors">
                Login
              </Link>
              <Link to="/register">
                <Button type="primary">Get Started</Button>
              </Link>
            </div>
            <div className="md:hidden">
              <Link to="/login">
                <Button type="primary" size="small">Sign In</Button>
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}