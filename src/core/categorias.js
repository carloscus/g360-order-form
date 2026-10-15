/**
 * categorias.js
 * Fuente única de segmentos (líneas) de venta y su identidad de color.
 * Consumida por el header (chips de búsqueda) y CatalogoPage (filtros, SKU).
 */

// Categorías fijas de venta (decisión de negocio: solo estas 3)
export const CATEGORIES = [
  { id: 'todos', label: 'Búsqueda', icon: 'search', isFreeSearch: true, ghost: 'Search' },
  { id: 'viniball', label: 'Viniball', icon: 'sports_baseball', categoria: 'VINIBALL', ghost: 'Viniball' },
  { id: 'vinifan', label: 'Vinifan', icon: 'school', categoria: 'VINIFAN', ghost: 'Vinifan' },
  { id: 'representadas', label: 'Representadas', icon: 'stars', categoria: 'REPRESENTADAS', ghost: 'Representadas' },
];

// Identidad de color por categoría (marca CIPSA). La base de UI es neutra:
// el color de categoría se aplica solo en chips activos, SKU y contador.
export const CATEGORY_COLORS = {
  VINIBALL: { primary: '#dc2626', onPrimary: '#ffffff', secondary: '#111827' },      // rojo y negro
  VINIFAN: { primary: '#ea580c', onPrimary: '#ffffff', secondary: '#1d4ed8' },       // naranja y azul
  REPRESENTADAS: { primary: '#16a34a', onPrimary: '#ffffff', secondary: '#f8fafc' }, // verde y blanco
};

export const colorDeCategoria = (cat) => CATEGORY_COLORS[cat]?.primary || null;
