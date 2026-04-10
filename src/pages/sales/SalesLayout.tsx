import { useState } from "react";
import { Link, Outlet, useLocation, Navigate } from "react-router-dom";
import { useSalesAuth } from "@/hooks/useSalesAuth";
import {
  LayoutDashboard, ShoppingCart, Users, XCircle, Target,
  Trophy, Settings, UserCog, Menu, X, LogOut, ChevronLeft, Receipt,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/sales", label: "Dashboard", icon: LayoutDashboard, roles: ["vendedor", "financeiro", "admin"] },
  { path: "/sales/vendedores", label: "Vendedores", icon: Users, roles: ["financeiro", "admin"] },
  { path: "/sales/vendas", label: "Vendas", icon: ShoppingCart, roles: ["vendedor", "financeiro", "admin"] },
  { path: "/sales/clientes", label: "Clientes", icon: Users, roles: ["vendedor", "financeiro", "admin"] },
  { path: "/sales/cancelamentos", label: "Cancelamentos", icon: XCircle, roles: ["vendedor", "financeiro", "admin"] },
  { path: "/sales/metas", label: "Metas", icon: Target, roles: ["financeiro", "admin"] },
  { path: "/sales/ranking", label: "Ranking", icon: Trophy, roles: ["vendedor", "financeiro", "admin"] },
  { path: "/sales/despesas", label: "Despesas", icon: Receipt, roles: ["financeiro", "admin"] },
  { path: "/sales/config", label: "Configurações", icon: Settings, roles: ["financeiro", "admin"] },
  { path: "/sales/usuarios", label: "Usuários", icon: UserCog, roles: ["admin"] },
];

export default function SalesLayout() {
  const { user, salesUser, loading, signOut } = useSalesAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (!salesUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted p-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <XCircle className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-xl font-bold">Acesso Restrito</h2>
          <p className="text-muted-foreground">
            Você não possui acesso ao módulo de vendas. Solicite acesso ao administrador.
          </p>
          <div className="flex gap-2 justify-center">
            <Link to="/"><Button variant="outline">Voltar ao site</Button></Link>
            <Button variant="ghost" onClick={() => signOut()}>Sair</Button>
          </div>
        </div>
      </div>
    );
  }

  const filteredNav = navItems.filter((item) => item.roles.includes(salesUser.role));

  const isActive = (path: string) => {
    if (path === "/sales") return location.pathname === "/sales";
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen flex bg-muted">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-[#1800ad] text-white transform transition-transform lg:translate-x-0 lg:static lg:inset-auto flex flex-col",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/20">
          <h2 className="font-bold text-lg tracking-tight">Parceiros Vendas</h2>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-white hover:bg-white/20"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {filteredNav.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                isActive(item.path)
                  ? "bg-white/20 text-white font-medium"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/20">
          <div className="text-sm font-medium text-white/90 truncate">{salesUser.name}</div>
          <div className="text-xs text-white/50 capitalize mb-3">{salesUser.role}</div>
          <div className="flex gap-2">
            <Link to="/" className="flex-1">
              <Button variant="ghost" size="sm" className="w-full text-white/70 hover:bg-white/10 hover:text-white text-xs">
                <ChevronLeft className="w-3 h-3 mr-1" /> Site
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="text-white/70 hover:bg-white/10 hover:text-white"
              onClick={() => signOut()}
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <header className="bg-white border-b sticky top-0 z-30 px-4 py-3 flex items-center gap-4 lg:px-6">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </Button>
          <h1 className="font-semibold text-lg">Gestão de Vendas</h1>
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
