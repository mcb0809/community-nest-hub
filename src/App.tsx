
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import AdminProtectedRoute from "@/components/auth/AdminProtectedRoute";
import Web3DashboardLayout from "./components/layout/Web3DashboardLayout";
import AdminLayout from "./components/layout/AdminLayout";
import Web3Dashboard from "./pages/Web3Dashboard";
import CourseHub from "./pages/CourseHub";
import CourseViewer from "./pages/CourseViewer";
import CommunityChat from "./pages/CommunityChat";
import EventHub from "./pages/EventHub";
import DocumentationCenter from "./pages/DocumentationCenter";
import Members from "./pages/Members";
import CourseAdmin from "./pages/admin/CourseAdmin";
import CourseDetail from "./pages/admin/CourseDetail";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            
            {/* Admin Routes - Protected */}
            <Route path="/admin/*" element={
              <AdminProtectedRoute>
                <AdminLayout>
                  <Routes>
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="course" element={<CourseAdmin />} />
                    <Route path="course/:courseId" element={<CourseDetail />} />
                    <Route path="messages" element={<div className="text-white">Messages Management - Coming Soon</div>} />
                    <Route path="events" element={<div className="text-white">Events Management - Coming Soon</div>} />
                    <Route path="documents" element={<div className="text-white">Documents Management - Coming Soon</div>} />
                    <Route path="database" element={<div className="text-white">Database Management - Coming Soon</div>} />
                    <Route path="analytics" element={<div className="text-white">Analytics - Coming Soon</div>} />
                    <Route path="settings" element={<div className="text-white">Settings - Coming Soon</div>} />
                  </Routes>
                </AdminLayout>
              </AdminProtectedRoute>
            } />
            
            {/* User Routes */}
            <Route path="/*" element={
              <Web3DashboardLayout>
                <Routes>
                  <Route path="/" element={<Web3Dashboard />} />
                  <Route path="/courses" element={<CourseHub />} />
                  <Route path="/courses/:courseId" element={<CourseViewer />} />
                  <Route path="/course/:slug" element={<CourseViewer />} />
                  <Route path="/chat" element={<CommunityChat />} />
                  <Route path="/events" element={<EventHub />} />
                  <Route path="/documents" element={<DocumentationCenter />} />
                  <Route path="/members" element={<Members />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Web3DashboardLayout>
            } />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
