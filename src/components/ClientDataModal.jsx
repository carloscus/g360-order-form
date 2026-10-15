/**
 * ClientDataModal.jsx
 * Modal Premium Flotante - CIPSA Marca Edition
 * Búsqueda de clientes contra Supabase (patrón g360-order-xlsx):
 * código exacto → fallback ilike por RUC/código/nombre. Al seleccionar,
 * autocompleta nombre, RUC y vendedor desde la fila de `ventas`.
 */

import { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useDebounce } from '../hooks/useDebounce';
import { buscarClientes, displayId, mapearClienteDeVenta } from '../services/clientesService';

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
      <span className={`absolute right-4 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all duration-300 ${isRuc ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'bg-[var(--g360-accent)] text-[var(--g360-accent-contrast)] shadow-lg shadow-[var(--g360-glow)]'}`}>
        {documentType}
      </span>
    </div>
  );
};

function ClientDataModal() {
  const { showPedidoModal, setShowPedidoModal, clientData, setClientDataAll } = useApp();
  const [formData, setFormData] = useState(clientData);

  // Búsqueda de clientes
  const [termino, setTermino] = useState('');
  const [resultados, setResultados] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [errorBusqueda, setErrorBusqueda] = useState(null);
  const [seleccionado, setSeleccionado] = useState(null);
  const [dropdownAbierto, setDropdownAbierto] = useState(false);
  const searchRef = useRef(null);
  const debouncedTermino = useDebounce(termino, 300);

  useEffect(() => {
    if (showPedidoModal) {
      setFormData(clientData);
      setSeleccionado(clientData.id_cliente ? clientData : null);
      setTermino('');
      setResultados([]);
      setErrorBusqueda(null);
      setDropdownAbierto(false);
    }
  }, [showPedidoModal]); // eslint-disable-line react-hooks/exhaustive-deps

  // Búsqueda con debounce: query al servidor (PostgREST), no filtro local
  useEffect(() => {
    const t = debouncedTermino.trim();
    if (t.length < 2) {
      setResultados([]);
      setErrorBusqueda(null);
      setBuscando(false);
      return;
    }
    let vigente = true;
    setBuscando(true);
    setErrorBusqueda(null);
    buscarClientes(t).then(({ clientes, error }) => {
      if (!vigente) return;
      setResultados(clientes);
      setErrorBusqueda(error);
      setBuscando(false);
    });
    return () => { vigente = false; };
  }, [debouncedTermino]);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    if (!dropdownAbierto) return;
    const onClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setDropdownAbierto(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [dropdownAbierto]);

  const seleccionarCliente = (row) => {
    const mapeado = mapearClienteDeVenta(row);
    setFormData(prev => ({ ...prev, ...mapeado }));
    setSeleccionado(mapeado);
    setTermino('');
    setResultados([]);
    setDropdownAbierto(false);
  };

  const limpiarSeleccion = () => {
    setSeleccionado(null);
    setFormData(prev => ({ ...prev, id_cliente: '', nombre: '', vendedor: '', id_vendedor: '' }));
  };

  const handleSave = () => {
    setClientDataAll(formData);
    setShowPedidoModal(false);
  };

  if (!showPedidoModal) return null;

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowPedidoModal(false)} />

      <div className="relative bg-[var(--g360-surface)] w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-[var(--g360-border)] animate-scale-in max-h-[92vh] overflow-y-auto">
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

          {/* Búsqueda de clientes (Supabase) */}
          <div className="group mb-6 relative" ref={searchRef}>
            <label className="text-[10px] font-bold text-[var(--g360-accent)] uppercase tracking-widest ml-1 mb-1 block">
              Buscar Cliente (Código, RUC o Nombre)
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[var(--g360-muted)] text-xl pointer-events-none">search</span>
              <input
                type="text"
                className="input-minimal pl-11 pr-10"
                placeholder="Ej: 56101, RUC completo o inicio del nombre..."
                value={termino}
                onChange={e => { setTermino(e.target.value); setDropdownAbierto(true); }}
                onFocus={() => setDropdownAbierto(true)}
                autoComplete="off"
              />
              {buscando && (
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[var(--g360-accent)] text-xl animate-spin">progress_activity</span>
              )}
            </div>

            {/* Dropdown de resultados */}
            {dropdownAbierto && termino.trim().length >= 2 && (
              <div className="absolute z-20 left-0 right-0 mt-2 bg-[var(--g360-surface)] border border-[var(--g360-border)] rounded-2xl shadow-2xl overflow-hidden">
                {errorBusqueda ? (
                  <p className="px-4 py-3 text-xs text-red-500 font-bold">{errorBusqueda}</p>
                ) : buscando ? (
                  <p className="px-4 py-3 text-xs text-[var(--g360-muted)] font-bold">Buscando...</p>
                ) : resultados.length === 0 ? (
                  <p className="px-4 py-3 text-xs text-[var(--g360-muted)] font-bold">No se encontraron resultados</p>
                ) : (
                  resultados.map(row => (
                    <button
                      key={row.id_cliente}
                      type="button"
                      onClick={() => seleccionarCliente(row)}
                      className="w-full text-left px-4 py-3 hover:bg-[var(--g360-input-bg)] transition-colors border-b border-[var(--g360-border)] last:border-b-0"
                    >
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-sm font-bold text-[var(--g360-text)] truncate">{row.nom_cliente}</span>
                        <span className="text-[10px] font-mono font-black text-[var(--g360-accent)] shrink-0">{displayId(row.id_cliente)}</span>
                      </div>
                      <div className="flex justify-between items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-[var(--g360-muted)] font-bold">RUC: {row.doc_cliente || '---'}</span>
                        {row.nom_vendedor && (
                          <span className="text-[10px] text-[var(--g360-muted)] font-bold truncate">Ven: {row.nom_vendedor}</span>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Cliente seleccionado desde búsqueda */}
          {seleccionado && (
            <div className="mb-6 flex items-center justify-between gap-3 bg-[var(--g360-accent)]/10 border border-[var(--g360-accent)]/30 rounded-2xl px-4 py-3">
              <div className="min-w-0">
                <p className="text-[9px] font-black uppercase tracking-widest text-[var(--g360-accent)]">Cliente seleccionado</p>
                <p className="text-sm font-bold text-[var(--g360-text)] truncate">{seleccionado.nombre || '---'}</p>
                <p className="text-[10px] font-mono text-[var(--g360-muted)]">
                  ID: {displayId(seleccionado.id_cliente)} · RUC: {seleccionado.ruc || '---'}
                  {seleccionado.vendedor ? ` · Ven: ${seleccionado.vendedor}` : ''}
                </p>
              </div>
              <button onClick={limpiarSeleccion} title="Quitar selección" className="w-8 h-8 shrink-0 rounded-full bg-[var(--g360-input-bg)] flex items-center justify-center hover:bg-red-500/10 hover:text-red-500 transition-all">
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>
          )}

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
                  value={formData.oc || ''}
                  onChange={e => setFormData({...formData, oc: e.target.value})}
                />
              </div>
              <div className="group">
                <label className="text-[10px] font-bold text-[var(--g360-accent)] uppercase tracking-widest ml-1 mb-1 block">Vendedor</label>
                <input
                  type="text"
                  className="input-minimal"
                  placeholder="Vendedor..."
                  value={formData.vendedor || ''}
                  onChange={e => setFormData({...formData, vendedor: e.target.value})}
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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
              className="flex-[2] py-4 bg-[var(--g360-accent)] text-[var(--g360-accent-contrast)] font-bold rounded-2xl shadow-xl shadow-[var(--g360-accent)]/20 hover:bg-[var(--g360-accent)] hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest text-xs"
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
