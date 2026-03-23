/**
 * Layout.jsx
 * Layout principal CIPSA Marca Edition
 * Focus: Mobile Mobility, Glassmorphism, Premium Header
 */

import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useRef, useEffect, useState, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { loadExcelFile } from '../utils/xlsxLoader';
import { getBaseUrl } from '../utils/baseUrl';
import { G360_CONFIG } from '../core/g360-skill';

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
          <button onClick={onConfirm} className={`flex-1 px-4 py-3 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${danger ? 'bg-red-500 shadow-lg' : 'bg-[var(--g360-accent)] text-black shadow-lg shadow-[var(--g360-glow)]'}`}>
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
             <span className={`material-symbols-outlined text-3xl ${type === 'success' ? 'text-green-500' : type === 'error' ? 'text-red-500' : 'text-[var(--g360-accent)]'}`}>
               {type === 'success' ? 'check_circle' : type === 'error' ? 'error' : type === 'warning' ? 'warning' : 'info'}
             </span>
          </div>
          <h3 className="text-xl font-black text-[var(--g360-text)] uppercase tracking-tighter">{title}</h3>
        </div>
        <p className="text-[var(--g360-muted)] mb-8 text-sm font-medium">{message}</p>
        <button onClick={onClose} className="w-full px-4 py-4 bg-[var(--g360-accent)] text-black rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg">
          {buttonText}
        </button>
      </div>
    </div>
  );
}

// Catálogos PDF disponibles
const CATALOGOS_PDF = [
  { id: 'viniball', nombre: 'Viniball', subtitulo: 'Pelotas y Deportes', icono: 'sports_baseball', url: 'https://kutt.to/Catal_Viniball_D' },
  { id: 'vinifan', nombre: 'Vinifan', subtitulo: 'Escolar', icono: 'school', url: 'https://kutt.to/Catal_Vinifan_D' },
  { id: 'representadas', nombre: 'Representadas', subtitulo: 'Tools/Herramientas', icono: 'handyman', url: 'https://kutt.to/Catal_Representadas_D' }
];

