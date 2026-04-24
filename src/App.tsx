import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
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
import MyContractsPage from "./pages/MyContractsPage";
import ProfilePage from "./pages/ProfilePage";
import Navbar from "./components/layout/Navbar";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import ErrorBoundary from "./components/ui/ErrorBoundary";

const queryClient = new QueryClient();

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
          <p className="text-slate-500 font-medium animate-pulse">Initializing Trustfy...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col">
          <Header />
          <div className="flex flex-col md:flex-row flex-grow">
            <Navbar />
            <main className="flex-grow pb-20 md:pb-0">
<Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route 
                  path="/templates" 
                  element={user ? <TemplatesPage /> : <Navigate to="/login" replace />} 
                />
                <Route 
                  path="/templates/:id" 
                  element={user ? <TemplateDetail /> : <Navigate to="/login" replace />} 
                />
                <Route 
                  path="/dashboard" 
                  element={user ? <ErrorBoundary><Dashboard /></ErrorBoundary> : <Navigate to="/login" replace />} 
                />
                <Route 
                  path="/my-contracts" 
                  element={user ? <ErrorBoundary><MyContractsPage /></ErrorBoundary> : <Navigate to="/login" replace />} 
                />
                <Route 
                  path="/profile" 
                  element={user ? <ProfilePage /> : <Navigate to="/login" replace />} 
                />
                <Route 
                  path="/contracts/new/:templateId" 
                  element={user ? <ErrorBoundary><ContractEditor /></ErrorBoundary> : <Navigate to="/login" replace />} 
                />
                <Route 
                  path="/contracts/:id/edit" 
                  element={user ? <ErrorBoundary><ContractEditor /></ErrorBoundary> : <Navigate to="/login" replace />} 
                />
                <Route path="/contracts/share/:id" element={<ErrorBoundary><SharedContractPage /></ErrorBoundary>} />
                
                {/* Admin Routes */}
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/reviews" element={<AdminReviews />} />
                <Route path="/admin/templates" element={<ManageTemplatesPage />} />
                <Route path="/admin/templates/new" element={<TemplateEditorPage />} />
                <Route path="/admin/templates/:id/edit" element={<TemplateEditorPage />} />
                
                <Route path="*" element={<Navigate to={user ? "/dashboard" : "/"} replace />} />
              </Routes>
            </main>
          </div>
          <Footer />
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
