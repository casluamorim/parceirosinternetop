import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { enqueueGesprov } from "@/lib/gesprov";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, ShieldCheck } from "lucide-react";

const schema = z.object({
  nome: z.string().trim().min(2, "Informe seu nome").max(150),
  email: z.string().trim().email("E-mail inválido").max(255),
  telefone: z.string().trim().max(30).optional().or(z.literal("")),
  tipo_solicitacao: z.enum(["acesso", "correcao", "exclusao", "outros"]),
  mensagem: z.string().trim().min(5, "Descreva sua solicitação").max(2000),
});

const TYPES = [
  { value: "acesso", label: "Acesso aos dados" },
  { value: "correcao", label: "Correção de dados" },
  { value: "exclusao", label: "Exclusão de dados" },
  { value: "outros", label: "Outros" },
];

export function LgpdRequestForm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    email: "",
    telefone: "",
    tipo_solicitacao: "acesso",
    mensagem: "",
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast({
        title: "Verifique os campos",
        description: parsed.error.issues[0]?.message ?? "Dados inválidos",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("lgpd_requests").insert({
      nome: parsed.data.nome,
      email: parsed.data.email,
      telefone: parsed.data.telefone || null,
      tipo_solicitacao: parsed.data.tipo_solicitacao,
      mensagem: parsed.data.mensagem,
    });
    setLoading(false);
    if (error) {
      toast({ title: "Erro ao enviar", description: error.message, variant: "destructive" });
      return;
    }
    enqueueGesprov("lead_contato", {
      origem: "lgpd",
      nome: parsed.data.nome,
      email: parsed.data.email,
      telefone: parsed.data.telefone || null,
      tipo: parsed.data.tipo_solicitacao,
      mensagem: parsed.data.mensagem,
    });
    setDone(true);
    toast({ title: "Solicitação enviada", description: "Retornaremos em até 15 dias úteis." });
  };

  if (done) {
    return (
      <div className="flex flex-col items-center text-center py-8">
        <CheckCircle2 className="w-12 h-12 text-primary mb-3" />
        <h3 className="font-display text-lg font-bold mb-1">Solicitação recebida!</h3>
        <p className="text-sm text-muted-foreground max-w-md">
          Nossa equipe entrará em contato pelo e-mail informado em até 15 dias úteis.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="flex items-start gap-3 bg-primary/5 border border-primary/20 rounded-lg p-3 text-sm text-foreground">
        <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <p>Seus dados são tratados com sigilo e usados apenas para atender sua solicitação.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="lgpd-nome">Nome *</Label>
          <Input
            id="lgpd-nome"
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            required
            maxLength={150}
          />
        </div>
        <div>
          <Label htmlFor="lgpd-email">E-mail *</Label>
          <Input
            id="lgpd-email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            maxLength={255}
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="lgpd-tel">Telefone (opcional)</Label>
          <Input
            id="lgpd-tel"
            value={form.telefone}
            onChange={(e) => setForm({ ...form, telefone: e.target.value })}
            maxLength={30}
          />
        </div>
        <div>
          <Label htmlFor="lgpd-tipo">Tipo de solicitação *</Label>
          <Select
            value={form.tipo_solicitacao}
            onValueChange={(v) => setForm({ ...form, tipo_solicitacao: v })}
          >
            <SelectTrigger id="lgpd-tipo">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="lgpd-msg">Mensagem *</Label>
        <Textarea
          id="lgpd-msg"
          rows={5}
          value={form.mensagem}
          onChange={(e) => setForm({ ...form, mensagem: e.target.value })}
          required
          maxLength={2000}
          placeholder="Descreva sua solicitação"
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full sm:w-auto">
        {loading ? "Enviando..." : "Enviar solicitação"}
      </Button>
    </form>
  );
}
