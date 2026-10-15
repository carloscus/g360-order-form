/**
 * stockApi.js
 * Servicio de catálogo/stock en vivo desde la Stock API (Render).
 * Puerto del patrón de g360-stock-reporter-lit (stock-service + stock-store):
 * - GET /api/v1/stock con X-API-Key
 * - Transformación: sku→codigo, precio→precioLista (referencial), un_bx→bxSize,
 *   stock = disponible del almacén VES (venta). Otros almacenes: informativos.
 * - Cache de 3 capas: memoria → sessionStorage (5 min) → localStorage (7 días)
 * - Probe de frescura ?limit=1 cada 10 min + keep-alive /health cada 5 min
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

const SESSION_KEY = 'g360_tienda_catalog_v1';
const LOCAL_KEY = 'g360_tienda_catalog_local_v1';
const TTL_SESSION_MS = 5 * 60 * 1000;   // 5 min (datos "frescos" en la sesión)
// localStorage NO expira: es el respaldo offline. Siempre se hidrata si existe,
// se marca como 'stale' y el badge muestra la edad de los datos.
const PROBE_INTERVAL_MS = 10 * 60 * 1000;     // 10 min
const KEEPALIVE_INTERVAL_MS = 5 * 60 * 1000;  // 5 min
const TIMEOUT_FULL_MS = 25000;
const TIMEOUT_PROBE_MS = 60000;

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
  fechaDescarga: null   // fecha_descarga del servidor (frescura de datos)
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

function applyCache(record, status) {
  setState({
    items: record.items,
    metadata: record.metadata || null,
    lastFetch: record.lastFetch || null,
    fechaDescarga: record.fechaDescarga || record.metadata?.fecha_descarga || null,
    status,
    error: null
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
        error: null
      });
      persistCache({ items, metadata: payload.metadata, lastFetch: state.lastFetch, fechaDescarga: state.fechaDescarga });
    } catch (err) {
      const waking = err.name === 'AbortError' || /502|503|timeout/i.test(err.message || '');
      setState({
        status: state.items.length ? 'stale' : 'error',
        error: waking
          ? 'El servidor está despertando (Render free tier). Reintentando...'
          : (err.message || 'Error al obtener catálogo')
      });
    } finally {
      inflightFull = null;
    }
  })();
  return inflightFull;
}

/**
 * Probe ligero: solo metadata (?limit=1). Si cambió fecha_descarga, refetch completo.
 */
async function probeFreshness() {
  if (!enVentanaOperativa()) return;
  // Sin datos (primer arranque fallido): reintentar carga completa
  if (state.items.length === 0) {
    fullFetch({ silent: false });
    return;
  }
  try {
    const response = await fetchWithTimeout(`${STOCK_API_URL}?limit=1`, TIMEOUT_PROBE_MS);
    if (!response.ok) return;
    const payload = await response.json();
    const remota = payload.metadata?.fecha_descarga;
    if (remota && remota !== state.fechaDescarga) {
      fullFetch({ silent: false });
    }
  } catch (e) { /* silencioso */ }
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
  // Offline-first: al volver la conexión, refrescar de inmediato
  window.addEventListener('online', () => {
    setState({ status: state.items.length ? 'stale' : 'loading', error: null });
    fullFetch({ silent: false });
  });
  window.addEventListener('offline', () => {
    if (state.items.length) {
      setState({ error: 'Sin conexión: trabajando con datos en cache' });
    }
  });
}

/**
 * Carga inicial: usa caches frescos y refresca en background si están fríos.
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
    applyCache(local, 'stale');
    fullFetch({ silent: true });
    return Promise.resolve(state);
  }
  setState({ status: 'loading' });
  return fullFetch();
}

/**
 * Refresco manual (botón Sincronizar)
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
