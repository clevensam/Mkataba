import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { db, auth } from "../firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Button, Modal, Card, Tag, message } from "antd";
import { 
  FileTextOutlined, 
  DownloadOutlined,
  ArrowRightOutlined,
  LoadingOutlined,
  GlobalOutlined,
  EyeOutlined,
  EditOutlined,
  CloseOutlined,
  LockOutlined,
  CheckCircleOutlined,
  SafetyOutlined
} from "@ant-design/icons";
import { downloadBlankTemplate } from "../services/pdfService";

export default function LandingPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewTemplate, setPreviewTemplate] = useState<any | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, "templates"), where("published", "==", true), orderBy("createdAt", "desc"));
        
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTemplates(data);
      } catch (error) {
        console.error("Error fetching templates:", error);
        message.error("Failed to load templates");
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const handleAction = (action: () => void) => {
    if (!user) {
      setShowAuthModal(true);
    } else {
      action();
    }
  };

  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      await downloadBlankTemplate(previewTemplate.title, previewTemplate.htmlContent);
      message.success("Document downloaded successfully");
    } catch (error) {
      message.error("Failed to download document");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      <section className="relative pt-20 pb-16 px-6 bg-white overflow-hidden">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-brand-50/50 blur-3xl rounded-full opacity-50" />
        </div>
        
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 mb-6 text-sm font-bold tracking-wider text-brand-700 uppercase bg-brand-100 rounded-full">
              Legal Platform for Tanzania
            </span>
            <Link to="/login" className="block hover:opacity-80 transition-opacity">
              <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 mb-8 tracking-tighter">
                The contract you need, <br />
                <span className="text-brand-600">in 60 seconds.</span>
              </h1>
            </Link>
            <p className="max-w-2xl mx-auto text-xl text-slate-600 mb-0 leading-relaxed font-medium">
              Transparent, professional, and legally compliant. Select a document below to get started.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-40">
              <LoadingOutlined spin style={{ fontSize: 64 }} className="text-brand-600 mb-6" />
              <p className="text-slate-500 font-bold text-xl uppercase tracking-widest">Loading Library...</p>
            </div>
          ) : templates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {templates.map((template, idx) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card hoverable className="bg-white rounded-[2.5rem] border border-slate-100 p-10 hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] transition-all group flex flex-col relative" bodyStyle={{ padding: 0 }}>
                    <div className="flex justify-between items-start mb-8">
                      <div className="bg-brand-50 p-4 rounded-3xl group-hover:bg-brand-600 transition-all transform group-hover:rotate-6">
                        <FileTextOutlined className="w-8 h-8 text-brand-600 group-hover:text-white transition-colors" />
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        <Tag color="default">{template.language}</Tag>
                        <Tag color="blue">{template.category}</Tag>
                      </div>
                    </div>
                    
                    <h3 className="text-3xl font-extrabold text-slate-900 mb-4 group-hover:text-brand-600 transition-colors tracking-tight">
                      {template.title}
                    </h3>
                    <p className="text-slate-500 mb-10 line-clamp-3 leading-relaxed font-medium">
                      {template.description}
                    </p>
                    
                    <div className="grid grid-cols-1 gap-4 mt-auto">
                      <Button 
                        size="large"
                        block
                        icon={<EyeOutlined />}
                        onClick={() => handleAction(() => setPreviewTemplate(template))}
                      >
                        Quick Preview
                      </Button>
                      <Button 
                        type="primary"
                        size="large"
                        block
                        icon={<EditOutlined />}
                        onClick={() => handleAction(() => navigate(`/contracts/new/${template.id}`))}
                      >
                        Customize Now
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="bg-white rounded-[4rem] p-32 text-center border border-slate-100 shadow-inner">
              <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
                <FileTextOutlined className="w-12 h-12 text-slate-200" />
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">No documents found.</h3>
              <p className="text-slate-500 text-lg font-medium">Try searching for a different keyword or category.</p>
            </Card>
          )}
        </div>
      </section>

      <section className="py-32 bg-slate-900 text-white px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-20">
            <div className="relative group">
              <div className="w-16 h-16 bg-brand-600/20 rounded-2xl flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(244,63,94,0.1)] group-hover:bg-brand-600/40 transition-all">
                <SafetyOutlined className="w-8 h-8 text-brand-400" />
              </div>
              <h4 className="text-2xl font-bold mb-4">Legally Vetted</h4>
              <p className="text-slate-400 leading-relaxed font-medium">Our templates follow standard legal frameworks in Tanzania, ensuring your rights are protected.</p>
            </div>
            <div className="relative group">
              <div className="w-16 h-16 bg-teal-600/20 rounded-2xl flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(20,184,166,0.1)] group-hover:bg-teal-600/40 transition-all">
                <CheckCircleOutlined className="w-8 h-8 text-teal-400" />
              </div>
              <h4 className="text-2xl font-bold mb-4">Zero Friction</h4>
              <p className="text-slate-400 leading-relaxed font-medium">No lawyers, no waiting. Choose, fill, and download your contracts instantly from any device.</p>
            </div>
            <div className="relative group">
              <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(59,130,246,0.1)] group-hover:bg-blue-600/40 transition-all">
                <FileTextOutlined className="w-8 h-8 text-blue-400" />
              </div>
              <h4 className="text-2xl font-bold mb-4">Audit Ready</h4>
              <p className="text-slate-400 leading-relaxed font-medium">Secure digital signatures and audit trails provide undeniable proof of agreement execution.</p>
            </div>
          </div>
        </div>
      </section>

      <Modal
        open={!!previewTemplate}
        onCancel={() => setPreviewTemplate(null)}
        footer={null}
        width={900}
        centered
        className="preview-modal"
        title={
          <div className="flex items-center gap-6">
            <div className="bg-brand-50 p-4 rounded-3xl">
              <FileTextOutlined className="w-8 h-8 text-brand-600" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">{previewTemplate?.title}</h2>
              <p className="text-slate-400 text-xs font-black uppercase tracking-[0.2em]">Document Preview</p>
            </div>
          </div>
        }
      >
        <div className="bg-white shadow-[0_40px_80px_rgba(0,0,0,0.05)] border border-slate-200 rounded-[3rem] p-16 md:p-24 min-h-[600px]">
          <div 
            className="prose prose-slate prose-xl max-w-none contract-preview"
            dangerouslySetInnerHTML={{ 
              __html: previewTemplate?.htmlContent.replace(/\{\{(.*?)\}\}/g, '<span class="bg-brand-50 text-brand-700 px-3 py-1 rounded-xl border border-brand-100 text-sm font-black">$1</span>') 
            }}
          />
        </div>
        
        <div className="flex flex-col sm:flex-row justify-end gap-6 mt-8">
          <Button
            size="large"
            icon={isDownloading ? <LoadingOutlined /> : <DownloadOutlined />}
            onClick={() => handleAction(handleDownload)}
            loading={isDownloading}
          >
            {isDownloading ? "Preparing Document..." : "Download Blank (PDF)"}
          </Button>
          <Button
            type="primary"
            size="large"
            icon={<EditOutlined />}
            onClick={() => handleAction(() => navigate(`/contracts/new/${previewTemplate?.id}`))}
          >
            Customize & Sign
          </Button>
        </div>
      </Modal>

      <Modal
        open={showAuthModal}
        onCancel={() => setShowAuthModal(false)}
        footer={null}
        centered
        width={500}
        closable={false}
      >
        <div className="text-center py-4">
          <div className="w-24 h-24 bg-brand-50 rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-inner">
            <LockOutlined className="w-12 h-12 text-brand-600" />
          </div>
          
          <h2 className="text-4xl font-black text-slate-900 mb-6 tracking-tighter">Sign up to act.</h2>
          <p className="text-slate-500 mb-12 text-xl leading-relaxed font-medium">
            To download or sign this contract, you need a free account. It takes precisely 45 seconds to get started.
          </p>
          
          <div className="space-y-6">
            <Link to="/register">
              <Button type="primary" size="large" block icon={<ArrowRightOutlined />} iconPosition="end" className="py-6 text-xl font-black">
                Get Started For Free
              </Button>
            </Link>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-6 bg-white text-slate-300 font-black uppercase tracking-[0.3em]">Already a member?</span>
              </div>
            </div>
            <Link to="/login">
              <Button size="large" block className="py-6 text-xl font-black">
                Log In
              </Button>
            </Link>
          </div>
        </div>
      </Modal>
    </div>
  );
}