/**
 * stockApi.js
 * Servicio de catálogo/stock en vivo desde la Stock API (Render).
 * Puerto del patrón de g360-stock-reporter-lit (stock-service + stock-store):
 * - GET /api/v1/stock con X-API-Key
 * - Transformación: sku→codigo, precio→precioLista (referencial), un_bx→bxSize,
 *   stock = disponible del almacén VES (venta). Otros almacenes: informativos.
 * - Estrategia offline-first SIN persistir data vieja como si fuera fresca:
 *     1) memoria → sessionStorage (5 min) → localStorage (respaldo, sin expiración pero
 *        siempre marcado 'stale' y con edad visible en el badge)
 *     2) Catálogo base estático (productos_local.json, mismo origen): SOLO para el primer
 *        render y como último recurso. NUNCA se persiste en localStorage.
 *     3) Cargas calientes: probe ?limit=1 (1 KB) — si la fecha_descarga del servidor
 *        coincide con la cache, NO se descarga el payload completo.
 * - Pub/sub para suscriptores (React vía useSyncExternalStore)
 */

const STOCK_API_URL_PROD = import.meta.env.VITE_STOCK_API_URL || 'https://g360-stock-api.onrender.com/api/v1/stock';
// En localhost (dev 5174 / preview 4173) usar el proxy de Vite ('/api' → Render):
// el header X-API-Key dispara preflight CORS y el allowlist de la API no incluye localhost.
// En producción (github.io, origen allowlistado) se usa la URL real.
const esLocalhost = typeof window !== 'undefined' &&
  ['localhost', '127.0.0.1', '[::1]', '::1'].includes(window.location.hostname);
const STOCK_API_URL = esLocalhost ? '/api/v1/stock' : STOCK_API_URL_PROD;
// Clave de SOLO LECTURA del equipo (misma exposición que g360-stock-reporter-lit)
const STOCK_API_KEY = import.meta.env.VITE_STOCK_API_KEY || 'cipsa2026';
const HEALTH_URL = STOCK_API_URL.replace(/\/stock$/, '/health');
// Catálogo base estático (fallback de primer render; jamás se persiste como cache)
const BASE_CATALOG_URL = `${import.meta.env.BASE_URL || '/'}productos_local.json`;

const SESSION_KEY = 'g360_tienda_catalog_v1';
const LOCAL_KEY = 'g360_tienda_catalog_local_v1';
const TTL_SESSION_MS = 5 * 60 * 1000;   // 5 min (datos "frescos" en la sesión)
// localStorage NO expira: es el respaldo offline. Siempre se hidrata si existe,
// se marca como 'stale' y el badge muestra la edad de los datos.
const PROBE_INTERVAL_MS = 10 * 60 * 1000;     // 10 min
const KEEPALIVE_INTERVAL_MS = 5 * 60 * 1000;  // 5 min
const TIMEOUT_FULL_MS = 25000;
const TIMEOUT_PROBE_MS = 60000;
const TIMEOUT_BASE_MS = 8000;

// Ventana operativa Lima: Lun-Sáb 07:00-22:59 (fuera de ella no se hace polling)
function enVentanaOperativa() {
  const ahora = new Date(
    new Date().toLocaleString('en-US', { timeZone: 'America/Lima' })
  );
  const dia = ahora.getDay(); // 0=domingo
  const hora = ahora.getHours();
  return dia !== 0 && hora >= 7 && hora < 23;
}

// Estado global del servicio
let state = {
  items: [],
  metadata: null,
  status: 'idle', // idle | loading | waking | fresh | stale | error
  error: null,
  lastFetch: null,      // ISO del último fetch completo exitoso
  fechaDescarga: null,  // fecha_descarga del servidor (frescura de datos)
  fuente: null          // 'api' | 'base' | null
};

const listeners = new Set();
let probeTimer = null;
let keepAliveTimer = null;
let backgroundStarted = false;
let inflightFull = null;

