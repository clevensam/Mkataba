import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { db, auth } from "../firebase";
import { collection, query, where, getDocs, getDoc, orderBy, deleteDoc, doc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Card, Button, Input, Select, Tag, Modal, message } from "antd";
import { 
  FileTextOutlined, 
  EditOutlined, 
  DownloadOutlined, 
  DeleteOutlined, 
  ClockCircleOutlined, 
  CheckCircleOutlined,
  SearchOutlined,
  ShareAltOutlined,
  PlusOutlined,
  ExclamationCircleOutlined
} from "@ant-design/icons";
import { motion, AnimatePresence } from "motion/react";
import { format } from "date-fns";
import { downloadContractPDF } from "../services/pdfService";

const { confirm } = Modal;
const { Search } = Input;

export default function MyContractsPage() {
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [filter, setFilter] = useState("all");
  const [searchText, setSearchText] = useState("");
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (!u) navigate("/login");
      setUser(u);
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const fetchContracts = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const q = query(
          collection(db, "contracts"), 
          where("userId", "==", user.uid),
          orderBy("updatedAt", "desc")
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setContracts(data);
      } catch (error) {
        console.error("Error fetching contracts:", error);
        message.error("Failed to fetch contracts");
      } finally {
        setLoading(false);
      }
    };

    fetchContracts();
  }, [user]);

  const showDeleteConfirm = (id: string) => {
    confirm({
      title: 'Delete Contract?',
      icon: <ExclamationCircleOutlined />,
      content: 'Are you sure? This action cannot be undone.',
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
      default:
        return <Tag icon={<EditOutlined />} color="default">Draft</Tag>;
    }
  };

  const filteredContracts = contracts.filter(c => {
    const matchesFilter = filter === "all" || (filter === "draft" && (!c.status || c.status === "draft")) || c.status === filter;
    const matchesSearch = c.id.toLowerCase().includes(searchText.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="bg-slate-50 min-h-screen p-6 md:p-10">
      <div className="w-full max-w-7xl mx-auto">
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2 tracking-tight">My Contracts</h1>
            <p className="text-slate-600">View and manage all your saved, signed, and drafted documents.</p>
          </div>
          <Link to="/templates">
            <Button type="primary" icon={<PlusOutlined />} size="large">
              New Contract
            </Button>
          </Link>
        </header>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <Search
            placeholder="Search by contract ID..."
            allowClear
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="flex-grow"
            size="large"
            prefix={<SearchOutlined className="text-slate-400" />}
          />
          <Select
            value={filter}
            onChange={setFilter}
            size="large"
            style={{ width: 160 }}
            options={[
              { value: "all", label: "All" },
              { value: "draft", label: "Draft" },
              { value: "signed", label: "Signed" },
              { value: "pending_review", label: "Pending Review" },
            ]}
          />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-brand-600 text-xl mb-4">Loading contracts...</div>
          </div>
        ) : filteredContracts.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {filteredContracts.map((contract, idx) => (
              <motion.div
                key={contract.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card hoverable className="group">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="bg-brand-50 p-3 rounded-xl group-hover:bg-brand-100 transition-colors">
                        <FileTextOutlined className="w-6 h-6 text-brand-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                          Contract #{contract.id.slice(-6).toUpperCase()}
                        </h3>
                        <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                          <span>Updated {contract.updatedAt ? format(contract.updatedAt.toDate(), "MMM d, yyyy") : "Just now"}</span>
                          <span>•</span>
                          {getStatusTag(contract.status)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Button 
                        icon={<ShareAltOutlined />}
                        onClick={() => navigate(`/contracts/${contract.id}/edit`)}
                        title="Share"
                      />
                      <Button 
                        icon={<EditOutlined />}
                        onClick={() => navigate(`/contracts/${contract.id}/edit`)}
                      >
                        Edit
                      </Button>
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
          <Card className="text-center p-20">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileTextOutlined className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">No contracts found</h3>
            <p className="text-slate-500 max-w-sm mx-auto mb-8">
              Try adjusting your filters or search terms to find what you're looking for.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}