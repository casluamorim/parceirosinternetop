import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSalesAuth, SalesRole } from "@/hooks/useSalesAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";

const sq = (table: string) => (supabase.from as any)(table);

export default function UsuariosPage() {
  const { salesUser } = useSalesAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "vendedor" as SalesRole });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { loadUsers(); }, [salesUser]);

  const loadUsers = async () => {
    if (!salesUser) return;
    const { data } = await sq("sales_users").select("*").order("created_at");
    setUsers(data || []);
  };

  const handleCreate = async () => {
    if (!form.name || !form.email || !form.password) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }
    if (form.password.length < 6) {
      toast({ title: "Senha deve ter no mínimo 6 caracteres", variant: "destructive" });
      return;
    }

    setSubmitting(true);

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { emailRedirectTo: window.location.origin },
    });

    if (authError || !authData.user) {
      toast({ title: "Erro ao criar usuário", description: authError?.message, variant: "destructive" });
      setSubmitting(false);
      return;
    }

    // Create sales_users record
    const { error: salesError } = await sq("sales_users").insert({
      user_id: authData.user.id,
      name: form.name,
      email: form.email,
      role: form.role,
    });

    if (salesError) {
      toast({ title: "Erro ao criar perfil de vendas", description: salesError.message, variant: "destructive" });
      setSubmitting(false);
      return;
    }

    toast({ title: "Usuário criado com sucesso!", description: "Um email de confirmação foi enviado." });
    setDialogOpen(false);
    setForm({ name: "", email: "", password: "", role: "vendedor" });
    setSubmitting(false);
    loadUsers();
  };

  const toggleActive = async (userId: string, currentActive: boolean) => {
    await sq("sales_users").update({ active: !currentActive }).eq("id", userId);
    loadUsers();
  };

  const roleColors: Record<string, string> = {
    admin: "bg-red-100 text-red-800",
    financeiro: "bg-blue-100 text-blue-800",
    vendedor: "bg-green-100 text-green-800",
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Gestão de Usuários</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Novo Usuário</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Criar Usuário</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Nome completo *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Input placeholder="Email *" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <Input placeholder="Senha *" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as SalesRole })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="vendedor">Vendedor</SelectItem>
                  <SelectItem value="financeiro">Financeiro</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleCreate} className="w-full" disabled={submitting}>
                {submitting ? "Criando..." : "Criar Usuário"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader><CardTitle>Usuários do Sistema</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Ativo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Badge className={roleColors[u.role] || ""} variant="outline">{u.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <Switch checked={u.active} onCheckedChange={() => toggleActive(u.id, u.active)} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
