import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import SalesLayout from "./pages/sales/SalesLayout";
import SalesDashboard from "./pages/sales/SalesDashboard";
import VendasPage from "./pages/sales/VendasPage";
import ClientesPage from "./pages/sales/ClientesPage";
import CancelamentosPage from "./pages/sales/CancelamentosPage";
import MetasPage from "./pages/sales/MetasPage";
import RankingPage from "./pages/sales/RankingPage";
import UsuariosPage from "./pages/sales/UsuariosPage";
import ConfigPage from "./pages/sales/ConfigPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />

      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Admin />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/sales" element={<SalesLayout />}>
            <Route index element={<SalesDashboard />} />
            <Route path="vendas" element={<VendasPage />} />
            <Route path="clientes" element={<ClientesPage />} />
            <Route path="cancelamentos" element={<CancelamentosPage />} />
            <Route path="metas" element={<MetasPage />} />
            <Route path="ranking" element={<RankingPage />} />
            <Route path="usuarios" element={<UsuariosPage />} />
            <Route path="config" element={<ConfigPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>

    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
