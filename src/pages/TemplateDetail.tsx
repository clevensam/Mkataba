import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { db, auth } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Button, Card, Tag, message } from "antd";
import { 
  ArrowLeftOutlined, 
  FileTextOutlined, 
  GlobalOutlined, 
  TagsOutlined, 
  DownloadOutlined, 
  EditOutlined,
  CheckCircleOutlined,
  LoadingOutlined
} from "@ant-design/icons";
import { motion } from "motion/react";
import { downloadBlankTemplate } from "../services/pdfService";

export default function TemplateDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [template, setTemplate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isDownloading, setIsDownloading] = useState(false);

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
        message.error("Failed to load template");
      } finally {
        setLoading(false);
      }
    };
    fetchTemplate();
  }, [id]);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadBlankTemplate(template.title, template.htmlContent);
      message.success("Template downloaded successfully");
    } catch (error) {
      message.error("Failed to download template");
    } finally {
      setIsDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)]">
        <LoadingOutlined spin style={{ fontSize: 40 }} className="text-brand-600 mb-4" />
        <p className="text-slate-500">Loading template details...</p>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="container mx-auto px-6 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Template not found</h1>
        <Link to="/templates">
          <Button type="primary" icon={<ArrowLeftOutlined />}>
            Back to Templates
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen p-6 md:p-10">
      <div className="w-full">
        <Button onClick={() => navigate(-1)} className="mb-8" icon={<ArrowLeftOutlined />}>
          Back to Templates
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-brand-100 p-4 rounded-2xl">
                    <FileTextOutlined className="w-8 h-8 text-brand-600" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-slate-900">{template.title}</h1>
                    <div className="flex gap-3 mt-2">
                      <Tag icon={<GlobalOutlined />}>{template.language}</Tag>
                      <Tag color="blue">{template.category.replace('_', ' ')}</Tag>
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
              </Card>
            </motion.div>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <h3 className="font-bold text-slate-900 mb-6">Actions</h3>
              
              <div className="space-y-4">
                <Link to={user ? `/contracts/new/${template.id}` : "/login"}>
                  <Button type="primary" size="large" block icon={<EditOutlined />}>
                    Start Filling
                  </Button>
                </Link>
                
                <Button 
                  size="large" 
                  block 
                  icon={<DownloadOutlined />}
                  onClick={handleDownload}
                  loading={isDownloading}
                >
                  Download Blank
                </Button>
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
                      <CheckCircleOutlined className="text-teal-500 shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}