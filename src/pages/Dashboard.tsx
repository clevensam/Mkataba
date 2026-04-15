import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import { collection, query, where, getDocs, orderBy, deleteDoc, doc, updateDoc } from "firebase/firestore";
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
  X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { format } from "date-fns";



export default function Dashboard() {
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const navigate = useNavigate();

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
        return <span className="px-2.5 py-1 bg-teal-100 text-teal-700 text-xs font-bold uppercase rounded-full flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Signed</span>;
      case "pending_review":
        return <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-bold uppercase rounded-full flex items-center gap-1"><Clock className="w-3 h-3" /> Pending Review</span>;
      case "approved":
        return <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-bold uppercase rounded-full flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Approved</span>;
      default:
        return <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-bold uppercase rounded-full flex items-center gap-1"><Edit3 className="w-3 h-3" /> Draft</span>;
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2 tracking-tight">My Contracts</h1>
            <p className="text-slate-600">Manage your drafted, signed, and reviewed contracts.</p>
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
          <Link to="/templates" className="btn-primary flex items-center gap-2 px-6 py-3">
            <Plus className="w-5 h-5" /> New Contract
          </Link>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-brand-600 animate-spin mb-4" />
            <p className="text-slate-500">Loading your contracts...</p>
          </div>
        ) : contracts.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {contracts.map((contract, idx) => (
              <motion.div
                key={contract.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg hover:shadow-slate-200/30 transition-all group"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-brand-50 p-3 rounded-xl">
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
                      onClick={() => navigate(`/contracts/${contract.id}/edit`)}
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-brand-600"
                      title="Share"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                    <Link 
                      to={`/contracts/${contract.id}/edit`}
                      className="btn-secondary flex items-center gap-2 text-sm"
                    >
                      <Edit3 className="w-4 h-4" /> Edit
                    </Link>
                    <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-brand-600">
                      <Download className="w-5 h-5" />
                    </button>
                    <button 
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
            <h3 className="text-2xl font-bold text-slate-900 mb-2">No contracts yet</h3>
            <p className="text-slate-500 max-w-sm mx-auto mb-8">
              You haven't created any contracts yet. Start by choosing a template from our library.
            </p>
            <Link to="/templates" className="btn-primary inline-flex items-center gap-2 px-8 py-3">
              Browse Templates <ChevronRight className="w-5 h-5" />
            </Link>
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
              <p className="text-slate-600 mb-8">
                Are you sure you want to delete this contract? This action cannot be undone and will permanently remove all data associated with it.
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
  );
}