function setState(partial) {
  state = { ...state, ...partial };
  listeners.forEach(fn => {
    try { fn(state); } catch (e) { console.warn('stockApi listener error', e); }
  });
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getState() {
  return state;
}

/**
 * Transforma un item crudo de la API al formato del catálogo de la tienda
 */
function transformItem(raw) {
  const almacenes = Array.isArray(raw.almacenes) ? raw.almacenes : [];
  const ves = almacenes.find(a => a.almacen === 'VES');
  return {
    codigo: String(raw.sku || '').trim(),
    nombre: raw.descripcion || raw.nombre_corto || '',
    bxSize: Number(raw.un_bx) || 1,
    precioLista: Number(raw.precio ?? raw.precio_lista ?? 0),
    pesoUm: Number(raw.peso_kg) || 0,
    ean: raw.ean13 || '',
    ean14: raw.ean14 || '',
    linea: (raw.linea || '').toUpperCase().trim(),
    categoria: (raw.categoria || '').toUpperCase().trim(),
    orden: Number(raw.orden) || 999999,
    // Disponible de venta = almacén VES exacto (lotes 129/40/121/122: informativos)
    stock: Number(ves?.disponible ?? 0),
    sinCatalogo: raw.sin_catalogo !== undefined ? !!raw.sin_catalogo : !raw.estado_linea,
    descontinuado: !!raw.descontinuado
  };
}

// Mapeo linea (catálogo base viejo) → categoria (3 líneas de venta de la tienda)
const LINEA_A_CATEGORIA = {
  PELOTAS: 'VINIBALL', JUGUETES: 'VINIBALL', MASCOTAS: 'VINIBALL', OTROS: 'VINIBALL',
  METALICA: 'VINIFAN', FORROS: 'VINIFAN', ARCHIVO: 'VINIFAN', PINTURA: 'VINIFAN',
  ESCRITURA: 'VINIFAN', ACCESORIOS: 'VINIFAN', MANUALIDADES: 'VINIFAN',
  DIDACTICOS: 'VINIFAN', PEGAMENTOS: 'VINIFAN', DIBUJO: 'VINIFAN',
  REPRESENTADAS: 'REPRESENTADAS', 'PRODUCTOS INDUSTRIALES': 'REPRESENTADAS', PUBLICIDAD: 'REPRESENTADAS'
};

/**
 * Transforma un item del catálogo base estático (formato legacy productos_local.json)
 */
function transformStatic(raw, index) {
  const linea = (raw.linea || '').toUpperCase().trim();
  return {
    codigo: String(raw.codigo || '').trim(),
    nombre: raw.nombre || raw.descripcion || '',
    bxSize: Number(raw.u_por_caja || raw.uni_caja) || 1,
    precioLista: Number(raw.precio) || 0,
    pesoUm: Number(raw.can_kg_um || raw.peso_kg) || 0,
    ean: raw.ean || '',
    ean14: raw.ean_14 || '',
    linea,
    categoria: LINEA_A_CATEGORIA[linea] || '',
    orden: Number(raw.orden) || index + 1,
    stock: Number(raw.stock_referencial || 0),
    sinCatalogo: false,
    descontinuado: false
  };
}

function persistCache(payload) {
  const record = {
    savedAt: Date.now(),
    items: payload.items,
    metadata: payload.metadata,
    lastFetch: payload.lastFetch,
    fechaDescarga: payload.fechaDescarga
  };
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(record));
  } catch (e) { /* quota */ }
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(record));
  } catch (e) { /* quota */ }
}

// Cache de sesión: datos "frescos" por 5 minutos
function readSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const record = JSON.parse(raw);
    if (!record?.items?.length) return null;
    if (Date.now() - record.savedAt > TTL_SESSION_MS) return null;
    return record;
  } catch (e) {
    return null;
  }
}

// Respaldo offline: sin expiración. Aunque tenga semanas, sirve para procesar pedidos.
function readLocal() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return null;
    const record = JSON.parse(raw);
    if (!record?.items?.length) return null;
    return record;
  } catch (e) {
    return null;
  }
}

function applyCache(record, status, fuente = 'api') {
  setState({
    items: record.items,
    metadata: record.metadata || null,
    lastFetch: record.lastFetch || null,
    fechaDescarga: record.fechaDescarga || record.metadata?.fecha_descarga || null,
    status,
    error: null,
    fuente
  });
}

async function fetchWithTimeout(url, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      headers: { 'X-API-Key': STOCK_API_KEY },
      cache: 'no-store',
      signal: controller.signal
    });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Catálogo base estático (productos_local.json): primer render instantáneo y
 * último recurso offline. NUNCA se persiste en localStorage/cache: es data de
 * referencia vieja por definición y no debe sobrevivir a la sesión como cache.
 */
async function cargarBase() {
  const response = await fetchWithTimeout(BASE_CATALOG_URL, TIMEOUT_BASE_MS);
  if (!response.ok) throw new Error(`Catálogo base respondió ${response.status}`);
  const data = await response.json();
  const items = (Array.isArray(data) ? data : (data.productos || [])).map(transformStatic);
  if (!items.length) throw new Error('Catálogo base vacío');
  applyCache({ items, metadata: null, lastFetch: null, fechaDescarga: null }, 'stale', 'base');
  return items;
}

