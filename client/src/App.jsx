import { Toaster } from "react-hot-toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";

import { lazy, Suspense } from "react";
import { ThemeProvider } from "@/contexts/ThemeContext";

// --- Lazy Loading Page Components ---
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const CreateInspectionPage = lazy(() => import("./pages/CreateInspectionPage"));
const InspectionsPage = lazy(() => import("./pages/InspectionsPage"));
const CompaniesPage = lazy(() => import("./pages/CompaniesPage"));
const InspectorsPage = lazy(() => import("./pages/InspectorsPage"));
const VendorsPage = lazy(() => import("./pages/VendorsPage"));
const AnalyticsPage = lazy(() => import("./pages/AnalyticsPage"));
const ReportsPage = lazy(() => import("./pages/ReportsPage"));
const FormBuilderPage = lazy(() => import("./pages/FormBuilderPage"));
const SuperAdminDashboard = lazy(() => import("./pages/SuperAdminDashboard"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const VerifyReport = lazy(() => import("./pages/VerifyReport"));
const KeyGeneration = lazy(() => import("./pages/KeyGeneration"));
const ServicesManagement = lazy(() => import("./pages/ServicesManagement"));
const ClientManagement = lazy(() => import("./pages/ClientManagement"));
const AddClientPage = lazy(() => import("./pages/AddClientPage"));
const EditClientPage = lazy(() => import("./pages/EditClientPage"));
const ClientDetailDashboard = lazy(() => import("./pages/ClientDetailDashboard"));
const AddMemberPage = lazy(() => import("./pages/AddMemberPage"));
const CompanyProfile = lazy(() => import("./pages/CompanyProfile"));

// Specialized Service Pages
const BaseIndustrialDashboard = lazy(() => import("./components/services/common/reports/BaseIndustrialDashboard"));
const ReportDispatcher = lazy(() => import("./components/services/common/reports/ReportDispatcher"));
const BaseIndustrialReports = lazy(() => import("./components/services/common/reports/BaseIndustrialReports"));
const BaseIndustrialNewSelection = lazy(() => import("./components/services/common/reports/BaseIndustrialNewSelection"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <SidebarProvider>
            <TooltipProvider>
              <Toaster position="top-center" reverseOrder={false} />
              <Suspense fallback={null}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/login" element={<AuthPage />} />

                  {/* Dashboard Routes with Layout - Protected */}
                  <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/admin" element={<SuperAdminDashboard />} />
                    <Route path="/admin/company-profile" element={<CompanyProfile />} />
                    <Route path="/key-generation" element={<KeyGeneration />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/inspections" element={<InspectionsPage />} />
                    <Route path="/companies" element={<CompaniesPage />} />
                    <Route path="/inspectors" element={<InspectorsPage />} />
                    <Route path="/members/new" element={<AddMemberPage />} />
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
                    <Route path="/admin/clients/new" element={<AddClientPage />} />
                    <Route path="/admin/clients/:id/edit" element={<EditClientPage />} />
                    <Route path="/admin/clients/:id" element={<ClientDetailDashboard />} />
                  </Route>

                  {/* Public Routes */}
                  <Route path="/verify/:token" element={<VerifyReport />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </TooltipProvider>
          </SidebarProvider>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
