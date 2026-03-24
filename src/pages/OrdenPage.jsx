/**
 * OrdenPage.jsx
 * Página de resumen de Orden de Compra - CIPSA Marca Edition
 * Focus: High-Visibility, Symmetric Theming, Floating Integrated Modals
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { formatMoney, getFechaCompacta } from '../utils/formatters';
import { generateExcel } from '../utils/xlsxGenerator';
import { shareViaWhatsApp, shareViaEmail, downloadExcel } from '../utils/xlsxShare';
import G360DragModal from '@assets/engine/components/G360DragModal';

function OrdenPage() {
   const {
     selectedProductsArray,
     clientData,
     cartCount,
     cartTotalValue,
     cartTotalUnits,
     updateCartQuantity,
     removeFromCart,
     clearCart,
     setClientDataAll,
     floatingPosition,
     updateFloatingPosition
   } = useApp();

  const navigate = useNavigate();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showExportConfirm, setShowExportConfirm] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const hasRedirectedRef = useRef(false);

  const uniqueLinesCount = useMemo(() => {
    const lines = new Set(selectedProductsArray.map(p => p.linea?.toUpperCase().trim()).filter(Boolean));
    return lines.size;
  }, [selectedProductsArray]);

  useEffect(() => {
    if (selectedProductsArray.length === 0 && !hasRedirectedRef.current) {
      hasRedirectedRef.current = true;
      const timer = setTimeout(() => { navigate('/catalogo', { replace: true }); }, 500);
      return () => clearTimeout(timer);
    }
  }, [selectedProductsArray.length, navigate]);

  const handleExport = () => {
    setShowClearConfirm(false);
    setShowExportConfirm(true);
  };

  const validarDocumento = () => {
    const doc = clientData.ruc?.replace(/\D/g, '') || '';
    if (doc.length === 0) return 'Ingrese un número de documento';
    if (doc.length < 8) return 'Documento incompleto. Mínimo 8 dígitos (DNI) o 11 dígitos (RUC)';
    return null;
  };

  const confirmShareWhatsApp = async () => {
    const errorDoc = validarDocumento();
    if (errorDoc) {
      alert(errorDoc);
      return;
    }
    setExportLoading(true);
    let exportClientData = { ...clientData };
    if (!clientData.oc?.trim()) exportClientData.oc = getFechaCompacta();

    try {
      const result = await shareViaWhatsApp(exportClientData, selectedProductsArray);
      if (result.success) {
        setShowExportConfirm(false);
        if (!clientData.oc?.trim()) setClientDataAll(exportClientData);
      }
    } catch (err) {
      alert('Error al compartir por WhatsApp: ' + err.message);
    } finally {
      setExportLoading(false);
    }
  };

  const confirmShareEmail = async () => {
    const errorDoc = validarDocumento();
    if (errorDoc) {
      alert(errorDoc);
      return;
    }
    setExportLoading(true);
    let exportClientData = { ...clientData };
    if (!clientData.oc?.trim()) exportClientData.oc = getFechaCompacta();

    try {
      const result = await shareViaEmail(exportClientData, selectedProductsArray);
      if (result.success) {
        setShowExportConfirm(false);
        if (!clientData.oc?.trim()) setClientDataAll(exportClientData);
      }
    } catch (err) {
      alert('Error al compartir por Email: ' + err.message);
    } finally {
      setExportLoading(false);
    }
  };

  const confirmExport = () => {
    const errorDoc = validarDocumento();
    if (errorDoc) {
      alert(errorDoc);
      return;
    }
    setExportLoading(true);
    let exportClientData = { ...clientData };
    if (!clientData.oc?.trim()) exportClientData.oc = getFechaCompacta();
    try {
      generateExcel(exportClientData, selectedProductsArray);
      setShowExportConfirm(false);
      if (!clientData.oc?.trim()) setClientDataAll(exportClientData);
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <>
        {/* Panel Flotante de Acciones - Lado Derecho */}
        {cartCount > 0 && !showExportConfirm && !showClearConfirm && (
          <G360DragModal 
            isOpen={true} 
            showBackdrop={false}
            position={floatingPosition ? null : "center"}
            initialPosition={floatingPosition}
            onPositionChange={updateFloatingPosition}
            verticalOffset={50}
            modalWidth={200}
            modalHeight={60}
            zIndex={10000}
            className="flex items-center gap-3 bg-[var(--g360-surface)]/60 backdrop-blur-sm p-3 pl-4 rounded-full border-2 border-[var(--g360-accent)]/40 shadow-[0_4px_16px_rgba(0,0,0,0.1)] opacity-90 hover:opacity-100 transition-all"
          >
           <button onClick={(e) => { e.stopPropagation(); setShowExportConfirm(false); setShowClearConfirm(true); }} className="w-9 h-9 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-all border border-red-500/20 hover:border-red-500"><span className="material-symbols-outlined text-xl">delete_sweep</span></button>
           <button onClick={(e) => { e.stopPropagation(); handleExport(); }} className="h-9 px-3 bg-[var(--g360-accent)] text-black rounded-full font-black text-xs uppercase tracking-[0.2em] shadow-md flex items-center gap-1 hover:shadow-lg hover:scale-105 transition-all border border-[var(--g360-accent)]"><span className="material-symbols-outlined text-base">send</span>ENVIAR</button>
        </G360DragModal>
        )}

       <div className="animate-slide-up pb-8 max-w-2xl mx-auto px-2">
         {/* Dashboard Header */}
         <div className="bg-[var(--g360-surface)] rounded-[2.5rem] p-4 text-[var(--g360-text)] shadow-xl mb-2 mt-1 border border-[var(--g360-border)] relative overflow-hidden text-center">
        <span className="text-ghost opacity-[0.03] top-1/2 -translate-y-1/2">Order</span>
        <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--g360-accent)] opacity-[0.03] rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <p className="text-xs text-[var(--g360-accent)] font-black uppercase tracking-[0.4em] mb-2">Total del Pedido</p>
          <h2 className="text-5xl sm:text-6xl font-black font-premium text-[var(--g360-accent)] tracking-tighter leading-none mb-4">
            {formatMoney(cartTotalValue)}
          </h2>
          <p className="text-xs text-[var(--g360-muted)] uppercase tracking-[0.1em] font-bold mb-6 opacity-80 leading-tight">
            Precios referenciales • Sujeto a cotización final
          </p>
          
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[var(--g360-input-bg)]/50 backdrop-blur-sm rounded-2xl p-4 border border-[var(--g360-border)]">
              <span className="text-xs uppercase font-black text-[var(--g360-muted)] block mb-1">Items</span>
              <span className="text-xl font-black">{cartCount}</span>
            </div>
            <div className="bg-[var(--g360-input-bg)]/50 backdrop-blur-sm rounded-2xl p-4 border border-[var(--g360-border)]">
              <span className="text-xs uppercase font-black text-[var(--g360-muted)] block mb-1">Líneas</span>
              <span className="text-xl font-black">{uniqueLinesCount}</span>
            </div>
            <div className="bg-[var(--g360-input-bg)]/50 backdrop-blur-sm rounded-2xl p-4 border border-[var(--g360-border)]">
              <span className="text-xs uppercase font-black text-[var(--g360-muted)] block mb-1">Unid</span>
              <span className="text-xl font-black">{cartTotalUnits}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Listado de Productos */}
      <div className="space-y-2">
        {selectedProductsArray.map((p) => (
          <div key={p.codigo} className="bg-[var(--g360-surface)] border border-[var(--g360-border)] rounded-2xl p-3 animate-slide-up shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex flex-col min-w-[85px] shrink-0 border-r border-[var(--g360-border)] pr-3">
                <span className="text-base font-mono font-black text-[var(--g360-accent)] tracking-tighter leading-none">{p.codigo}</span>
                <span className="text-xs font-black text-[var(--g360-muted)] uppercase mt-1 truncate">{p.linea}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-[11px] font-bold text-[var(--g360-text)] leading-tight truncate">{p.nombre}</h4>
                <p className="text-xs font-mono text-[var(--g360-muted)] mt-0.5">EAN: {p.ean || p.ean14 || '---'}</p>
              </div>
              <div className="text-right shrink-0 ml-2">
                <p className="text-sm font-black text-[var(--g360-text)] leading-none">{formatMoney(p.precioLista * p.cantidad)}</p>
                <div className="flex items-center justify-end gap-2 mt-2">
                   <div className="flex items-center bg-[var(--g360-input-bg)] rounded-lg p-0.5 border border-[var(--g360-border)]">
                    <button onClick={() => updateCartQuantity(p.codigo, p.cantidad - 1)} className="w-6 h-6 flex items-center justify-center text-[var(--g360-muted)] hover:text-[var(--g360-accent)]"><span className="material-symbols-outlined text-base">remove</span></button>
                    <span className="w-5 text-center text-xs font-black text-[var(--g360-text)]">{p.cantidad}</span>
                    <button onClick={() => updateCartQuantity(p.codigo, p.cantidad + 1)} className="w-6 h-6 flex items-center justify-center text-[var(--g360-muted)] hover:text-[var(--g360-accent)]"><span className="material-symbols-outlined text-base">add</span></button>
                  </div>
                  <button onClick={() => removeFromCart(p.codigo)} className="text-red-500/40 hover:text-red-500"><span className="material-symbols-outlined text-lg">delete</span></button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      </div>

      {/* MODALES GLOBALES */}
      {showExportConfirm && (
        <G360DragModal 
          isOpen={true} 
          position="center"
          verticalOffset={50}
          onClose={() => setShowExportConfirm(false)}
          modalWidth={280}
          modalHeight={420}
          zIndex={10000}
          className="bg-[var(--g360-surface)] rounded-2xl p-4 max-w-[280px] w-full animate-scale-in border border-[var(--g360-accent)]/20 shadow-[0_30px_100px_rgba(0,0,0,0.5)] text-center"
        >
          <div className="w-10 h-1 bg-[var(--g360-accent)]/40 mx-auto mb-4 rounded-full cursor-move"></div>
          <h3 className="text-[11px] font-black text-[var(--g360-text)] block truncate mb-2 uppercase tracking-[0.2em]">{clientData.nombre || 'CONFIRMAR PEDIDO'}</h3>
          
          <div className="text-xs text-[var(--g360-muted)] mb-3 space-y-1 bg-[var(--g360-input-bg)] rounded-lg p-2 border border-[var(--g360-border)]">
            <div className="flex justify-between items-center"><span className="font-black">Documento:</span> <span className={`font-mono ${(clientData.ruc?.replace(/\D/g, '') || '').length >= 8 ? 'text-green-500' : 'text-red-500'}`}>{(clientData.ruc?.replace(/\D/g, '') || '').length >= 8 ? '✓' : '⚠'} {clientData.ruc || '---'}</span></div>
            <div className="flex justify-between"><span className="font-black">OC:</span> <span className="font-mono">{clientData.oc || '---'}</span></div>
            <div className="flex justify-between"><span className="font-black">Provincia:</span> <span>{clientData.provincia || '---'}</span></div>
            <div className="flex justify-between"><span className="font-black">Teléfono:</span> <span>{clientData.telefono || '---'}</span></div>
          </div>
          
          <p className="text-xs text-[var(--g360-muted)] mb-3 opacity-85 leading-tight text-center">
            Precios referenciales sin descuentos ni IGV.<br/>
            Cotización final por separado.
          </p>
          <div className="grid grid-cols-2 gap-1.5 mb-3">
            <button onClick={confirmShareWhatsApp} disabled={exportLoading} className="py-2.5 bg-[var(--g360-accent)] text-black rounded-xl font-black text-xs uppercase flex flex-col items-center gap-0.5 shadow-lg shadow-[var(--g360-glow)] disabled:opacity-50">
              <span className={`material-symbols-outlined text-lg ${exportLoading ? 'animate-spin' : ''}`}>chat</span>
              WhatsApp
            </button>
            <button onClick={confirmShareEmail} disabled={exportLoading} className="py-2.5 bg-[#4285F4] text-white rounded-xl font-black text-xs uppercase flex flex-col items-center gap-0.5 shadow-lg shadow-blue-500/20 disabled:opacity-50">
              <span className={`material-symbols-outlined text-lg ${exportLoading ? 'animate-spin' : ''}`}>mail</span>
              Email
            </button>
            <button onClick={confirmExport} disabled={exportLoading} className="col-span-2 py-3 bg-[var(--g360-surface)] text-[var(--g360-text)] border border-[var(--g360-border)] rounded-xl font-black text-[11px] uppercase flex items-center justify-center gap-2 shadow-lg disabled:opacity-50">
              <span className={`material-symbols-outlined text-xl ${exportLoading ? 'animate-spin' : ''}`}>download</span>
              {exportLoading ? 'PROCESANDO...' : 'DESCARGAR EXCEL'}
            </button>
          </div>
          <button onClick={() => setShowExportConfirm(false)} className="text-xs text-[var(--g360-muted)] uppercase font-black tracking-widest hover:text-[var(--g360-text)] transition-colors mt-1">CANCELAR</button>
        </G360DragModal>
      )}

      {showClearConfirm && (
        <G360DragModal
          isOpen={true}
          position="center"
          verticalOffset={50}
          onClose={() => setShowClearConfirm(false)}
          modalWidth={260}
          modalHeight={220}
          zIndex={10000}
          className="bg-[var(--g360-surface)] border border-red-500/20 rounded-[2rem] p-6 max-w-[260px] w-full animate-scale-in text-center shadow-2xl"
        >
          <div className="w-12 h-1 bg-red-500/30 mx-auto mb-6 rounded-full cursor-move"></div>
          <h3 className="text-xs font-black uppercase tracking-widest text-[var(--g360-text)] mb-6">¿VACIAR CARRITO?</h3>
          <div className="flex gap-3">
            <button onClick={() => setShowClearConfirm(false)} className="flex-1 py-3 bg-[var(--g360-input-bg)] rounded-xl text-[11px] font-black uppercase text-[var(--g360-text)]">NO</button>
            <button onClick={() => { clearCart(); setShowClearConfirm(false); navigate('/catalogo'); }} className="flex-1 py-3 bg-red-500 text-white rounded-xl font-black text-[11px] uppercase shadow-lg shadow-red-500/20">VACIAR</button>
          </div>
        </G360DragModal>
      )}
     </>
   );
 }

 export default OrdenPage;
