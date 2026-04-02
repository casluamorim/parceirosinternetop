export const SALARIO_BASE = 1950;

interface VendaCalc {
  plano_id: string;
  quantidade: number;
}

interface PlanoCalc {
  id: string;
  comissao: number;
  bonus_extra?: number | null;
}

interface MetaCalc {
  min_vendas: number;
  bonus: number;
}

interface MetaIndividual {
  meta: number;
}

interface RecorrenciaCalc {
  valor: number;
}

export function calcularGanho(
  vendas: VendaCalc[],
  planos: PlanoCalc[],
  metas: MetaCalc[],
  metaIndividual: MetaIndividual | null,
  recorrencia: RecorrenciaCalc | null,
  cancelamentos: number
) {
  let totalVendas = 0;
  let comissao = 0;

  vendas.forEach((v) => {
    const plano = planos.find((p) => p.id === v.plano_id);
    if (!plano) return;
    totalVendas += v.quantidade;
    comissao += v.quantidade * plano.comissao;
    if (plano.bonus_extra) {
      comissao += v.quantidade * plano.bonus_extra;
    }
  });

  let bonus = 0;
  const sortedMetas = [...metas].sort((a, b) => a.min_vendas - b.min_vendas);
  sortedMetas.forEach((m) => {
    if (totalVendas >= m.min_vendas) {
      bonus = m.bonus;
    }
  });

  if (metaIndividual && totalVendas >= metaIndividual.meta) {
    bonus += 200;
  }

  const clientesAtivos = Math.max(0, totalVendas - cancelamentos);
  const recorrenciaTotal = recorrencia ? clientesAtivos * recorrencia.valor : 0;

  return {
    totalVendas,
    comissao,
    bonus,
    recorrencia: recorrenciaTotal,
    cancelamentos,
    score: totalVendas - cancelamentos * 2,
    total: SALARIO_BASE + comissao + bonus + recorrenciaTotal,
  };
}

export function calcularCAC(investimento: number, totalClientes: number) {
  if (totalClientes === 0) return 0;
  return investimento / totalClientes;
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];
