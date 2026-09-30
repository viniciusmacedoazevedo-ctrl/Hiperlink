import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/montserrat';
import '@fontsource-variable/inter';
import '../styles/base.css';
import '../styles/components.css';
import '../styles/hiperlink.css';
import { HiperlinkPage } from '../pages/hiperlink/HiperlinkPage';
import { playArrivalTransition } from '../lib/pageTransition';

playArrivalTransition();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HiperlinkPage />
  </StrictMode>,
);
