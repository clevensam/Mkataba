import { useState, useEffect } from "react";
import { seedTemplates } from "../services/seedService";
import { Button, Card, message } from "antd";
import { 
  DatabaseOutlined, 
  UploadOutlined, 
  FileTextOutlined, 
  CheckCircleOutlined,
  LoadingOutlined
} from "@ant-design/icons";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate, Link } from "react-router-dom";

export default function AdminDashboard() {
  const [seeding, setSeeding] = useState(false);
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user || user.email !== "clevensamwel@gmail.com") {
        // navigate("/"); 
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleSeed = async () => {
    setSeeding(true);
    setMsg("");
    try {
      const seeded = await seedTemplates();
      if (seeded) {
        setMsg("Templates seeded successfully!");
        message.success("Templates seeded successfully!");
      } else {
        setMsg("Templates already exist in the database.");
        message.info("Templates already exist in the database.");
      }
    } catch (error) {
      setMsg("Error seeding templates.");
      message.error("Error seeding templates.");
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen p-6 md:p-10">
      <div className="w-full">
        <h1 className="text-4xl font-bold text-slate-900 mb-10 tracking-tight">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card>
            <div className="bg-brand-100 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
              <DatabaseOutlined className="text-brand-600 w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Seed Data</h3>
            <p className="text-slate-600 mb-6">Initialize the database with default contract templates.</p>
            <Button 
              type="primary"
              icon={seeding ? <LoadingOutlined /> : <UploadOutlined />}
              onClick={handleSeed}
              loading={seeding}
              block
            >
              Seed Templates
            </Button>
            {msg && <p className="mt-4 text-sm font-medium text-brand-600">{msg}</p>}
          </Card>

          <Card>
            <div className="bg-teal-100 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
              <FileTextOutlined className="text-teal-600 w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Manage Templates</h3>
            <p className="text-slate-600 mb-6">Create, edit, upload, or delete contract templates.</p>
            <Link to="/admin/templates">
              <Button block>
                Manage Templates
              </Button>
            </Link>
          </Card>

          <Card>
            <div className="bg-amber-100 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
              <CheckCircleOutlined className="text-amber-600 w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Review Queue</h3>
            <p className="text-slate-600 mb-6">Review and approve contracts submitted by users.</p>
            <Button disabled>
              Coming Soon
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}