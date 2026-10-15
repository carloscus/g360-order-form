/**
 * CartDrawer.jsx
 * Carrito de compra deslizante - Tienda Virtual CIPSA
 * Flujo: cliente en atención → productos → 🛒 → Generar Hoja de Pedido.
 */

import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { formatMoney } from '../utils/formatters';

function CartDrawer({ open, onClose, onOpenClient }) {
  const {
    selectedProductsArray,
    cartCount,
    cartTotalValue,
    updateCartQuantity,
    removeFromCart,
    clientData,
    setShowPedidoModal
  } = useApp();
  const navigate = useNavigate();

  if (!open) return null;

  const clienteCargado = Boolean(clientData.ruc || clientData.nombre);

  return (
    <div className="fixed inset-0 z-[900]">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] animate-fade-in" onClick={onClose} />

      <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-[var(--g360-bg)] shadow-2xl border-l border-[var(--g360-border)] flex flex-col animate-slide-in-right">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-5 border-b border-[var(--g360-border)] shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="material-symbols-outlined text-3xl text-[var(--g360-accent)]">shopping_cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">{cartCount}</span>
              )}
            </div>
            <div>
              <h2 className="text-lg font-black font-premium uppercase tracking-tighter text-[var(--g360-text)] leading-none">Mi Carrito</h2>
              <p className="text-[9px] font-black uppercase tracking-widest text-[var(--g360-muted)] mt-1">Tienda CIPSA</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-[var(--g360-input-bg)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all">
            <span className="material-symbols-outlined text-[var(--g360-muted)]">close</span>
          </button>
        </header>

        {/* Cliente en atención (Paso 1 del flujo) */}
        <div className="px-6 py-4 border-b border-[var(--g360-border)] shrink-0">
          {clienteCargado ? (
            <button
              onClick={onOpenClient}
              className="w-full flex items-center justify-between gap-3 bg-[var(--g360-accent)]/10 border border-[var(--g360-accent)]/30 rounded-2xl px-4 py-3 text-left hover:bg-[var(--g360-accent)]/20 transition-all"
            >
              <div className="min-w-0">
                <p className="text-[8px] font-black uppercase tracking-widest text-[var(--g360-accent)]">Cliente en atención</p>
                <p className="text-sm font-bold text-[var(--g360-text)] truncate">{clientData.nombre || '---'}</p>
                <p className="text-[10px] font-mono text-[var(--g360-muted)] truncate">
                  RUC: {clientData.ruc || '---'}{clientData.vendedor ? ` · Ven: ${clientData.vendedor}` : ''}
                </p>
              </div>
              <span className="material-symbols-outlined text-[var(--g360-muted)] shrink-0">edit</span>
            </button>
          ) : (
            <button
              onClick={onOpenClient}
              className="w-full flex items-center justify-center gap-2 bg-[var(--g360-surface)] border-2 border-dashed border-[var(--g360-accent)]/40 rounded-2xl px-4 py-4 hover:border-[var(--g360-accent)] transition-all"
            >
              <span className="material-symbols-outlined text-[var(--g360-accent)]">person_add</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--g360-accent)]">Paso 1: Cargar Cliente</span>
            </button>
          )}
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {selectedProductsArray.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
              <span className="material-symbols-outlined text-6xl text-[var(--g360-muted)] opacity-40">remove_shopping_cart</span>
              <p className="text-sm font-bold text-[var(--g360-muted)]">Carrito vacío</p>
              <p className="text-[11px] text-[var(--g360-muted)] opacity-70 max-w-[220px]">Busca o selecciona productos del catálogo y agrégalos para generar tu hoja de pedido.</p>
              <button onClick={onClose} className="mt-2 px-6 py-3 bg-[var(--g360-accent)] text-[var(--g360-accent-contrast)] rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg">
                Ir al Catálogo
              </button>
            </div>
          ) : (
            selectedProductsArray.map(p => (
              <div key={p.codigo} className="bg-[var(--g360-surface)] border border-[var(--g360-border)] rounded-2xl p-3 flex items-center gap-3">
                <div className="flex flex-col min-w-[70px] shrink-0 border-r border-[var(--g360-border)] pr-3">
                  <span className="text-sm font-mono font-black text-[var(--g360-accent)] tracking-tighter leading-none">{p.codigo}</span>
                  <span className="text-[8px] font-black text-[var(--g360-muted)] uppercase mt-1 truncate">{p.linea}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[11px] font-bold text-[var(--g360-text)] leading-tight truncate">{p.nombre}</h4>
                  <p className="text-[9px] font-mono text-[var(--g360-muted)] mt-0.5">
                    {formatMoney(p.precioLista)} · Box {p.bxSize}U · {Math.ceil(p.cantidad / p.bxSize)} bx
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center bg-[var(--g360-input-bg)] rounded-lg p-0.5 border border-[var(--g360-border)]">
                      <button onClick={() => updateCartQuantity(p.codigo, p.cantidad - 1)} className="w-6 h-6 flex items-center justify-center text-[var(--g360-muted)] hover:text-[var(--g360-accent)]"><span className="material-symbols-outlined text-base">remove</span></button>
                      <span className="w-6 text-center text-[10px] font-black text-[var(--g360-text)]">{p.cantidad}</span>
                      <button onClick={() => updateCartQuantity(p.codigo, p.cantidad + 1)} className="w-6 h-6 flex items-center justify-center text-[var(--g360-muted)] hover:text-[var(--g360-accent)]"><span className="material-symbols-outlined text-base">add</span></button>
                    </div>
                    <button onClick={() => removeFromCart(p.codigo)} className="text-red-500/40 hover:text-red-500"><span className="material-symbols-outlined text-base">delete</span></button>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-black text-[var(--g360-text)] leading-none">{formatMoney(p.precioLista * p.cantidad)}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer: total + CTA del flujo */}
        <footer className="px-6 py-5 border-t border-[var(--g360-border)] shrink-0 bg-[var(--g360-surface)]/50">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--g360-muted)]">Total referencial</span>
            <span className="text-2xl font-black font-premium text-[var(--g360-accent)] tracking-tighter">{formatMoney(cartTotalValue)}</span>
          </div>
          <p className="text-[9px] text-[var(--g360-muted)] opacity-70 mb-4">Precios sin descuentos ni IGV · Sujeto a cotización final</p>
          <button
            onClick={() => { onClose(); navigate('/orden'); }}
            disabled={cartCount === 0}
            className="w-full py-4 bg-[var(--g360-accent)] text-[var(--g360-accent-contrast)] rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-[var(--g360-glow)] flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30 disabled:grayscale"
          >
            <span className="material-symbols-outlined text-lg">receipt_long</span>
            Generar Hoja de Pedido
          </button>
        </footer>
      </aside>
    </div>
  );
}

export default CartDrawer;