// Componente Modal de Catálogos
function CatalogosModal({ isOpen, onClose }) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-[var(--g360-surface)] rounded-[2rem] shadow-2xl max-w-md w-full p-8 animate-scale-in border border-[var(--g360-border)]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-[var(--g360-text)] uppercase tracking-tighter">Catálogos</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-[var(--g360-input-bg)] flex items-center justify-center text-[var(--g360-muted)] hover:text-[var(--g360-text)]">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        {/* Sección: Ver Catálogo Online */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-[var(--g360-accent)]">auto_stories</span>
            <span className="text-xs font-black uppercase tracking-widest text-[var(--g360-muted)]">Ver Catálogo Online</span>
          </div>
          <button 
            onClick={() => window.open('https://fliphtml5.com/bookcase/ilmjw/', '_blank')}
            className="w-full flex items-center gap-3 px-4 py-3 bg-[var(--g360-input-bg)] rounded-xl border border-[var(--g360-border)] hover:border-[var(--g360-accent)]/40 transition-all"
          >
            <div className="w-10 h-10 bg-[var(--g360-accent)]/10 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-[var(--g360-accent)]">menu_book</span>
            </div>
            <div className="flex-1 text-left">
              <div className="text-sm font-bold text-[var(--g360-text)]">Flip Book Interactivo</div>
              <div className="text-[10px] text-[var(--g360-muted)]">Explora nuestros catálogos en línea</div>
            </div>
            <span className="material-symbols-outlined text-[var(--g360-muted)]">open_in_new</span>
          </button>
        </div>
        
        {/* Sección: Descargar PDF */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-[var(--g360-accent)]">download</span>
            <span className="text-xs font-black uppercase tracking-widest text-[var(--g360-muted)]">Descargar PDF</span>
          </div>
          <div className="flex flex-col gap-2">
            {CATALOGOS_PDF.map(cat => (
              <button 
                key={cat.id}
                onClick={() => window.open(cat.url, '_blank')}
                className="w-full flex items-center gap-3 px-4 py-3 bg-[var(--g360-input-bg)] rounded-xl border border-[var(--g360-border)] hover:border-[var(--g360-accent)]/40 transition-all"
              >
                <div className="w-10 h-10 bg-[var(--g360-accent)]/10 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-[var(--g360-accent)]">{cat.icono}</span>
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-bold text-[var(--g360-text)]">{cat.nombre}</div>
                  <div className="text-[10px] text-[var(--g360-muted)]">{cat.subtitulo}</div>
                </div>
                <span className="material-symbols-outlined text-[var(--g360-muted)]">download</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Layout() {
  const { cartCount, setShowPedidoModal, clearCart, isDarkMode, toggleTheme } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showCatalogosModal, setShowCatalogosModal] = useState(false);
  
  
  const [modals, setModals] = useState({
    refresh: { open: false },
    load: { open: false, data: null },
    alert: { open: false, title: '', message: '', type: 'info' }
  });

  const showAlert = (title, message, type = 'info') => {
    setModals(prev => ({ ...prev, alert: { open: true, title, message, type } }));
  };

  const performRefresh = async () => {
    setIsRefreshing(true);
    try {
      const stockResponse = await fetch(`${getBaseUrl()}stock_data.json?t=${Date.now()}`);
      if (!stockResponse.ok) throw new Error('Error al descargar stock');
      const stockData = await stockResponse.json();
      const catalogResponse = await fetch(`${getBaseUrl()}productos_local.json?t=${Date.now()}`);
      if (!catalogResponse.ok) throw new Error('Error al descargar catálogo');
      const catalogData = await catalogResponse.json();
      const syncTime = new Date().toISOString();
      const syncInfo = { timestamp: syncTime, stockData: stockData.data, catalogData: catalogData };
      localStorage.setItem('hoja_pedido_stock', JSON.stringify(syncInfo));
      localStorage.setItem('hoja_pedido_stock_sync', JSON.stringify(syncTime));
      window.dispatchEvent(new CustomEvent('stock-updated', { detail: syncInfo }));
      showAlert('Éxito', 'Datos actualizados correctamente.', 'success');
    } catch (err) {
      showAlert('Error', err.message, 'error');
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
      showAlert('Error', 'No se pudo cargar el Excel.', 'error');
    }
    event.target.value = '';
  };

  const loadProductsToCart = async ({ products }) => {
    showAlert('Cargando', `Procesando ${products.length} productos...`, 'info');
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

          <button onClick={toggleTheme} className="w-10 h-10 rounded-xl bg-[var(--g360-input-bg)] flex items-center justify-center text-[var(--g360-text)] border border-[var(--g360-border)]">
            <span className="material-symbols-outlined text-xl">
              {isDarkMode ? 'light_mode' : 'dark_mode'}
            </span>
          </button>
        </header>
      </div>

      <div className="flex pt-16">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 h-[calc(100vh-80px)] sticky top-20 ml-8 bg-[var(--g360-surface)] rounded-[2.5rem] border border-[var(--g360-border)] p-6 gap-6 shadow-xl z-40">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--g360-muted)] px-4 mb-2">Navegación</span>
            <NavLink to="/catalogo" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${isActive ? 'bg-[var(--g360-accent)] text-black shadow-lg shadow-[var(--g360-glow)]' : 'text-[var(--g360-text)] hover:bg-[var(--g360-input-bg)]'}`}>
              <span className="material-symbols-outlined">home</span>
              <span className="text-sm font-bold uppercase tracking-widest">Inicio</span>
            </NavLink>
            <NavLink to="/orden" className={({isActive}) => `flex items-center justify-between px-4 py-3 rounded-2xl transition-all ${isActive ? 'bg-[var(--g360-accent)] text-black shadow-lg shadow-[var(--g360-glow)]' : 'text-[var(--g360-muted)] hover:bg-[var(--g360-input-bg)]'}`}>
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
            <button onClick={() => setShowCatalogosModal(true)} className="flex items-center gap-3 px-4 py-3 rounded-2xl text-[var(--g360-muted)] hover:bg-[var(--g360-input-bg)] transition-all text-left">
              <span className="material-symbols-outlined">menu_book</span>
              <span className="text-sm font-bold uppercase tracking-widest">Catálogos</span>
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
        <button onClick={() => setShowCatalogosModal(true)} className="nav-item">
          <span className="material-symbols-outlined">menu_book</span>
          <span>Catálogos</span>
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
        <NavLink to="/orden" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
          <div className="relative">
              <span className="material-symbols-outlined">shopping_bag</span>
              {cartCount > 0 && (
                <span className={`absolute -top-1.5 -right-2 w-4 h-4 text-[8px] flex items-center justify-center rounded-full font-black border border-[var(--g360-bg)] ${isPathActive('/orden') ? 'bg-black text-[var(--g360-accent)]' : 'bg-red-500 text-white'}`}>
                  {cartCount}
                </span>
              )}
          </div>
          <span>Orden</span>
        </NavLink>
      </nav>

      {/* MODALS */}
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

      <CatalogosModal
        isOpen={showCatalogosModal}
        onClose={() => setShowCatalogosModal(false)}
      />

    </div>
  );
}

export default Layout;
