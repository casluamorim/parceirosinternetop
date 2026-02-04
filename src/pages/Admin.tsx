import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Settings, Package, MapPin, Users, FileText, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { siteConfig, plans, businessPlans, testimonials } from "@/lib/config";
import { useToast } from "@/hooks/use-toast";

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  // Senha temporária - em produção, isso deve usar autenticação real via Lovable Cloud
  const TEMP_PASSWORD = "admin123";

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === TEMP_PASSWORD) {
      setIsAuthenticated(true);
      toast({
        title: "Login realizado",
        description: "Bem-vindo ao painel administrativo!",
      });
    } else {
      toast({
        title: "Senha incorreta",
        description: "Verifique a senha e tente novamente.",
        variant: "destructive",
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <CardTitle>Acesso Administrativo</CardTitle>
            <CardDescription>
              Digite a senha para acessar o painel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite a senha"
                />
              </div>
              <Button type="submit" className="w-full">
                Entrar
              </Button>
              <Link to="/" className="block text-center text-sm text-muted-foreground hover:text-foreground">
                ← Voltar ao site
              </Link>
            </form>
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
          <Button variant="outline" size="sm" onClick={() => setIsAuthenticated(false)}>
            Sair
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="plans">Planos</TabsTrigger>
            <TabsTrigger value="coverage">Cobertura</TabsTrigger>
            <TabsTrigger value="testimonials">Depoimentos</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Planos Ativos</CardDescription>
                  <CardTitle className="text-3xl">{plans.length + businessPlans.length}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {plans.length} residenciais, {businessPlans.length} empresariais
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Bairros Atendidos</CardDescription>
                  <CardTitle className="text-3xl">
                    {Object.values(siteConfig.coverage.neighborhoods).flat().length}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Em {siteConfig.coverage.cities.length} cidades
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Depoimentos</CardDescription>
                  <CardTitle className="text-3xl">{testimonials.length}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Todos com 5 estrelas
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Promoção</CardDescription>
                  <CardTitle className="text-3xl">{siteConfig.promo.active ? "Ativa" : "Inativa"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {siteConfig.promo.discount} {siteConfig.promo.discountText}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Ações Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                    <Package className="w-5 h-5" />
                    <span>Editar Planos</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                    <MapPin className="w-5 h-5" />
                    <span>Áreas de Cobertura</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                    <Users className="w-5 h-5" />
                    <span>Depoimentos</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                    <FileText className="w-5 h-5" />
                    <span>Exportar Dados</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-amber-200 bg-amber-50">
              <CardHeader>
                <CardTitle className="text-amber-800">⚠️ Funcionalidade Limitada</CardTitle>
              </CardHeader>
              <CardContent className="text-amber-700">
                <p>
                  Para habilitar a edição e salvamento de dados em tempo real, é necessário ativar o <strong>Lovable Cloud</strong>. 
                  Isso permitirá:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Editar planos e preços dinamicamente</li>
                  <li>Gerenciar áreas de cobertura</li>
                  <li>Salvar e exportar leads de clientes</li>
                  <li>Autenticação segura com email e senha</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Plans Tab */}
          <TabsContent value="plans" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Planos Residenciais</CardTitle>
                <CardDescription>Gerencie os planos disponíveis para clientes residenciais</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {plans.map((plan) => (
                    <div key={plan.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-semibold">{plan.name}</h4>
                        <p className="text-sm text-muted-foreground">{plan.speed} Mega</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">R$ {plan.price.toFixed(2)}</p>
                        {plan.originalPrice && (
                          <p className="text-sm text-muted-foreground line-through">
                            R$ {plan.originalPrice.toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Planos Empresariais</CardTitle>
                <CardDescription>Gerencie os planos disponíveis para empresas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {businessPlans.map((plan) => (
                    <div key={plan.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-semibold">{plan.name}</h4>
                        <p className="text-sm text-muted-foreground">{plan.speed} Mega</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">R$ {plan.price.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
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
                <div className="space-y-4">
                  {testimonials.map((testimonial) => (
                    <div key={testimonial.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold">{testimonial.name}</h4>
                          <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                        </div>
                        <div className="text-yellow-500">
                          {"★".repeat(testimonial.rating)}
                        </div>
                      </div>
                      <p className="text-sm">{testimonial.text}</p>
                    </div>
                  ))}
                </div>
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
                  <div className="space-y-2">
                    <Label>Nome da Empresa</Label>
                    <Input value={siteConfig.company.name} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label>Telefone</Label>
                    <Input value={siteConfig.contact.phone} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label>WhatsApp</Label>
                    <Input value={siteConfig.contact.whatsappDisplay} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={siteConfig.contact.email} readOnly />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Promoção Ativa</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Texto do Banner</Label>
                    <Input value={siteConfig.promo.bannerText} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label>Desconto</Label>
                    <Input value={`${siteConfig.promo.discount} ${siteConfig.promo.discountText}`} readOnly />
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
