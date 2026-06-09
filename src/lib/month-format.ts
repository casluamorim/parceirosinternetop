// Utilities to format the current month with configurable timezone, locale, and case style.

export type MonthFormat =
  | "title"        // Maio
  | "lower"        // maio
  | "upper"        // MAIO
  | "short_title"  // Mai.
  | "short_lower"  // mai.
  | "short_upper"; // MAI.

const COMMON_TIMEZONES = [
  "America/Sao_Paulo",
  "America/Manaus",
  "America/Belem",
  "America/Fortaleza",
  "America/Recife",
  "America/Bahia",
  "America/Cuiaba",
  "America/Campo_Grande",
  "America/Porto_Velho",
  "America/Rio_Branco",
  "America/Noronha",
  "UTC",
  "Europe/Lisbon",
  "Europe/Madrid",
  "America/New_York",
  "America/Los_Angeles",
];

export const TIMEZONE_OPTIONS = COMMON_TIMEZONES;

export const LOCALE_OPTIONS: { value: string; label: string }[] = [
  { value: "pt-BR", label: "Português (Brasil)" },
  { value: "pt-PT", label: "Português (Portugal)" },
  { value: "en-US", label: "English (US)" },
  { value: "es-ES", label: "Español" },
];

export const MONTH_FORMAT_OPTIONS: { value: MonthFormat; label: string }[] = [
  { value: "title", label: "Maio (primeira maiúscula)" },
  { value: "lower", label: "maio (minúsculo)" },
  { value: "upper", label: "MAIO (maiúsculo)" },
  { value: "short_title", label: "Mai. (abreviado)" },
  { value: "short_lower", label: "mai. (abreviado, minúsculo)" },
  { value: "short_upper", label: "MAI. (abreviado, maiúsculo)" },
];

const titleCase = (s: string) => s.charAt(0).toLocaleUpperCase() + s.slice(1).toLocaleLowerCase();

function rawMonthName(date: Date, timezone: string, locale: string, short: boolean): string {
  try {
    const fmt = new Intl.DateTimeFormat(locale, {
      month: short ? "short" : "long",
      timeZone: timezone,
    });
    let name = fmt.format(date);
    // Strip trailing period from short month if Intl already added one — we'll re-add consistently.
    name = name.replace(/\.$/, "").trim();
    return name;
  } catch {
    const fallback = ["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"];
    const m = fallback[date.getMonth()];
    return short ? m.slice(0, 3) : m;
  }
}

export function formatMonth(
  date: Date,
  format: MonthFormat = "title",
  timezone = "America/Sao_Paulo",
  locale = "pt-BR",
): string {
  const short = format.startsWith("short_");
  const base = rawMonthName(date, timezone, locale, short);
  const styled = (() => {
    switch (format) {
      case "lower":
      case "short_lower":
        return base.toLocaleLowerCase();
      case "upper":
      case "short_upper":
        return base.toLocaleUpperCase();
      case "title":
      case "short_title":
      default:
        return titleCase(base);
    }
  })();
  return short ? `${styled}.` : styled;
}

export type Hemisphere = "south" | "north";

export const HEMISPHERE_OPTIONS: { value: Hemisphere; label: string }[] = [
  { value: "south", label: "Hemisfério Sul (Brasil)" },
  { value: "north", label: "Hemisfério Norte" },
];

export type SeasonFormat =
  | "title"      // Verão
  | "lower"      // verão
  | "upper";     // VERÃO

export const SEASON_FORMAT_OPTIONS: { value: SeasonFormat; label: string }[] = [
  { value: "title", label: "Verão (primeira maiúscula)" },
  { value: "lower", label: "verão (minúsculo)" },
  { value: "upper", label: "VERÃO (maiúsculo)" },
];

