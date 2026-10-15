/**
 * clientesService.js
 * Búsqueda de clientes contra Supabase PostgREST (tabla `ventas`).
 * Estrategia TIMEOUT-SAFE (la tabla no tiene índice de texto completo y el
 * statement_timeout de Supabase es ~3s, los `%contains%` hacen full-scan y
 * devuelven 500/57014):
 *   1) Código exacto (id_cliente eq, padded a 8) — indexado
 *   2) RUC/DNI completo (doc_cliente eq, 8 u 11 dígitos) — rápido
 *   3) Prefijo de nombre (nom_cliente ilike 'term*') — indexado
 * La búsqueda parcial de RUC y el contains de nombre NO son viables hoy
 * (requerirían índice trgm del lado de la base).
 */

import { postgrestGet, isSupabaseConfigured } from './supabaseRest';

const COLUMNAS = 'id_cliente,doc_cliente,nom_cliente,id_vendedor,nom_vendedor';

// Quita caracteres que rompen la sintaxis de PostgREST
function sanitizarTermino(termino) {
  return (termino || '').replace(/[,(){}*%\\]/g, ' ').trim();
}

// id_cliente canónico: 8 dígitos con ceros a la izquierda (ej: 56101 → 00056101)
function canonicalId(termino) {
  return termino.padStart(8, '0');
}

// id_cliente para display: sin ceros a la izquierda (ej: 00056101 → 56101)
export function displayId(idCliente) {
  if (!idCliente) return '';
  return String(idCliente).replace(/^0+/, '') || '0';
}

function dedupe(rows) {
  const seen = new Set();
  return (rows || []).filter(row => {
    if (!row?.id_cliente || seen.has(row.id_cliente)) return false;
    seen.add(row.id_cliente);
    return true;
  });
}

// Las queries son indexadas (<1s), pero la BD compartida tiene picos de carga
// justo en el borde del statement_timeout (~3s): 1 reintento automático.
const ERRORES_TRANSITORIOS = /57014|statement timeout|\b429\b|\b500\b|timeout/i;

async function getConRetry(params, reintentos = 1) {
  try {
    return await postgrestGet('ventas', params);
  } catch (err) {
    if (reintentos > 0 && ERRORES_TRANSITORIOS.test(err.message || '')) {
      await new Promise(r => setTimeout(r, 400));
      return getConRetry(params, reintentos - 1);
    }
    throw err;
  }
}

/**
 * Busca clientes: código exacto → RUC/DNI completo → prefijo de nombre.
 * @param {string} termino - Código, RUC/DNI completo o inicio del nombre (mín. 2 caracteres)
 * @returns {Promise<{clientes: Array, error: string|null}>}
 */
export async function buscarClientes(termino) {
  const limpio = sanitizarTermino(termino);
  if (limpio.length < 2) return { clientes: [], error: null };
  if (!isSupabaseConfigured()) {
    return { clientes: [], error: 'Supabase no configurado (.env)' };
  }

  try {
    // 1) Coincidencia exacta por código de cliente (indexada)
    if (/^\d+$/.test(limpio)) {
      const exactos = await getConRetry({
        select: COLUMNAS,
        'id_cliente': `eq.${canonicalId(limpio)}`,
        limit: 1
      });
      if (exactos.length > 0) {
        return { clientes: dedupe(exactos), error: null };
      }
    }

    // 2) RUC/DNI completo (solo con longitud exacta; el parcial hace full-scan y explota el timeout)
    if (/^\d{8}$|^\d{11}$/.test(limpio)) {
      const porDoc = await getConRetry({
        select: COLUMNAS,
        'doc_cliente': `eq.${limpio}`,
        limit: 10
      });
      if (porDoc.length > 0) {
        return { clientes: dedupe(porDoc), error: null };
      }
    }

    // 3) Prefijo de nombre (ilike 'term*' usa índice; '%term%' no)
    const porNombre = await getConRetry({
      select: COLUMNAS,
      'nom_cliente': `ilike.${limpio}*`,
      limit: 10
    });
    return { clientes: dedupe(porNombre).slice(0, 10), error: null };
  } catch (err) {
    const msg = /57014|statement timeout/i.test(err.message || '')
      ? 'El servidor tardó demasiado. Buscá por código completo, RUC completo o inicio del nombre.'
      : (err.message || 'Error al buscar clientes');
    return { clientes: [], error: msg };
  }
}

/**
 * Mapea una fila de `ventas` a los datos del cliente del formulario
 */
export function mapearClienteDeVenta(row) {
  return {
    id_cliente: row.id_cliente || '',
    ruc: (row.doc_cliente || '').trim(),
    nombre: (row.nom_cliente || '').trim(),
    id_vendedor: row.id_vendedor || '',
    vendedor: (row.nom_vendedor || '').trim()
  };
}

export default { buscarClientes, displayId, mapearClienteDeVenta };
