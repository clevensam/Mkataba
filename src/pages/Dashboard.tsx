import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import { collection, query, where, getDocs, getDoc, orderBy, deleteDoc, doc, updateDoc, limit } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { 
  FileText, 
  Plus, 
  Edit3, 
  Download, 
  Trash2, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  ChevronRight,
  Share2,
  X,
  Layout,
  FileCheck,
  FileClock,
  ArrowRight,
  Sparkles,
  Search,
  Settings
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { format } from "date-fns";
import { downloadContractPDF, downloadBlankTemplate } from "../services/pdfService";

export default function Dashboard() {
  const [contracts, setContracts] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleDownloadContract = async (contract: any) => {
    setIsDownloading(contract.id);
    try {
      const templateDoc = await getDoc(doc(db, "templates", contract.templateId));
      if (templateDoc.exists()) {
        const templateData = templateDoc.data();
        await downloadContractPDF(
          templateData.title, 
          templateData.htmlContent, 
          JSON.parse(contract.filledData)
        );
      } else {
        alert("Template not found for this contract.");
      }
    } catch (error) {
      console.error("Error downloading contract:", error);
    } finally {
      setIsDownloading(null);
    }
  };

  const makeAdmin = async () => {
    if (!user) return;
    setIsUpdating(true);
    try {
      await updateDoc(doc(db, "users", user.uid), { role: "ADMIN" });
      alert("You are now an Admin! Please refresh the page.");
      window.location.reload();
    } catch (error) {
      console.error("Error making admin:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (!u) navigate("/login");
      setUser(u);
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setLoading(true);
      try {
        // Fetch Contracts
        const contractsQuery = query(
          collection(db, "contracts"), 
          where("userId", "==", user.uid),
          orderBy("updatedAt", "desc"),
          limit(5)
        );
        const contractsSnapshot = await getDocs(contractsQuery);
        setContracts(contractsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        // Fetch Recent Templates
        const templatesQuery = query(
          collection(db, "templates"),
          where("published", "==", true),
          orderBy("createdAt", "desc"),
          limit(4)
        );
        const templatesSnapshot = await getDocs(templatesQuery);
        setTemplates(templatesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "contracts", id));
      setContracts(prev => prev.filter(c => c.id !== id));
      setDeleteConfirmId(null);
    } catch (error) {
      console.error("Error deleting contract:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "signed":
        return <span className="px-2.5 py-1 bg-teal-100 text-teal-700 text-[10px] font-bold uppercase rounded-full flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Signed</span>;
      case "pending_review":
        return <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-[10px] font-bold uppercase rounded-full flex items-center gap-1"><Clock className="w-3 h-3" /> Pending Review</span>;
      case "approved":
        return <span className="px-2.5 py-1 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded-full flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Approved</span>;
      default:
        return <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase rounded-full flex items-center gap-1"><Edit3 className="w-3 h-3" /> Draft</span>;
    }
  };

  const stats = [
    { label: "Total Contracts", value: contracts.length, icon: FileText, color: "text-brand-600", bg: "bg-brand-50" },
    { label: "Signed", value: contracts.filter(c => c.status === "signed").length, icon: FileCheck, color: "text-teal-600", bg: "bg-teal-50" },
    { label: "Drafts", value: contracts.filter(c => c.status === "draft" || !c.status).length, icon: FileClock, color: "text-amber-600", bg: "bg-amber-50" },
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Dashboard Top Header */}
      <div className="bg-white border-b border-slate-200 px-6 md:px-10 py-4 sticky top-0 z-30">
        <div className="w-full max-w-7xl mx-auto flex items-center justify-between">
          <div className="hidden md:block">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Dashboard</h2>
          </div>
          <div className="flex items-center gap-4 ml-auto">
            <div className="h-8 w-[1px] bg-slate-200 mx-2" />
            <Link to="/profile" className="flex items-center gap-3 pl-2 group">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                  {user?.displayName || user?.email?.split('@')[0]}
                </p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {user?.email}
                </p>
              </div>
              <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center text-brand-600 font-bold border border-brand-200 group-hover:scale-105 transition-transform">
                {user?.displayName?.[0] || user?.email?.[0]?.toUpperCase()}
              </div>
            </Link>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-10">
        <div className="w-full max-w-7xl mx-auto">
          {/* Welcome Header */}
        <header className="mb-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-brand-600 font-bold text-sm mb-2">
                Welcome Back
              </div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2 tracking-tight">
                Hello, {user?.displayName || user?.email?.split('@')[0] || "User"}
              </h1>
              <p className="text-slate-600">Here's what's happening with your contracts today.</p>
              {user?.email === "clevensamwel@gmail.com" && (
                <button 
                  onClick={makeAdmin}
                  disabled={isUpdating}
                  className="mt-4 text-xs bg-brand-100 text-brand-700 px-3 py-1 rounded-full font-bold hover:bg-brand-200 transition-colors"
                >
                  {isUpdating ? "Updating..." : "Verify Admin Status"}
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Link to="/templates" className="btn-primary flex items-center gap-2 px-6 py-3 shadow-lg shadow-brand-200">
                <Plus className="w-5 h-5" /> New Contract
              </Link>
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {stats.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center gap-5"
            >
              <div className={`${stat.bg} p-4 rounded-2xl`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Recent Activity */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">Recent Activity</h2>
              {contracts.length > 0 && (
                <button className="text-brand-600 font-bold text-sm hover:underline flex items-center gap-1">
                  View All <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>

            {loading ? (
              <div className="bg-white rounded-3xl p-12 flex flex-col items-center justify-center border border-slate-200">
                <Loader2 className="w-10 h-10 text-brand-600 animate-spin mb-4" />
                <p className="text-slate-500">Loading activity...</p>
              </div>
            ) : contracts.length > 0 ? (
              <div className="space-y-4">
                {contracts.map((contract, idx) => (
                  <motion.div
                    key={contract.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="bg-slate-50 p-3 rounded-xl group-hover:bg-brand-50 transition-colors">
                          <FileText className="w-6 h-6 text-slate-400 group-hover:text-brand-600 transition-colors" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                            Contract #{contract.id.slice(-6).toUpperCase()}
                          </h3>
                          <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                            <span>{contract.updatedAt ? format(contract.updatedAt.toDate(), "MMM d, yyyy") : "Just now"}</span>
                            <span>•</span>
                            {getStatusBadge(contract.status)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link 
                          to={`/contracts/${contract.id}/edit`}
                          className="p-2 hover:bg-brand-50 rounded-lg transition-colors text-slate-400 hover:text-brand-600"
                          title="Edit"
                        >
                          <Edit3 className="w-5 h-5" />
                        </Link>
                        <button 
                          type="button"
                          onClick={() => setDeleteConfirmId(contract.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors text-slate-400 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 border-dashed">
                <FileText className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-500">No recent activity found.</p>
              </div>
            )}
          </div>

          {/* Quick Actions & Templates */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Quick Templates</h2>
              <div className="space-y-4">
                {templates.map((template, idx) => (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + (idx * 0.1) }}
                    className="bg-white rounded-2xl p-4 border border-slate-200 hover:border-brand-300 transition-all group"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="bg-brand-50 p-2 rounded-lg">
                        <Layout className="w-4 h-4 text-brand-600" />
                      </div>
                      <button 
                        onClick={() => downloadBlankTemplate(template.title, template.htmlContent)}
                        className="text-slate-400 hover:text-brand-600 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                    <h4 className="font-bold text-slate-900 mb-1 line-clamp-1">{template.title}</h4>
                    <p className="text-xs text-slate-500 mb-4 line-clamp-2">{template.description}</p>
                    <Link 
                      to={`/contracts/new/${template.id}`}
                      className="text-xs font-bold text-brand-600 flex items-center gap-1 hover:underline"
                    >
                      Use this template <ArrowRight className="w-3 h-3" />
                    </Link>
                  </motion.div>
                ))}
                <Link 
                  to="/templates"
                  className="flex items-center justify-center gap-2 w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all"
                >
                  Browse All Templates <Search className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setDeleteConfirmId(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl text-center"
            >
              <div className="bg-red-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Delete Contract?</h2>
              <p className="text-slate-600 mb-8">
                Are you sure you want to delete this contract? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeleteConfirmId(null)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleDelete(deleteConfirmId)}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl flex-1 transition-all"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}
