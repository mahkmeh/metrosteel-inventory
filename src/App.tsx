// Fixed imports and routing structure
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Layout from "@/components/Layout";
import Index from "@/pages/Index";
import Materials from "@/pages/Materials";
import Customers from "@/pages/Customers";
import Quotations from "@/pages/Quotations";
import Purchase from "@/pages/Purchase";
import PurchaseOrders from "@/pages/PurchaseOrders";
import PurchaseInvoice from "@/pages/PurchaseInvoice";
import PurchaseReturn from "@/pages/PurchaseReturn";
import Payables from "@/pages/Payables";
import JobWork from "@/pages/JobWork";
import Vendors from "@/pages/Vendors";
import Sales from "@/pages/Sales";

const queryClient = new QueryClient();

function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Index />} />
            <Route path="materials" element={<Materials />} />
            <Route path="customers" element={<Customers />} />
            <Route path="quotations" element={<Quotations />} />
            <Route path="purchase" element={<Purchase />} />
            <Route path="purchase-orders" element={<PurchaseOrders />} />
            <Route path="purchase-invoice" element={<PurchaseInvoice />} />
            <Route path="purchase-return" element={<PurchaseReturn />} />
            <Route path="payables" element={<Payables />} />
            <Route path="job-work" element={<JobWork />} />
            <Route path="vendors" element={<Vendors />} />
            <Route path="sales" element={<Sales />} />
          </Route>
        </Routes>
        <Toaster />
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
