import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import { collection, query, where, getDocs, getDoc, orderBy, deleteDoc, doc, updateDoc, limit } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { Card, Button, Modal, Tag, message, Statistic } from "antd";
import type { CardProps } from "antd";
import { 
  FileTextOutlined, 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  ClockCircleOutlined, 
  CheckCircleOutlined,
  LoadingOutlined,
  RightOutlined,
  DownloadOutlined,
  LayoutOutlined,
  ArrowRightOutlined,
  SearchOutlined,
  ExclamationCircleOutlined
} from "@ant-design/icons";
import { motion, AnimatePresence } from "motion/react";
import { format } from "date-fns";
import { downloadContractPDF, downloadBlankTemplate } from "../services/pdfService";

const { confirm } = Modal;

export default function Dashboard() {
  const [contracts, setContracts] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleDownloadContract = async (contract: any) => {
    setIsDownloading(contract.id);
    try {
      const templateDoc = await getDoc(doc(db, "templates", contract.templateId));
      if (templateDoc.exists()) {
        const templateData = templateDoc.data();
        await downloadContractPDF(
          templateData.title, 
          templateData.htmlContent, 
          JSON.parse(contract.filledData)
        );
        message.success("Contract downloaded successfully");
      } else {
        message.error("Template not found for this contract");
      }
    } catch (error) {
      console.error("Error downloading contract:", error);
      message.error("Failed to download contract");
    } finally {
      setIsDownloading(null);
    }
  };

  const makeAdmin = async () => {
    if (!user) return;
    setIsUpdating(true);
    try {
      await updateDoc(doc(db, "users", user.uid), { role: "ADMIN" });
      message.success("You are now an Admin! Please refresh the page.");
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      console.error("Error making admin:", error);
      message.error("Failed to update admin status");
    } finally {
      setIsUpdating(false);
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
      if (!user) return;
      setLoading(true);
      try {
        const contractsQuery = query(
          collection(db, "contracts"), 
          where("userId", "==", user.uid),
          orderBy("updatedAt", "desc"),
          limit(5)
        );
        const contractsSnapshot = await getDocs(contractsQuery);
        setContracts(contractsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        const templatesQuery = query(
          collection(db, "templates"),
          where("published", "==", true),
          orderBy("createdAt", "desc"),
          limit(4)
        );
        const templatesSnapshot = await getDocs(templatesQuery);
        setTemplates(templatesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        message.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  const showDeleteConfirm = (id: string) => {
    confirm({
      title: 'Delete Contract?',
      icon: <ExclamationCircleOutlined />,
      content: 'Are you sure you want to delete this contract? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await deleteDoc(doc(db, "contracts", id));
          setContracts(prev => prev.filter(c => c.id !== id));
          message.success("Contract deleted successfully");
        } catch (error) {
          console.error("Error deleting contract:", error);
          message.error("Failed to delete contract");
        }
      },
    });
  };

  const getStatusTag = (status: string) => {
    switch (status) {
      case "signed":
        return <Tag icon={<CheckCircleOutlined />} color="success">Signed</Tag>;
      case "pending_review":
        return <Tag icon={<ClockCircleOutlined />} color="warning">Pending Review</Tag>;
      case "approved":
        return <Tag icon={<CheckCircleOutlined />} color="processing">Approved</Tag>;
      default:
        return <Tag icon={<EditOutlined />} color="default">Draft</Tag>;
    }
  };

  const signedCount = contracts.filter(c => c.status === "signed").length;
  const draftCount = contracts.filter(c => c.status === "draft" || !c.status).length;

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="p-6 md:p-10">
        <div className="w-full max-w-7xl mx-auto">
          <header className="mb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 text-brand-600 font-bold text-sm mb-2">
                  Welcome Back
                </div>
                <h1 className="text-4xl font-bold text-slate-900 mb-2 tracking-tight">
                  Hello, {user?.displayName || user?.email?.split('@')[0] || "User"}
                </h1>
                <p className="text-slate-600">Here's what's happening with your contracts today.</p>
                {user?.email === "clevensamwel@gmail.com" && (
                  <Button 
                    onClick={makeAdmin}
                    loading={isUpdating}
                    className="mt-4"
                    size="small"
                  >
                    {isUpdating ? "Updating..." : "Verify Admin Status"}
                  </Button>
                )}
              </div>
              <Link to="/templates">
                <Button type="primary" icon={<PlusOutlined />} size="large">
                  New Contract
                </Button>
              </Link>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0 }}
            >
              <Card>
                <Statistic 
                  title={<span className="text-slate-500 font-bold uppercase text-xs">Total Contracts</span>} 
                  value={contracts.length} 
                  prefix={<FileTextOutlined className="text-brand-600" />}
                />
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <Statistic 
                  title={<span className="text-slate-500 font-bold uppercase text-xs">Signed</span>} 
                  value={signedCount} 
                  prefix={<CheckCircleOutlined className="text-teal-600" />}
                  styles={{ content: { color: '#0d9488' } }}
                />
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <Statistic 
                  title={<span className="text-slate-500 font-bold uppercase text-xs">Drafts</span>} 
                  value={draftCount} 
                  prefix={<ClockCircleOutlined className="text-amber-600" />}
                  styles={{ content: { color: '#d97706' } }}
                />
              </Card>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900">Recent Activity</h2>
                {contracts.length > 0 && (
                  <Link to="/contracts" className="text-brand-600 font-bold text-sm hover:underline flex items-center gap-1">
                    View All <RightOutlined />
                  </Link>
                )}
              </div>

              {loading ? (
                <Card className="text-center p-12">
                  <LoadingOutlined spin style={{ fontSize: 40 }} className="text-brand-600 mb-4" />
                  <p className="text-slate-500">Loading activity...</p>
                </Card>
              ) : contracts.length > 0 ? (
                <div className="space-y-4">
                  {contracts.map((contract, idx) => (
                    <motion.div
                      key={contract.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Card hoverable className="group">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="bg-slate-50 p-3 rounded-xl group-hover:bg-brand-50 transition-colors">
                              <FileTextOutlined className="w-6 h-6 text-slate-400 group-hover:text-brand-600 transition-colors" />
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                                Contract #{contract.id.slice(-6).toUpperCase()}
                              </h3>
                              <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                                <span>{contract.updatedAt ? format(contract.updatedAt.toDate(), "MMM d, yyyy") : "Just now"}</span>
                                <span>•</span>
                                {getStatusTag(contract.status)}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Link 
                              to={`/contracts/${contract.id}/edit`}
                              className="ant-btn ant-btn-default"
                              title="Edit"
                            >
                              <EditOutlined />
                            </Link>
                            <Button 
                              type="text"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => showDeleteConfirm(contract.id)}
                              title="Delete"
                            />
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <Card className="text-center p-12 border-dashed">
                  <FileTextOutlined style={{ fontSize: 48 }} className="text-slate-200 mb-4" />
                  <p className="text-slate-500">No recent activity found.</p>
                </Card>
              )}
            </div>

            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Quick Templates</h2>
                <div className="space-y-4">
                  {templates.map((template, idx) => (
                    <motion.div
                      key={template.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 + (idx * 0.1) }}
                    >
                      <Card hoverable className="group">
                        <div className="flex items-center justify-between mb-3">
                          <div className="bg-brand-50 p-2 rounded-lg">
                            <LayoutOutlined className="text-brand-600" />
                          </div>
                          <Button 
                            type="text" 
                            icon={<DownloadOutlined />}
                            onClick={() => downloadBlankTemplate(template.title, template.htmlContent)}
                            className="text-slate-400 hover:text-brand-600"
                          />
                        </div>
                        <h4 className="font-bold text-slate-900 mb-1 line-clamp-1">{template.title}</h4>
                        <p className="text-xs text-slate-500 mb-4 line-clamp-2">{template.description}</p>
                        <Link 
                          to={`/contracts/new/${template.id}`}
                          className="text-xs font-bold text-brand-600 flex items-center gap-1 hover:underline"
                        >
                          Use this template <ArrowRightOutlined />
                        </Link>
                      </Card>
                    </motion.div>
                  ))}
                  <Link 
                    to="/templates"
                    className="flex items-center justify-center gap-2 w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all"
                  >
                    Browse All Templates <SearchOutlined />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}