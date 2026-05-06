import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Eye, ShieldCheck } from "lucide-react";

interface LgpdRequest {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  tipo_solicitacao: string;
  mensagem: string;
  status: string;
  created_at: string;
}

const TYPE_LABEL: Record<string, string> = {
  acesso: "Acesso",
  correcao: "Correção",
  exclusao: "Exclusão",
  outros: "Outros",
};

const STATUS_OPTIONS = [
  { value: "pendente", label: "Pendente" },
  { value: "em_andamento", label: "Em andamento" },
  { value: "concluido", label: "Concluído" },
];

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  pendente: "outline",
  em_andamento: "secondary",
  concluido: "default",
};

export function LgpdRequestsTab() {
  const { toast } = useToast();
  const [items, setItems] = useState<LgpdRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<LgpdRequest | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("lgpd_requests")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Erro ao carregar", description: error.message, variant: "destructive" });
    } else {
      setItems((data ?? []) as LgpdRequest[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await (supabase as any).from("lgpd_requests").update({ status }).eq("id", id);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
      return;
    }
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
    if (selected?.id === id) setSelected({ ...selected, status });
    toast({ title: "Status atualizado" });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-primary" />
          Solicitações LGPD
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma solicitação recebida.</p>
        ) : (
          <div className="space-y-3">
            {items.map((r) => (
              <div
                key={r.id}
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-4 border border-border rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-semibold text-foreground break-words">{r.nome}</span>
                    <Badge variant="outline">{TYPE_LABEL[r.tipo_solicitacao] ?? r.tipo_solicitacao}</Badge>
                    <Badge variant={STATUS_VARIANT[r.status] ?? "outline"}>
                      {STATUS_OPTIONS.find((s) => s.value === r.status)?.label ?? r.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground break-all">
                    {r.email}
                    {r.telefone ? ` • ${r.telefone}` : ""}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(r.created_at).toLocaleString("pt-BR")}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Select value={r.status} onValueChange={(v) => updateStatus(r.id, v)}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" onClick={() => setSelected(r)}>
                    <Eye className="w-4 h-4 mr-1" /> Ver
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalhes da solicitação</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <Field label="Nome" value={selected.nome} />
              <Field label="E-mail" value={selected.email} />
              {selected.telefone && <Field label="Telefone" value={selected.telefone} />}
              <Field
                label="Tipo"
                value={TYPE_LABEL[selected.tipo_solicitacao] ?? selected.tipo_solicitacao}
              />
              <Field label="Data" value={new Date(selected.created_at).toLocaleString("pt-BR")} />
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Mensagem</p>
                <p className="bg-muted/50 border border-border rounded-md p-3 whitespace-pre-wrap break-words">
                  {selected.mensagem}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold text-muted-foreground uppercase">{label}</p>
      <p className="text-foreground break-words">{value}</p>
    </div>
  );
}
