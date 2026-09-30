import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/montserrat';
import '@fontsource-variable/inter';
import '../styles/base.css';
import '../styles/components.css';
import '../admin/admin.css';
import { AdminApp } from '../admin/AdminApp';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AdminApp />
  </StrictMode>,
);
