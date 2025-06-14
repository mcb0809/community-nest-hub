
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Web3DashboardLayout from "./components/layout/Web3DashboardLayout";
import Web3Dashboard from "./pages/Web3Dashboard";
import CourseHub from "./pages/CourseHub";
import CommunityChat from "./pages/CommunityChat";
import EventHub from "./pages/EventHub";
import DocumentationCenter from "./pages/DocumentationCenter";
import Members from "./pages/Members";
import CourseAdmin from "./pages/admin/CourseAdmin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Web3DashboardLayout>
          <Routes>
            <Route path="/" element={<Web3Dashboard />} />
            <Route path="/courses" element={<CourseHub />} />
            <Route path="/chat" element={<CommunityChat />} />
            <Route path="/events" element={<EventHub />} />
            <Route path="/documents" element={<DocumentationCenter />} />
            <Route path="/members" element={<Members />} />
            <Route path="/admin/course" element={<CourseAdmin />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Web3DashboardLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
