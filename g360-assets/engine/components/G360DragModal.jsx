import React, { useState, useRef, useEffect, useCallback } from 'react';

export default function G360DragModal({ 
  isOpen, 
  onClose, 
  children, 
  className = '', 
  initialPosition = null, 
  lockInterface = false, 
  position = 'center', 
  modalWidth = 280, 
  modalHeight = 400, 
  zIndex = 9999, 
  verticalOffset = 0,
  showBackdrop = true,
  onPositionChange = null
}) {
  const [positionCoords, setPositionCoords] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const modalRef = useRef(null);

  // Función para calcular la posición central inferior segura
  const getSmartCenterPosition = useCallback(() => {
    if (typeof window === 'undefined') return { x: 0, y: 0 };
    
    // Centrado horizontal
    const x = (window.innerWidth - modalWidth) / 2;
    // Posicionado en la parte inferior con un margen (zona segura)
    // En móvil vertical esto queda perfecto sobre la navegación.
    // En PC horizontal queda centrado abajo.
    const y = window.innerHeight - modalHeight - (window.innerWidth < 768 ? 100 : 40) + verticalOffset;
    
    return {
      x: Math.max(20, Math.min(window.innerWidth - modalWidth - 20, x)),
      y: Math.max(20, Math.min(window.innerHeight - modalHeight - 20, y))
    };
  }, [modalWidth, modalHeight, verticalOffset]);

  // Asegurar que la posición esté dentro de los límites actuales
  const clampPosition = useCallback((pos) => {
    const mWidth = modalRef.current?.offsetWidth || modalWidth;
    const mHeight = modalRef.current?.offsetHeight || modalHeight;
    
    return {
      x: Math.max(10, Math.min(window.innerWidth - mWidth - 10, pos.x)),
      y: Math.max(10, Math.min(window.innerHeight - mHeight - 10, pos.y))
    };
  }, [modalWidth, modalHeight]);

  // Inicialización y Resize
  useEffect(() => {
    if (isOpen) {
      if (initialPosition) {
        // Si hay una posición guardada, la usamos pero la validamos por si cambió el tamaño de pantalla
        setPositionCoords(clampPosition(initialPosition));
      } else {
        // Si no hay posición, usamos el centro inteligente
        setPositionCoords(getSmartCenterPosition());
      }
    }
  }, [isOpen, initialPosition, getSmartCenterPosition, clampPosition]);

  // Manejar el cambio de tamaño de pantalla (ej: rotación de móvil)
  useEffect(() => {
    const handleResize = () => {
      setPositionCoords(prev => clampPosition(prev));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [clampPosition]);

  const handleBackdropClick = (e) => {
    if (onClose && e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleMouseDown = (e) => {
    if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return;
    setIsDragging(true);
    const rect = modalRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    if (lockInterface) {
      document.body.style.pointerEvents = 'none';
      modalRef.current.style.pointerEvents = 'auto';
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const mWidth = modalRef.current?.offsetWidth || modalWidth;
    const mHeight = modalRef.current?.offsetHeight || modalHeight;
    const newX = Math.max(0, Math.min(window.innerWidth - mWidth, e.clientX - dragOffset.x));
    const newY = Math.max(0, Math.min(window.innerHeight - mHeight, e.clientY - dragOffset.y));
    setPositionCoords({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      if (onPositionChange) onPositionChange(positionCoords);
    }
  };

  const handleTouchStart = (e) => {
    if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return;
    setIsDragging(true);
    const rect = modalRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    setDragOffset({
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    });
    if (lockInterface) {
      document.body.style.pointerEvents = 'none';
      modalRef.current.style.pointerEvents = 'auto';
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const touch = e.touches[0];
    const mWidth = modalRef.current?.offsetWidth || modalWidth;
    const mHeight = modalRef.current?.offsetHeight || modalHeight;
    const newX = Math.max(0, Math.min(window.innerWidth - mWidth, touch.clientX - dragOffset.x));
    const newY = Math.max(0, Math.min(window.innerHeight - mHeight, touch.clientY - dragOffset.y));
    setPositionCoords({ x: newX, y: newY });
  };

  const handleTouchEnd = () => {
    if (isDragging) {
      setIsDragging(false);
      if (onPositionChange) onPositionChange(positionCoords);
    }
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove, { passive: false });
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      if (lockInterface) document.body.style.pointerEvents = '';
    };
  }, [isDragging, dragOffset, lockInterface, positionCoords, onPositionChange]);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 transition-all duration-300 ${
        showBackdrop 
          ? isDragging 
            ? 'bg-black/50 backdrop-blur-sm' 
            : 'bg-black/30' 
          : 'pointer-events-none'
      }`}
      onClick={showBackdrop ? handleBackdropClick : undefined}
      style={{ zIndex: zIndex - 1 }}
    >
      <div
        ref={modalRef}
        className={`fixed select-none pointer-events-auto ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        } ${className}`}
        style={{
          left: `${positionCoords.x}px`,
          top: `${positionCoords.y}px`,
          zIndex: zIndex,
          transform: isDragging ? 'scale(1.03)' : 'scale(1)',
          transition: isDragging ? 'box-shadow 0.15s ease' : 'transform 0.2s ease, box-shadow 0.2s ease',
          boxShadow: isDragging 
            ? '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)' 
            : '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
          touchAction: 'none' // Importante para evitar scroll del navegador mientras se arrastra
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
