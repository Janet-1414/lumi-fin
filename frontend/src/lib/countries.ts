export interface Country {
  name: string;
  code: string;
  currency: string;
  currencySymbol: string;
  flag: string;
}

export const EAST_AFRICAN_COUNTRIES: Country[] = [
  { name: "Uganda", code: "UG", currency: "UGX", currencySymbol: "UGX", flag: "🇺🇬" },
  { name: "Kenya", code: "KE", currency: "KES", currencySymbol: "KES", flag: "🇰🇪" },
  { name: "Tanzania", code: "TZ", currency: "TZS", currencySymbol: "TZS", flag: "🇹🇿" },
  { name: "Rwanda", code: "RW", currency: "RWF", currencySymbol: "RWF", flag: "🇷🇼" },
  { name: "Ethiopia", code: "ET", currency: "ETB", currencySymbol: "ETB", flag: "🇪🇹" },
  { name: "Burundi", code: "BI", currency: "BIF", currencySymbol: "BIF", flag: "🇧🇮" },
  { name: "South Sudan", code: "SS", currency: "SSP", currencySymbol: "SSP", flag: "🇸🇸" },
];

export function getCountryByCurrency(currency: string): Country | undefined {
  return EAST_AFRICAN_COUNTRIES.find((c) => c.currency === currency);
}

export function getCurrencyForCountry(countryName: string): string {
  return EAST_AFRICAN_COUNTRIES.find((c) => c.name === countryName)?.currency || "UGX";
}
