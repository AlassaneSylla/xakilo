import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { client } from '../shared/api/client';

type StockAlertContextType = {
  lowStockCount: number;
  refreshLowStock: () => void;
};

const StockAlertContext = createContext<StockAlertContextType>({
  lowStockCount: 0,
  refreshLowStock: () => {},
});

export function StockAlertProvider({ children }: { children: React.ReactNode }) {
  const [lowStockCount, setLowStockCount] = useState(0);

  const refreshLowStock = useCallback(() => {
    client.get('products/low-stock/')
      .then(({ data }) => setLowStockCount(data.count ?? 0))
      .catch(() => {});
  }, []);

  useEffect(() => { refreshLowStock(); }, [refreshLowStock]);

  return (
    <StockAlertContext.Provider value={{ lowStockCount, refreshLowStock }}>
      {children}
    </StockAlertContext.Provider>
  );
}

export function useStockAlert() {
  return useContext(StockAlertContext);
}