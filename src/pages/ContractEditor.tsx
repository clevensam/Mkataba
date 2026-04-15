import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { db, auth } from "../firebase";
import { doc, getDoc, collection, addDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { 
  ArrowLeft, 
  Save, 
  Download, 
  PenTool, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Eye,
  Edit3,
  FileText,
  Share2,
  Copy,
  ExternalLink,
  X,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import SignaturePadComponent from "../components/ui/SignaturePad";

import { generateContractPDF, downloadBlob } from "../lib/pdfGenerator";

export default function ContractEditor() {
  const { templateId, id } = useParams();
  const navigate = useNavigate();
  const [template, setTemplate] = useState<any>(null);
  const [contract, setContract] = useState<any>(null);
  const [filledData, setFilledData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(1); // 1: Edit, 2: Preview, 3: Finalize
  const [showSignature, setShowSignature] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [sharingEnabled, setSharingEnabled] = useState(false);
  const [sharingPermission, setSharingPermission] = useState<"view" | "edit">("view");
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [signaturePosition, setSignaturePosition] = useState({ x: 0, y: 0 });
  const [isPrintingBlank, setIsPrintingBlank] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const steps = [
    { id: 1, name: "Edit Details", icon: Edit3 },
    { id: 2, name: "Review Preview", icon: Eye },
    { id: 3, name: "Sign & Finalize", icon: PenTool },
  ];

  const handleDownload = async () => {
    if (!template) return;
    try {
      await generateContractPDF("contract-document", `${template.title.replace(/\s+/g, '_')}_Contract.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
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
      setLoading(true);
      try {
        if (id) {
          // Loading existing contract
          const contractDoc = await getDoc(doc(db, "contracts", id));
          if (contractDoc.exists()) {
            const data = contractDoc.data();
            setContract({ id: contractDoc.id, ...data });
            setFilledData(JSON.parse(data.filledData));
            setSignatureData(data.signatureDataUrl || null);
            setSignaturePosition(data.signaturePosition || { x: 0, y: 0 });
            setSharingEnabled(data.sharing?.enabled || false);
            setSharingPermission(data.sharing?.permission || "view");
            
            // Load template for this contract
            const templateDoc = await getDoc(doc(db, "templates", data.templateId));
            if (templateDoc.exists()) {
              setTemplate({ id: templateDoc.id, ...templateDoc.data() });
            }
          }
        } else if (templateId) {
          // New contract from template
          const templateDoc = await getDoc(doc(db, "templates", templateId));
          if (templateDoc.exists()) {
            setTemplate({ id: templateDoc.id, ...templateDoc.data() });
            // Initialize filledData with empty strings for all fields
            const fields = JSON.parse(templateDoc.data().fields);
            const initialData: Record<string, string> = {};
            fields.forEach((f: any) => initialData[f.id] = "");
            setFilledData(initialData);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [templateId, id]);

  const handleInputChange = (fieldId: string, value: string) => {
    setFilledData(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const data = {
        userId: user.uid,
        templateId: template.id,
        filledData: JSON.stringify(filledData),
        signatureDataUrl: signatureData,
        signaturePosition: signaturePosition,
        status: signatureData ? "signed" : "draft",
        sharing: {
          enabled: sharingEnabled,
          permission: sharingPermission
        },
        updatedAt: serverTimestamp(),
      };

      if (contract?.id) {
        await updateDoc(doc(db, "contracts", contract.id), data);
      } else {
        const newDoc = await addDoc(collection(db, "contracts"), {
          ...data,
          createdAt: serverTimestamp(),
        });
        setContract({ id: newDoc.id, ...data });
        navigate(`/contracts/${newDoc.id}/edit`, { replace: true });
      }
    } catch (error) {
      console.error("Error saving contract:", error);
    } finally {
      setSaving(false);
    }
  };

  const renderContent = () => {
    if (!template) return null;
    
    let html = template.htmlContent;
    const fields = JSON.parse(template.fields);
    
    // Split HTML by placeholders to insert inputs
    const parts = html.split(/\{\{(.*?)\}\}/);
    
    return (
      <div className="prose prose-slate max-w-none font-serif leading-relaxed text-lg relative">
        {parts.map((part: string, i: number) => {
          if (i % 2 === 0) {
            // This part is HTML content from the template
            return <div key={i} className="inline" dangerouslySetInnerHTML={{ __html: part }} />;
          } else {
            const field = fields.find((f: any) => f.id === part);
            if (!field) return <span key={i}>{{part}}</span>;
            
            if (isPrintingBlank) {
              return (
                <span key={i} className="inline-block border-b border-black min-w-[150px] h-5 mx-1 translate-y-1" />
              );
            }
            
            if (currentStep > 1) {
              return (
                <span key={i} className="border-b border-black font-bold px-1 min-w-[50px] inline-block">
                  {filledData[part] || "__________"}
                </span>
              );
            }
            
            return (
              <input
                key={i}
                type={field.type === "number" ? "number" : "text"}
                value={filledData[part] || ""}
                onChange={(e) => handleInputChange(part, e.target.value)}
                placeholder={field.label}
                className="inline-block border-b-2 border-black focus:border-brand-600 focus:bg-brand-50 outline-none px-1 transition-all min-w-[120px] font-sans text-base font-medium"
              />
            );
          }
        })}
        
        {signatureData && (
          <motion.div 
            drag
            dragMomentum={false}
            dragConstraints={containerRef}
            initial={signaturePosition}
            onDragEnd={(_, info) => {
              setSignaturePosition(prev => ({
                x: prev.x + info.offset.x,
                y: prev.y + info.offset.y
              }));
            }}
            className="absolute z-10 cursor-move group"
            style={{ left: 0, top: 0 }}
          >
            <div className="relative p-2 border-2 border-dashed border-transparent group-hover:border-brand-300 rounded-lg transition-colors">
              <img src={signatureData} alt="Signature" className="h-20 object-contain pointer-events-none" />
              <div className="absolute -top-6 left-0 bg-brand-600 text-white text-[10px] font-bold px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Drag to position signature
              </div>
            </div>
          </motion.div>
        )}
      </div>
    );
  };

  const handleToggleSharing = async () => {
    if (!contract?.id) return;
    const newEnabled = !sharingEnabled;
    setSharingEnabled(newEnabled);
    try {
      await updateDoc(doc(db, "contracts", contract.id), {
        "sharing.enabled": newEnabled,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error toggling sharing:", error);
    }
  };

  const handleUpdatePermission = async (perm: "view" | "edit") => {
    if (!contract?.id) return;
    setSharingPermission(perm);
    try {
      await updateDoc(doc(db, "contracts", contract.id), {
        "sharing.permission": perm,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error updating permission:", error);
    }
  };

  const shareUrl = `${window.location.origin}/contracts/share/${contract?.id}`;

  const copyShareUrl = () => {
    navigator.clipboard.writeText(shareUrl);
    alert("Link copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)]">
        <Loader2 className="w-10 h-10 text-brand-600 animate-spin mb-4" />
        <p className="text-slate-500">Loading editor...</p>
      </div>
    );
  }

  const completionPercent = template ? Math.round(
    (Object.values(filledData).filter(v => (v as string).trim() !== "").length / JSON.parse(template.fields).length) * 100
  ) : 0;

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Editor Header */}
      <div className="glass sticky top-0 z-40 px-6 py-4 border-b border-slate-200">
        <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-900">{template?.title}</h1>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <span className={`px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  contract?.status === "signed" ? "bg-teal-100 text-teal-700" : "bg-slate-100 text-slate-600"
                }`}>
                  {contract?.status || "Draft"}
                </span>
              </div>
            </div>
          </div>

          {/* Stepper (Removed from header) */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowShareModal(true)}
              disabled={!contract?.id}
              className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all"
              title={!contract?.id ? "Save draft first to share" : "Share contract"}
            >
              <Share2 className="w-5 h-5" />
            </button>

            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-secondary flex items-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span className="hidden sm:inline">Save Draft</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stepper Section (New) */}
      <div className="bg-white border-b border-slate-200 py-3 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-2">
          {steps.map((step, idx) => (
            <div key={step.id} className="flex items-center">
              <button
                onClick={() => {
                  if (step.id < currentStep || (step.id === 2 && completionPercent > 0) || (step.id === 3 && completionPercent === 100)) {
                    setCurrentStep(step.id);
                  }
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  currentStep === step.id 
                    ? "bg-brand-600 text-white shadow-md shadow-brand-100" 
                    : currentStep > step.id 
                      ? "text-brand-600 bg-brand-50" 
                      : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] ${
                  currentStep >= step.id ? "bg-white/20" : "bg-slate-100"
                }`}>
                  {currentStep > step.id ? <CheckCircle2 className="w-3 h-3" /> : step.id}
                </div>
                {step.name}
              </button>
              {idx < steps.length - 1 && (
                <div className="w-4 md:w-8 h-[1px] bg-slate-200 mx-1" />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-8 space-y-8">
        {/* Main Document Area */}
        <motion.div 
          layout
          ref={containerRef}
          id="contract-document"
          className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-6 md:p-12 border border-slate-100 min-h-[1000px] relative overflow-hidden"
        >
          {renderContent()}
        </motion.div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <button
            onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
            disabled={currentStep === 1}
            className="btn-secondary flex items-center gap-2 disabled:opacity-0"
          >
            <ArrowLeft className="w-4 h-4" /> Previous Step
          </button>

          <div className="flex items-center gap-3">
            {currentStep === 3 && (
              <>
                <button
                  onClick={handleDownload}
                  className="btn-secondary flex items-center gap-2"
                >
                  <Download className="w-4 h-4" /> Download PDF
                </button>
                <button
                  onClick={() => setShowSignature(true)}
                  disabled={completionPercent < 100 || contract?.status === "signed"}
                  className="btn-primary flex items-center gap-2"
                >
                  <PenTool className="w-4 h-4" />
                  {contract?.status === "signed" ? "Signed" : "Sign Contract"}
                </button>
              </>
            )}
            
            {currentStep < 3 && (
              <button
                onClick={() => setCurrentStep(prev => Math.min(3, prev + 1))}
                disabled={currentStep === 1 && completionPercent === 0}
                className="btn-primary flex items-center gap-2 px-8"
              >
                {currentStep === 1 ? "Preview Document" : "Proceed to Signing"}
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowShareModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md"
            >
              <div className="bg-white rounded-3xl p-8 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-slate-900">Share Contract</h2>
                  <button onClick={() => setShowShareModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div>
                      <p className="font-bold text-slate-900">Enable Link Sharing</p>
                      <p className="text-sm text-slate-500">Anyone with the link can access</p>
                    </div>
                    <button 
                      onClick={handleToggleSharing}
                      className={`w-12 h-6 rounded-full transition-colors relative ${sharingEnabled ? 'bg-brand-600' : 'bg-slate-300'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${sharingEnabled ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>

                  {sharingEnabled && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 ml-1">Permissions</label>
                        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                          <button 
                            onClick={() => handleUpdatePermission("view")}
                            className={`py-2 rounded-lg text-sm font-bold transition-all ${sharingPermission === "view" ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500'}`}
                          >
                            View Only
                          </button>
                          <button 
                            onClick={() => handleUpdatePermission("edit")}
                            className={`py-2 rounded-lg text-sm font-bold transition-all ${sharingPermission === "edit" ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500'}`}
                          >
                            Can Edit
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 ml-1">Share Link</label>
                        <div className="flex gap-2">
                          <input 
                            readOnly 
                            value={shareUrl}
                            className="flex-grow px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-600 outline-none"
                          />
                          <button 
                            onClick={copyShareUrl}
                            className="p-2 bg-brand-50 text-brand-600 rounded-xl hover:bg-brand-100 transition-colors"
                          >
                            <Copy className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      {contract?.id && (
                        <a 
                          href={shareUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex items-center justify-center gap-2 text-sm font-bold text-brand-600 hover:underline pt-2"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Open shared link
                        </a>
                      )}
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Signature Modal */}
      <AnimatePresence>
        {showSignature && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSignature(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg"
            >
              <div className="bg-white rounded-3xl p-8 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-slate-900">Sign Contract</h2>
                  <button onClick={() => setShowSignature(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                  </button>
                </div>
                
                <p className="text-slate-600 mb-8">
                  By signing this document, you agree to the terms and conditions stated above.
                </p>

                <SignaturePadComponent 
                  onConfirm={(dataUrl) => {
                    setSignatureData(dataUrl);
                    setShowSignature(false);
                    // Automatically save after signing
                    setTimeout(handleSave, 100);
                  }}
                  onClear={() => setSignatureData(null)}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
