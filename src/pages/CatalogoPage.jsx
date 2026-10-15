/**
 * CatalogoPage.jsx
 * E-commerce Moderno - CIPSA Marca Edition
 * Catálogo en vivo desde Stock API (Render): precio base referencial + stock VES real.
 * La búsqueda y los segmentos (líneas) viven en el header (Layout); esta página
 * es puro contenido: grid de productos + paginación.
 */

import { useState, useMemo, useEffect } from 'react';
import { useDebounce } from '../hooks/useDebounce';
import { useApp } from '../context/AppContext';
import { useStockCatalog } from '../hooks/useStockCatalog';
import { formatMoney } from '../utils/formatters';
import Paginador from '../components/Paginador';
import { CATEGORIES, colorDeCategoria } from '../core/categorias';

// Umbral de bajo stock en cajas (regla de negocio de g360-stock-reporter)
const UMBRAL_BAJO_STOCK = 10;

const PRODUCTS_PER_PAGE = 24;

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
  const { addToCart, search, activeCatalog, setActiveCatalog } = useApp();
  const { items, status, error, fuente, refresh } = useStockCatalog();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuantities, setSearchQuantities] = useState({});
  const [selectedProductDetail, setSelectedProductDetail] = useState(null);
  const debouncedSearch = useDebounce(search, 300);

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

  // Cambio de segmento o búsqueda → volver a la página 1
  useEffect(() => { setCurrentPage(1); }, [activeCatalog, debouncedSearch]);
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
    <div>
      {/* Aviso: catálogo base (precios pueden estar desactualizados) */}
      {fuente === 'base' && status === 'stale' && (
        <div className="mt-1 mb-2 rounded-2xl bg-amber-500/10 border border-amber-500/40 px-4 py-2 flex items-center gap-2.5">
          <span className="material-symbols-outlined text-amber-500 text-base shrink-0">warning</span>
          <p className="text-[9px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide leading-tight">
            Catálogo base de respaldo — precios pueden estar desactualizados. Conectando con el servidor…
          </p>
        </div>
      )}

      {/* Contador de resultados (caption; el título vive en el chip activo del header) */}
      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--g360-muted)] mb-2 mt-1">
        {filteredProducts.length} productos
        {currentCategory.id !== 'todos' ? ` · ${currentCategory.label}` : ''}
      </p>

      {/* Product Grid */}
      <div className="pb-3 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 lg:gap-6">
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
