import { FileText, Mail, Phone, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import { auth } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function Footer() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  if (user) return null;

  return (
    <footer className="bg-slate-900 text-slate-400 py-12 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center gap-2 mb-6">
            <FileText className="text-brand-500 w-6 h-6" />
            <span className="text-2xl font-bold text-white tracking-tight">Mikataba</span>
          </div>
          <p className="max-w-md mb-6">
            Empowering Tanzanians with legally structured, easy-to-use contract templates. 
            Create, sign, and manage your agreements professionally.
          </p>
        </div>
        
        <div>
          <h4 className="text-white font-semibold mb-6">Platform</h4>
          <ul className="space-y-4">
            <li><a href="/templates" className="hover:text-brand-400 transition-colors">Templates</a></li>
            <li><a href="/dashboard" className="hover:text-brand-400 transition-colors">Dashboard</a></li>
            <li><a href="/register" className="hover:text-brand-400 transition-colors">Get Started</a></li>
          </ul>
        </div>
        
        <div>
          <h4 className="text-white font-semibold mb-6">Contact</h4>
          <ul className="space-y-4">
            <li className="flex items-center gap-2"><Mail className="w-4 h-4" /> info@mikataba.co.tz</li>
            <li className="flex items-center gap-2"><Phone className="w-4 h-4" /> +255 123 456 789</li>
            <li className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Dar es Salaam, Tanzania</li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-slate-800 text-center text-sm">
        <p>© 2026 Mikataba Platform. All rights reserved.</p>
      </div>
    </footer>
  );
}
