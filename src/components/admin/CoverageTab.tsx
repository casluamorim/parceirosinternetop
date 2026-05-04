import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { siteConfig } from "@/lib/config";

interface CoverageArea {
  id: string;
  city: string;
  neighborhood: string;
  ativo: boolean;
}

export function CoverageTab() {
  const [areas, setAreas] = useState<CoverageArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState(siteConfig.coverage.cities[0]);
  const [neighborhood, setNeighborhood] = useState("");
  const [filterCity, setFilterCity] = useState<string>("all");

  const fetchAreas = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("coverage_areas")
      .select("*")
      .order("city")
      .order("neighborhood");
    if (error) toast.error("Erro ao carregar bairros");
    else setAreas((data as CoverageArea[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchAreas(); }, []);

  const handleAdd = async () => {
    const name = neighborhood.trim();
    if (!name) {
      toast.error("Informe o nome do bairro");
      return;
    }
    const duplicate = areas.some(
      (a) => a.city === city && a.neighborhood.toLowerCase() === name.toLowerCase()
    );
    if (duplicate) {
      toast.error(`O bairro "${name}" já existe em ${city}`);
      return;
    }
    const { error } = await supabase
      .from("coverage_areas")
      .insert({ city, neighborhood: name, ativo: true });
    if (error) {
      toast.error("Erro ao adicionar bairro");
      return;
    }
    toast.success("Bairro adicionado");
    setNeighborhood("");
    fetchAreas();
  };

  const handleToggle = async (id: string, ativo: boolean) => {
    const { error } = await supabase
      .from("coverage_areas")
      .update({ ativo })
      .eq("id", id);
    if (error) toast.error("Erro ao atualizar");
    else {
      setAreas(areas.map(a => a.id === id ? { ...a, ativo } : a));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este bairro?")) return;
    const { error } = await supabase.from("coverage_areas").delete().eq("id", id);
    if (error) toast.error("Erro ao excluir");
    else {
      toast.success("Bairro excluído");
      setAreas(areas.filter(a => a.id !== id));
    }
  };

  const filtered = filterCity === "all" ? areas : areas.filter(a => a.city === filterCity);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Adicionar Bairro</CardTitle>
          <CardDescription>
            Os bairros aqui cadastrados aparecem na seção de cobertura do site. A validação oficial continua sendo feita por CEP.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-3">
            <Select value={city} onValueChange={setCity}>
              <SelectTrigger className="md:w-64"><SelectValue /></SelectTrigger>
              <SelectContent>
                {siteConfig.coverage.cities.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Nome do bairro"
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
            <Button onClick={handleAdd}>
              <Plus className="w-4 h-4 mr-2" /> Adicionar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
          <div>
            <CardTitle>Bairros cadastrados</CardTitle>
            <CardDescription>{filtered.length} bairros</CardDescription>
          </div>
          <Select value={filterCity} onValueChange={setFilterCity}>
            <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as cidades</SelectItem>
              {siteConfig.coverage.cities.map(c => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-8 text-muted-foreground">Carregando...</p>
          ) : filtered.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">Nenhum bairro encontrado</p>
          ) : (
            <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bairro</TableHead>
                    <TableHead>Cidade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(area => (
                    <TableRow key={area.id}>
                      <TableCell className="font-medium">{area.neighborhood}</TableCell>
                      <TableCell>{area.city}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={area.ativo}
                            onCheckedChange={(v) => handleToggle(area.id, v)}
                          />
                          <span className="text-sm text-muted-foreground">
                            {area.ativo ? "Ativo" : "Inativo"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(area.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
