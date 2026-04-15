import { useState, useEffect } from "react";
import { seedTemplates } from "../services/seedService";
import { Database, Upload, FileText, CheckCircle, Loader2 } from "lucide-react";

import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate, Link } from "react-router-dom";

export default function AdminDashboard() {
  const [seeding, setSeeding] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user || user.email !== "clevensamwel@gmail.com") {
        // Only allow the owner for now if they aren't marked as ADMIN in DB
        // navigate("/"); 
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleSeed = async () => {
    setSeeding(true);
    setMessage("");
    try {
      const seeded = await seedTemplates();
      if (seeded) {
        setMessage("Templates seeded successfully!");
      } else {
        setMessage("Templates already exist in the database.");
      }
    } catch (error) {
      setMessage("Error seeding templates.");
      console.error(error);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-900 mb-12 tracking-tight">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
            <div className="bg-brand-100 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
              <Database className="text-brand-600 w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Seed Data</h3>
            <p className="text-slate-600 mb-6">Initialize the database with default contract templates.</p>
            <button 
              onClick={handleSeed}
              disabled={seeding}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Seed Templates
            </button>
            {message && <p className="mt-4 text-sm font-medium text-brand-600">{message}</p>}
          </div>

          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
            <div className="bg-teal-100 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
              <FileText className="text-teal-600 w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Manage Templates</h3>
            <p className="text-slate-600 mb-6">Create, edit, upload, or delete contract templates.</p>
            <Link to="/admin/templates" className="btn-secondary w-full flex items-center justify-center">
              Manage Templates
            </Link>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm opacity-50 cursor-not-allowed">
            <div className="bg-amber-100 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
              <CheckCircle className="text-amber-600 w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Review Queue</h3>
            <p className="text-slate-600 mb-6">Review and approve contracts submitted by users.</p>
            <button disabled className="btn-secondary w-full">Coming Soon</button>
          </div>
        </div>
      </div>
    </div>
  );
}
