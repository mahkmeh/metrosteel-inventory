import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient as QueryClientProvider } from "@tanstack/react-query";
import { QueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Layout } from "@/components/Layout";
import Index from "@/pages/Index";
import Materials from "@/pages/Materials";
import Inventory from "@/pages/Inventory";
import Transactions from "@/pages/Transactions";
import Batches from "@/pages/Batches";
import Customers from "@/pages/Customers";
import Quotations from "@/pages/Quotations";
import SalesOrders from "@/pages/SalesOrders";
import Suppliers from "@/pages/Suppliers";
import Purchase from "@/pages/Purchase";
import PurchaseOrders from "@/pages/PurchaseOrders";
import PurchaseInvoice from "@/pages/PurchaseInvoice";
import PurchaseReturn from "@/pages/PurchaseReturn";
import Payables from "@/pages/Payables";
import JobWork from "@/pages/JobWork";
import Locations from "@/pages/Locations";

const queryClient = new QueryClient();

function App() {
  return (
    <BrowserRouter>
      <QueryClient>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
          <Layout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/materials" element={<Materials />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/batches" element={<Batches />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/quotations" element={<Quotations />} />
              <Route path="/sales-orders" element={<SalesOrders />} />
              <Route path="/suppliers" element={<Suppliers />} />
              <Route path="/purchase" element={<Purchase />} />
              <Route path="/purchase-orders" element={<PurchaseOrders />} />
              <Route path="/purchase-invoice" element={<PurchaseInvoice />} />
              <Route path="/purchase-return" element={<PurchaseReturn />} />
              <Route path="/payables" element={<Payables />} />
              <Route path="/job-work" element={<JobWork />} />
              <Route path="/locations" element={<Locations />} />
            </Routes>
          </Layout>
        </div>
      </QueryClient>
    </BrowserRouter>
  );
}

export default App;
