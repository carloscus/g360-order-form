/**
 * Layout.jsx
 * Layout principal CIPSA Marca Edition
 * Focus: Mobile Mobility, Glassmorphism, Premium Header
 */

import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { loadExcelFile } from '../utils/xlsxLoader';
import { getTimeAgo } from '../utils/formatters';
import { G360_CONFIG } from '../core/g360-skill';
import { useStockCatalog } from '../hooks/useStockCatalog';
import ClientDataModal from '../components/ClientDataModal';
import CartDrawer from '../components/CartDrawer';

// Componente de Modal de Confirmación Moderno - Symmetric
function ConfirmModal({ isOpen, title, message, confirmText = 'Confirmar', cancelText = 'Cancelar', onConfirm, onCancel, danger = false }) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onCancel} />
      <div className="relative bg-[var(--g360-surface)] rounded-[2rem] shadow-2xl max-w-sm w-full p-8 animate-scale-in border border-[var(--g360-border)] text-center">
        <h3 className="text-xl font-black text-[var(--g360-text)] mb-2 uppercase tracking-tighter">{title}</h3>
        <p className="text-[var(--g360-muted)] mb-8 text-sm font-medium">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 px-4 py-3 bg-[var(--g360-input-bg)] text-[var(--g360-text)] rounded-xl font-bold text-xs uppercase tracking-widest">
            {cancelText}
          </button>
          <button onClick={onConfirm} className={`flex-1 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${danger ? 'bg-red-500 text-white shadow-lg' : 'bg-[var(--g360-accent)] text-[var(--g360-accent-contrast)] shadow-lg shadow-[var(--g360-glow)]'}`}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

// Componente de Modal de Alerta Moderno - Symmetric
function AlertModal({ isOpen, title, message, buttonText = 'Aceptar', onClose, type = 'info' }) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-[var(--g360-surface)] rounded-[2rem] shadow-2xl max-w-sm w-full p-8 animate-scale-in border border-[var(--g360-border)] text-center">
        <div className="flex flex-col items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-full bg-[var(--g360-input-bg)] flex items-center justify-center border border-[var(--g360-border)]">
             <span className={`material-symbols-outlined text-3xl ${type === 'success' ? 'text-[var(--g360-accent)]' : type === 'error' ? 'text-red-500' : 'text-[var(--g360-muted)]'}`}>
               {type === 'success' ? 'check_circle' : type === 'error' ? 'error' : type === 'warning' ? 'warning' : 'info'}
             </span>
          </div>
          <h3 className="text-xl font-black text-[var(--g360-text)] uppercase tracking-tighter">{title}</h3>
        </div>
        <p className="text-[var(--g360-muted)] mb-8 text-sm font-medium">{message}</p>
        <button onClick={onClose} className="w-full px-4 py-4 bg-[var(--g360-accent)] text-[var(--g360-accent-contrast)] rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg">
          {buttonText}
        </button>
      </div>
    </div>
  );
}

