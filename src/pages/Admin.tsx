import { Link } from "react-router-dom";
import { ArrowLeft, Settings, Package, MapPin, Users, FileText, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { siteConfig } from "@/lib/config";
import { useAuth } from "@/hooks/useAuth";
import { AdminAuth } from "@/components/admin/AdminAuth";
import { PlansTab } from "@/components/admin/PlansTab";

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
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="plans">Planos</TabsTrigger>
            <TabsTrigger value="coverage">Cobertura</TabsTrigger>
            <TabsTrigger value="testimonials">Depoimentos</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>

          {/* Plans Tab */}
          <TabsContent value="plans">
            <PlansTab />
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
          <TabsContent value="testimonials" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Depoimentos de Clientes</CardTitle>
                <CardDescription>Gerencie os depoimentos exibidos no site</CardDescription>
              </CardHeader>
              <CardContent>
                <Alert>
                  <AlertDescription>
                    A edição de depoimentos será implementada em breve.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações da Empresa</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Nome da Empresa</p>
                    <p className="font-medium">{siteConfig.company.name}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Telefone</p>
                    <p className="font-medium">{siteConfig.contact.phone}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">WhatsApp</p>
                    <p className="font-medium">{siteConfig.contact.whatsappDisplay}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{siteConfig.contact.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Promoção Ativa</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Texto do Banner</p>
                    <p className="font-medium">{siteConfig.promo.bannerText}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Desconto</p>
                    <p className="font-medium">{siteConfig.promo.discount} {siteConfig.promo.discountText}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
