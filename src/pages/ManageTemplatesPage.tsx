import React, { useState, useEffect } from "react";
import { 
  getAllTemplates, 
  deleteTemplate, 
  togglePublishTemplate,
  Template 
} from "../services/templateService";
import { Button, Card, Modal, Tag, message, Switch } from "antd";
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined, 
  EyeInvisibleOutlined, 
  LoadingOutlined,
  ArrowLeftOutlined,
  FileTextOutlined,
  ExclamationCircleOutlined
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";

const { confirm } = Modal;

export default function ManageTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const data = await getAllTemplates();
      setTemplates(data);
    } catch (error) {
      console.error("Error fetching templates:", error);
      message.error("Failed to load templates");
    } finally {
      setLoading(false);
    }
  };

  const showDeleteConfirm = (id: string) => {
    confirm({
      title: 'Delete Template?',
      icon: <ExclamationCircleOutlined />,
      content: 'Are you sure you want to delete this template? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await deleteTemplate(id);
          message.success("Template deleted successfully");
          fetchTemplates();
        } catch (error) {
          console.error("Error deleting template:", error);
          message.error("Failed to delete template");
        }
      },
    });
  };

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    try {
      await togglePublishTemplate(id, !currentStatus);
      message.success(currentStatus ? "Template unpublished" : "Template published");
      fetchTemplates();
    } catch (error) {
      console.error("Error toggling publish status:", error);
      message.error("Failed to update template status");
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen p-6 md:p-10">
      <div className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <Link to="/admin" className="text-brand-600 flex items-center gap-2 text-sm font-semibold mb-2 hover:underline">
              <ArrowLeftOutlined /> Back to Admin
            </Link>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Manage Templates</h1>
          </div>
          <Button 
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={() => navigate("/admin/templates/new")}
          >
            Create Template
          </Button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <LoadingOutlined spin style={{ fontSize: 40 }} className="text-brand-600 mb-4" />
            <p className="text-slate-500 font-medium">Loading templates...</p>
          </div>
        ) : templates.length === 0 ? (
          <Card className="text-center p-12">
            <div className="bg-slate-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FileTextOutlined className="text-slate-400 w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No templates found</h3>
            <p className="text-slate-500 mb-8">Get started by creating your first contract template.</p>
            <Button type="primary" onClick={() => navigate("/admin/templates/new")}>
              Create Template
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <motion.div 
                key={template.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card
                  hoverable
                  title={
                    <div className="flex items-start justify-between">
                      <Tag color={template.published ? "success" : "default"}>
                        {template.published ? 'Published' : 'Draft'}
                      </Tag>
                      <Tag>{template.category}</Tag>
                    </div>
                  }
                  extra={
                    <div className="flex items-center gap-2">
                      <Button 
                        type="text" 
                        icon={<EditOutlined />}
                        onClick={() => navigate(`/admin/templates/${template.id}/edit`)}
                      />
                      <Switch
                        checked={template.published}
                        onChange={() => handleTogglePublish(template.id!, template.published)}
                        checkedChildren={<EyeOutlined />}
                        unCheckedChildren={<EyeInvisibleOutlined />}
                      />
                      <Button 
                        type="text" 
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => showDeleteConfirm(template.id!)}
                      />
                    </div>
                  }
                >
                  <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-1">{template.title}</h3>
                  <p className="text-slate-500 text-sm line-clamp-2">{template.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}