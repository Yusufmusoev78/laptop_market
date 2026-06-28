import React, { createContext, useContext, useState } from 'react';

export type MarketMode = 'laptop' | 'phone';

interface MarketContextType {
  marketMode: MarketMode;
  setMarketMode: (mode: MarketMode) => void;
}

const MarketContext = createContext<MarketContextType>({
  marketMode: 'laptop',
  setMarketMode: () => {}
});

export const MarketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [marketMode, setMarketModeState] = useState<MarketMode>(() => {
    try {
      const saved = localStorage.getItem('sc-market-mode');
      return saved === 'phone' ? 'phone' : 'laptop';
    } catch {
      return 'laptop';
    }
  });

  const setMarketMode = (mode: MarketMode) => {
    setMarketModeState(mode);
    try {
      localStorage.setItem('sc-market-mode', mode);
    } catch {}
  };

  return (
    <MarketContext.Provider value={{ marketMode, setMarketMode }}>
      {children}
    </MarketContext.Provider>
  );
};

export const useMarket = () => useContext(MarketContext);
