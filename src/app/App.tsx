import { BrowserRouter } from 'react-router-dom';
import { StoreProvider } from '@/store/StoreContext';
import { AppRoutes } from './routes';

export function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </StoreProvider>
  );
}

