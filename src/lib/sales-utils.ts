export const SALARIO_BASE = 1950;
export const FIDELIDADE_MESES = 12;
export const MULTA_PERCENTUAL = 0.10;

export const FAIXAS_COMISSAO = [
  { min: 1, max: 25, percentual: 0.20 },
  { min: 26, max: 36, percentual: 0.25 },
  { min: 37, max: 51, percentual: 0.30 },
  { min: 52, max: 72, percentual: 0.35 },
  { min: 73, max: 90, percentual: 0.40 },
];

interface VendaCalc {
  plano_id: string;
  quantidade: number;
}

interface PlanoCalc {
  id: string;
  preco: number;
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

export function getPercentualComissao(totalVendas: number): number {
  for (const faixa of FAIXAS_COMISSAO) {
    if (totalVendas >= faixa.min && totalVendas <= faixa.max) {
      return faixa.percentual;
    }
  }
  if (totalVendas > 90) return 0.40;
  return 0;
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
  let faturamento = 0;

  vendas.forEach((v) => {
    const plano = planos.find((p) => p.id === v.plano_id);
    if (!plano) return;
    totalVendas += v.quantidade;
    faturamento += v.quantidade * plano.preco;
  });

  const porcentagem = getPercentualComissao(totalVendas);
  const comissao = faturamento * porcentagem;

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
    faturamento,
    porcentagem,
    comissao,
    bonus,
    recorrencia: recorrenciaTotal,
    cancelamentos,
    score: totalVendas - cancelamentos * 2,
    total: SALARIO_BASE + comissao + bonus + recorrenciaTotal,
  };
}

export function calcularMulta(planoPreco: number, mesesAtivo: number) {
  if (mesesAtivo >= FIDELIDADE_MESES) return 0;
  const mesesRestantes = FIDELIDADE_MESES - mesesAtivo;
  const valorRestante = mesesRestantes * planoPreco;
  return valorRestante * MULTA_PERCENTUAL;
}

export function calcularMesesAtivo(dataInstalacao: string): number {
  const inicio = new Date(dataInstalacao);
  const hoje = new Date();
  const diff = (hoje.getFullYear() - inicio.getFullYear()) * 12 + (hoje.getMonth() - inicio.getMonth());
  return Math.max(0, diff);
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
