import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/montserrat';
import '@fontsource-variable/inter';
import '../styles/base.css';
import '../styles/components.css';
import '../styles/psg.css';
import { PsgDadosPage } from '../pages/psg/PsgDadosPage';
import { playArrivalTransition } from '../lib/pageTransition';

playArrivalTransition();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PsgDadosPage />
  </StrictMode>,
);
