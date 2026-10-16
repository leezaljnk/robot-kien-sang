import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import SharedAssetEditor from './SharedAssetEditor';
import './index.css';

createRoot(document.getElementById('root')!).render(
  location.pathname.endsWith('/editor.html') ? <SharedAssetEditor /> : <App />
);
