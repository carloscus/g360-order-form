import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './pages/Layout';
import CatalogoPage from './pages/CatalogoPage';
import OrdenPage from './pages/OrdenPage';
import { AppProvider } from './context/AppContext';
import { G360_CONFIG } from './core/g360-skill.js';

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            {/* Redirigir la raíz al catálogo por defecto */}
            <Route index element={<Navigate to="/catalogo" replace />} />
            <Route path="catalogo" element={<CatalogoPage />} />
            <Route path="orden" element={<OrdenPage />} />
            {/* Fallback para cualquier otra ruta */}
            <Route path="*" element={<Navigate to="/catalogo" replace />} />
          </Route>
        </Routes>
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;
