import React from 'react';

// Componente reutilizable para input de documento (DNI/RUC)
// Detecta automáticamente el tipo basado en la longitud
export const DocumentInput = ({
  value,
  onChange,
  placeholder = '8 o 11 dígitos',
  className = 'high-contrast-input'
}) => {
  const isRuc = value?.length > 8;
  const documentType = isRuc ? 'RUC' : 'DNI';

  const handleInputChange = (e) => {
    const input = e.target.value.replace(/\D/g, ''); // Solo números
    onChange(input);
  };

  return (
    <div className="input-with-badge">
      <input
        type="text"
        maxLength="11"
        className={className}
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder}
      />
      <span className={`doc-badge ${isRuc ? 'ruc' : 'dni'}`}>
        {documentType}
      </span>
    </div>
  );
};

// CSS requerido:
// .input-with-badge { position: relative; display: flex; align-items: center; }
// .doc-badge { position: absolute; right: 16px; font-size: 10px; font-weight: 900; padding: 4px 10px; border-radius: 6px; color: white; pointer-events: none; }
// .doc-badge.ruc { background: #ef4444; }
// .doc-badge.dni { background: var(--g360-accent); }