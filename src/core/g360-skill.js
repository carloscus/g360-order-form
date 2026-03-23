/**
 * G360 Skill Configuration - CIPSA OrderX
 * Sistema de gestión de pedidos usando skill unificado 'client' (Mobile)
 */

import { getClientSkill } from '../../../../g360-assets/engine/g360-skill-client.js';

const baseClientSkill = getClientSkill('mobile');

export const G360_CONFIG = {
  ...baseClientSkill,
  
  // Identidad de CIPSA OrderX v2.0
  branding: {
    ...baseClientSkill.branding,
    clientName: 'CIPSA',
    appTitle: 'CIPSA OrderX v2.0',
    clientLogoFile: './logo-cipsa.svg',
    clientFavicon: './favicon.svg'
  }
};

// Aplicar configuración del skill al contexto global
if (typeof window !== 'undefined') {
  window.G360_CONFIG = G360_CONFIG;
}
