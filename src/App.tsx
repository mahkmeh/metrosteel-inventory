
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/hooks/use-theme";
import Layout from "@/components/Layout";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Materials from "./pages/Materials";
import MaterialDetails from "./pages/MaterialDetails";
import Customers from "./pages/Customers";
import Quotations from "./pages/Quotations";
import Sales from "./pages/Sales";
import Purchase from "./pages/Purchase";
import PurchaseOrders from "./pages/PurchaseOrders";
import PurchaseInvoice from "./pages/PurchaseInvoice";
import PurchaseReturn from "./pages/PurchaseReturn";
import Vendors from "./pages/Vendors";
import Payables from "./pages/Payables";
import JobWork from "./pages/JobWork";
import JobWorkOutward from "./pages/JobWorkOutward";
import JobWorkInward from "./pages/JobWorkInward";
import JobWorkContractors from "./pages/JobWorkContractors";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Index />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="materials" element={<Materials />} />
              <Route path="materials/:id" element={<MaterialDetails />} />
              <Route path="customers" element={<Customers />} />
              <Route path="quotations" element={<Quotations />} />
              <Route path="sales" element={<Sales />} />
              <Route path="purchase" element={<Purchase />} />
              <Route path="purchase/orders" element={<PurchaseOrders />} />
              <Route path="purchase/invoice" element={<PurchaseInvoice />} />
              <Route path="purchase/returns" element={<PurchaseReturn />} />
              <Route path="purchase/payables" element={<Payables />} />
              <Route path="vendors" element={<Vendors />} />
              <Route path="jobwork" element={<Navigate to="/jobwork/outward" replace />} />
              <Route path="jobwork/outward" element={<JobWorkOutward />} />
              <Route path="jobwork/inward" element={<JobWorkInward />} />
              <Route path="jobwork/contractors" element={<JobWorkContractors />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
