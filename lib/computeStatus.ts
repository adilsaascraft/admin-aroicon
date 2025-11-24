// utility to compute event status
// computeStatus.ts
type MaybeDate = string | Date | null | undefined;

// Parse many formats -> Date (or null)
function parseDate(input: MaybeDate): Date | null {
  if (!input) return null;
  if (input instanceof Date) return isNaN(input.getTime()) ? null : input;

  const s = String(input).trim();

  // DD/MM/YYYY or DD-MM-YYYY
  const m1 = s.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
  if (m1) {
    const day = parseInt(m1[1], 10);
    const month = parseInt(m1[2], 10) - 1;
    const year = parseInt(m1[3], 10);
    // Use UTC noon to avoid TZ edge cases when later converting to IST date
    return new Date(Date.UTC(year, month, day, 12, 0, 0));
  }

  // YYYY-MM-DD (safe) or full ISO
  const t = Date.parse(s);
  if (!Number.isNaN(t)) return new Date(t);

  return null;
}

// Convert a Date => yyyymmdd **in Asia/Kolkata**
function ymdInIST(date: Date): number {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const [y, m, d] = fmt.format(date).split("-").map((n) => parseInt(n, 10));
  return y * 10000 + m * 100 + d;
}

// Main status calculator
export function computeStatus(
  startDate: MaybeDate,
  endDate: MaybeDate,
  isLocalDraft: boolean = false
): "Live" | "Running" | "Past" | "Draft" {
  if (isLocalDraft) return "Draft";

  const start = parseDate(startDate);
  const end = parseDate(endDate);
  if (!start || !end) return "Draft";

  const todayIST = ymdInIST(new Date());
  const startIST = ymdInIST(start);
  const endIST = ymdInIST(end);

  if (todayIST < startIST) return "Live";            // upcoming
  if (todayIST >= startIST && todayIST <= endIST) return "Running"; // during
  if (todayIST > endIST) return "Past";                 // finished

  return "Draft";
}