/**
 * CatalogoPage.jsx
 * E-commerce Moderno - CIPSA Marca Edition
 * Catálogo en vivo desde Stock API (Render): precio base referencial + stock VES real.
 */

import { useState, useMemo, useEffect } from 'react';
import { useDebounce } from '../hooks/useDebounce';
import { useApp } from '../context/AppContext';
import { useStockCatalog } from '../hooks/useStockCatalog';
import { formatMoney } from '../utils/formatters';
import Paginador from '../components/Paginador';
import useVoz from '../hooks/useVoz';

// Categorías fijas de venta (decisión de negocio: solo estas 3)
const CATEGORIES = [
  { id: 'todos', label: 'Búsqueda', icon: 'search', isFreeSearch: true, ghost: 'Search' },
  { id: 'viniball', label: 'Viniball', icon: 'sports_baseball', categoria: 'VINIBALL', ghost: 'Viniball' },
  { id: 'vinifan', label: 'Vinifan', icon: 'school', categoria: 'VINIFAN', ghost: 'Vinifan' },
  { id: 'representadas', label: 'Representadas', icon: 'stars', categoria: 'REPRESENTADAS', ghost: 'Representadas' },
];

// Umbral de bajo stock en cajas (regla de negocio de g360-stock-reporter)
const UMBRAL_BAJO_STOCK = 10;

const PRODUCTS_PER_PAGE = 24;

// Identidad de color por categoría (marca CIPSA). La base de UI es neutra:
// el color de categoría se aplica solo en chips activos, SKU y contador.
const CATEGORY_COLORS = {
  VINIBALL: { primary: '#dc2626', onPrimary: '#ffffff', secondary: '#111827' },      // rojo y negro
  VINIFAN: { primary: '#ea580c', onPrimary: '#ffffff', secondary: '#1d4ed8' },       // naranja y azul
  REPRESENTADAS: { primary: '#16a34a', onPrimary: '#ffffff', secondary: '#f8fafc' }, // verde y blanco
};
const colorDeCategoria = (cat) => CATEGORY_COLORS[cat]?.primary || null;

// Estado de stock: agotado (0), bajo (<10 cajas VES), ok
function stockEstado(p) {
  if (p.stock <= 0) return 'agotado';
  const cajas = p.bxSize > 1 ? Math.floor(p.stock / p.bxSize) : p.stock;
  return cajas < UMBRAL_BAJO_STOCK ? 'bajo' : 'ok';
}

