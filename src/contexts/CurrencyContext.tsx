import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

type Currency = "BRL" | "USD" | "EUR";

interface CurrencyContextType {
  currency: Currency;
  currencySymbol: string;
  formatAmount: (amount: number) => string;
  setCurrency: (currency: Currency) => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const currencyConfig = {
  BRL: { symbol: "R$", locale: "pt-BR" },
  USD: { symbol: "US$", locale: "en-US" },
  EUR: { symbol: "€", locale: "de-DE" },
};

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrencyState] = useState<Currency>("BRL");

  useEffect(() => {
    loadUserCurrency();
  }, []);

  const loadUserCurrency = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("currency")
      .eq("user_id", user.id)
      .single();

    if (profile?.currency) {
      setCurrencyState(profile.currency as Currency);
    }
  };

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
  };

  const currencySymbol = currencyConfig[currency].symbol;

  const formatAmount = (amount: number): string => {
    const locale = currencyConfig[currency].locale;
    return `${currencySymbol} ${amount.toLocaleString(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        currencySymbol,
        formatAmount,
        setCurrency,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
};
