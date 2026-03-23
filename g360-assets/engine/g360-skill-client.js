/**
 * G360 Skill Client - Placeholder for local development
 * En producción, este archivo viene del repositorio g360-assets
 */

export function getClientSkill(platform = 'mobile') {
  return {
    platform,
    branding: {
      clientName: 'G360',
      appTitle: 'G360 Order Form',
      clientLogoFile: '',
      clientFavicon: ''
    },
    settings: {
      theme: 'default',
      language: 'es'
    }
  };
}
