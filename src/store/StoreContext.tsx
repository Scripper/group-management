import { createContext, useContext, ReactNode } from 'react';
import { RootStore } from './RootStore';

const StoreContext = createContext<RootStore | null>(null);

const rootStore = new RootStore();

interface StoreProviderProps {
  children: ReactNode;
}

export function StoreProvider({ children }: StoreProviderProps) {
  return (
    <StoreContext.Provider value={rootStore}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore(): RootStore {
  const store = useContext(StoreContext);
  if (!store) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return store;
}

