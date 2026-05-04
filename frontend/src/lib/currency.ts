export function formatCurrency(amount: number, currencyCode: string): string {
  const localeMap: Record<string, string> = {
    UGX: "en-UG",
    KES: "en-KE",
    TZS: "en-TZ",
    RWF: "rw-RW",
    ETB: "am-ET",
    BIF: "fr-BI",
    SSP: "en-SS",
  };

  const locale = localeMap[currencyCode] || "en-UG";

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    // Fallback for currencies not supported by Intl
    return `${currencyCode} ${amount.toLocaleString()}`;
  }
}

export function formatCompact(amount: number, currencyCode: string): string {
  if (amount >= 1_000_000) {
    return `${currencyCode} ${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `${currencyCode} ${(amount / 1_000).toFixed(0)}K`;
  }
  return formatCurrency(amount, currencyCode);
}
