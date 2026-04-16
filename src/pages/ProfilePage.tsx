import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { Mail, Shield, Loader2, LogOut } from "lucide-react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        const userDoc = await getDoc(doc(db, "users", u.uid));
        if (userDoc.exists()) {
          setRole(userDoc.data().role);
        }
      } else {
        navigate("/login");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="w-10 h-10 text-brand-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen p-6 md:p-10">
      <div className="max-w-3xl mx-auto pb-20 md:pb-0">
        <header className="mb-10">
          <h1 className="text-4xl font-bold text-slate-900 mb-2 tracking-tight">My Profile</h1>
          <p className="text-slate-600">Your personal account information.</p>
        </header>

        <div className="grid grid-cols-1 gap-8">
          {/* Profile Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm"
          >
            <div className="flex flex-col md:flex-row items-center gap-8 mb-10 pb-10 border-b border-slate-100">
              <div className="w-32 h-32 bg-brand-100 rounded-full flex items-center justify-center text-brand-600 text-4xl font-bold border-4 border-white shadow-md">
                {user?.displayName?.[0] || user?.email?.[0]?.toUpperCase()}
              </div>
              <div className="text-center md:text-left">
                <h2 className="text-2xl font-bold text-slate-900 mb-1">{user?.displayName || "User"}</h2>
                <p className="text-slate-500 mb-3">{user?.email}</p>
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <span className="px-3 py-1 bg-brand-50 text-brand-700 text-xs font-bold uppercase rounded-full flex items-center gap-1">
                    <Shield className="w-3 h-3" /> {role || "User"}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Email Address</p>
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <Mail className="w-5 h-5 text-slate-400" />
                  <p className="font-medium text-slate-900">{user?.email}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Account Role</p>
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <Shield className="w-5 h-5 text-slate-400" />
                  <p className="font-medium text-slate-900">{role || "Standard User"}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Member Since</p>
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <Loader2 className="w-5 h-5 text-slate-400 shrink-0" />
                  <p className="font-medium text-slate-900 truncate">
                    {user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : "N/A"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-10 pt-10 border-t border-slate-100 hidden md:block">
              <button 
                onClick={handleLogout}
                className="flex items-center gap-3 px-8 py-4 bg-red-50 text-red-600 font-bold rounded-2xl hover:bg-red-100 transition-all"
              >
                <LogOut size={22} /> Sign Out of Account
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