// Indicador de frescura del stock (Render API): acento = en vivo / 🟡 cache / 🟠 base / 🔴 viejo o error
function StockStatusBadge({ status, lastFetch, error, fuente, onRefresh, refreshing }) {
  const config = {
    fresh: { color: 'bg-[var(--g360-accent)]', label: 'Stock en vivo' },
    stale: { color: 'bg-amber-500', label: 'Cache local' },
    loading: { color: 'bg-sky-500 animate-pulse', label: 'Cargando stock' },
    waking: { color: 'bg-sky-500 animate-pulse', label: 'Servidor despertando' },
    error: { color: 'bg-red-500', label: 'Sin conexión' },
    idle: { color: 'bg-slate-400', label: 'Sin datos' }
  }[status] || { color: 'bg-slate-400', label: 'Stock' };

  const timeAgo = lastFetch ? getTimeAgo(lastFetch) : '';
  // Data vieja (>7 días): avisar con rojo — sirve para trabajar offline, pero no es fresca
  const dias = lastFetch ? Math.floor((Date.now() - new Date(lastFetch).getTime()) / 86400000) : null;
  const muyVieja = status === 'stale' && dias !== null && dias >= 7;

  let color = config.color;
  let label = config.label;
  if (fuente === 'base' && status === 'stale') { color = 'bg-amber-500'; label = 'Catálogo base'; }
  if (muyVieja) { color = 'bg-red-500'; label = `Cache ${dias}d`; }

  return (
    <button
      onClick={onRefresh}
      disabled={refreshing}
      title={error || `Actualizado ${timeAgo}. Click para sincronizar.`}
      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--g360-input-bg)] border border-[var(--g360-border)] hover:bg-[var(--g360-surface)] transition-all disabled:opacity-50"
    >
      <span className={`w-2 h-2 rounded-full ${color}`}></span>
      <span className="hidden sm:inline text-[9px] font-black uppercase tracking-widest text-[var(--g360-muted)]">
        {refreshing ? 'Sincronizando...' : (timeAgo || label)}
      </span>
      <span className={`material-symbols-outlined text-sm text-[var(--g360-muted)] ${refreshing ? 'animate-spin' : ''}`}>sync</span>
    </button>
  );
}

