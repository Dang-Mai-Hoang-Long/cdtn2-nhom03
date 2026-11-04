import React from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import UngDung from './App.jsx';
import './styles/index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <UngDung />
  </StrictMode>,
);
