/**
 * Utilitario para obtener la URL base del proyecto.
 * Útil para deployments en subdirectorios con Vite.
 * 
 * IMPORTANTE: Esta función debe mantener consistencia con la lógica
 * de basename en App.jsx Y con vite.config.js para evitar problemas de rutas.
 */

// Obtiene la URL base del proyecto
// Usa la misma lógica que App.jsx para mantener consistencia
// con el BrowserRouter basename
// También considera la configuración base de Vite para desarrollo
export const getBaseUrl = () => {
  // En Vite, import.meta.env.BASE_URL siempre tiene el valor correcto definido en vite.config.js
  const base = import.meta.env.BASE_URL || '/';
  
  // Asegurar que termina con /
  return base.endsWith('/') ? base : base + '/';
};
