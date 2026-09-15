'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type CurrencyCode = 'LKR' | 'USD' | 'EUR' | 'GBP' | 'AUD' | 'CAD' | 'JPY';

export interface CurrencyConfig {
  code: CurrencyCode;
  name: string;
  symbol: string;
  decimals: number;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  LKR: { code: 'LKR', name: 'Sri Lankan Rupee', symbol: 'Rs.', decimals: 0 },
  USD: { code: 'USD', name: 'US Dollar', symbol: '$', decimals: 2 },
  EUR: { code: 'EUR', name: 'Euro', symbol: '€', decimals: 2 },
  GBP: { code: 'GBP', name: 'British Pound', symbol: '£', decimals: 2 },
  AUD: { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', decimals: 2 },
  CAD: { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', decimals: 2 },
  JPY: { code: 'JPY', name: 'Japanese Yen', symbol: '¥', decimals: 0 },
};

// Fallback rates if offline or API delayed
const DEFAULT_RATES: Record<CurrencyCode, number> = {
  LKR: 1,
  USD: 0.00304,
  EUR: 0.00263,
  GBP: 0.00225,
  AUD: 0.00427,
  CAD: 0.00423,
  JPY: 0.470,
};

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  rates: Record<CurrencyCode, number>;
  ratesLoading: boolean;
  convertPrice: (amountInLkr: number) => number;
  formatPrice: (amountInLkr: number, options?: { showCode?: boolean; roundUp?: boolean }) => string;
  activeCurrencyConfig: CurrencyConfig;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>('LKR');
  const [rates, setRates] = useState<Record<CurrencyCode, number>>(DEFAULT_RATES);
  const [ratesLoading, setRatesLoading] = useState<boolean>(true);

  // Restore stored currency on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ridelanka_currency') as CurrencyCode;
      if (saved && CURRENCIES[saved]) {
        setCurrencyState(saved);
      }
    } catch {
      // ignore in private browsing
    }
  }, []);

  // Fetch real-time FX rates from Open Exchange Rates
  useEffect(() => {
    let isMounted = true;
    async function fetchRates() {
      try {
        // Check localStorage cache first (1 hour TTL)
        const cached = localStorage.getItem('ridelanka_fx_cache');
        if (cached) {
          try {
            const { timestamp, data } = JSON.parse(cached);
            if (Date.now() - timestamp < 3600000) {
              if (isMounted) {
                setRates(prev => ({ ...prev, ...data }));
                setRatesLoading(false);
                return;
              }
            }
          } catch {
            // parse error, continue to fetch
          }
        }

        const res = await fetch('https://open.er-api.com/v6/latest/LKR');
        if (!res.ok) throw new Error('Failed to fetch rates');
        const json = await res.json();
        if (json && json.rates) {
          const newRates: Record<CurrencyCode, number> = {
            LKR: 1,
            USD: Number(json.rates.USD) || DEFAULT_RATES.USD,
            EUR: Number(json.rates.EUR) || DEFAULT_RATES.EUR,
            GBP: Number(json.rates.GBP) || DEFAULT_RATES.GBP,
            AUD: Number(json.rates.AUD) || DEFAULT_RATES.AUD,
            CAD: Number(json.rates.CAD) || DEFAULT_RATES.CAD,
            JPY: Number(json.rates.JPY) || DEFAULT_RATES.JPY,
          };
          if (isMounted) {
            setRates(newRates);
            try {
              localStorage.setItem('ridelanka_fx_cache', JSON.stringify({ timestamp: Date.now(), data: newRates }));
            } catch {
              // ignore
            }
          }
        }
      } catch (err) {
        console.warn('Using fallback currency rates:', err);
      } finally {
        if (isMounted) setRatesLoading(false);
      }
    }

    fetchRates();
    return () => { isMounted = false; };
  }, []);

  const setCurrency = (c: CurrencyCode) => {
    setCurrencyState(c);
    try {
      localStorage.setItem('ridelanka_currency', c);
    } catch {
      // ignore
    }
  };

  const convertPrice = (amountInLkr: number): number => {
    const rate = rates[currency] ?? DEFAULT_RATES[currency] ?? 1;
    return (Number(amountInLkr) || 0) * rate;
  };

  const formatPrice = (amountInLkr: number, options?: { showCode?: boolean; roundUp?: boolean }): string => {
    const config = CURRENCIES[currency] || CURRENCIES.LKR;
    const rate = rates[currency] ?? DEFAULT_RATES[currency] ?? 1;
    let converted = (Number(amountInLkr) || 0) * rate;

    if (options?.roundUp) {
      converted = Math.ceil(converted);
    }

    const formatted = converted.toLocaleString(undefined, {
      minimumFractionDigits: config.decimals,
      maximumFractionDigits: config.decimals,
    });

    if (currency === 'LKR') {
      return `Rs. ${formatted}`;
    }

    return options?.showCode ? `${config.symbol}${formatted} ${currency}` : `${config.symbol}${formatted}`;
  };

  return (
    <CurrencyContext.Provider value={{
      currency,
      setCurrency,
      rates,
      ratesLoading,
      convertPrice,
      formatPrice,
      activeCurrencyConfig: CURRENCIES[currency] || CURRENCIES.LKR,
    }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
