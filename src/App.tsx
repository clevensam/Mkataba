import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Dashboard from "./pages/Dashboard";
import TemplatesPage from "./pages/TemplatesPage";
import TemplateDetail from "./pages/TemplateDetail";
import ContractEditor from "./pages/ContractEditor";
import AdminDashboard from "./pages/AdminDashboard";
import AdminReviews from "./pages/AdminReviews";
import ManageTemplatesPage from "./pages/ManageTemplatesPage";
import TemplateEditorPage from "./pages/TemplateEditorPage";
import SharedContractPage from "./pages/SharedContractPage";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/templates" element={<TemplatesPage />} />
              <Route path="/templates/:id" element={<TemplateDetail />} />
              
              {/* Protected Routes (will add auth guard later) */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/contracts/new/:templateId" element={<ContractEditor />} />
              <Route path="/contracts/:id/edit" element={<ContractEditor />} />
              <Route path="/contracts/share/:id" element={<SharedContractPage />} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/reviews" element={<AdminReviews />} />
              <Route path="/admin/templates" element={<ManageTemplatesPage />} />
              <Route path="/admin/templates/new" element={<TemplateEditorPage />} />
              <Route path="/admin/templates/:id/edit" element={<TemplateEditorPage />} />
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
