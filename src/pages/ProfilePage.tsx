import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged, updateProfile } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { User, Mail, Shield, Save, Loader2, Camera } from "lucide-react";
import { motion } from "motion/react";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        setDisplayName(u.displayName || "");
        const userDoc = await getDoc(doc(db, "users", u.uid));
        if (userDoc.exists()) {
          setRole(userDoc.data().role);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setMessage({ type: "", text: "" });
    try {
      await updateProfile(user, { displayName });
      await updateDoc(doc(db, "users", user.uid), {
        displayName,
        updatedAt: new Date()
      });
      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({ type: "error", text: "Failed to update profile." });
    } finally {
      setSaving(false);
    }
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
      <div className="max-w-3xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-bold text-slate-900 mb-2 tracking-tight">Account Settings</h1>
          <p className="text-slate-600">Manage your personal information and security preferences.</p>
        </header>

        <div className="grid grid-cols-1 gap-8">
          {/* Profile Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm"
          >
            <div className="flex flex-col md:flex-row items-center gap-8 mb-10 pb-10 border-b border-slate-100">
              <div className="relative">
                <div className="w-32 h-32 bg-brand-100 rounded-full flex items-center justify-center text-brand-600 text-4xl font-bold border-4 border-white shadow-md">
                  {user?.displayName?.[0] || user?.email?.[0]?.toUpperCase()}
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-white border border-slate-200 rounded-full shadow-sm hover:bg-slate-50 transition-colors">
                  <Camera className="w-5 h-5 text-slate-600" />
                </button>
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

            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 ml-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-transparent rounded-xl focus:bg-white focus:border-brand-500 outline-none transition-all"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      type="email"
                      value={user?.email}
                      disabled
                      className="w-full pl-10 pr-4 py-3 bg-slate-100 border border-transparent rounded-xl text-slate-500 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2 ml-1">Email cannot be changed manually.</p>
                </div>
              </div>

              {message.text && (
                <div className={`p-4 rounded-xl text-sm font-medium ${
                  message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                }`}>
                  {message.text}
                </div>
              )}

              <div className="pt-4">
                <button 
                  type="submit"
                  disabled={saving}
                  className="btn-primary px-8 py-3 flex items-center gap-2"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  Save Changes
                </button>
              </div>
            </form>
          </motion.div>

          {/* Security Card */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Security</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <p className="font-bold text-slate-900">Password</p>
                  <p className="text-sm text-slate-500">Last changed 3 months ago</p>
                </div>
                <button className="text-brand-600 font-bold text-sm hover:underline">Change Password</button>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <p className="font-bold text-slate-900">Two-Factor Authentication</p>
                  <p className="text-sm text-slate-500">Add an extra layer of security</p>
                </div>
                <button className="text-brand-600 font-bold text-sm hover:underline">Enable</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