// Modal compacto de detalle de producto (revisión de stock VES)
function ProductDetailModal({ product, onClose }) {
  if (!product) return null;
  const estado = stockEstado(product);
  const cajas = product.bxSize > 1 ? Math.floor(product.stock / product.bxSize) : product.stock;

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-detail-title"
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
      <div
        className="relative bg-[var(--g360-surface)] w-full max-w-xs rounded-2xl shadow-2xl border border-[var(--g360-border)] animate-scale-in p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-2xl font-mono font-black tracking-tighter text-[var(--g360-accent)]" style={{ color: colorDeCategoria(product.categoria) || undefined }}>{product.codigo}</span>
        <h2 id="product-detail-title" className="text-sm font-bold text-[var(--g360-text)] mt-2 mb-4 leading-tight">{product.nombre}</h2>
        {(product.descontinuado || product.sinCatalogo) && (
          <p className={`text-[9px] font-black uppercase tracking-widest mb-3 ${product.descontinuado ? 'text-[var(--g360-muted)]' : 'text-amber-500'}`}>
            {product.descontinuado ? '⚠️ Producto descontinuado' : '⚠️ Fuera del catálogo maestro'}
          </p>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-black text-[var(--g360-muted)] uppercase">Precio neto</span>
            <span className="font-black text-[var(--g360-text)]">{formatMoney(product.precioLista)}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="font-black text-[var(--g360-muted)] uppercase">Box</span>
            <span className="font-bold text-[var(--g360-text)]">{product.bxSize}U</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="font-black text-[var(--g360-muted)] uppercase">Stock VES</span>
            <div className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${estado === 'agotado' ? 'bg-red-600' : estado === 'bajo' ? 'bg-amber-500' : 'bg-[var(--g360-accent)]'}`}></div>
              <span className={`font-bold ${estado === 'agotado' ? 'text-red-600' : 'text-[var(--g360-text)]'}`}>
                {estado === 'agotado' ? 'AGOTADO' : `${product.stock} u`}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="font-black text-[var(--g360-muted)] uppercase">Cajas disponibles</span>
            <span className="font-bold text-[var(--g360-text)]">{estado === 'agotado' ? 0 : cajas} bx</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="font-black text-[var(--g360-muted)] uppercase">EAN</span>
            <span className="font-mono font-bold text-[var(--g360-text)]">{product.ean || product.ean14 || '---'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CatalogoPage() {
  const { addToCart, clientData, setShowPedidoModal } = useApp();
  const { items, status, error, refresh } = useStockCatalog();
  const [search, setSearch] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [activeCatalog, setActiveCatalog] = useState('todos');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuantities, setSearchQuantities] = useState({});
  const [selectedProductDetail, setSelectedProductDetail] = useState(null);
  const debouncedSearch = useDebounce(search, 300);

  const { escuchando, soportado: vozSoportada, escuchar, detener } = useVoz({
    onTexto: (t) => { setSearch(t); setActiveCatalog('todos'); }
  });

  const clienteCargado = Boolean(clientData.ruc || clientData.nombre);

  // Universo vendible (chips de categoría): sin catálogo ni descontinuados
  const productosVenta = useMemo(() => {
    return items.filter(p => !p.sinCatalogo && !p.descontinuado).sort((a, b) => a.orden - b.orden);
  }, [items]);

  // Universo completo (pestaña Búsqueda): incluye sin catálogo y descontinuados (ej: 016717)
  const productosTodos = useMemo(() => {
    return [...items].sort((a, b) => a.orden - b.orden);
  }, [items]);

  const filteredProducts = useMemo(() => {
    const currentCat = CATEGORIES.find(c => c.id === activeCatalog) || CATEGORIES[0];
    const query = debouncedSearch.trim().toLowerCase();

    if (currentCat.isFreeSearch) {
      // Búsqueda: universo completo
      let result = productosTodos;
      if (query) {
        result = result.filter(p =>
          p.codigo.toLowerCase().includes(query) ||
          p.nombre.toLowerCase().includes(query) ||
          p.ean?.toLowerCase().includes(query) ||
          p.ean14?.toLowerCase().includes(query)
        );
      }
      return result;
    }

    // Chips: solo productos vendibles de la categoría elegida
    let result = productosVenta.filter(p => p.categoria === currentCat.categoria);
    if (query) {
      result = result.filter(p =>
        p.nombre.toLowerCase().includes(query) ||
        p.codigo.toLowerCase().includes(query) ||
        p.ean?.toLowerCase().includes(query)
      );
    }
    return result;
  }, [productosVenta, productosTodos, activeCatalog, debouncedSearch]);

  const pagedItems = filteredProducts.slice((currentPage - 1) * PRODUCTS_PER_PAGE, currentPage * PRODUCTS_PER_PAGE);
  const totalPaginas = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const currentCategory = CATEGORIES.find(c => c.id === activeCatalog) || CATEGORIES[0];
  const currentCatColor = currentCategory.categoria ? CATEGORY_COLORS[currentCategory.categoria] : null;

  // Si el filtro reduce los resultados y la página actual queda fuera de rango, volver a la 1
  useEffect(() => {
    if (currentPage > totalPaginas && totalPaginas > 0) setCurrentPage(1);
  }, [currentPage, totalPaginas]);

  const cambiarPagina = (p) => {
    setCurrentPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const isLoading = status === 'loading' || status === 'idle';

  return (
    <div className={`transition-all duration-500 ${isSearchFocused && !search.trim() ? 'search-focus-active' : ''}`}>
      {isSearchFocused && <div className="search-overlay" onClick={() => setIsSearchFocused(false)} />}

      {/* Flujo de tienda: Paso 1 - Cliente */}
      {!clienteCargado ? (
        <div className="mx-4 mt-4 mb-2 rounded-3xl bg-[var(--g360-surface)] border-2 border-dashed border-[var(--g360-accent)]/40 p-5 flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between animate-slide-up">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 shrink-0 rounded-2xl bg-[var(--g360-accent)]/10 border border-[var(--g360-accent)]/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-[var(--g360-accent)]">person_add</span>
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--g360-accent)]">Paso 1 · Cargar cliente</p>
              <p className="text-sm font-bold text-[var(--g360-text)] mt-0.5">Busca por código, RUC o nombre para empezar el pedido</p>
            </div>
          </div>
          <button
            onClick={() => setShowPedidoModal(true)}
            className="shrink-0 px-6 py-3 bg-[var(--g360-accent)] text-[var(--g360-accent-contrast)] rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-[var(--g360-glow)] hover:scale-105 active:scale-95 transition-all"
          >
            Cargar Cliente
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowPedidoModal(true)}
          className="mx-4 mt-4 mb-2 rounded-3xl bg-[var(--g360-accent)]/10 border border-[var(--g360-accent)]/30 px-5 py-3 flex items-center gap-3 text-left w-[calc(100%-2rem)] hover:bg-[var(--g360-accent)]/20 transition-all animate-slide-up"
        >
          <span className="material-symbols-outlined text-[var(--g360-accent)] shrink-0">badge</span>
          <div className="min-w-0 flex-1">
            <p className="text-[8px] font-black uppercase tracking-widest text-[var(--g360-accent)]">Atendiendo a</p>
            <p className="text-sm font-bold text-[var(--g360-text)] truncate">{clientData.nombre || '---'} <span className="text-[10px] font-mono text-[var(--g360-muted)]">· RUC {clientData.ruc || '---'}</span></p>
          </div>
          <span className="material-symbols-outlined text-[var(--g360-muted)] shrink-0">edit</span>
        </button>
      )}

      {/* Dynamic Header */}
      <div className="relative overflow-hidden pt-4 sm:pt-6 pb-3 sm:pb-4 px-4">
        <span className="text-ghost opacity-5" style={currentCatColor ? { color: currentCatColor.secondary } : undefined}>{currentCategory.ghost}</span>
        <div className="relative z-10 text-center sm:text-left">
          <h2 className="text-2xl sm:text-3xl font-black font-premium uppercase tracking-tighter text-[var(--g360-text)]">
            {currentCategory.label}
          </h2>
          <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] mt-1" style={{ color: currentCatColor?.primary || 'var(--g360-accent)' }}>
            {filteredProducts.length} PRODUCTOS DISPONIBLES
          </p>
        </div>
      </div>

      {/* Navigation & Search Sticky */}
      <div className="sticky top-20 z-40 bg-[var(--g360-bg)]/80 backdrop-blur-2xl py-2 sm:py-3 -mx-4 px-4 lg:-mx-8 lg:px-8 border-b border-[var(--g360-border)] search-container rounded-b-[2.5rem]">
         <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3 mb-3 sm:pb-4 sm:mb-4">
            {CATEGORIES.map(cat => {
              const activo = activeCatalog === cat.id;
              const color = cat.categoria ? CATEGORY_COLORS[cat.categoria] : null;
              return (
                <button
                  key={cat.id}
                  onClick={() => { setActiveCatalog(cat.id); setCurrentPage(1); }}
                  style={activo && color ? { backgroundColor: color.primary, color: color.onPrimary } : undefined}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl whitespace-nowrap text-[9px] font-black uppercase tracking-widest transition-all lg:px-6 lg:py-3 lg:text-[10px] lg:gap-2 lg:rounded-2xl ${
                    activo
                      ? (color ? 'shadow-xl' : 'bg-[var(--g360-accent)] text-[var(--g360-accent-contrast)] shadow-xl shadow-[var(--g360-accent)]/20')
                      : 'bg-[var(--g360-surface)] text-[var(--g360-muted)] border border-[var(--g360-border)]'
                  }`}
                >
                  <span className="material-symbols-outlined text-base lg:text-lg">{cat.icon}</span>
                  {cat.label}
                </button>
              );
            })}
         </div>

         <div className="relative group">
            <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-[var(--g360-muted)] group-focus-within:text-[var(--g360-accent)] text-2xl transition-colors">search</span>
            <input
              type="text"
              placeholder="Buscar SKU o nombre..."
              className="w-full bg-[var(--g360-input-bg)] border-2 border-[var(--g360-border)] rounded-[1.5rem] py-4 pl-14 pr-14 text-sm font-bold text-[var(--g360-text)] focus:border-[var(--g360-accent)] outline-none transition-all"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={() => { setIsSearchFocused(true); setActiveCatalog('todos'); }}
            />
            {vozSoportada && (
              <button
                type="button"
                onClick={() => (escuchando ? detener() : escuchar())}
                title={escuchando ? 'Detener dictado' : 'Buscar por voz'}
                aria-label="Buscar por voz"
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full hover:bg-[var(--g360-surface)] transition-all"
              >
                <span className={`material-symbols-outlined text-2xl ${escuchando ? 'text-red-500 animate-pulse' : 'text-[var(--g360-muted)]'}`}>mic</span>
              </button>
            )}
            {escuchando && (
              <p className="absolute left-14 -bottom-5 text-[9px] font-black uppercase tracking-[0.2em] text-red-500 animate-pulse pointer-events-none">
                ● Escuchando... di el SKU o nombre
              </p>
            )}
         </div>
      </div>

      {/* Product Grid */}
      <div className="py-3 sm:py-4 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 lg:gap-6 relative z-10">
        {isLoading ? (
          Array(8).fill(0).map((_, i) => (
            <div key={i} className="h-56 bg-[var(--g360-surface)] rounded-[2rem] animate-pulse" />
          ))
        ) : error && productosTodos.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-center gap-4">
            <span className="material-symbols-outlined text-5xl text-[var(--g360-muted)]">cloud_off</span>
            <p className="text-sm font-bold text-[var(--g360-muted)] max-w-xs">{error}</p>
            <button
              onClick={refresh}
              className="px-6 py-3 bg-[var(--g360-accent)] text-[var(--g360-accent-contrast)] rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg"
            >
              Reintentar
            </button>
          </div>
        ) : pagedItems.map(p => {
          const estado = stockEstado(p);
          const isAgotado = estado === 'agotado';
          const isBajo = estado === 'bajo';
          return (
            <div key={p.codigo} className={`g360-card relative flex flex-col p-2.5 sm:p-3 hover:border-[var(--g360-accent)]/40 ${isAgotado ? 'ring-2 ring-red-500/50 bg-red-500/5 opacity-75' : ''}`}>

              {/* Badge DESCONTINUADO / SIN CATÁLOGO */}
              {p.descontinuado && (
                <div className="absolute -top-1 -right-1 z-10">
                  <div className="bg-[var(--g360-muted)] text-[var(--g360-bg)] px-2 py-1 rounded-bl-xl rounded-tr-xl shadow-lg">
                    <span className="text-[8px] font-black uppercase tracking-wider">Descont.</span>
                  </div>
                </div>
              )}
              {!p.descontinuado && p.sinCatalogo && (
                <div className="absolute -top-1 -right-1 z-10">
                  <div className="bg-amber-500/90 text-black px-2 py-1 rounded-bl-xl rounded-tr-xl shadow-lg">
                    <span className="text-[8px] font-black uppercase tracking-wider">S/Catálogo</span>
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
                  <span className="text-lg sm:text-xl font-mono font-black text-[var(--g360-accent)] tracking-tighter" style={{ color: colorDeCategoria(p.categoria) || undefined }}>
                    {p.codigo}
                  </span>
                  <span className="text-[10px] font-black text-[var(--g360-muted)] uppercase tracking-widest">{p.linea}</span>
                </div>
                <span className="text-[10px] font-bold text-[var(--g360-muted)] mt-1 uppercase opacity-60">EAN: {p.ean || p.ean14 || '---'}</span>
              </div>

              {/* Product Name (click = revisar stock) */}
              <h3
                className="text-sm sm:text-base font-bold text-[var(--g360-text)] line-clamp-2 leading-tight min-h-[2.4rem] mb-3 tracking-tight hover:text-[var(--g360-accent)] transition-colors cursor-pointer"
                onClick={() => setSelectedProductDetail(p)}
                role="button"
                aria-label={`Ver stock de ${p.nombre}`}
              >
                {p.nombre}
              </h3>

              {/* Combined Info Section: Stock VES + Box + Price */}
              <div className="bg-[var(--g360-input-bg)]/50 rounded-2xl p-3 border border-[var(--g360-border)] mb-3">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${isAgotado ? 'bg-red-600' : isBajo ? 'bg-amber-500 animate-pulse' : 'bg-[var(--g360-accent)]'}`}></div>
                    <span className={`text-[10px] font-black uppercase ${isAgotado ? 'text-red-600' : 'text-[var(--g360-muted)]'}`}>
                      {isAgotado ? 'AGOTADO' : `Stock: ${p.stock} u`}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 bg-[var(--g360-surface)] rounded text-[10px] font-black text-[var(--g360-muted)] border border-[var(--g360-border)]">Box: {p.bxSize}U</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] sm:text-[10px] text-[var(--g360-muted)] font-bold uppercase tracking-widest">Precio Neto</span>
                  <span className="text-lg sm:text-2xl lg:text-3xl font-black text-[var(--g360-text)] tracking-tighter">{formatMoney(p.precioLista)}</span>
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
                    <span className="text-[7px] font-black uppercase leading-none">+1</span>
                    <span className="text-[9px] font-black uppercase leading-none">Box</span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    const q = searchQuantities[p.codigo] || 0;
                    if(q > 0) {
                      addToCart(p, q);
                      setSearchQuantities(v => ({...v, [p.codigo]: 0}));
                    }
                  }}
                  disabled={!(searchQuantities[p.codigo] > 0)}
                  className="w-full h-10 bg-[var(--g360-accent)] text-[var(--g360-accent-contrast)] rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[var(--g360-accent)]/20 disabled:opacity-20 disabled:grayscale hover:bg-[var(--g360-accent)] transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined text-xl font-bold">add_shopping_cart</span>
                  <span className="text-[10px] font-black uppercase tracking-widest">Añadir</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de detalle de stock */}
      {selectedProductDetail && (
        <ProductDetailModal
          product={selectedProductDetail}
          onClose={() => setSelectedProductDetail(null)}
        />
      )}

      {/* Pagination */}
      <Paginador
        page={currentPage}
        total={totalPaginas}
        onChange={cambiarPagina}
      />
    </div>
  );
}

export default CatalogoPage;
