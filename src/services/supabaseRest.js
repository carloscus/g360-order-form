/**
 * supabaseRest.js
 * Cliente PostgREST mínimo (fetch directo, sin dependencia supabase-js).
 * Mismo patrón que g360-ventas-pulse (src/lib/api/postgrest.js).
 * Credenciales anon de SOLO LECTURA: no hay Auth ni escritura.
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export function isSupabaseConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

/**
 * Ejecuta un GET contra PostgREST.
 * @param {string} tabla - Tabla o vista (ej: 'ventas')
 * @param {Object} params - Query params PostgREST (select, eq/or como string, limit, offset...)
 * @returns {Promise<Array>} Filas JSON
 */
export async function postgrestGet(tabla, params = {}) {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase no configurado (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY)');
  }
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) qs.append(key, String(value));
  });
  const url = `${SUPABASE_URL}/rest/v1/${tabla}?${qs.toString()}`;
  const response = await fetch(url, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'Accept-Profile': 'public'
    }
  });
  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`PostgREST ${response.status}: ${body.slice(0, 200)}`);
  }
  return response.json();
}
