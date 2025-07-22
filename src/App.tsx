
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import Layout from "./components/Layout";

// Import pages
import Index from "./pages/Index";
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
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <Router>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="materials" element={<Materials />} />
              <Route path="materials/:id" element={<MaterialDetails />} />
              <Route path="customers" element={<Customers />} />
              <Route path="quotations" element={<Quotations />} />
              <Route path="sales" element={<Sales />} />
              <Route path="purchase" element={<Purchase />} />
              <Route path="purchase/invoice" element={<PurchaseInvoice />} />
              <Route path="purchase/vendors" element={<Vendors />} />
              <Route path="purchase/return" element={<PurchaseReturn />} />
              <Route path="purchase/payables" element={<Payables />} />
              <Route path="jobwork" element={<JobWork />} />
              <Route path="jobwork/inward" element={<JobWork />} />
              <Route path="jobwork/outward" element={<JobWork />} />
              <Route path="jobwork/contractors" element={<JobWork />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Router>
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
