/**
 * CatalogoPage.jsx
 * E-commerce Moderno - CIPSA Marca Edition
 * Focus: Adaptive Theming (Symmetric Light/Dark), High-Visibility
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDebounce } from '../hooks/useDebounce';
import { useApp } from '../context/AppContext';
import { formatMoney } from '../utils/formatters';
import { getBaseUrl } from '../utils/baseUrl';

//hardcoded
const SEARCH_CATEGORY = { id: 'todos', label: 'Búsqueda', icon: 'search', isFreeSearch: true, ghost: 'Search' };

// Iconos por categoría (categoria del JSON)
const CATEGORY_ICONS = {
  VINIBALL: 'sports_baseball',
  VINIFAN: 'school',
  REPRESENTADAS: 'stars'
};

const PRODUCTS_PER_PAGE = 24;

function CatalogoPage() {
  const { addToCart, lastStockUpdate } = useApp();
  const [productos, setProductos] = useState([]);
  const [stockData, setStockData] = useState({});
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [activeCatalog, setActiveCatalog] = useState('todos');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuantities, setSearchQuantities] = useState({});
  const [dynamicCategories, setDynamicCategories] = useState([]);
  const debouncedSearch = useDebounce(search, 300);

  // Generar categorías desde el JSON
  const allCategories = useMemo(() => {
    return [SEARCH_CATEGORY, ...dynamicCategories];
  }, [dynamicCategories]);

  // Cargar stock desde localStorage
  const loadStockFromStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem('hoja_pedido_stock');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.stockData && Array.isArray(parsed.stockData)) {
          const stockObj = {};
          parsed.stockData.forEach(item => {
            stockObj[item.sku] = item.disponible;
          });
          setStockData(stockObj);
        }
      }
    } catch (e) {
      console.warn('Error loading stock from storage:', e);
    }
  }, []);

  // Cargar datos iniciales (catálogo + stock)
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Cargar stock primero
      loadStockFromStorage();
      
      const response = await fetch(`${getBaseUrl()}catalogo_productos.json?t=${Date.now()}`);
      const data = await response.json();
      
      // Generar categorías únicas desde el campo 'categoria' del JSON
      const categoriasUnicas = [...new Set(data.productos.map(p => p.categoria?.toUpperCase().trim()).filter(Boolean))];
      const categoriasGeneradas = categoriasUnicas.map(cat => ({
        id: cat.toLowerCase(),
        label: cat.charAt(0) + cat.slice(1).toLowerCase(),
        icon: CATEGORY_ICONS[cat] || 'category',
        categoria: cat,
        ghost: cat
      })).sort((a, b) => b.label.localeCompare(a.label)); // Ordenar alfabético inverso
      
      setDynamicCategories(categoriasGeneradas);
      
      setProductos(data.productos.map((p, index) => ({
        codigo: p.sku,
        nombre: p.nombre || '',
        bxSize: Number(p.un_bx || 1),
        precioLista: Number(p.precio_final || p.precio_lista || 0),
        pesoUm: Number(p.peso_kg || 0),
        ean: p.ean13 || '',
        ean14: '',
        linea: p.linea?.toUpperCase().trim() || '',
        categoria: p.categoria?.toUpperCase().trim() || '',
        // Stock se obtiene del stockData cargado
        orden: p.orden || index + 1,
        isNew: index < 20,
        isTrending: index % 15 === 0,
        esRemate: p.tipo === 'FIJO' || p.es_remate === true
      })));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [loadStockFromStorage]);

  useEffect(() => { loadData(); }, [loadData]);

  // Actualizar stock cuando cambia el evento de stock-updated
  useEffect(() => {
    if (lastStockUpdate?.stockData) {
      const stockObj = {};
      lastStockUpdate.stockData.forEach(item => {
        stockObj[item.sku] = item.disponible;
      });
      setStockData(stockObj);
    }
  }, [lastStockUpdate]);

  // Función para obtener stock de un producto
  const getProductStock = (sku) => {
    const stock = stockData[sku];
    return stock !== undefined ? stock : 999; // Por defecto 999 si no hay stock
  };

  const filteredProducts = useMemo(() => {
    let result = productos;
    const currentCat = allCategories.find(c => c.id === activeCatalog);

    if (currentCat.isFreeSearch) {
      if (debouncedSearch.trim()) {
        const query = debouncedSearch.toLowerCase();
        result = result.filter(p => 
          p.codigo.toLowerCase().includes(query) || 
          p.nombre.toLowerCase().includes(query) ||
          p.ean?.toLowerCase().includes(query) ||
          p.ean14?.toLowerCase().includes(query)
        );
      } else {
        return [];
      }
    } else {
      result = result.filter(p => {
        // Filtrar por categoría del JSON
        return p.categoria?.toUpperCase() === currentCat.categoria;
      });
      if (debouncedSearch.trim()) {
        const query = debouncedSearch.toLowerCase();
        result = result.filter(p => 
          p.nombre.toLowerCase().includes(query) || 
          p.codigo.toLowerCase().includes(query) ||
          p.ean?.toLowerCase().includes(query)
        );
      }
    }
    return result;
  }, [productos, activeCatalog, debouncedSearch]);

  const pagedItems = filteredProducts.slice((currentPage - 1) * PRODUCTS_PER_PAGE, currentPage * PRODUCTS_PER_PAGE);
  const currentCategory = allCategories.find(c => c.id === activeCatalog);

  return (
    <div className={`transition-all duration-500 ${isSearchFocused ? 'search-focus-active' : ''}`}>
      {isSearchFocused && <div className="search-overlay" onClick={() => setIsSearchFocused(false)} />}
      
      {/* Dynamic Header */}
      <div className="relative overflow-hidden pt-6 pb-4 px-4">
        <span className="text-ghost opacity-5">{currentCategory.ghost}</span>
        <div className="relative z-10 text-center sm:text-left">
          <h2 className="text-3xl font-black font-premium uppercase tracking-tighter text-[var(--g360-text)]">
            {currentCategory.label}
          </h2>
          <p className="text-xs text-[var(--g360-accent)] font-black uppercase tracking-[0.2em] mt-1">
            {filteredProducts.length} PRODUCTOS DISPONIBLES
          </p>
        </div>
      </div>

      {/* Navigation & Search Sticky */}
      <div className="sticky top-20 z-40 bg-[var(--g360-bg)]/80 backdrop-blur-2xl py-3 -mx-4 px-4 lg:-mx-8 lg:px-8 border-b border-[var(--g360-border)] search-container rounded-b-[2.5rem]">
         <div className="flex gap-2 overflow-x-auto no-scrollbar pb-4 mb-4">
            {allCategories.map(cat => (
              <button
                key={cat.id}
                onClick={() => { setActiveCatalog(cat.id); setCurrentPage(1); }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl whitespace-nowrap text-[11px] font-black uppercase tracking-widest transition-all lg:px-6 lg:py-3 lg:text-[12px] lg:gap-2 lg:rounded-2xl ${
                  activeCatalog === cat.id
                  ? 'bg-[var(--g360-accent)] text-black shadow-xl shadow-[var(--g360-accent)]/20'
                  : 'bg-[var(--g360-surface)] text-[var(--g360-muted)] border border-[var(--g360-border)]'
                }`}
              >
                <span className="material-symbols-outlined text-base lg:text-lg">{cat.icon}</span>
                {cat.label}
              </button>
            ))}
         </div>
         
         <div className="relative group">
            <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-[var(--g360-muted)] group-focus-within:text-[var(--g360-accent)] text-2xl transition-colors">search</span>
            <input 
              type="text" 
              placeholder="Buscar SKU o nombre..."
              className="w-full bg-[var(--g360-input-bg)] border-2 border-[var(--g360-border)] rounded-[1.5rem] py-4 pl-14 pr-6 text-sm font-bold text-[var(--g360-text)] focus:border-[var(--g360-accent)] outline-none transition-all"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={() => { setIsSearchFocused(true); setActiveCatalog('todos'); }}
            />
         </div>
      </div>

      {/* Product Grid */}
      <div className="py-4 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 relative z-10">
        {loading ? (
          Array(8).fill(0).map((_, i) => (
            <div key={i} className="h-56 bg-[var(--g360-surface)] rounded-[2rem] animate-pulse" />
          ))
        ) : pagedItems.map(p => {
          const productStock = getProductStock(p.codigo);
          const isAgotado = productStock === 0;
          return (
            <div key={p.codigo} className={`g360-card relative flex flex-col p-3 hover:border-[var(--g360-accent)]/40 ${p.esRemate ? 'ring-2 ring-yellow-500/50 bg-yellow-500/5' : ''} ${isAgotado ? 'ring-2 ring-red-500/50 bg-red-500/5 opacity-75' : ''}`}>
              
              {/* Badge REMATE */}
              {p.esRemate && (
                <div className="absolute -top-1 -right-1 z-10">
                  <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black px-2 py-1 rounded-bl-xl rounded-tr-xl flex items-center gap-1 shadow-lg">
                    <span className="text-sm">🏷️</span>
                    <span className="text-xs font-black uppercase tracking-wider">OFERTA</span>
                  </div>
                </div>
              )}
              
              {/* Badge AGOTADO */}
              {isAgotado && (
                <div className="absolute -top-1 -left-1 z-10">
                  <div className="bg-gradient-to-r from-red-600 to-red-800 text-white px-2 py-1 rounded-br-xl rounded-tl-xl flex items-center gap-1 shadow-lg">
                    <span className="text-sm">🚫</span>
                    <span className="text-xs font-black uppercase tracking-wider">AGOTADO</span>
                  </div>
                </div>
              )}
              
              {/* Header SKU */}
              <div className="flex flex-col mb-3">
                <div className="flex justify-between items-start">
                  <span className={`text-lg sm:text-xl font-mono font-black tracking-tighter ${p.esRemate ? 'text-yellow-500' : 'text-[var(--g360-accent)]'}`}>
                    {p.codigo}
                  </span>
                  <span className="text-xs font-black text-[var(--g360-muted)] uppercase tracking-widest">{p.linea}</span>
                </div>
                <span className="text-xs font-bold text-[var(--g360-muted)] mt-1 uppercase opacity-60">EAN: {p.ean || p.ean14 || '---'}</span>
              </div>

              {/* Product Name */}
              <h3 className="text-sm sm:text-base font-bold text-[var(--g360-text)] line-clamp-2 leading-tight min-h-[2.4rem] mb-3 tracking-tight group-hover:text-[var(--g360-accent)] transition-colors">
                {p.nombre}
              </h3>

              {/* Combined Info Section: Stock + Box + Price */}
              <div className="bg-[var(--g360-input-bg)]/50 rounded-2xl p-3 border border-[var(--g360-border)] mb-3">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${isAgotado ? 'bg-red-600' : productStock < 20 ? 'bg-red-500 animate-pulse' : 'bg-[var(--g360-accent)]'}`}></div>
                    <span className={`text-xs font-black uppercase ${isAgotado ? 'text-red-600' : 'text-[var(--g360-muted)]'}`}>{isAgotado ? 'AGOTADO' : `Stock: ${productStock}`}</span>
                  </div>
                  <span className="px-2 py-0.5 bg-[var(--g360-surface)] rounded text-xs font-black text-[var(--g360-muted)] border border-[var(--g360-border)]">Box: {p.bxSize}U</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--g360-muted)] font-bold uppercase tracking-widest">Precio Neto</span>
                  <span className="text-2xl sm:text-3xl font-black text-[var(--g360-text)] tracking-tighter">{formatMoney(p.precioLista)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-auto space-y-2">
                <div className="flex gap-2">
                  <div className="flex-1 h-10 flex items-center bg-[var(--g360-input-bg)] rounded-xl p-1 border border-[var(--g360-border)]">
                    <button 
                      onClick={() => setSearchQuantities(v => ({...v, [p.codigo]: Math.max(0, (v[p.codigo] || 0) - 1)}))}
                      className="w-8 h-8 flex items-center justify-center text-[var(--g360-muted)] hover:text-[var(--g360-accent)]"
                    >
                      <span className="material-symbols-outlined text-xl">remove</span>
                    </button>
                    <input
                      type="number"
                      className="w-full text-center bg-transparent border-none text-sm font-black p-0 focus:ring-0 text-[var(--g360-text)]"
                      value={searchQuantities[p.codigo] || 0}
                      onChange={e => setSearchQuantities(v => ({...v, [p.codigo]: parseInt(e.target.value) || 0}))}
                    />
                    <button 
                      onClick={() => setSearchQuantities(v => ({...v, [p.codigo]: (v[p.codigo] || 0) + 1}))}
                      className="w-8 h-8 flex items-center justify-center text-[var(--g360-muted)] hover:text-[var(--g360-accent)]"
                    >
                      <span className="material-symbols-outlined text-xl">add</span>
                    </button>
                  </div>
                  
                  <button
                    onClick={() => setSearchQuantities(v => ({...v, [p.codigo]: (v[p.codigo] || 0) + p.bxSize}))}
                    className="w-10 h-10 bg-[var(--g360-accent)]/10 text-[var(--g360-accent)] rounded-xl flex flex-col items-center justify-center border border-[var(--g360-accent)]/30 hover:bg-[var(--g360-accent)] hover:text-black transition-all"
                  >
                    <span className="text-xs font-black uppercase leading-none">+1</span>
                    <span className="text-[11px] font-black uppercase leading-none">Box</span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    const q = searchQuantities[p.codigo] || 0;
                    if(q > 0) {
                      // Si está agotado, confirmar antes de agregar
                      if (isAgotado) {
                        if (!confirm(`⚠️ El producto ${p.codigo} - ${p.nombre} está AGOTADO.\n\n¿Desea agregarlo de todas maneras?`)) {
                          return;
                        }
                      }
                      addToCart(p, q);
                      setSearchQuantities(v => ({...v, [p.codigo]: 0}));
                    }
                  }}
                  disabled={!(searchQuantities[p.codigo] > 0)}
                  className="w-full h-10 bg-[var(--g360-accent)] text-black rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[var(--g360-accent)]/20 disabled:opacity-20 disabled:grayscale hover:bg-[var(--g360-accent)] transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined text-xl font-bold">add_shopping_cart</span>
                  <span className="text-[11px] font-black uppercase tracking-widest">Añadir</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {filteredProducts.length > PRODUCTS_PER_PAGE && (
        <div className="flex justify-center items-center gap-8 py-12">
           <button 
            disabled={currentPage === 1} 
            onClick={() => { setCurrentPage(v => v - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="w-14 h-14 rounded-full border border-[var(--g360-border)] flex items-center justify-center hover:bg-[var(--g360-surface)] text-[var(--g360-muted)] disabled:opacity-20 transition-all"
           >
             <span className="material-symbols-outlined text-2xl">west</span>
           </button>
           <span className="text-xs font-black uppercase tracking-[0.2em] text-[var(--g360-muted)]">
             PÁGINA <span className="text-[var(--g360-text)] text-base mx-1">{currentPage}</span>
             <span className="text-[var(--g360-muted)] mx-1">de</span>
             <span className="text-[var(--g360-text)] text-base mx-1">{Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE)}</span>
           </span>
           <button 
            disabled={currentPage * PRODUCTS_PER_PAGE >= filteredProducts.length}
            onClick={() => { setCurrentPage(v => v + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="w-14 h-14 rounded-full border border-[var(--g360-border)] flex items-center justify-center hover:bg-[var(--g360-surface)] text-[var(--g360-muted)] disabled:opacity-20 transition-all"
           >
               <span className="material-symbols-outlined text-2xl">east</span>
           </button>
        </div>
      )}
    </div>
  );
}

export default CatalogoPage;
