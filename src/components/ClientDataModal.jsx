/**
 * ClientDataModal.jsx
 * Modal Emercente - CIPSA Marca Edition
 * Focus: Auto-guardado en tiempo real, cierre al hacer click fuera
 */

import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import DocumentInput from './DocumentInput';

function ClientDataModal({ zIndex = 9999 }) {
  const { showPedidoModal, setShowPedidoModal, clientData, setClientDataAll } = useApp();
  const [formData, setFormData] = useState(clientData);

  useEffect(() => {
    if (showPedidoModal) setFormData(clientData);
  }, [showPedidoModal, clientData]);

  // Guardar automáticamente en tiempo real
  useEffect(() => {
    setClientDataAll(formData);
  }, [formData]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setShowPedidoModal(false);
    }
  };

  if (!showPedidoModal) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" />
      
      {/* Modal */}
      <div className="relative bg-[var(--g360-surface)] w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-[var(--g360-border)] animate-scale-in overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[var(--g360-accent)] to-[var(--g360-accent)]" />
        
        <div className="p-8 sm:p-10">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-2xl font-black font-premium text-slate-900 dark:text-slate-100 uppercase tracking-tight">
                Datos del Cliente
              </h2>
              <p className="text-sm text-slate-500 font-medium">Información para la Hoja de Pedido</p>
            </div>
            <button onClick={() => setShowPedidoModal(false)} className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center hover:scale-110 active:scale-95 transition-all">
              <span className="material-symbols-outlined text-slate-400">close</span>
            </button>
          </div>

          <div className="space-y-6">
            <div className="group">
              <label className="text-[11px] font-bold text-[var(--g360-accent)] uppercase tracking-widest ml-1 mb-1 block">Documento de Identidad</label>
              <DocumentInput 
                value={formData.ruc}
                onChange={val => setFormData({...formData, ruc: val})}
              />
            </div>

            <div className="group">
              <label className="text-[11px] font-bold text-[var(--g360-accent)] uppercase tracking-widest ml-1 mb-1 block">Nombre / Razón Social</label>
              <input 
                type="text" 
                className="input-minimal"
                placeholder="Nombre del cliente..."
                value={formData.nombre || ''}
                onChange={e => setFormData({...formData, nombre: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="group">
                <label className="text-[11px] font-bold text-[var(--g360-accent)] uppercase tracking-widest ml-1 mb-1 block">Orden de Compra / Ref</label>
                <input 
                  type="text" 
                  className="input-minimal font-mono"
                  placeholder="OP-001"
                  value={formData.oc || ''}
                  onChange={e => setFormData({...formData, oc: e.target.value})}
                />
              </div>
              <div className="group">
                <label className="text-[11px] font-bold text-[var(--g360-accent)] uppercase tracking-widest ml-1 mb-1 block">Provincia / Sucursal</label>
                <input 
                  type="text" 
                  className="input-minimal"
                  placeholder="Ej: Trujillo..."
                  value={formData.provincia || ''}
                  onChange={e => setFormData({...formData, provincia: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="group">
                <label className="text-[11px] font-bold text-[var(--g360-accent)] uppercase tracking-widest ml-1 mb-1 block">Dirección de Entrega</label>
                <input 
                  type="text" 
                  className="input-minimal text-xs"
                  placeholder="Av. Las Artes..."
                  value={formData.direccion || ''}
                  onChange={e => setFormData({...formData, direccion: e.target.value})}
                />
              </div>
              <div className="group">
                <label className="text-[11px] font-bold text-[var(--g360-accent)] uppercase tracking-widest ml-1 mb-1 block">WhatsApp / Teléfono</label>
                <input 
                  type="tel" 
                  className="input-minimal"
                  placeholder="999 999 999"
                  value={formData.telefono || ''}
                  onChange={e => setFormData({...formData, telefono: e.target.value})}
                />
              </div>
              <div className="group sm:col-span-2">
                <label className="text-[11px] font-bold text-[var(--g360-accent)] uppercase tracking-widest ml-1 mb-1 block">Correo Electrónico</label>
                <input 
                  type="email" 
                  className="input-minimal text-xs"
                  placeholder="ejemplo@correo.com"
                  value={formData.email || ''}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="mt-10 flex justify-center">
            <button 
              onClick={() => setShowPedidoModal(false)}
              className="py-4 bg-[var(--g360-accent)] text-white font-bold rounded-2xl shadow-xl shadow-[var(--g360-accent)]/20 hover:bg-[var(--g360-accent)] hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest text-xs px-12"
            >
              Listo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClientDataModal;