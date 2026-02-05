 import { Link } from "react-router-dom";
 import { ArrowLeft, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
 import { siteConfig } from "@/lib/config";
import { useAuth } from "@/hooks/useAuth";
 import { Alert, AlertDescription } from "@/components/ui/alert";
import { AdminAuth } from "@/components/admin/AdminAuth";
import { PlansTab } from "@/components/admin/PlansTab";
 import { TestimonialsTab } from "@/components/admin/TestimonialsTab";
 import { TrustedCompaniesTab } from "@/components/admin/TrustedCompaniesTab";
 import { SettingsTab } from "@/components/admin/SettingsTab";

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
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user.email}</span>
            <Button variant="outline" size="sm" onClick={() => signOut()}>
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <Tabs defaultValue="plans" className="space-y-6">
           <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
            <TabsTrigger value="plans">Planos</TabsTrigger>
             <TabsTrigger value="companies">Empresas</TabsTrigger>
            <TabsTrigger value="coverage">Cobertura</TabsTrigger>
            <TabsTrigger value="testimonials">Depoimentos</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>

          {/* Plans Tab */}
          <TabsContent value="plans">
            <PlansTab />
          </TabsContent>
 
           {/* Trusted Companies Tab */}
           <TabsContent value="companies">
             <TrustedCompaniesTab />
           </TabsContent>

          {/* Coverage Tab */}
          <TabsContent value="coverage" className="space-y-6">
            {siteConfig.coverage.cities.map((city) => (
              <Card key={city}>
                <CardHeader>
                  <CardTitle>{city}</CardTitle>
                  <CardDescription>
                    {siteConfig.coverage.neighborhoods[city as keyof typeof siteConfig.coverage.neighborhoods]?.length || 0} bairros atendidos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {siteConfig.coverage.neighborhoods[city as keyof typeof siteConfig.coverage.neighborhoods]?.map((neighborhood) => (
                      <span
                        key={neighborhood}
                        className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                      >
                        {neighborhood}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
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