function getSeasonIndex(date: Date, hemisphere: Hemisphere): number {
  const m = date.getMonth() + 1; // 1–12
  const d = date.getDate();
  if (hemisphere === "south") {
    if ((m === 9 && d >= 23) || m === 10 || m === 11 || (m === 12 && d <= 20)) return 0; // Primavera
    if ((m === 12 && d >= 21) || m === 1 || m === 2 || (m === 3 && d <= 20)) return 1; // Verão
    if ((m === 3 && d >= 21) || m === 4 || m === 5 || (m === 6 && d <= 20)) return 2; // Outono
    return 3; // Inverno
  } else {
    if ((m === 3 && d >= 21) || m === 4 || m === 5 || (m === 6 && d <= 20)) return 0; // Primavera
    if ((m === 6 && d >= 21) || m === 7 || m === 8 || (m === 9 && d <= 22)) return 1; // Verão
    if ((m === 9 && d >= 23) || m === 10 || m === 11 || (m === 12 && d <= 20)) return 2; // Outono
    return 3; // Inverno
  }
}

const SEASONS_PT = ["Primavera", "Verão", "Outono", "Inverno"];

export function formatSeason(
  date: Date,
  format: SeasonFormat = "title",
  hemisphere: Hemisphere = "south",
): string {
  const idx = getSeasonIndex(date, hemisphere);
  const base = SEASONS_PT[idx];
  switch (format) {
    case "lower":
      return base.toLocaleLowerCase();
    case "upper":
      return base.toLocaleUpperCase();
    case "title":
    default:
      return base;
  }
}

// All long month names in a locale/timezone — used to detect existing month words in text.
export function allMonthNames(locale: string, timezone: string): string[] {
  const names: string[] = [];
  for (let m = 0; m < 12; m++) {
    const d = new Date(Date.UTC(2024, m, 15));
    const long = rawMonthName(d, timezone, locale, false);
    const short = rawMonthName(d, timezone, locale, true);
    names.push(long, short);
  }
  return Array.from(new Set(names.filter(Boolean)));
}

// Escape regex special chars
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Replace any {mes} / {MES} tokens AND any detected month name in `text`
 * with the current month using the given format/timezone/locale.
 */
export function applyCurrentMonth(
  text: string,
  opts: { format?: MonthFormat; timezone?: string; locale?: string } = {},
): string {
  const format = opts.format ?? "title";
  const timezone = opts.timezone ?? "America/Sao_Paulo";
  const locale = opts.locale ?? "pt-BR";
  const now = new Date();
  const replacement = formatMonth(now, format, timezone, locale);

  let out = text
    .replace(/\{MES\}/g, replacement.toLocaleUpperCase())
    .replace(/\{mes\}/gi, replacement);

  // Replace any existing month name (long or short, any locale option) with the configured form.
  const candidates = new Set<string>();
  for (const loc of ["pt-BR", "pt-PT", "en-US", "es-ES", locale]) {
    for (const n of allMonthNames(loc, timezone)) candidates.add(n);
  }
  const sorted = Array.from(candidates).sort((a, b) => b.length - a.length).map(esc);
  if (sorted.length) {
    const re = new RegExp(`\\b(${sorted.join("|")})\\.?\\b`, "gi");
    out = out.replace(re, replacement);
  }
  return out;
}

/**
 * Replace {estacao} / {ESTACAO} tokens AND detected season names
 * with the current season using the given format/hemisphere.
 */
export function applyCurrentSeason(
  text: string,
  opts: { format?: SeasonFormat; hemisphere?: Hemisphere } = {},
): string {
  const format = opts.format ?? "title";
  const hemisphere = opts.hemisphere ?? "south";
  const now = new Date();
  const replacement = formatSeason(now, format, hemisphere);

  let out = text
    .replace(/\{ESTACAO\}/g, replacement.toLocaleUpperCase())
    .replace(/\{estacao\}/gi, replacement);

  // Also replace any known season word with the current one.
  const seasons = Array.from(new Set(SEASONS_PT.flatMap((s) => [s, s.toLocaleLowerCase(), s.toLocaleUpperCase()])));
  const sorted = seasons.sort((a, b) => b.length - a.length).map(esc);
  if (sorted.length) {
    const re = new RegExp(`\\b(${sorted.join("|")})\\b`, "gi");
    out = out.replace(re, replacement);
  }
  return out;
}
