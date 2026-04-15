import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2, 
  Type, 
  Hash, 
  Calendar, 
  Layout, 
  ChevronDown,
  Info,
  Loader2,
  CheckCircle2,
  X,
  Eye
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  getTemplate, 
  createTemplate, 
  updateTemplate, 
  Template 
} from "../services/templateService";

const COMMON_FIELDS = [
  { label: "Full Name", type: "text", id: "full_name" },
  { label: "Date of Agreement", type: "date", id: "agreement_date" },
  { label: "Physical Address", type: "text", id: "address" },
  { label: "ID Number (NIDA)", type: "text", id: "id_number" },
  { label: "Phone Number", type: "text", id: "phone" },
  { label: "Email Address", type: "text", id: "email" },
  { label: "Amount (TZS)", type: "number", id: "amount" },
  { label: "Duration (Months)", type: "number", id: "duration" },
  { label: "Start Date", type: "date", id: "start_date" },
  { label: "End Date", type: "date", id: "end_date" },
];

const QuillWrapper = ReactQuill as any;

export default function TemplateEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const quillRef = useRef<any>(null);
  
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Omit<Template, "id" | "createdAt">>({
    title: "",
    category: "general",
    language: "ENGLISH",
    description: "",
    htmlContent: "",
    fields: "[]",
    published: false
  });
  const [visualFields, setVisualFields] = useState<{ id: string, label: string, type: string }[]>([]);
  const [showCommonFields, setShowCommonFields] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    if (id) {
      fetchTemplate();
    }
  }, [id]);

  const fetchTemplate = async () => {
    try {
      const template = await getTemplate(id!);
      setFormData({
        title: template.title,
        category: template.category,
        language: template.language,
        description: template.description,
        htmlContent: template.htmlContent,
        fields: template.fields,
        published: template.published
      });
      setVisualFields(JSON.parse(template.fields));
    } catch (error) {
      console.error("Error fetching template:", error);
      alert("Failed to load template.");
      navigate("/admin/templates");
    } finally {
      setLoading(false);
    }
  };

  const addField = (field?: { label: string, type: string, id: string }) => {
    if (field) {
      // Check if ID already exists
      if (visualFields.some(f => f.id === field.id)) {
        const newId = `${field.id}_${Date.now().toString().slice(-4)}`;
        setVisualFields([...visualFields, { ...field, id: newId }]);
      } else {
        setVisualFields([...visualFields, field]);
      }
    } else {
      setVisualFields([...visualFields, { id: `field_${Date.now()}`, label: "", type: "text" }]);
    }
    setShowCommonFields(false);
  };

  const removeField = (index: number) => {
    setVisualFields(prev => prev.filter((_, i) => i !== index));
  };

  const updateField = (index: number, key: string, value: string) => {
    const newFields = [...visualFields];
    newFields[index] = { ...newFields[index], [key]: value };
    
    if (key === "label" && (!newFields[index].id || newFields[index].id.startsWith("field_"))) {
      newFields[index].id = value.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    }
    
    setVisualFields(newFields);
  };

  const insertPlaceholder = (fieldId: string) => {
    const quill = quillRef.current?.getEditor();
    if (quill) {
      const range = quill.getSelection(true);
      quill.insertText(range.index, `{{${fieldId}}}`);
      quill.setSelection(range.index + fieldId.length + 4);
    }
  };

  const handleSave = async () => {
    if (!formData.title) {
      alert("Please enter a template title.");
      return;
    }
    setSaving(true);
    try {
      const finalData = {
        ...formData,
        fields: JSON.stringify(visualFields)
      };

      if (id) {
        await updateTemplate(id, finalData);
      } else {
        await createTemplate(finalData);
      }
      navigate("/admin/templates");
    } catch (error) {
      console.error("Error saving template:", error);
      alert("Failed to save template.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <Loader2 className="w-10 h-10 text-brand-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Loading template editor...</p>
      </div>
    );
  }

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['clean']
    ],
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Header */}
      <div className="glass sticky top-0 z-50 px-6 py-4 border-b border-slate-200">
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/admin/templates" className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                {id ? "Edit Template" : "Create New Template"}
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                {formData.title || "Untitled Template"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setPreviewMode(!previewMode)}
              className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                previewMode 
                ? 'bg-brand-600 text-white shadow-lg shadow-brand-200' 
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Eye className="w-4 h-4" />
              {previewMode ? "Exit Preview" : "Live Preview"}
            </button>
            <button 
              onClick={handleSave}
              disabled={saving}
              className="btn-primary px-8 py-2.5 flex items-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {id ? "Update Template" : "Save Template"}
            </button>
          </div>
        </div>
      </div>

      <div className="w-full px-6 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Sidebar: Settings & Fields */}
        <div className="lg:col-span-4 space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Layout className="w-5 h-5 text-brand-600" />
              Template Settings
            </h3>
            
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 ml-1">Title</label>
              <input 
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="e.g. Rental Agreement"
                className="w-full px-4 py-2.5 bg-slate-50 border border-transparent rounded-xl focus:bg-white focus:border-brand-500 outline-none transition-all text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 ml-1">Type</label>
                <select 
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-transparent rounded-xl focus:bg-white focus:border-brand-500 outline-none transition-all text-sm appearance-none"
                >
                  <option value="rental">Rental</option>
                  <option value="car_sale">Car Sale</option>
                  <option value="employment">Employment</option>
                  <option value="general">General</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 ml-1">Language</label>
                <select 
                  value={formData.language}
                  onChange={(e) => setFormData({...formData, language: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-transparent rounded-xl focus:bg-white focus:border-brand-500 outline-none transition-all text-sm appearance-none"
                >
                  <option value="ENGLISH">English</option>
                  <option value="SWAHILI">Swahili</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 ml-1">Description</label>
              <textarea 
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="What is this contract for?"
                className="w-full px-4 py-2.5 bg-slate-50 border border-transparent rounded-xl focus:bg-white focus:border-brand-500 outline-none transition-all text-sm resize-none"
              />
            </div>
          </div>

          {/* Field Builder */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col max-h-[600px]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Type className="w-5 h-5 text-brand-600" />
                Questions to Ask
              </h3>
              <div className="relative">
                <button 
                  onClick={() => setShowCommonFields(!showCommonFields)}
                  className="text-[10px] bg-brand-50 text-brand-600 px-3 py-1.5 rounded-full font-bold hover:bg-brand-100 transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Quick Add <ChevronDown className="w-3 h-3" />
                </button>
                
                <AnimatePresence>
                  {showCommonFields && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowCommonFields(false)} />
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 z-20 py-2 overflow-hidden"
                      >
                        <p className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50">Common Fields</p>
                        <div className="max-h-60 overflow-y-auto">
                          {COMMON_FIELDS.map((f) => (
                            <button
                              key={f.id}
                              onClick={() => addField(f)}
                              className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-brand-50 hover:text-brand-600 transition-colors flex items-center justify-between"
                            >
                              {f.label}
                              <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-400 uppercase">{f.type}</span>
                            </button>
                          ))}
                        </div>
                        <button 
                          onClick={() => addField()}
                          className="w-full text-left px-4 py-2 text-sm font-bold text-brand-600 hover:bg-brand-50 transition-colors border-t border-slate-50"
                        >
                          + Custom Field
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="space-y-3 overflow-y-auto pr-2 flex-grow custom-scrollbar">
              {visualFields.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <Info className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                  <p className="text-xs text-slate-400">Add questions that users need to fill out in the contract.</p>
                </div>
              ) : (
                visualFields.map((field, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3 relative group"
                  >
                    <button 
                      onClick={() => removeField(index)}
                      className="absolute top-2 right-2 p-1 text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    
                    <div className="flex items-center gap-2">
                      <div className="bg-white p-1.5 rounded-lg border border-slate-200">
                        {field.type === "number" ? <Hash className="w-3 h-3 text-brand-600" /> : field.type === "date" ? <Calendar className="w-3 h-3 text-brand-600" /> : <Type className="w-3 h-3 text-brand-600" />}
                      </div>
                      <input 
                        type="text"
                        value={field.label}
                        onChange={(e) => updateField(index, "label", e.target.value)}
                        placeholder="Question Label"
                        className="flex-grow bg-transparent font-bold text-slate-900 text-sm outline-none"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 bg-white px-2 py-1 rounded-lg border border-slate-100">
                        <span>ID:</span>
                        <input 
                          type="text"
                          value={field.id}
                          onChange={(e) => updateField(index, "id", e.target.value)}
                          className="bg-transparent outline-none w-24"
                        />
                      </div>
                      <button 
                        onClick={() => insertPlaceholder(field.id)}
                        className="text-[10px] font-bold text-brand-600 hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Add to Doc
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Area: Rich Text Editor or Preview */}
        <div className="lg:col-span-8 flex flex-col h-[calc(100vh-160px)]">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-brand-600" />
                {previewMode ? "Contract Preview" : "Contract Content"}
              </h3>
              <div className="flex items-center gap-4">
                {!previewMode && visualFields.length > 0 && (
                  <div className="relative group">
                    <select 
                      onChange={(e) => {
                        if (e.target.value) {
                          insertPlaceholder(e.target.value);
                          e.target.value = "";
                        }
                      }}
                      className="text-xs font-bold bg-white border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:border-brand-500 transition-all appearance-none pr-8 cursor-pointer"
                    >
                      <option value="">Insert Field...</option>
                      {visualFields.map(f => (
                        <option key={f.id} value={f.id}>{f.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                )}
                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                  <CheckCircle2 className="w-4 h-4 text-teal-500" />
                  {previewMode ? "Viewing as user" : "Auto-saving draft"}
                </div>
              </div>
            </div>
            
            <div className="flex-grow overflow-hidden flex flex-col">
              {previewMode ? (
                <div className="flex-grow overflow-y-auto p-12 bg-slate-50/50">
                  <div className="max-w-2xl mx-auto bg-white p-12 shadow-sm border border-slate-100 rounded-2xl min-h-full prose prose-slate">
                    <div 
                      dangerouslySetInnerHTML={{ 
                        __html: formData.htmlContent.replace(/\{\{(.*?)\}\}/g, (match, id) => {
                          const field = visualFields.find(f => f.id === id);
                          return `<span class="bg-brand-50 text-brand-700 px-1 rounded border-b border-brand-200 font-bold">${field ? field.label : match}</span>`;
                        }) 
                      }} 
                    />
                  </div>
                </div>
              ) : (
                <QuillWrapper
                  ref={quillRef}
                  theme="snow"
                  value={formData.htmlContent}
                  onChange={(content: string) => setFormData({...formData, htmlContent: content})}
                  modules={modules}
                  className="h-full flex-grow flex flex-col"
                  placeholder="Start writing your contract here... Use the 'Add to Doc' buttons on the left to insert placeholders."
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .quill {
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .ql-container {
          flex-grow: 1;
          font-family: 'Inter', sans-serif;
          font-size: 16px;
          border: none !important;
          overflow-y: auto;
        }
        .ql-toolbar {
          border: none !important;
          border-bottom: 1px solid #f1f5f9 !important;
          padding: 12px 24px !important;
          background: #f8fafc;
        }
        .ql-editor {
          padding: 40px 60px !important;
          line-height: 1.8;
        }
        .ql-editor h1, .ql-editor h2, .ql-editor h3 {
          font-weight: 800;
          color: #0f172a;
          margin-top: 1.5em;
          margin-bottom: 0.5em;
        }
        .ql-editor p {
          margin-bottom: 1.2em;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}

function FileText(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  );
}
