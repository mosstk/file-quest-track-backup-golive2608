
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import RequesterDashboard from "./pages/RequesterDashboard";
import ReceiverDashboard from "./pages/ReceiverDashboard";
import Requests from "./pages/Requests";
import RequestDetail from "./pages/RequestDetail";
import CreateEditRequest from "./pages/CreateEditRequest";
import AdminPanel from "./pages/AdminPanel";
import UserSystemPathsPage from "./pages/UserSystemPathsPage";
import DocumentationSystem from "./pages/DocumentationSystem";
import ReportsPage from "./pages/ReportsPage";
import NotFound from "./pages/NotFound";
// Debug panels removed

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={<Dashboard />} />
              
              <Route path="/requester-dashboard" element={<RequesterDashboard />} />
              <Route path="/receiver-dashboard" element={<ReceiverDashboard />} />
              <Route path="/requests" element={<Requests />} />
              <Route path="/requests/new" element={<CreateEditRequest />} />
              <Route path="/requests/edit/:id" element={<CreateEditRequest />} />
              <Route path="/request/:id" element={<RequestDetail />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/documentation" element={<DocumentationSystem />} />
              <Route path="/system-paths" element={<UserSystemPathsPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            
          </TooltipProvider>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
