import React from 'react';

/**
 * DocumentInput - CIPSA Premium Edition
 * Reusable component for DNI/RUC input with auto-detection.
 */
export const DocumentInput = ({
  value,
  onChange,
  placeholder = '8 o 11 dígitos',
  className = 'input-minimal w-full pr-16 text-lg font-bold'
}) => {
  const isRuc = value?.length > 8;
  const documentType = isRuc ? 'RUC' : 'DNI';

  const handleInputChange = (e) => {
    // Only numbers, max 11 digits
    const input = e.target.value.replace(/\D/g, '').slice(0, 11);
    onChange(input);
  };

  return (
    <div className="relative flex items-center group w-full">
      <input
        type="text"
        className={className}
        value={value || ''}
        onChange={handleInputChange}
        placeholder={placeholder}
      />
      <span className={`absolute right-4 px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-tighter text-white transition-all duration-300 pointer-events-none ${isRuc ? 'bg-rose-500 shadow-lg shadow-rose-500/20' : 'bg-[var(--g360-accent)] shadow-lg shadow-[var(--g360-glow)]'}`}>
        {documentType}
      </span>
    </div>
  );
};

export default DocumentInput;
