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
import DespesasPage from "./pages/sales/DespesasPage";
import VendedoresPage from "./pages/sales/VendedoresPage";
import Preview from "./pages/Preview";
import PoliticaPrivacidade from "./pages/PoliticaPrivacidade";
import TermosUso from "./pages/TermosUso";
import { TrackingPixels } from "./components/TrackingPixels";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <TrackingPixels />

      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Admin />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/preview" element={<Preview />} />
          <Route path="/politica-de-privacidade" element={<PoliticaPrivacidade />} />
          <Route path="/termos-de-uso" element={<TermosUso />} />
          <Route path="/sales" element={<SalesLayout />}>
            <Route index element={<SalesDashboard />} />
            <Route path="vendas" element={<VendasPage />} />
            <Route path="clientes" element={<ClientesPage />} />
            <Route path="cancelamentos" element={<CancelamentosPage />} />
            <Route path="metas" element={<MetasPage />} />
            <Route path="ranking" element={<RankingPage />} />
            <Route path="vendedores" element={<VendedoresPage />} />
            <Route path="usuarios" element={<UsuariosPage />} />
            <Route path="despesas" element={<DespesasPage />} />
            <Route path="config" element={<ConfigPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>

    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
