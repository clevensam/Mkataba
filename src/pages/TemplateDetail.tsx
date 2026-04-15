import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { db, auth } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { 
  ArrowLeft, 
  FileText, 
  Globe, 
  Tag, 
  Download, 
  Edit3, 
  CheckCircle2,
  Loader2,
  ChevronRight
} from "lucide-react";
import { motion } from "motion/react";

export default function TemplateDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [template, setTemplate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchTemplate = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, "templates", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setTemplate({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (error) {
        console.error("Error fetching template:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTemplate();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)]">
        <Loader2 className="w-10 h-10 text-brand-600 animate-spin mb-4" />
        <p className="text-slate-500">Loading template details...</p>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="container mx-auto px-6 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Template not found</h1>
        <Link to="/templates" className="btn-primary inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Templates
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-600 hover:text-brand-600 font-medium mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Templates
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-brand-100 p-4 rounded-2xl">
                  <FileText className="w-8 h-8 text-brand-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">{template.title}</h1>
                  <div className="flex gap-3 mt-2">
                    <span className="flex items-center gap-1 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <Globe className="w-3 h-3" /> {template.language}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-bold text-brand-600 uppercase tracking-wider">
                      <Tag className="w-3 h-3" /> {template.category.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-slate-600 text-lg leading-relaxed mb-8">
                {template.description}
              </p>

              <div className="border-t border-slate-100 pt-8">
                <h3 className="font-bold text-slate-900 mb-4">Template Preview</h3>
                <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 font-serif text-slate-500 select-none pointer-events-none blur-[1px]">
                  <div dangerouslySetInnerHTML={{ __html: template.htmlContent.replace(/\{\{(.*?)\}\}/g, '<span class="bg-slate-200 px-2 rounded">...</span>') }} />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Actions Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm sticky top-24">
              <h3 className="font-bold text-slate-900 mb-6">Actions</h3>
              
              <div className="space-y-4">
                <Link 
                  to={user ? `/contracts/new/${template.id}` : "/login"}
                  className="btn-primary w-full py-4 flex items-center justify-center gap-2 text-lg"
                >
                  <Edit3 className="w-5 h-5" /> Start Filling
                </Link>
                
                <button className="btn-secondary w-full py-4 flex items-center justify-center gap-2 text-lg">
                  <Download className="w-5 h-5" /> Download Blank
                </button>
              </div>

              <div className="mt-8 pt-8 border-t border-slate-100">
                <h4 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wider">What's included</h4>
                <ul className="space-y-3">
                  {[
                    "Legally structured content",
                    "Customizable fields",
                    "Digital signature support",
                    "PDF download",
                    "Optional lawyer review"
                  ].map(item => (
                    <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
                      <CheckCircle2 className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
