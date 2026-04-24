import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { db } from "../firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { Button, Input, Modal, Card, Tag, Select, message } from "antd";
import { 
  SearchOutlined, 
  FileTextOutlined, 
  RightOutlined, 
  GlobalOutlined,
  DownloadOutlined,
  EditOutlined,
  EyeOutlined,
  CloseOutlined,
  LoadingOutlined
} from "@ant-design/icons";
import { motion, AnimatePresence } from "motion/react";
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
  const [previewTemplate, setPreviewTemplate] = useState<any | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

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
        message.error("Failed to load templates");
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

  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      await downloadBlankTemplate(previewTemplate.title, previewTemplate.htmlContent);
      message.success("Template downloaded successfully");
    } catch (error) {
      message.error("Failed to download template");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen p-6 md:p-10">
      <div className="w-full">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">Contract Templates</h1>
          <p className="text-slate-600">Browse and select a template to get started.</p>
        </div>

        <div className="flex flex-col gap-8">
          <div className="flex-grow">
            <div className="relative mb-6">
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                size="large"
                prefix={<SearchOutlined className="text-slate-400" />}
                className="py-4"
              />
            </div>

            <div className="flex flex-wrap gap-2 mb-10">
              {categories.map(cat => (
                <Button
                  key={cat.id}
                  type={categoryFilter === cat.id ? "primary" : "default"}
                  onClick={() => setSearchParams({ category: cat.id })}
                >
                  {cat.title}
                </Button>
              ))}
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <LoadingOutlined spin style={{ fontSize: 40 }} className="text-brand-600 mb-4" />
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
                  >
                    <Card hoverable className="group">
                      <div className="flex justify-between items-start mb-4">
                        <div className="bg-brand-50 p-3 rounded-xl">
                          <FileTextOutlined className="w-6 h-6 text-brand-600" />
                        </div>
                        <div className="flex gap-2">
                          <Tag icon={<GlobalOutlined />}>{template.language}</Tag>
                          <Tag color="blue">{template.category.replace('_', ' ')}</Tag>
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-brand-600 transition-colors">
                        {template.title}
                      </h3>
                      <p className="text-slate-600 text-sm mb-6 line-clamp-3 flex-grow">
                        {template.description}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-3 mt-auto">
                        <Button 
                          icon={<EyeOutlined />}
                          onClick={() => setPreviewTemplate(template)}
                        >
                          View
                        </Button>
                        <Link to={`/contracts/new/${template.id}`}>
                          <Button type="primary" icon={<EditOutlined />} block>
                            Use Template
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <Card className="text-center p-20 border-dashed">
                <FileTextOutlined style={{ fontSize: 48 }} className="text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">No templates found</h3>
                <p className="text-slate-500">Try adjusting your search or category filter.</p>
              </Card>
            )}
          </div>
        </div>
      </div>

      <Modal
        open={!!previewTemplate}
        onCancel={() => setPreviewTemplate(null)}
        footer={[
          <Button
            key="download"
            icon={isDownloading ? <LoadingOutlined /> : <DownloadOutlined />}
            onClick={handleDownload}
            loading={isDownloading}
          >
            {isDownloading ? "Generating..." : "Download Blank"}
          </Button>,
          <Link key="use" to={`/contracts/new/${previewTemplate?.id}`}>
            <Button type="primary" icon={<EditOutlined />}>
              Use This Template
            </Button>
          </Link>
        ]}
        width={800}
        title={previewTemplate?.title}
      >
        <div className="bg-white shadow-sm border border-slate-200 rounded-xl p-8 md:p-12 min-h-[400px]">
          <div 
            className="prose prose-slate max-w-none contract-preview"
            dangerouslySetInnerHTML={{ 
              __html: previewTemplate?.htmlContent.replace(/\{\{(.*?)\}\}/g, '<span class="bg-brand-50 text-brand-700 px-2 py-0.5 rounded border border-brand-100 text-xs font-mono">$1</span>') 
            }}
          />
        </div>
      </Modal>
    </div>
  );
}