import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { db } from "../firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { 
  Search, 
  Filter, 
  FileText, 
  ChevronRight, 
  Globe, 
  Tag,
  Loader2,
  Download,
  Edit3
} from "lucide-react";
import { motion } from "motion/react";
import { downloadBlankTemplate } from "../services/pdfService";

const categories = [
  { id: "all", title: "All Templates" },
  { id: "rental", title: "Rental" },
  { id: "car_sale", title: "Car Sale" },
  { id: "employment", title: "Employment" },
  { id: "loan", title: "Loan" },
  { id: "land", title: "Land" },
  { id: "partnership", title: "Partnership" },
];

export default function TemplatesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFilter = searchParams.get("category") || "all";
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      try {
        let q = query(collection(db, "templates"), where("published", "==", true), orderBy("createdAt", "desc"));
        
        if (categoryFilter !== "all") {
          q = query(collection(db, "templates"), 
            where("published", "==", true), 
            where("category", "==", categoryFilter),
            orderBy("createdAt", "desc")
          );
        }
        
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTemplates(data);
      } catch (error) {
        console.error("Error fetching templates:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, [categoryFilter]);

  const filteredTemplates = templates.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-slate-50 min-h-screen p-6 md:p-10">
      <div className="w-full">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">Contract Templates</h1>
          <p className="text-slate-600">Browse and select a template to get started.</p>
        </div>

        <div className="flex flex-col gap-8">
          {/* Main Content */}
          <div className="flex-grow">
            {/* Search Bar */}
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 shadow-sm transition-all"
              />
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-2 mb-10">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSearchParams({ category: cat.id })}
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-all border ${
                    categoryFilter === cat.id 
                      ? "bg-brand-600 text-white border-brand-600 shadow-md shadow-brand-200" 
                      : "bg-white text-slate-600 border-slate-200 hover:border-brand-300 hover:text-brand-600"
                  }`}
                >
                  {cat.title}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-brand-600 animate-spin mb-4" />
                <p className="text-slate-500">Loading templates...</p>
              </div>
            ) : filteredTemplates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredTemplates.map((template, idx) => (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl hover:shadow-slate-200/50 transition-all group flex flex-col"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="bg-brand-50 p-3 rounded-xl">
                        <FileText className="w-6 h-6 text-brand-600" />
                      </div>
                      <div className="flex gap-2">
                        <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase rounded-md flex items-center gap-1">
                          <Globe className="w-3 h-3" /> {template.language}
                        </span>
                        <span className="px-2 py-1 bg-brand-50 text-brand-600 text-[10px] font-bold uppercase rounded-md flex items-center gap-1">
                          <Tag className="w-3 h-3" /> {template.category.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-brand-600 transition-colors">
                      {template.title}
                    </h3>
                    <p className="text-slate-600 text-sm mb-6 line-clamp-3 flex-grow">
                      {template.description}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-3 mt-auto">
                      <button 
                        onClick={() => downloadBlankTemplate(template.title, template.htmlContent)}
                        className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all"
                      >
                        <Download className="w-4 h-4" /> Download
                      </button>
                      <Link 
                        to={`/contracts/new/${template.id}`}
                        className="flex items-center justify-center gap-2 py-3 px-4 bg-brand-600 text-white rounded-xl font-bold text-sm hover:bg-brand-700 shadow-lg shadow-brand-100 transition-all"
                      >
                        <Edit3 className="w-4 h-4" /> Use Template
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-20 text-center border border-slate-200 border-dashed">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">No templates found</h3>
                <p className="text-slate-500">Try adjusting your search or category filter.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
