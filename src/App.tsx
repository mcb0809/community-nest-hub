
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Web3DashboardLayout from "./components/layout/Web3DashboardLayout";
import Web3Dashboard from "./pages/Web3Dashboard";
import CourseHub from "./pages/CourseHub";
import CourseViewer from "./pages/CourseViewer";
import CommunityChat from "./pages/CommunityChat";
import EventHub from "./pages/EventHub";
import DocumentationCenter from "./pages/DocumentationCenter";
import Members from "./pages/Members";
import CourseAdmin from "./pages/admin/CourseAdmin";
import CourseDetail from "./pages/admin/CourseDetail";
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
                  <Route path="/admin/course" element={<CourseAdmin />} />
                  <Route path="/admin/course/:courseId" element={<CourseDetail />} />
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
