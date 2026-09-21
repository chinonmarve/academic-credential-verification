function ordinal(n) {
  const suffixes = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return `${n}${suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]}`;
}

/**
 * Formats a date (or "now" if none given) into the { day, month, year }
 * pieces used in the certificate's "Given this ___ day of ___, ___" line.
 */
export function formatCertificateDate(input) {
  const d = input ? new Date(input) : new Date();
  if (Number.isNaN(d.getTime())) {
    return { day: "—", month: "—", year: "—" };
  }
  return {
    day: ordinal(d.getDate()),
    month: d.toLocaleString("en-US", { month: "long" }),
    year: String(d.getFullYear())
  };
}
