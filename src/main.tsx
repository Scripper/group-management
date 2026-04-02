import { createRoot } from 'react-dom/client';
import { App } from '@/app/App';
import '@/shared/styles/global.css';

const root = createRoot(document.getElementById('root')!);
root.render(<App />);

