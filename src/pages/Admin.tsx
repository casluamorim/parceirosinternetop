import { Link } from "react-router-dom";
import { ArrowLeft, AlertCircle, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
 import { siteConfig } from "@/lib/config";
import { useAuth } from "@/hooks/useAuth";
 import { Alert, AlertDescription } from "@/components/ui/alert";
import { AdminAuth } from "@/components/admin/AdminAuth";
import { PlansCombosTab } from "@/components/admin/PlansCombosTab";
 import { TestimonialsTab } from "@/components/admin/TestimonialsTab";
 import { TrustedCompaniesTab } from "@/components/admin/TrustedCompaniesTab";
 import { SettingsTab } from "@/components/admin/SettingsTab";
 import { CoverageTab } from "@/components/admin/CoverageTab";

export default function Admin() {
  const { user, isAdmin, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <AdminAuth />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6 text-accent-foreground" />
            </div>
            <CardTitle>Acesso Restrito</CardTitle>
            <CardDescription>
              Sua conta não possui permissão de administrador.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                Entre em contato com o administrador do sistema para solicitar acesso.
              </AlertDescription>
            </Alert>
            <div className="flex flex-col gap-2">
              <Button variant="outline" onClick={() => signOut()}>
                Sair
              </Button>
              <Link to="/" className="block text-center text-sm text-muted-foreground hover:text-foreground">
                ← Voltar ao site
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao site
              </Button>
            </Link>
            <div className="h-6 w-px bg-border" />
            <h1 className="font-display font-bold text-lg">Painel Administrativo</h1>
          </div>
            <div className="flex items-center gap-3">
              <Link to="/sales">
                <Button variant="outline" size="sm">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Módulo de Vendas
                </Button>
              </Link>
              <span className="text-sm text-muted-foreground">{user.email}</span>
              <Button variant="outline" size="sm" onClick={() => signOut()}>
                Sair
              </Button>
            </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <Tabs defaultValue="plans-combos" className="space-y-6">
          <div className="w-full overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            <TabsList className="inline-flex w-max sm:w-full sm:grid sm:grid-cols-2 lg:grid-cols-5 gap-1">
              <TabsTrigger value="plans-combos" className="whitespace-nowrap">Planos e Combos</TabsTrigger>
              <TabsTrigger value="companies" className="whitespace-nowrap">Empresas</TabsTrigger>
              <TabsTrigger value="coverage" className="whitespace-nowrap">Cobertura</TabsTrigger>
              <TabsTrigger value="testimonials" className="whitespace-nowrap">Depoimentos</TabsTrigger>
              <TabsTrigger value="settings" className="whitespace-nowrap">Configurações</TabsTrigger>
            </TabsList>
          </div>

          {/* Plans & Combos Tab */}
          <TabsContent value="plans-combos">
            <PlansCombosTab />
          </TabsContent>
 
           {/* Trusted Companies Tab */}
           <TabsContent value="companies">
             <TrustedCompaniesTab />
           </TabsContent>

          {/* Coverage Tab */}
          <TabsContent value="coverage">
            <CoverageTab />
          </TabsContent>

           {/* Testimonials Tab */}
           <TabsContent value="testimonials">
             <TestimonialsTab />
          </TabsContent>

           {/* Settings Tab */}
           <TabsContent value="settings">
             <SettingsTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
