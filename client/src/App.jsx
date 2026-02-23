import { Toaster } from "react-hot-toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import CreateInspectionPage from "./pages/CreateInspectionPage";
import InspectionsPage from "./pages/InspectionsPage";
import CompaniesPage from "./pages/CompaniesPage";
import InspectorsPage from "./pages/InspectorsPage";
import VendorsPage from "./pages/VendorsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import ReportsPage from "./pages/ReportsPage";
import FormBuilderPage from "./pages/FormBuilderPage";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import ProfilePage from "./pages/ProfilePage";
import VerifyReport from "./pages/VerifyReport";
import KeyGeneration from "./pages/KeyGeneration";
import ServicesManagement from "./pages/ServicesManagement";
import ClientManagement from "./pages/ClientManagement";
import ClientDetailDashboard from "./pages/ClientDetailDashboard";

// Specialized Service Pages
import BaseIndustrialDashboard from "./components/services/common/reports/BaseIndustrialDashboard";
import ReportDispatcher from "./components/services/common/reports/ReportDispatcher";
import BaseIndustrialReports from "./components/services/common/reports/BaseIndustrialReports";
import BaseIndustrialNewSelection from "./components/services/common/reports/BaseIndustrialNewSelection";

import { ThemeProvider } from "@/contexts/ThemeContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <SidebarProvider>
            <TooltipProvider>
              <Toaster position="top-center" reverseOrder={false} />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/login" element={<AuthPage />} />

                {/* Dashboard Routes with Layout - Protected */}
                <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/admin" element={<SuperAdminDashboard />} />
                  <Route path="/key-generation" element={<KeyGeneration />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/inspections" element={<InspectionsPage />} />
                  <Route path="/companies" element={<CompaniesPage />} />
                  <Route path="/inspectors" element={<InspectorsPage />} />
                  <Route path="/vendors" element={<VendorsPage />} />
                  <Route path="/reports" element={<ReportsPage />} />
                  <Route path="/form-builder" element={<FormBuilderPage />} />
                  <Route path="/analytics" element={<AnalyticsPage />} />
                  <Route path="/inspections/new" element={<CreateInspectionPage />} />

                  {/* Global Dynamic Industrial Services */}
                  <Route path="/admin/services/:id/:serviceType" element={<BaseIndustrialDashboard />} />
                  <Route path="/admin/services/:id/:serviceType/new" element={<ReportDispatcher />} />
                  <Route path="/admin/services/:id/:serviceType/edit/:inspectionId" element={<ReportDispatcher />} />
                  <Route path="/admin/services/:id/:serviceType/reports" element={<BaseIndustrialReports />} />
                  <Route path="/admin/services/:id/:serviceType/new/selection" element={<BaseIndustrialNewSelection />} />


                  <Route path="/services/industrial-inspection/ndt-services/:inspectionId/edit" element={<ReportDispatcher />} />
                  <Route path="/services/industrial-inspection/:serviceType/:inspectionId/edit" element={<ReportDispatcher />} />

                  <Route path="/admin/services" element={<ServicesManagement />} />
                  <Route path="/admin/clients" element={<ClientManagement />} />
                  <Route path="/admin/clients/:id" element={<ClientDetailDashboard />} />
                </Route>

                {/* Public Routes */}
                <Route path="/verify/:token" element={<VerifyReport />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </TooltipProvider>
          </SidebarProvider>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
