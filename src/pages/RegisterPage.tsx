import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { FileText, Mail, Lock, User as UserIcon, ArrowRight } from "lucide-react";
import { motion } from "motion/react";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        username,
        email,
        role: email === "clevensamwel@gmail.com" ? "ADMIN" : "USER",
        createdAt: serverTimestamp(),
      });

      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setError("");
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, "users", user.uid), {
          username: user.displayName || user.email?.split('@')[0] || "User",
          email: user.email,
          role: user.email === "clevensamwel@gmail.com" ? "ADMIN" : "USER",
          createdAt: serverTimestamp(),
        });
      }
      navigate("/dashboard");
    } catch (err: any) {
      setError("Google registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 sm:p-6 bg-slate-50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl shadow-slate-200/60 p-6 sm:p-10 border border-slate-100"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-50 rounded-2xl mb-4 shadow-sm">
            <FileText className="text-brand-600 w-7 h-7" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Create Account</h1>
          <p className="text-slate-500 mt-2 text-sm sm:text-base">Start generating professional contracts.</p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm mb-6 border border-red-100 flex items-center gap-3"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0" />
            {error}
          </motion.div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleGoogleRegister}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-white border border-slate-200 rounded-2xl font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" referrerPolicy="no-referrer" />
            Continue with Google
          </button>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold text-slate-400">
              <span className="bg-white px-4">Or email</span>
            </div>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 ml-1">Username</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all"
                  placeholder="johndoe"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all"
                  placeholder="••••••••"
                  minLength={8}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-brand-600 text-white rounded-2xl font-bold shadow-lg shadow-brand-200 hover:bg-brand-700 hover:shadow-brand-300 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Register"}
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </div>

        <p className="text-center text-slate-500 mt-10 text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-brand-600 font-bold hover:text-brand-700 transition-colors">
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
