import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { db, auth } from "../firebase";
import { doc, getDoc, collection, addDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Button, Modal, Steps, Input, Switch, Select, message } from "antd";
import { 
  ArrowLeftOutlined, 
  SaveOutlined, 
  DownloadOutlined, 
  CheckCircleOutlined,
  EyeOutlined,
  EditOutlined,
  FileTextOutlined,
  ShareAltOutlined,
  CopyOutlined,
  CloseOutlined,
  RightOutlined,
  LoadingOutlined
} from "@ant-design/icons";
import { motion, AnimatePresence } from "motion/react";
import SignaturePadComponent from "../components/ui/SignaturePad";
import { generateContractPDF } from "../lib/pdfGenerator";

export default function ContractEditor() {
  const { templateId, id } = useParams();
  const navigate = useNavigate();
  const [template, setTemplate] = useState<any>(null);
  const [contract, setContract] = useState<any>(null);
  const [filledData, setFilledData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [showSignature, setShowSignature] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [sharingEnabled, setSharingEnabled] = useState(false);
  const [sharingPermission, setSharingPermission] = useState<"view" | "edit">("view");
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [signaturePosition, setSignaturePosition] = useState({ x: 0, y: 0 });
  const [isPrintingBlank, setIsPrintingBlank] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const steps = [
    { id: 1, name: "Edit Details", icon: EditOutlined },
    { id: 2, name: "Review Preview", icon: EyeOutlined },
    { id: 3, name: "Sign & Finalize", icon: CheckCircleOutlined },
  ];

  const handleDownload = async () => {
    if (!template) return;
    try {
      await generateContractPDF("contract-document", `${template.title.replace(/\s+/g, '_')}_Contract.pdf`);
      message.success("Contract downloaded successfully");
    } catch (error) {
      console.error("Error generating PDF:", error);
      message.error("Failed to download contract");
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
          const contractDoc = await getDoc(doc(db, "contracts", id));
          if (contractDoc.exists()) {
            const data = contractDoc.data();
            setContract({ id: contractDoc.id, ...data });
            setFilledData(JSON.parse(data.filledData));
            setSignatureData(data.signatureDataUrl || null);
            setSignaturePosition(data.signaturePosition || { x: 0, y: 0 });
            setSharingEnabled(data.sharing?.enabled || false);
            setSharingPermission(data.sharing?.permission || "view");
            
            const templateDoc = await getDoc(doc(db, "templates", data.templateId));
            if (templateDoc.exists()) {
              setTemplate({ id: templateDoc.id, ...templateDoc.data() });
            }
          }
        } else if (templateId) {
          const templateDoc = await getDoc(doc(db, "templates", templateId));
          if (templateDoc.exists()) {
            setTemplate({ id: templateDoc.id, ...templateDoc.data() });
            const fields = JSON.parse(templateDoc.data().fields);
            const initialData: Record<string, string> = {};
            fields.forEach((f: any) => initialData[f.id] = "");
            setFilledData(initialData);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        message.error("Failed to load contract data");
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
        message.success("Contract saved successfully");
      } else {
        const newDoc = await addDoc(collection(db, "contracts"), {
          ...data,
          createdAt: serverTimestamp(),
        });
        setContract({ id: newDoc.id, ...data });
        message.success("Contract created successfully");
        navigate(`/contracts/${newDoc.id}/edit`, { replace: true });
      }
    } catch (error) {
      console.error("Error saving contract:", error);
      message.error("Failed to save contract");
    } finally {
      setSaving(false);
    }
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
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setSignatureData(null);
                }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                title="Remove signature"
              >
                <CloseOutlined className="w-3 h-3" />
              </button>
              <div className="absolute -top-8 left-0 bg-brand-600 text-white text-[10px] font-bold px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
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
      message.error("Failed to update sharing settings");
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
      message.error("Failed to update permission");
    }
  };

  const shareUrl = `${window.location.origin}/contracts/share/${contract?.id}`;

  const copyShareUrl = () => {
    navigator.clipboard.writeText(shareUrl);
    message.success("Link copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)]">
        <LoadingOutlined spin style={{ fontSize: 40 }} className="text-brand-600 mb-4" />
        <p className="text-slate-500">Loading editor...</p>
      </div>
    );
  }

  const completionPercent = template ? Math.round(
    (Object.values(filledData).filter(v => (v as string).trim() !== "").length / JSON.parse(template.fields).length) * 100
  ) : 0;

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <div className="glass sticky top-0 z-40 px-6 py-4 border-b border-slate-200">
        <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} />
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{template?.title}</h1>
              <div className="mt-1 flex items-center gap-2 text-[10px] font-bold">
                <span className={`px-2 py-0.5 rounded-md uppercase tracking-wider ${
                  contract?.status === "signed" ? "bg-teal-100 text-teal-700" : "bg-slate-100 text-slate-600"
                }`}>
                  {contract?.status || "Draft"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              icon={<ShareAltOutlined />}
              onClick={() => setShowShareModal(true)}
              disabled={!contract?.id}
              title={!contract?.id ? "Save draft first to share" : "Share contract"}
            />

            <Button
              icon={saving ? <LoadingOutlined /> : <SaveOutlined />}
              onClick={handleSave}
              loading={saving}
            >
              <span className="font-bold">Save Draft</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="py-8 px-6">
        <div className="max-w-4xl mx-auto">
          <Steps
            current={currentStep - 1}
            items={steps.map((step) => ({
              title: step.name,
              icon: currentStep > step.id ? <CheckCircleOutlined /> : step.icon,
            }))}
          />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-8 space-y-8">
        <motion.div 
          layout
          ref={containerRef}
          id="contract-document"
          className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-4 md:p-6 border border-slate-100 min-h-[1000px] relative overflow-hidden"
        >
          {renderContent()}
        </motion.div>

        <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <Button
            onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
            disabled={currentStep === 1}
            icon={<ArrowLeftOutlined />}
          >
            Previous Step
          </Button>

          <div className="flex items-center gap-3">
            {currentStep === 3 && (
              <>
                <Button
                  icon={<FileTextOutlined />}
                  onClick={async () => {
                    if (!template) return;
                    setIsPrintingBlank(true);
                    setTimeout(async () => {
                      try {
                        await generateContractPDF("contract-document", `${template.title.replace(/\s+/g, '_')}_Blank.pdf`);
                        message.success("Blank contract downloaded");
                      } catch (error) {
                        console.error("Error generating blank PDF:", error);
                        message.error("Failed to download blank contract");
                      } finally {
                        setIsPrintingBlank(false);
                      }
                    }, 100);
                  }}
                >
                  Download Blank
                </Button>
                <Button
                  icon={<DownloadOutlined />}
                  onClick={handleDownload}
                >
                  Download PDF
                </Button>
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  onClick={() => setShowSignature(true)}
                  disabled={completionPercent < 100 || contract?.status === "signed"}
                >
                  {contract?.status === "signed" ? "Signed" : "Sign Contract"}
                </Button>
              </>
            )}
            
            {currentStep < 3 && (
              <Button
                type="primary"
                onClick={() => setCurrentStep(prev => Math.min(3, prev + 1))}
                disabled={currentStep === 1 && completionPercent === 0}
                icon={<RightOutlined />}
                iconPosition="end"
              >
                {currentStep === 1 ? "Preview Document" : "Proceed to Signing"}
              </Button>
            )}
          </div>
        </div>
      </div>

      <Modal
        title="Share Contract"
        open={showShareModal}
        onCancel={() => setShowShareModal(false)}
        footer={null}
        width={500}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div>
              <p className="font-bold text-slate-900">Enable Link Sharing</p>
              <p className="text-sm text-slate-500">Anyone with the link can access</p>
            </div>
            <Switch 
              checked={sharingEnabled} 
              onChange={handleToggleSharing}
            />
          </div>

          {sharingEnabled && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 ml-1">Permissions</label>
                <Select
                  value={sharingPermission}
                  onChange={handleUpdatePermission}
                  style={{ width: '100%' }}
                  options={[
                    { value: "view", label: "View Only" },
                    { value: "edit", label: "Can Edit" },
                  ]}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 ml-1">Share Link</label>
                <Input
                  readOnly 
                  value={shareUrl}
                  suffix={
                    <Button 
                      type="text" 
                      icon={<CopyOutlined />}
                      onClick={copyShareUrl}
                    />
                  }
                />
              </div>

              {contract?.id && (
                <a 
                  href={shareUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 text-sm font-bold text-brand-600 hover:underline pt-2"
                >
                  <ShareAltOutlined />
                  Open shared link
                </a>
              )}
            </div>
          )}
        </div>
      </Modal>

      <Modal
        title="Sign Contract"
        open={showSignature}
        onCancel={() => setShowSignature(false)}
        footer={null}
        width={600}
      >
        <p className="text-slate-600 mb-8">
          By signing this document, you agree to the terms and conditions stated above.
        </p>

        <SignaturePadComponent 
          onConfirm={(dataUrl) => {
            setSignatureData(dataUrl);
            setShowSignature(false);
            setTimeout(handleSave, 100);
          }}
          onClear={() => setSignatureData(null)}
        />
      </Modal>
    </div>
  );
}