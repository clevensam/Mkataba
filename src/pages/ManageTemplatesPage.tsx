import React, { useState, useEffect } from "react";
import { 
  getAllTemplates, 
  deleteTemplate, 
  togglePublishTemplate,
  Template 
} from "../services/templateService";
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  EyeOff, 
  Loader2, 
  ArrowLeft,
  FileText
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";

export default function ManageTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const data = await getAllTemplates();
      setTemplates(data);
    } catch (error) {
      console.error("Error fetching templates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTemplate(id);
      setDeleteConfirmId(null);
      fetchTemplates();
    } catch (error) {
      console.error("Error deleting template:", error);
    }
  };

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    try {
      await togglePublishTemplate(id, !currentStatus);
      fetchTemplates();
    } catch (error) {
      console.error("Error toggling publish status:", error);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen p-6 md:p-10">
      <div className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <Link to="/admin" className="text-brand-600 flex items-center gap-2 text-sm font-semibold mb-2 hover:underline">
              <ArrowLeft className="w-4 h-4" /> Back to Admin
            </Link>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Manage Templates</h1>
          </div>
          <button 
            onClick={() => navigate("/admin/templates/new")}
            className="btn-primary flex items-center justify-center gap-2 px-6 py-3"
          >
            <Plus className="w-5 h-5" /> Create Template
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-brand-600 animate-spin mb-4" />
            <p className="text-slate-500 font-medium">Loading templates...</p>
          </div>
        ) : templates.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm">
            <div className="bg-slate-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FileText className="text-slate-400 w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No templates found</h3>
            <p className="text-slate-500 mb-8">Get started by creating your first contract template.</p>
            <button onClick={() => navigate("/admin/templates/new")} className="btn-primary px-8">Create Template</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <motion.div 
                key={template.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col"
              >
                <div className="p-6 flex-grow">
                  <div className="flex items-start justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      template.published ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {template.published ? 'Published' : 'Draft'}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {template.category}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-1">{template.title}</h3>
                  <p className="text-slate-500 text-sm line-clamp-2 mb-4">{template.description}</p>
                </div>
                
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => navigate(`/admin/templates/${template.id}/edit`)}
                      className="p-2 text-slate-600 hover:bg-white hover:text-brand-600 rounded-xl transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleTogglePublish(template.id!, template.published)}
                      className="p-2 text-slate-600 hover:bg-white hover:text-brand-600 rounded-xl transition-colors"
                      title={template.published ? "Unpublish" : "Publish"}
                    >
                      {template.published ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <button 
                    onClick={() => setDeleteConfirmId(template.id!)}
                    className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setDeleteConfirmId(null)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl text-center"
          >
            <div className="bg-red-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Trash2 className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Delete Template?</h2>
            <p className="text-slate-600 mb-8">
              Are you sure you want to delete this template? This action cannot be undone and will affect all future contracts using this template.
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
    </div>
  );
}
