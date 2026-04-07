import * as XLSX from "xlsx";
import { getPercentualComissao } from "./sales-utils";

export interface ImportRow {
  plano_id: string;
  plano_name: string;
  quantidade: number;
  mes: number;
  ano: number;
  valid: boolean;
  errors: string[];
}

export interface ExportRow {
  vendedor: string;
  plano: string;
  velocidade: number;
  quantidade: number;
  valor_plano: number;
  faturamento: number;
  comissao_percentual: string;
  mes: number;
  ano: number;
}

interface PlanOption {
  id: string;
  name: string;
  speed: number;
  price?: number;
}

/**
 * Reads an xlsx or csv file and returns raw rows as objects
 */
export function readSpreadsheet(file: File): Promise<Record<string, any>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array" });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: "" });
        resolve(rows);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Auto-detects column mapping from header names
 */
export function autoDetectColumns(headers: string[]): Record<string, string> {
  const mapping: Record<string, string> = { plano: "", quantidade: "", mes: "", ano: "" };
  const lower = headers.map((h) => h.toLowerCase().trim());

  for (const h of headers) {
    const l = h.toLowerCase().trim();
    if (l.includes("plano") || l.includes("plan")) mapping.plano = h;
    else if (l.includes("qtd") || l.includes("quantidade") || l.includes("qty")) mapping.quantidade = h;
    else if (l === "mes" || l === "mês" || l.includes("month")) mapping.mes = h;
    else if (l === "ano" || l.includes("year")) mapping.ano = h;
  }

  return mapping;
}

/**
 * Validates imported rows against active plans
 */
export function validateImportRows(
  rawRows: Record<string, any>[],
  columnMapping: Record<string, string>,
  plans: PlanOption[],
  defaultMes: number,
  defaultAno: number
): ImportRow[] {
  return rawRows.map((raw) => {
    const errors: string[] = [];

    // Extract values using mapping
    const planoRaw = String(raw[columnMapping.plano] || "").trim();
    const qtdRaw = Number(raw[columnMapping.quantidade]);
    const mesRaw = columnMapping.mes ? Number(raw[columnMapping.mes]) || defaultMes : defaultMes;
    const anoRaw = columnMapping.ano ? Number(raw[columnMapping.ano]) || defaultAno : defaultAno;

    // Find plan by name or speed
    let matchedPlan: PlanOption | undefined;
    matchedPlan = plans.find(
      (p) =>
        p.name.toLowerCase() === planoRaw.toLowerCase() ||
        p.id === planoRaw ||
        String(p.speed) === planoRaw
    );

    if (!matchedPlan) errors.push(`Plano "${planoRaw}" não encontrado`);
    if (isNaN(qtdRaw) || qtdRaw <= 0) errors.push("Quantidade inválida");
    if (mesRaw < 1 || mesRaw > 12) errors.push("Mês inválido");

    const now = new Date();
    if (anoRaw > now.getFullYear() || (anoRaw === now.getFullYear() && mesRaw > now.getMonth() + 1)) {
      errors.push("Não é permitido importar vendas de mês futuro");
    }

    return {
      plano_id: matchedPlan?.id || "",
      plano_name: matchedPlan ? `${matchedPlan.name} (${matchedPlan.speed}MB)` : planoRaw,
      quantidade: isNaN(qtdRaw) ? 0 : qtdRaw,
      mes: mesRaw,
      ano: anoRaw,
      valid: errors.length === 0,
      errors,
    };
  });
}

/**
 * Generates the template spreadsheet for download
 */
export function downloadTemplate(plans: PlanOption[]) {
  const header = ["Plano", "Quantidade", "Mês", "Ano"];
  const example = plans.slice(0, 3).map((p, i) => [p.name, 1, new Date().getMonth() + 1, new Date().getFullYear()]);

  const wsData = [header, ...example];
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  ws["!cols"] = [{ wch: 25 }, { wch: 12 }, { wch: 8 }, { wch: 8 }];

  // Add a second sheet with plan reference
  const refData = [["Plano", "Velocidade (MB)"], ...plans.map((p) => [p.name, p.speed])];
  const wsRef = XLSX.utils.aoa_to_sheet(refData);
  wsRef["!cols"] = [{ wch: 25 }, { wch: 18 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Vendas");
  XLSX.utils.book_append_sheet(wb, wsRef, "Planos Disponíveis");
  XLSX.writeFile(wb, "modelo_importacao_vendas.xlsx");
}

/**
 * Exports sales data to xlsx
 */
export function exportSalesXlsx(
  rows: ExportRow[],
  filename: string
) {
  const header = ["Vendedor", "Plano", "Velocidade (MB)", "Quantidade", "Valor Plano (R$)", "Faturamento (R$)", "Faixa Comissão", "Mês", "Ano"];
  const data = rows.map((r) => [
    r.vendedor,
    r.plano,
    r.velocidade,
    r.quantidade,
    r.valor_plano,
    r.faturamento,
    r.comissao_percentual,
    r.mes,
    r.ano,
  ]);

  const ws = XLSX.utils.aoa_to_sheet([header, ...data]);
  ws["!cols"] = [
    { wch: 22 }, { wch: 20 }, { wch: 16 }, { wch: 12 },
    { wch: 15 }, { wch: 15 }, { wch: 16 }, { wch: 8 }, { wch: 8 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Vendas");
  XLSX.writeFile(wb, filename);
}
