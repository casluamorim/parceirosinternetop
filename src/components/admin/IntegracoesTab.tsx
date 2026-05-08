import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { Activity, AlertCircle, CheckCircle2, RefreshCw, PlayCircle } from "lucide-react";

const sq = (t: string) => (supabase.from as any)(t);

export function IntegracoesTab() {
  const [config, setConfig] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [queue, setQueue] = useState<any[]>([]);
  const [stats, setStats] = useState({ pending: 0, sent: 0, failed: 0, today: 0 });
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const { data: cfg } = await sq("gesprov_config").select("*").limit(1).maybeSingle();
    setConfig(cfg ?? { enabled: false, auth_type: "bearer", extra_headers: {} });
    const { data: lg } = await sq("gesprov_logs").select("*").order("created_at", { ascending: false }).limit(50);
    setLogs(lg || []);
    const { data: q } = await sq("gesprov_queue").select("*").order("created_at", { ascending: false }).limit(50);
    setQueue(q || []);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const { data: all } = await sq("gesprov_queue").select("status, created_at");
    const items = all || [];
    setStats({
      pending: items.filter((i: any) => i.status === "pending" || i.status === "processing").length,
      sent: items.filter((i: any) => i.status === "sent").length,
      failed: items.filter((i: any) => i.status === "failed").length,
      today: items.filter((i: any) => new Date(i.created_at) >= today && i.status === "sent").length,
    });
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    setLoading(true);
    const { error } = await sq("gesprov_config").update({
      api_url: config.api_url,
      auth_type: config.auth_type,
      username: config.username,
      enabled: config.enabled,
      extra_headers: config.extra_headers || {},
    }).eq("singleton", true);
    setLoading(false);
    if (error) toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    else { toast({ title: "Configurações salvas" }); load(); }
  };

  const testConnection = async () => {
    setLoading(true);
    const { data } = await supabase.functions.invoke("gesprov-sync", { body: {}, method: "POST" as any });
    // also call test action via fetch to support query param
    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gesprov-sync?action=test`;
      const res = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
      });
      const json = await res.json();
      toast({
        title: json.ok ? "Conexão OK" : "Falha na conexão",
        description: json.error ?? `Status HTTP ${json.status ?? ""}`,
        variant: json.ok ? "default" : "destructive",
      });
    } catch (e: any) {
      toast({ title: "Erro no teste", description: String(e?.message ?? e), variant: "destructive" });
    }
    setLoading(false);
    load();
  };

  const runSync = async () => {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("gesprov-sync");
    setLoading(false);
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else toast({ title: "Sincronização executada", description: `Processados: ${data?.processed ?? 0}` });
    load();
  };

  const retryItem = async (id: string) => {
    await sq("gesprov_queue").update({ status: "pending", next_retry_at: new Date().toISOString(), attempts: 0 }).eq("id", id);
    runSync();
  };

  if (!config) return <div className="text-center py-8">Carregando...</div>;

  const statusBadge = () => {
    if (!config.enabled) return <Badge variant="secondary">Desativada</Badge>;
    if (config.last_status === "ok") return <Badge className="bg-green-600">Conectado</Badge>;
    if (config.last_status === "error") return <Badge variant="destructive">Erro</Badge>;
    if (config.last_status === "partial") return <Badge className="bg-yellow-600">Parcial</Badge>;
    return <Badge variant="outline">Aguardando</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Status / métricas */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground">Status</p><div className="mt-2">{statusBadge()}</div></div><Activity className="w-5 h-5 text-muted-foreground" /></div></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground">Pendentes</p><p className="text-2xl font-bold mt-1">{stats.pending}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground">Enviados hoje</p><p className="text-2xl font-bold mt-1 text-green-600">{stats.today}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground">Falhas</p><p className="text-2xl font-bold mt-1 text-destructive">{stats.failed}</p></CardContent></Card>
      </div>

      <Tabs defaultValue="config">
        <TabsList>
          <TabsTrigger value="config">Configuração</TabsTrigger>
          <TabsTrigger value="queue">Fila ({queue.length})</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="config">
          <Card>
            <CardHeader>
              <CardTitle>GESPROV</CardTitle>
              <CardDescription>
                Última sincronização: {config.last_sync_at ? new Date(config.last_sync_at).toLocaleString("pt-BR") : "—"}
                {config.last_error && <span className="block text-destructive mt-1">{config.last_error}</span>}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                <div>
                  <p className="font-medium">Integração ativa</p>
                  <p className="text-xs text-muted-foreground">Quando ativa, envia leads e vendas automaticamente em background.</p>
                </div>
                <Switch checked={!!config.enabled} onCheckedChange={(v) => setConfig({ ...config, enabled: v })} />
              </div>

              <div>
                <Label>URL da API</Label>
                <Input value={config.api_url ?? ""} onChange={(e) => setConfig({ ...config, api_url: e.target.value })} placeholder="https://api.gesprov.com.br/v1" />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Tipo de autenticação</Label>
                  <Select value={config.auth_type} onValueChange={(v) => setConfig({ ...config, auth_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bearer">Bearer Token</SelectItem>
                      <SelectItem value="apikey">API Key (header)</SelectItem>
                      <SelectItem value="basic">Basic Auth</SelectItem>
                      <SelectItem value="none">Nenhuma</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Usuário (Basic Auth)</Label>
                  <Input value={config.username ?? ""} onChange={(e) => setConfig({ ...config, username: e.target.value })} />
                </div>
              </div>

              <div className="rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
                <strong>Credenciais sensíveis:</strong> O token e a senha do GESPROV são armazenados como
                segredos (<code>GESPROV_API_TOKEN</code>, <code>GESPROV_PASSWORD</code>) e nunca expostos no painel.
                Solicite o cadastro através do suporte.
              </div>

              <div className="flex flex-wrap gap-2">
                <Button onClick={save} disabled={loading}>Salvar configurações</Button>
                <Button variant="outline" onClick={testConnection} disabled={loading}>
                  <CheckCircle2 className="w-4 h-4 mr-2" />Testar conexão
                </Button>
                <Button variant="outline" onClick={runSync} disabled={loading}>
                  <PlayCircle className="w-4 h-4 mr-2" />Executar sincronização agora
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="queue">
          <Card>
            <CardHeader><CardTitle>Fila de envio</CardTitle></CardHeader>
            <CardContent>
              {queue.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Nenhum item na fila.</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader><TableRow>
                      <TableHead>Tipo</TableHead><TableHead>Status</TableHead><TableHead>Tentativas</TableHead>
                      <TableHead>Próx. retry</TableHead><TableHead>Erro</TableHead><TableHead></TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                      {queue.map((q) => (
                        <TableRow key={q.id}>
                          <TableCell>{q.tipo}</TableCell>
                          <TableCell><Badge variant={q.status === "sent" ? "default" : q.status === "failed" ? "destructive" : "secondary"}>{q.status}</Badge></TableCell>
                          <TableCell>{q.attempts}/{q.max_attempts}</TableCell>
                          <TableCell className="text-xs">{new Date(q.next_retry_at).toLocaleString("pt-BR")}</TableCell>
                          <TableCell className="max-w-[260px] truncate text-xs text-destructive">{q.last_error}</TableCell>
                          <TableCell>{q.status !== "sent" && (
                            <Button size="sm" variant="ghost" onClick={() => retryItem(q.id)}>
                              <RefreshCw className="w-3 h-3" />
                            </Button>
                          )}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader><CardTitle>Histórico de envios</CardTitle></CardHeader>
            <CardContent>
              {logs.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Sem logs ainda.</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader><TableRow>
                      <TableHead>Data</TableHead><TableHead>Tipo</TableHead><TableHead>Status</TableHead>
                      <TableHead>HTTP</TableHead><TableHead>Mensagem</TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                      {logs.map((l) => (
                        <TableRow key={l.id}>
                          <TableCell className="text-xs whitespace-nowrap">{new Date(l.created_at).toLocaleString("pt-BR")}</TableCell>
                          <TableCell>{l.tipo}</TableCell>
                          <TableCell>
                            {l.status === "success" ? <Badge className="bg-green-600">OK</Badge>
                              : l.status === "failed" ? <Badge variant="destructive">Falhou</Badge>
                              : <Badge variant="secondary">Retry</Badge>}
                          </TableCell>
                          <TableCell>{l.http_status ?? "—"}</TableCell>
                          <TableCell className="max-w-[400px] truncate text-xs">{l.message ?? "—"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
