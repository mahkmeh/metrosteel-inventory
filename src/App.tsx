import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/use-theme";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Materials from "./pages/Materials";
import MaterialDetails from "./pages/MaterialDetails";
import Customers from "./pages/Customers";
import Quotations from "./pages/Quotations";
import Sales from "./pages/Sales";
import Purchase from "./pages/Purchase";
import PurchaseInvoice from "./pages/PurchaseInvoice";
import Vendors from "./pages/Vendors";
import PurchaseReturn from "./pages/PurchaseReturn";
import Payables from "./pages/Payables";
import JobWork from "./pages/JobWork";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="steel-trader-theme">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="materials" element={<Materials />} />
                <Route path="materials/:id" element={<MaterialDetails />} />
                <Route path="customers" element={<Customers />} />
                <Route path="quotations" element={<Quotations />} />
                <Route path="purchase" element={<Purchase />} />
                <Route path="purchase/invoice" element={<PurchaseInvoice />} />
                <Route path="purchase/vendors" element={<Vendors />} />
                <Route path="purchase/return" element={<PurchaseReturn />} />
                <Route path="purchase/payables" element={<Payables />} />
                <Route path="sales" element={<Sales />} />
                <Route path="jobwork" element={<JobWork />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
