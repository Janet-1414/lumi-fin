"use client";
import { EAST_AFRICAN_COUNTRIES } from "@/lib/countries";

interface CountrySelectProps {
  value: string;
  onChange: (country: string, currency: string) => void;
  error?: string;
}

export default function CountrySelect({ value, onChange, error }: CountrySelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-[var(--text-secondary)]">Country</label>
      <select
        value={value}
        onChange={(e) => {
          const country = EAST_AFRICAN_COUNTRIES.find((c) => c.name === e.target.value);
          if (country) onChange(country.name, country.currency);
        }}
        className="w-full rounded-card border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-primary)] px-3 py-2.5 text-sm focus:outline-none focus:border-mg-gold focus:ring-1 focus:ring-mg-gold/30"
      >
        <option value="">Select your country</option>
        {EAST_AFRICAN_COUNTRIES.map((c) => (
          <option key={c.code} value={c.name}>
            {c.flag} {c.name} ({c.currency})
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-mg-alert">{error}</p>}
    </div>
  );
}
