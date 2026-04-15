import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { 
  FileText, 
  Eye, 
  Edit3, 
  Save, 
  Loader2, 
  AlertCircle,
  CheckCircle2,
  Download,
  Share2
} from "lucide-react";
import { motion } from "motion/react";
import { generateContractPDF, downloadBlob } from "../lib/pdfGenerator";

export default function SharedContractPage() {
  const { id } = useParams();
  const [contract, setContract] = useState<any>(null);
  const [template, setTemplate] = useState<any>(null);
  const [filledData, setFilledData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [signaturePosition, setSignaturePosition] = useState({ x: 0, y: 0 });
  const [isPrintingBlank, setIsPrintingBlank] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const contractDoc = await getDoc(doc(db, "contracts", id));
        if (contractDoc.exists()) {
          const data = contractDoc.data();
          
          if (!data.sharing?.enabled) {
            setError("This contract is not shared or sharing has been disabled.");
            setLoading(false);
            return;
          }

          setContract({ id: contractDoc.id, ...data });
          setFilledData(JSON.parse(data.filledData));
          setSignaturePosition(data.signaturePosition || { x: 0, y: 0 });
          setMode(data.sharing.permission === "edit" ? "edit" : "view");

          const templateDoc = await getDoc(doc(db, "templates", data.templateId));
          if (templateDoc.exists()) {
            setTemplate({ id: templateDoc.id, ...templateDoc.data() });
          }
        } else {
          setError("Contract not found.");
        }
      } catch (err) {
        console.error("Error fetching shared contract:", err);
        setError("You don't have permission to view this contract or it doesn't exist.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleInputChange = (fieldId: string, value: string) => {
    if (contract?.sharing?.permission !== "edit") return;
    setFilledData(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleSave = async () => {
    if (!id || contract?.sharing?.permission !== "edit") return;
    setSaving(true);
    try {
      await updateDoc(doc(db, "contracts", id), {
        filledData: JSON.stringify(filledData),
        signaturePosition: signaturePosition,
        updatedAt: serverTimestamp(),
      });
      alert("Changes saved successfully!");
    } catch (err) {
      console.error("Error saving shared contract:", err);
      alert("Failed to save changes. You may not have edit permissions.");
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = async () => {
    if (!template) return;
    try {
      await generateContractPDF("contract-document", `${template.title.replace(/\s+/g, '_')}_Shared.pdf`);
    } catch (err) {
      console.error("Error generating PDF:", err);
    }
  };

  const handleDownloadBlank = async () => {
    if (!template) return;
    setIsPrintingBlank(true);
    setTimeout(async () => {
      try {
        await generateContractPDF("contract-document", `${template.title.replace(/\s+/g, '_')}_Blank.pdf`);
      } catch (err) {
        console.error("Error generating blank PDF:", err);
      } finally {
        setIsPrintingBlank(false);
      }
    }, 100);
  };

  const renderContent = () => {
    if (!template) return null;
    
    let html = template.htmlContent;
    const fields = JSON.parse(template.fields);
    const parts = html.split(/\{\{(.*?)\}\}/);
    
    return (
      <div className="prose prose-slate max-w-none font-serif leading-relaxed text-lg relative">
        {parts.map((part: string, i: number) => {
          if (i % 2 === 0) {
            return <div key={i} className="inline" dangerouslySetInnerHTML={{ __html: part }} />;
          } else {
            const field = fields.find((f: any) => f.id === part);
            if (!field) return <span key={i}>{{part}}</span>;
            
            if (isPrintingBlank) {
              return (
                <span key={i} className="inline-block border-b border-black min-w-[150px] h-5 mx-1 translate-y-1" />
              );
            }
            
            if (mode === "view" || contract?.status !== "draft") {
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
        
        {contract?.signatureDataUrl && (
          <motion.div 
            drag={mode === "edit" && contract?.status === "draft"}
            dragMomentum={false}
            dragConstraints={containerRef}
            initial={signaturePosition}
            onDragEnd={(_, info) => {
              setSignaturePosition(prev => ({
                x: prev.x + info.offset.x,
                y: prev.y + info.offset.y
              }));
            }}
            className={`absolute z-10 ${mode === "edit" && contract?.status === "draft" ? "cursor-move group" : ""}`}
            style={{ left: 0, top: 0 }}
          >
            <div className={`relative p-2 border-2 border-dashed border-transparent ${mode === "edit" && contract?.status === "draft" ? "group-hover:border-brand-300" : ""} rounded-lg transition-colors`}>
              <img src={contract.signatureDataUrl} alt="Signature" className="h-20 object-contain pointer-events-none" />
              {mode === "edit" && contract?.status === "draft" && (
                <div className="absolute -top-6 left-0 bg-brand-600 text-white text-[10px] font-bold px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Drag to position signature
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <Loader2 className="w-10 h-10 text-brand-600 animate-spin mb-4" />
        <p className="text-slate-500">Loading shared contract...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-slate-100">
          <div className="bg-red-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h1>
          <p className="text-slate-600 mb-8">{error}</p>
          <Link to="/" className="btn-primary w-full">Go to Homepage</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <div className="glass sticky top-0 z-40 px-6 py-4 border-b border-slate-200">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-brand-100 p-2 rounded-lg">
              <Share2 className="w-5 h-5 text-brand-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">{template?.title}</h1>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <span className="px-2 py-0.5 rounded-full bg-brand-100 text-brand-700 uppercase tracking-wider">
                  Shared {contract?.sharing?.permission === "edit" ? "Editor" : "Viewer"}
                </span>
                <span>•</span>
                <span className={`px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  contract?.status === "signed" ? "bg-teal-100 text-teal-700" : "bg-slate-100 text-slate-600"
                }`}>
                  {contract?.status}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {contract?.sharing?.permission === "edit" && contract?.status === "draft" && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary flex items-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            )}
            <button
              onClick={handleDownloadBlank}
              className="btn-secondary flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Download Blank
            </button>
            <button
              onClick={handleDownload}
              className="btn-secondary flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          ref={containerRef}
          id="contract-document"
          className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8 sm:p-12 border border-slate-100 min-h-[1000px] relative overflow-hidden"
        >
          {renderContent()}
        </motion.div>
      </div>
    </div>
  );
}