async function fullFetch({ silent = false } = {}) {
  if (inflightFull) return inflightFull;
  if (!silent) setState({ status: state.items.length ? 'stale' : 'loading', error: null });

  inflightFull = (async () => {
    try {
      const response = await fetchWithTimeout(STOCK_API_URL, TIMEOUT_FULL_MS);
      if (!response.ok) throw new Error(`Stock API respondió ${response.status}`);
      const payload = await response.json();
      const items = (payload.items || []).map(transformItem);
      setState({
        items,
        metadata: payload.metadata || null,
        lastFetch: new Date().toISOString(),
        fechaDescarga: payload.metadata?.fecha_descarga || null,
        status: 'fresh',
        error: null,
        fuente: 'api'
      });
      persistCache({ items, metadata: payload.metadata, lastFetch: state.lastFetch, fechaDescarga: state.fechaDescarga });
    } catch (err) {
      const waking = err.name === 'AbortError' || /502|503|timeout/i.test(err.message || '');
      let msg = waking
        ? 'El servidor está despertando (Render free tier). Reintentando...'
        : (err.message || 'Error al obtener catálogo');
      // Sin datos: último recurso = catálogo base (solo en memoria, no se persiste)
      if (!state.items.length) {
        try {
          await cargarBase();
          msg = 'Sin conexión con la Stock API: mostrando catálogo base';
        } catch (e) { /* tampoco hay base → error real */ }
      }
      setState({
        status: state.items.length ? 'stale' : 'error',
        error: msg
      });
    } finally {
      inflightFull = null;
    }
  })();
  return inflightFull;
}

/**
 * Sincronización liviana para cargas calientes: probe ?limit=1 (1 KB).
 * - Servidor con la MISMA fecha_descarga que la cache → no se descarga nada, se marca 'fresh'.
 * - Fecha distinta (o fechaDescarga desconocida, ej. catálogo base) → descarga completa.
 * - Probe falla (offline/servidor dormido) → se queda con la cache, sin errores visibles.
 */
async function syncLigero() {
  try {
    const response = await fetchWithTimeout(`${STOCK_API_URL}?limit=1`, TIMEOUT_PROBE_MS);
    if (!response.ok) return;
    const payload = await response.json();
    const remota = payload.metadata?.fecha_descarga;
    if (!remota || remota !== state.fechaDescarga) {
      await fullFetch({ silent: true });
    } else {
      setState({ status: 'fresh', error: null });
    }
  } catch (e) { /* offline: quedamos con la cache */ }
}

/**
 * Probe periódico (gated por ventana operativa)
 */
async function probeFreshness() {
  if (!enVentanaOperativa()) return;
  // Sin datos (primer arranque fallido): reintentar carga completa
  if (state.items.length === 0) {
    fullFetch({ silent: false });
    return;
  }
  await syncLigero();
}

async function keepAlive() {
  try {
    await fetchWithTimeout(HEALTH_URL, 10000);
  } catch (e) { /* silencioso: el servidor duerme igual */ }
}

function startBackground() {
  if (backgroundStarted || typeof window === 'undefined') return;
  backgroundStarted = true;
  probeTimer = setInterval(probeFreshness, PROBE_INTERVAL_MS);
  keepAliveTimer = setInterval(keepAlive, KEEPALIVE_INTERVAL_MS);
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && enVentanaOperativa()) {
      probeFreshness();
    }
  });
  // Offline-first: al volver la conexión, sincronizar liviano (probe decide si hay full)
  window.addEventListener('online', () => {
    setState({ error: null });
    syncLigero();
  });
  window.addEventListener('offline', () => {
    if (state.items.length) {
      setState({ error: 'Sin conexión: trabajando con datos en cache' });
    }
  });
}

/**
 * Carga inicial:
 *   session (≤5 min) → fresh
 *   local (sin expiración) → stale + syncLigero (probe decide si hay descarga)
 *   sin cache → catálogo base (instantáneo, en memoria) + descarga completa de la API
 * @returns {Promise<void>} resuelve con el estado luego del primer intento
 */
export function ensureLoaded() {
  startBackground();
  const session = readSession();
  if (session) {
    applyCache(session, 'fresh');
    return Promise.resolve(state);
  }
  const local = readLocal();
  if (local) {
    // Hidrata siempre (sin importar la edad): offline = datos para procesar
    applyCache(local, 'stale', 'api');
    syncLigero();
    return Promise.resolve(state);
  }
  setState({ status: 'loading' });
  return cargarBase()
    .then(() => fullFetch({ silent: true }))
    .catch(() => fullFetch());
}

/**
 * Refresco manual (botón Sincronizar): descarga completa siempre
 */
export function refresh() {
  return fullFetch();
}

export const stockApi = {
  subscribe,
  getState,
  ensureLoaded,
  refresh
};

export default stockApi;