function Layout() {
  const { cartCount, setShowPedidoModal, clearCart, clientData, setClientDataAll, addToCart, isDarkMode, toggleTheme } = useApp();
  const { items: catalogo, status, lastFetch, error, fuente, refresh: refreshStock } = useStockCatalog();
  const location = useLocation();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  const [modals, setModals] = useState({
    load: { open: false, data: null },
    alert: { open: false, title: '', message: '', type: 'info' }
  });

  const showAlert = (title, message, type = 'info') => {
    setModals(prev => ({ ...prev, alert: { open: true, title, message, type } }));
  };

  const performRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshStock();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLoadXLSX = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const data = await loadExcelFile(file);
      if (cartCount > 0) {
        setModals(prev => ({ ...prev, load: { open: true, data } }));
      } else {
        await loadProductsToCart(data);
      }
    } catch (err) {
      showAlert('Error', err.message || 'No se pudo cargar el Excel.', 'error');
    }
    event.target.value = '';
  };

  // Reconstruye el carrito desde el Excel importado, cotejando contra el catálogo de la API
  const loadProductsToCart = async ({ products, clientData: importedClient }) => {
    // Agregar cantidades por SKU (el archivo puede repetir el mismo SKU en varias filas)
    const cantidades = new Map();
    const precios = new Map();
    (products || []).forEach(row => {
      const cantidad = Number(row.cantidad) || 0;
      if (!row.codigo || cantidad <= 0) return;
      cantidades.set(row.codigo, (cantidades.get(row.codigo) || 0) + cantidad);
      if (row.precioLista) precios.set(row.codigo, Number(row.precioLista));
    });

    if (cantidades.size === 0) {
      showAlert('Sin productos', 'El archivo no contiene productos con cantidad válida.', 'warning');
      return;
    }

    const catalogMap = new Map(catalogo.map(p => [p.codigo, p]));
    let sinCatalogo = 0;
    cantidades.forEach((cantidad, codigo) => {
      const cat = catalogMap.get(codigo);
      if (cat) {
        addToCart(cat, cantidad);
      } else {
        addToCart({
          codigo,
          nombre: '[NO CATÁLOGO]',
          bxSize: 1,
          precioLista: precios.get(codigo) || 0,
          pesoUm: 0
        }, cantidad);
        sinCatalogo++;
      }
    });

    // Restaurar datos del cliente presentes en el archivo (merge de campos no vacíos)
    if (importedClient) {
      const merged = { ...clientData };
      Object.entries(importedClient).forEach(([key, value]) => {
        if (value) merged[key] = value;
      });
      setClientDataAll(merged);
    }

    showAlert(
      'Importación completa',
      `${cantidades.size} productos importados${sinCatalogo ? ` (${sinCatalogo} sin catálogo)` : ''}.`,
      'success'
    );
    navigate('/orden');
  };

  // Determinar si una ruta está activa
  const isPathActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-[var(--g360-bg)] transition-colors duration-300 pb-16 lg:pb-0">
      {/* Header Premium */}
      <div className="fixed top-0 left-0 right-0 z-[500] p-4 pointer-events-none">
        <header className="max-w-[1400px] mx-auto h-16 glass rounded-2xl px-6 flex items-center justify-between pointer-events-auto border border-[var(--g360-border)] shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[var(--g360-surface)] rounded-xl flex items-center justify-center p-1.5 shadow-sm border border-[var(--g360-border)]">
              <img src={G360_CONFIG.branding.clientLogoFile} alt="CIPSA" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg sm:text-2xl font-black font-premium leading-tight tracking-tighter uppercase italic text-[var(--g360-text)]">
                CIPSA <span className="text-[var(--g360-accent)]">OrderX</span>
              </h1>
              <span className="text-[10px] uppercase font-black text-[var(--g360-muted)] tracking-[0.15em] leading-none">
                Gestión de Pedidos
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <StockStatusBadge
              status={status}
              lastFetch={lastFetch}
              error={error}
              fuente={fuente}
              onRefresh={performRefresh}
              refreshing={isRefreshing}
            />
            <button onClick={toggleTheme} className="w-10 h-10 rounded-xl bg-[var(--g360-input-bg)] flex items-center justify-center text-[var(--g360-text)] border border-[var(--g360-border)]">
              <span className="material-symbols-outlined text-xl">
                {isDarkMode ? 'light_mode' : 'dark_mode'}
              </span>
            </button>
          </div>
        </header>
      </div>

      <div className="flex pt-16">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 h-[calc(100vh-80px)] sticky top-20 ml-8 bg-[var(--g360-surface)] rounded-[2.5rem] border border-[var(--g360-border)] p-6 gap-6 shadow-xl z-40">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--g360-muted)] px-4 mb-2">Navegación</span>
            <NavLink to="/catalogo" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${isActive ? 'bg-[var(--g360-accent)] text-[var(--g360-accent-contrast)] shadow-lg shadow-[var(--g360-glow)]' : 'text-[var(--g360-text)] hover:bg-[var(--g360-input-bg)]'}`}>
              <span className="material-symbols-outlined">home</span>
              <span className="text-sm font-bold uppercase tracking-widest">Inicio</span>
            </NavLink>
            <NavLink to="/orden" className={({isActive}) => `flex items-center justify-between px-4 py-3 rounded-2xl transition-all ${isActive ? 'bg-[var(--g360-accent)] text-[var(--g360-accent-contrast)] shadow-lg shadow-[var(--g360-glow)]' : 'text-[var(--g360-muted)] hover:bg-[var(--g360-input-bg)]'}`}>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined">shopping_bag</span>
                <span className="text-sm font-bold uppercase tracking-widest">Mi Orden</span>
              </div>
              {cartCount > 0 && (
                <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-black ${isPathActive('/orden') ? 'bg-black text-[var(--g360-accent)]' : 'bg-red-500 text-white'}`}>
                  {cartCount}
                </span>
              )}
            </NavLink>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--g360-muted)] px-4 mb-2">Herramientas</span>
            <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-3 px-4 py-3 rounded-2xl text-[var(--g360-muted)] hover:bg-[var(--g360-input-bg)] transition-all text-left">
              <span className="material-symbols-outlined">upload_file</span>
              <span className="text-sm font-bold uppercase tracking-widest">Cargar XLSX</span>
            </button>
            <button onClick={performRefresh} disabled={isRefreshing} className="flex items-center gap-3 px-4 py-3 rounded-2xl text-[var(--g360-muted)] hover:bg-[var(--g360-input-bg)] transition-all text-left">
              <span className={`material-symbols-outlined ${isRefreshing ? 'animate-spin' : ''}`}>sync</span>
              <span className="text-sm font-bold uppercase tracking-widest">{isRefreshing ? 'Actualizando...' : 'Sincronizar'}</span>
            </button>
            <button onClick={() => setShowPedidoModal(true)} className="flex items-center gap-3 px-4 py-3 rounded-2xl text-[var(--g360-muted)] hover:bg-[var(--g360-input-bg)] transition-all text-left">
              <span className="material-symbols-outlined">badge</span>
              <span className="text-sm font-bold uppercase tracking-widest">Cliente</span>
            </button>
            <button onClick={() => window.open('https://fliphtml5.com/bookcase/ilmjw/', '_blank')} className="flex items-center gap-3 px-4 py-3 rounded-2xl text-[var(--g360-muted)] hover:bg-[var(--g360-input-bg)] transition-all text-left">
              <span className="material-symbols-outlined">menu_book</span>
              <span className="text-sm font-bold uppercase tracking-widest">Catálogos Online</span>
            </button>
          </div>
        </aside>

        <main className="flex-1 lg:pt-4 pb-16 lg:pb-12 px-4 lg:px-8 max-w-full overflow-hidden">
          <Outlet />
        </main>
      </div>

      {/* Mobile Nav - FIXED DESIGN */}
      <nav className="mobile-nav lg:hidden">
        <NavLink to="/catalogo" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="material-symbols-outlined">home</span>
          <span>Inicio</span>
        </NavLink>
        <button onClick={() => window.open('https://fliphtml5.com/bookcase/ilmjw/', '_blank')} className="nav-item">
          <span className="material-symbols-outlined">menu_book</span>
          <span>Catálogo</span>
        </button>
        <button onClick={() => fileInputRef.current?.click()} className="nav-item">
          <span className="material-symbols-outlined">upload_file</span>
          <span>Cargar</span>
        </button>
        <input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={handleLoadXLSX} className="hidden" />
        <button onClick={performRefresh} disabled={isRefreshing} className="nav-item">
          <span className={`material-symbols-outlined ${isRefreshing ? 'animate-spin' : ''}`}>sync</span>
          <span>Sincro</span>
        </button>
        <button onClick={() => setShowPedidoModal(true)} className="nav-item">
          <span className="material-symbols-outlined">badge</span>
          <span>Cliente</span>
        </button>
      </nav>

      {/* FAB Carrito - único acceso al carrito en móvil (abre el drawer con badge de items) */}
      {!isPathActive('/orden') && !cartOpen && (
        <button
          onClick={() => setCartOpen(true)}
          className="fixed bottom-24 lg:bottom-8 right-4 lg:right-8 z-[550] h-14 pl-4 pr-5 bg-[var(--g360-accent)] text-[var(--g360-accent-contrast)] rounded-full shadow-2xl shadow-[var(--g360-glow)] flex items-center gap-2 hover:scale-105 active:scale-95 transition-all border border-[var(--g360-accent)]"
        >
          <span className="relative">
            <span className="material-symbols-outlined text-2xl">shopping_cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2.5 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border border-[var(--g360-accent)]">{cartCount}</span>
            )}
          </span>
          <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Carrito</span>
        </button>
      )}

      {/* MODALS */}
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onOpenClient={() => { setCartOpen(false); setShowPedidoModal(true); }}
      />

      <ClientDataModal />

      <ConfirmModal
        isOpen={modals.load.open}
        title="¿Importar Pedido?"
        message="Se reemplazará el carrito actual."
        confirmText="IMPORTAR"
        onConfirm={() => {
          setModals(prev => ({ ...prev, load: { open: false, data: null } }));
          clearCart();
          loadProductsToCart(modals.load.data);
        }}
        onCancel={() => setModals(prev => ({ ...prev, load: { open: false, data: null } }))}
        danger
      />

      <AlertModal
        isOpen={modals.alert.open}
        title={modals.alert.title}
        message={modals.alert.message}
        type={modals.alert.type}
        onClose={() => setModals(prev => ({ ...prev, alert: { open: false } }))}
      />

    </div>
  );
}

export default Layout;
