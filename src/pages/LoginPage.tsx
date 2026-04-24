import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { Button, Input, message } from "antd";
import { 
  FileTextOutlined, 
  MailOutlined, 
  LockOutlined, 
  ArrowRightOutlined 
} from "@ant-design/icons";
import { motion } from "motion/react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      message.success("Welcome back!");
      navigate("/dashboard");
    } catch (err: any) {
      message.error("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
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
      message.success("Welcome back!");
      navigate("/dashboard");
    } catch (err: any) {
      console.error("Google Login Error:", err);
      if (err.code === "auth/unauthorized-domain") {
        message.error("This domain is not authorized in Firebase. Please add your Vercel URL to 'Authorized domains' in Firebase Console.");
      } else {
        message.error(err.message || "Google sign-in failed. Please try again.");
      }
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
            <FileTextOutlined className="text-brand-600 w-7 h-7" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome Back</h1>
          <p className="text-slate-500 mt-2 text-sm sm:text-base">Sign in to manage your contracts.</p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={handleGoogleLogin}
            loading={loading}
            size="large"
            className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-white border border-slate-200 rounded-2xl font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" referrerPolicy="no-referrer" />
            Continue with Google
          </Button>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold text-slate-400">
              <span className="bg-white px-4">Or email</span>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 ml-1">Email Address</label>
              <Input
                type="email"
                required
                size="large"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                prefix={<MailOutlined className="text-slate-400" />}
                placeholder="name@company.com"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 ml-1">Password</label>
              <Input.Password
                required
                size="large"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                prefix={<LockOutlined className="text-slate-400" />}
                placeholder="••••••••"
              />
            </div>

            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              block
              icon={<ArrowRightOutlined />}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </div>

        <p className="text-center text-slate-500 mt-10 text-sm">
          Don't have an account?{" "}
          <Link to="/register" className="text-brand-600 font-bold hover:text-brand-700 transition-colors">
            Register Now
          </Link>
        </p>
      </motion.div>
    </div>
  );
}