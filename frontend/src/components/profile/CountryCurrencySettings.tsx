"use client";
import { useState } from "react";
import Card from "@/components/ui/Card";
import CountrySelect from "@/components/ui/CountrySelect";
import Button from "@/components/ui/Button";
import type { User } from "@/types/user";

interface CountryCurrencySettingsProps {
  user: User;
  onUpdate: (data: { country: string; currency_code?: string }) => void;
}

export default function CountryCurrencySettings({ user, onUpdate }: CountryCurrencySettingsProps) {
  const [country, setCountry] = useState(user.country);
  const [currency, setCurrency] = useState(user.currency_code);
  const [isLoading, setIsLoading] = useState(false);

  const hasChanged = country !== user.country;

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await onUpdate({ country, currency_code: currency });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Country & Currency</h3>
      <CountrySelect
        value={country}
        onChange={(c, curr) => { setCountry(c); setCurrency(curr); }}
      />
      {hasChanged && (
        <div className="mt-3">
          <p className="text-xs text-mg-gold mb-2">Currency will change to: {currency}</p>
          <Button size="sm" variant="primary" onClick={handleSave} isLoading={isLoading} className="w-full">
            Save Changes
          </Button>
        </div>
      )}
    </Card>
  );
}
