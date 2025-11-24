import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface Transaction {
  id: string;
  name: string;
  amount: number;
  category: string;
  type: "income" | "expense";
  date: string;
}

interface FixedAccount {
  id: string;
  name: string;
  amount: number;
  category: string;
  due_day: number;
  is_active: boolean;
}

interface CacheData {
  transactions: Transaction[];
  todayBalance: number;
  recentTransactions: Transaction[];
  fixedAccounts: FixedAccount[];
  totalBalance: { [key: string]: number }; // key is period (7, 30, 60)
  lastUpdated: number;
}

interface CacheContextType {
  cache: CacheData;
  updateCache: (data: Partial<CacheData>) => void;
  clearCache: () => void;
}

const defaultCache: CacheData = {
  transactions: [],
  todayBalance: 0,
  recentTransactions: [],
  fixedAccounts: [],
  totalBalance: {},
  lastUpdated: 0,
};

const CacheContext = createContext<CacheContextType | undefined>(undefined);

export const CacheProvider = ({ children }: { children: ReactNode }) => {
  const [cache, setCache] = useState<CacheData>(() => {
    try {
      const stored = localStorage.getItem("financeAppCache");
      if (stored) {
        const parsed = JSON.parse(stored);
        // Check if cache is less than 5 minutes old
        if (Date.now() - parsed.lastUpdated < 5 * 60 * 1000) {
          return parsed;
        }
      }
    } catch (error) {
      console.error("Error loading cache:", error);
    }
    return defaultCache;
  });

  useEffect(() => {
    try {
      localStorage.setItem("financeAppCache", JSON.stringify(cache));
    } catch (error) {
      console.error("Error saving cache:", error);
    }
  }, [cache]);

  const updateCache = (data: Partial<CacheData>) => {
    setCache((prev) => ({
      ...prev,
      ...data,
      lastUpdated: Date.now(),
    }));
  };

  const clearCache = () => {
    setCache(defaultCache);
    localStorage.removeItem("financeAppCache");
  };

  return (
    <CacheContext.Provider value={{ cache, updateCache, clearCache }}>
      {children}
    </CacheContext.Provider>
  );
};

export const useCache = () => {
  const context = useContext(CacheContext);
  if (!context) {
    throw new Error("useCache must be used within CacheProvider");
  }
  return context;
};
