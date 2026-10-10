import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
const Admin = lazy(() => import("./pages/Admin"));
const SalesLayout = lazy(() => import("./pages/sales/SalesLayout"));
const SalesDashboard = lazy(() => import("./pages/sales/SalesDashboard"));
const VendasPage = lazy(() => import("./pages/sales/VendasPage"));
const ClientesPage = lazy(() => import("./pages/sales/ClientesPage"));
const CancelamentosPage = lazy(() => import("./pages/sales/CancelamentosPage"));
const MetasPage = lazy(() => import("./pages/sales/MetasPage"));
const RankingPage = lazy(() => import("./pages/sales/RankingPage"));
const UsuariosPage = lazy(() => import("./pages/sales/UsuariosPage"));
const ConfigPage = lazy(() => import("./pages/sales/ConfigPage"));
const DespesasPage = lazy(() => import("./pages/sales/DespesasPage"));
const VendedoresPage = lazy(() => import("./pages/sales/VendedoresPage"));
const Preview = lazy(() => import("./pages/Preview"));
const PoliticaPrivacidade = lazy(() => import("./pages/PoliticaPrivacidade"));
const TermosUso = lazy(() => import("./pages/TermosUso"));
import { TrackingPixels } from "./components/TrackingPixels";
import { SiteFavicon } from "./components/SiteFavicon";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <TrackingPixels />
      <SiteFavicon />

      <BrowserRouter>
        <Suspense fallback={null}>
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
        </Suspense>
      </BrowserRouter>

    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
