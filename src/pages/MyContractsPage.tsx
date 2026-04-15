import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { db, auth } from "../firebase";
import { collection, query, where, getDocs, getDoc, orderBy, deleteDoc, doc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { 
  FileText, 
  Edit3, 
  Download, 
  Trash2, 
  Clock, 
  CheckCircle2, 
  Loader2,
  Search,
  Filter,
  Share2,
  Plus
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { format } from "date-fns";

import { downloadContractPDF } from "../services/pdfService";

export default function MyContractsPage() {
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (!u) navigate("/login");
      setUser(u);
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const fetchContracts = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const q = query(
          collection(db, "contracts"), 
          where("userId", "==", user.uid),
          orderBy("updatedAt", "desc")
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setContracts(data);
      } catch (error) {
        console.error("Error fetching contracts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContracts();
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
      default:
        return <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase rounded-full flex items-center gap-1"><Edit3 className="w-3 h-3" /> Draft</span>;
    }
  };

  const filteredContracts = contracts.filter(c => {
    const matchesFilter = filter === "all" || (filter === "draft" && (!c.status || c.status === "draft")) || c.status === filter;
    const matchesSearch = c.id.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="bg-slate-50 min-h-screen p-6 md:p-10">
      <div className="w-full max-w-7xl mx-auto">
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2 tracking-tight">My Contracts</h1>
            <p className="text-slate-600">View and manage all your saved, signed, and drafted documents.</p>
          </div>
          <Link to="/templates" className="btn-primary flex items-center gap-2 px-6 py-3">
            <Plus className="w-5 h-5" /> New Contract
          </Link>
        </header>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text"
              placeholder="Search by contract ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:border-brand-500 outline-none transition-all shadow-sm"
            />
          </div>
          <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
            {["all", "draft", "signed", "pending_review"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-sm font-bold capitalize transition-all ${
                  filter === f ? "bg-brand-600 text-white shadow-md" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {f.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-brand-600 animate-spin mb-4" />
            <p className="text-slate-500">Loading contracts...</p>
          </div>
        ) : filteredContracts.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {filteredContracts.map((contract, idx) => (
              <motion.div
                key={contract.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-all group"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-brand-50 p-3 rounded-xl group-hover:bg-brand-100 transition-colors">
                      <FileText className="w-6 h-6 text-brand-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                        Contract #{contract.id.slice(-6).toUpperCase()}
                      </h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                        <span>Updated {contract.updatedAt ? format(contract.updatedAt.toDate(), "MMM d, yyyy") : "Just now"}</span>
                        <span>•</span>
                        {getStatusBadge(contract.status)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button 
                      type="button"
                      onClick={() => navigate(`/contracts/${contract.id}/edit`)}
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-brand-600"
                      title="Share"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                    <Link 
                      to={`/contracts/${contract.id}/edit`}
                      className="btn-secondary flex items-center gap-2 text-sm"
                      title="Edit"
                    >
                      <Edit3 className="w-4 h-4" /> Edit
                    </Link>
                    <button 
                      type="button"
                      onClick={() => handleDownloadContract(contract)}
                      disabled={isDownloading === contract.id}
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-brand-600 disabled:opacity-50"
                      title="Download PDF"
                    >
                      {isDownloading === contract.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                    </button>
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
          <div className="bg-white rounded-3xl p-20 text-center border border-slate-200 border-dashed">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">No contracts found</h3>
            <p className="text-slate-500 max-w-sm mx-auto mb-8">
              Try adjusting your filters or search terms to find what you're looking for.
            </p>
          </div>
        )}
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
              <p className="text-slate-600 mb-8">Are you sure? This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirmId(null)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={() => handleDelete(deleteConfirmId)} className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl flex-1 transition-all">Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
