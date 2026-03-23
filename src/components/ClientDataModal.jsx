/**
 * ClientDataModal.jsx
 * Modal Premium Flotante - CIPSA Marca Edition
 * Focus: Mobility, Glassmorphism, Modern Inputs
 */

import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

// Componente DocumentInput con auto-detección (Marca Snippet)
const DocumentInput = ({ value, onChange, placeholder = '8 o 11 dígitos' }) => {
  const isRuc = value?.length > 8;
  const documentType = isRuc ? 'RUC' : 'DNI';

  const handleInputChange = (e) => {
    const input = e.target.value.replace(/\D/g, '').slice(0, 11);
    onChange(input);
  };

  return (
    <div className="relative flex items-center group">
      <input
        type="text"
        className="input-minimal w-full pr-16 text-lg font-bold"
        value={value || ''}
        onChange={handleInputChange}
        placeholder={placeholder}
      />
      <span className={`absolute right-4 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter text-white transition-all duration-300 ${isRuc ? 'bg-rose-500 shadow-lg shadow-rose-500/20' : 'bg-[var(--g360-accent)] shadow-lg shadow-[var(--g360-glow)]'}`}>
        {documentType}
      </span>
    </div>
  );
};

function ClientDataModal() {
  const { showPedidoModal, setShowPedidoModal, clientData, setClientDataAll } = useApp();
  const [formData, setFormData] = useState(clientData);

  useEffect(() => {
    if (showPedidoModal) setFormData(clientData);
  }, [showPedidoModal, clientData]);

  const handleSave = () => {
    setClientDataAll(formData);
    setShowPedidoModal(false);
  };

  if (!showPedidoModal) return null;

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowPedidoModal(false)} />
      
      <div className="relative bg-[var(--g360-surface)] w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-[var(--g360-border)] animate-scale-in">
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
              <label className="text-[10px] font-bold text-[var(--g360-accent)] uppercase tracking-widest ml-1 mb-1 block">Documento de Identidad</label>
              <DocumentInput 
                value={formData.ruc}
                onChange={val => setFormData({...formData, ruc: val})}
              />
            </div>

            <div className="group">
              <label className="text-[10px] font-bold text-[var(--g360-accent)] uppercase tracking-widest ml-1 mb-1 block">Nombre / Razón Social</label>
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
                <label className="text-[10px] font-bold text-[var(--g360-accent)] uppercase tracking-widest ml-1 mb-1 block">Orden de Compra / Ref</label>
                <input 
                   type="text" 
                  className="input-minimal font-mono"
                  placeholder="OP-001"
                  value={formData.ordenCompra || ''}
                  onChange={e => setFormData({...formData, ordenCompra: e.target.value})}
                />
              </div>
              <div className="group">
                <label className="text-[10px] font-bold text-[var(--g360-accent)] uppercase tracking-widest ml-1 mb-1 block">Provincia / Sucursal</label>
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
                <label className="text-[10px] font-bold text-[var(--g360-accent)] uppercase tracking-widest ml-1 mb-1 block">Dirección de Entrega</label>
                <input 
                  type="text" 
                  className="input-minimal text-xs"
                  placeholder="Av. Las Artes..."
                  value={formData.direccion || ''}
                  onChange={e => setFormData({...formData, direccion: e.target.value})}
                />
              </div>
              <div className="group">
                <label className="text-[10px] font-bold text-[var(--g360-accent)] uppercase tracking-widest ml-1 mb-1 block">WhatsApp / Teléfono</label>
                <input 
                  type="tel" 
                  className="input-minimal"
                  placeholder="999 999 999"
                  value={formData.telefono || ''}
                  onChange={e => setFormData({...formData, telefono: e.target.value})}
                />
              </div>
              <div className="group">
                <label className="text-[10px] font-bold text-[var(--g360-accent)] uppercase tracking-widest ml-1 mb-1 block">Correo Electrónico</label>
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

          <div className="mt-10 flex gap-4">
            <button 
              onClick={() => setShowPedidoModal(false)}
              className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all uppercase tracking-widest text-xs"
            >
              Cerrar
            </button>
            <button 
              onClick={handleSave}
              className="flex-[2] py-4 bg-[var(--g360-accent)] text-white font-bold rounded-2xl shadow-xl shadow-[var(--g360-accent)]/20 hover:bg-[var(--g360-accent)] hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest text-xs"
            >
              Guardar Cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClientDataModal;