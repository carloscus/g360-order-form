# 🛒 CIPSA OrderX v3.0.0 — Tienda Virtual

> Tienda virtual de pedidos para fuerza de ventas CIPSA: catálogo y stock en vivo, búsqueda de clientes y generación de Hoja de Pedido. Forma parte de la familia de microherramientas G360.

![Versión](https://img.shields.io/badge/version-3.0.0--tienda-blue)
![React](https://img.shields.io/badge/React-18-61DAFB)
![Vite](https://img.shields.io/badge/Vite-5-646CFF)
![Tailwind](https://img.shields.io/badge/Tailwind-3-38B2AC)
![G360](https://img.shields.io/badge/G360-Ecosystem-0d9488)
![Status](https://img.shields.io/badge/status-production-green)

---

## 📑 Tabla de Contenidos

- [Características Principales](#-características-principales)
- [Novedades v3.0.0](#-novedades-v300)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Instalación y Uso](#️-instalación-y-uso)
- [Fuentes de Datos (APIs)](#-fuentes-de-datos-apis)
- [Sincronización de Stock](#-sincronización-de-stock)
- [Guía de Uso (Flujo de Tienda)](#-guía-de-uso-flujo-de-tienda)
- [Formato de Exportación Excel](#-formato-de-exportación-excel)
- [Paleta de Colores](#-paleta-de-colores)
- [Arquitectura](#️-arquitectura)
- [Tecnologías Utilizadas](#-tecnologías-utilizadas)
- [Notas Técnicas](#-notas-técnicas)
- [Solución de Problemas](#-solución-de-problemas)
- [Contribución](#-contribución)
- [Licencia](#-licencia)

---

## Familia G360

Este proyecto forma parte de la familia de microherramientas **G360** para apoyo CRM y gestión de datos en escritorio, enfocadas en áreas como ventas, finanzas y logística.

### Herramientas Relacionadas
- **[g360-cli](https://github.com/carloscus/g360-cli)**: Bootstrap de proyectos G360
- **[g360-signature](https://github.com/carloscus/g360-signature)**: Web component de branding G360
- **[g360-order-xlsx](https://github.com/carloscus/g360-order-xlsx)**: Generador de hojas de pedido en formato Excel

### Glosario de Componentes
Sigue las convenciones del proyecto:
- Componentes: PascalCase (ej: `ClientDataModal`)
- Clases CSS: Kebab-case (ej: `data-card`)
- Props: camelCase (ej: `onChange`)

---

## 🚀 Características Principales

### 📱 Interfaz Responsive con Navegación Tipo App
- **Modo Móvil**: Barra de navegación inferior fija (5 accesos directos)
- **Modo Desktop**: Sidebar lateral fijo + contenido principal
- **Modo Oscuro/Claro**: Alternancia instantánea con persistencia local
- **Glassmorphism**: Diseño moderno con efectos de transparencia

### 🔄 Gestión de Productos
- **Búsqueda por Código/Nombre/EAN**: Universo completo (incluye sin catálogo y descontinuados, con badge visible)
- **Categorías Fijas**: Chips Viniball, Vinifan y Representadas (producto vendible de cada línea)
- **Stock en Vivo (almacén VES)**: Semáforo por producto — AGOTADO / BAJO (<10 bx) / OK
- **Detalle de Stock**: Toca el nombre del producto para revisar stock VES, cajas disponibles, box y precio
- **Equivalencias Dinámicas**: Conversión automática Unidades ↔ Cajas
- **Paginador con Salto**: Números de página con elipsis + primera/última
- **Orden de Ingreso**: Numeración secuencial para cotejo con listas manuales

### 🧑‍💼 Clientes (Supabase)
- **Búsqueda de Clientes**: Por código exacto o parcial (RUC / código / nombre) contra la tabla `ventas` del ERP replicado
- **Autocompletado**: Nombre, RUC y vendedor se completan al seleccionar el cliente
- **Cliente en Atención**: Chip visible en catálogo y carrito durante todo el flujo

### 🛒 Carrito de Compra
- **Drawer Lateral**: Botón flotante 🛒 con contador; revisa y ajusta cantidades sin salir del catálogo
- **Persistencia**: Carrito y cliente guardados automáticamente en localStorage
- **Recuperación de Pedidos**: Importar pedidos Excel previamente exportados (coteja contra el catálogo en vivo)

### 💾 Persistencia y Sincronización
- **localStorage**: Carrito y datos de cliente persistidos automáticamente
- **Cache Offline-First (sin data vieja persistida)**: memoria → sesión (5 min) → **localStorage sin expiración** (siempre marcada como cache, edad visible en el badge; >7 días en rojo). Con conexión refresca automático; sin conexión **sigue operando con los últimos datos**
- **Sync liviano**: en cargas calientes un probe `?limit=1` (1 KB) compara `fecha_descarga` — si el servidor no cambió, **no se descarga el payload completo**
- **Catálogo base**: si no hay cache (primer visita / storage limpio) se muestra al instante `productos_local.json` estático (mismo origen) — **solo en memoria, nunca se persiste como cache**; al conectar, la API lo reemplaza

### 📤 Exportación y Carga XLSX
- **Exportar a Excel**: Hoja de Pedido con datos del cliente (RUC, OC, SKU, cantidad, precio, ID cliente, vendedor)
- **Compartir**: Descarga directa o Email
- **Cargar XLSX**: Importar pedidos guardados previamente

---

## 🆕 Novedades v3.0.0 (Tienda Virtual)

| Feature | Descripción |
|---------|-------------|
| **Catálogo en Vivo** | Precio base referencial + stock real del almacén VES desde la Stock API (Render) |
| **Flujo de Tienda** | Cargar cliente → revisar stock → buscar/seleccionar productos → 🛒 → Hoja de Pedido |
| **Carrito Drawer** | Panel lateral deslizante con items, cantidades y total referencial |
| **Búsqueda de Clientes** | Supabase PostgREST timeout-safe: código exacto → RUC/DNI completo → prefijo de nombre, vendedor autocompletado |
| **Detalle de Stock** | Modal por producto con stock VES, cajas disponibles y estado |
| **Categorías Fijas** | Chips Viniball / Vinifan / Representadas; la pestaña Búsqueda abarca el universo completo (~2.100 SKUs, incl. sin catálogo y descontinuados con badge) |
| **Paginador con Salto** | Números de página con elipsis + botones primera/anterior/siguiente/última |
| **Importador XLSX** | Reconstruye el carrito cotejando SKUs contra el catálogo en vivo |
| **Export con Resumen** | Contrato de 8 columnas + filas de totales al pie (unidades, cajas, total referencial, fecha); totales también en el mensaje de Email |

---

## 📁 Estructura del Proyecto

```
g360-order-form/
├── 📄 index.html                 # Punto de entrada HTML
├── 📄 package.json               # Dependencias y scripts
├── 📄 vite.config.js            # Configuración Vite
├── 📄 tailwind.config.js        # Configuración Tailwind CSS
├── 📄 postcss.config.js         # Configuración PostCSS
├── 📄 README.md                 # Este archivo
│
├── 📁 .github/
│   └── 📁 workflows/
│       └── 📄 update-stock.yml  # GitHub Actions para stock
│
├── 📁 public/                    # Archivos estáticos
│   ├── 📄 productos_local.json  # Catálogo de productos
│   ├── 📄 stock_data.json       # Datos de stock (generado)
│   └── 📄 favicon.svg          # Icono de la app
│
├── 📁 scripts/
│   └── 📄 download-stock.js     # Script de sincronización
│
├── 📁 stock-api/                 # API local opcional
│   ├── 📄 server.js
│   └── 📄 package.json
│
├── 📁 docs/
│   └── 📄 MANUAL_USUARIO.md     # Manual de usuario
│
└── � src/                       # Código fuente
    ├── 📄 main.jsx              # Punto de entrada React
    ├── 📄 App.jsx              # Componente principal + Rutas
    ├── 📄 index.css            # Estilos globales + CSS variables
    │
    ├── 📁 components/          # Componentes reutilizables
    │   ├── 📄 ClientDataModal.jsx  # Modal datos del cliente + búsqueda Supabase
    │   ├── 📄 CartDrawer.jsx   # Carrito deslizante (🛒)
    │   ├── 📄 Paginador.jsx    # Paginación con salto de páginas
    │   └── 📄 Tooltip.jsx      # Tooltip informativo
    │
    ├── 📁 context/             # Estado global
    │   └── 📄 AppContext.jsx   # Context API (carrito, tema, cliente)
    │
    ├── 📁 pages/               # Páginas principales
    │   ├── 📄 Layout.jsx       # Layout, nav, frescura de stock, import XLSX
    │   ├── 📄 CatalogoPage.jsx # Catálogo en vivo + flujo de tienda
    │   └── 📄 OrdenPage.jsx    # Hoja de Pedido: resumen y exportación
    │
    ├── 📁 hooks/
    │   ├── 📄 useDebounce.js   # Hook de debounce
    │   └── 📄 useStockCatalog.js # Hook del catálogo/stock en vivo
    │
    ├── 📁 services/
    │   ├── 📄 stockApi.js      # Stock API Render (catálogo, stock VES, cache, probe)
    │   ├── 📄 supabaseRest.js  # Cliente PostgREST mínimo (fetch directo)
    │   ├── 📄 clientesService.js # Búsqueda de clientes (tabla ventas)
    │   └── 📄 stockService.js  # (legacy, sin uso)
    │
    └── 📁 utils/
        ├── 📄 formatters.js    # Formateadores de datos
        ├── 📄 xlsxGenerator.js # Generador de Excel
        └── 📄 xlsxLoader.js    # Loader de archivos XLSX
```

---

## 🛠️ Instalación y Uso

### Requisitos Previos
- Node.js 18+ 
- npm o yarn

### Instalación

```bash
# Clonar o descargar el proyecto
cd g360-order-form

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Construir para producción
npm run build
```

### Acceso
- Desarrollo: `http://localhost:5173`
- Producción: Desplegar carpeta `dist/` en GitHub Pages, Netlify, Vercel, etc.

---

## 🗄️ Fuentes de Datos (APIs)

### Stock API (Render) — catálogo, precio y stock en vivo

```
GET https://g360-stock-api.onrender.com/api/v1/stock
Header: X-API-Key: cipsa2026 (solo lectura)
```

Respuesta (por item, transformada en `src/services/stockApi.js`):

| Campo API | Normalizado a | Descripción |
|-----------|---------------|-------------|
| `sku` | `codigo` | Código de producto |
| `descripcion` / `nombre_corto` | `nombre` | Nombre del producto |
| `un_bx` | `bxSize` | Unidades por caja/bulto |
| `precio` / `precio_lista` | `precioLista` | Precio base referencial (sin IGV) |
| `peso_kg` | `pesoUm` | Peso unitario |
| `ean13` / `ean14` | `ean` / `ean14` | Códigos de barras |
| `linea` / `categoria` | `linea` / `categoria` | Línea y categoría (categorías dinámicas) |
| `almacenes[VES].disponible` | `stock` | **Disponible de venta = almacén VES exacto** (129/40/121/122: informativos) |
| `estado_linea` / `sin_catalogo` / `descontinuado` | filtros | Solo se venden productos del catálogo maestro |
| `orden` | `orden` | Orden del catálogo maestro |

Regla de negocio (heredada de g360-stock-reporter): `un_bx > 1` → venta en cajas; estado de stock: AGOTADO (0), BAJO (<10 bx), OK (≥10 bx).

### Supabase PostgREST — búsqueda de clientes

```
GET {VITE_SUPABASE_URL}/rest/v1/ventas
  ?select=id_cliente,doc_cliente,nom_cliente,id_vendedor,nom_vendedor
  &id_cliente=eq.00056101&limit=1              # 1) código exacto (padded a 8, indexado)
  &doc_cliente=eq.20601024714&limit=10          # 2) RUC/DNI completo (rápido)
  &nom_cliente=ilike.MULTI*&limit=10            # 3) prefijo de nombre (indexado)
Headers: apikey + Authorization: Bearer {anon key} (solo lectura)
```

- `id_cliente` canónico: 8 dígitos con ceros (`56101` → `00056101`); para display se recortan los ceros
- El vendedor (`nom_vendedor`) viaja embebido en la fila de `ventas` y se autocompleta al elegir el cliente
- **Semántica de búsqueda**: código completo, RUC/DNI completo o inicio del nombre. La búsqueda parcial (`%contains%`) hace full-scan sobre `ventas` y excede el statement_timeout de Supabase (500/57014) — por eso el servicio es timeout-safe con las 3 estrategias indexadas
- Implementación: `src/services/clientesService.js` + `src/services/supabaseRest.js` (fetch directo, sin supabase-js)

### Variables de Entorno

Crear `.env.local` (dev) o configurar secretos en GitHub Actions (prod). Ver `.env.example`:

```
VITE_SUPABASE_URL=https://<proyecto>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key solo lectura>
VITE_STOCK_API_URL=https://g360-stock-api.onrender.com/api/v1/stock
VITE_STOCK_API_KEY=cipsa2026
```

---

## 🔄 Sincronización de Stock

### Flujo actual (API en vivo)

```
┌──────────────────────────┐
│  Stock API (Render)      │
│  g360-stock-api          │
│  refresca ERP ~15 min    │
└────────┬─────────────────┘
         │ GET /api/v1/stock (X-API-Key)
         ▼
┌──────────────────────────┐
│  stockApi.js             │
│  transform + cache 3 capas│ ──► memoria / sessionStorage (5 min) / localStorage (7 días)
└────────┬─────────────────┘
         │ pub/sub (useSyncExternalStore)
         ▼
┌──────────────────────────┐
│  UI                      │
│  badge frescura 🟢/🟡/🔵 │ ──► probe ?limit=1 cada 10 min + keep-alive /health cada 5 min
└──────────────────────────┘
```

- **Badge de frescura** en el header: 🟢 en vivo / 🟡 cache local / 🔵 cargando (cold start Render ~30-90 s) / 🔴 sin conexión
- Fuera de la ventana operativa Lima (Lun-Sáb 07:00-22:59) no se hace polling en background
- Botón "Sincronizar" fuerza un refetch completo

### Workflow `update-stock.yml` (DEPRECATED)

El flujo horario que descargaba `stock_data.json` desde appweb y creaba PRs quedó obsoleto: la app ya no lee esos JSON (`productos_local.json` / `stock_data.json` permanecen en `public/` solo como legacy). Puede deshabilitarse desde GitHub Actions sin afectar la tienda.

---

## 💡 Guía de Uso (Flujo de Tienda)

### Flujo principal

```
① Cargar Cliente ──► ② Revisar Stock ──► ③ Buscar/Seleccionar ──► ④ 🛒 ──► ⑤ Hoja de Pedido
```

**① Cargar Cliente** — Chip del cliente en el header (o botón 🛒 → "Cargar Cliente"); si no hay cliente cargado muestra el prompt "Cargar cliente". Busca por código, RUC o nombre; al seleccionar se autocompletan nombre, RUC y vendedor.

**② Revisar Stock** — Cada tarjeta muestra el semáforo del almacén VES (AGOTADO / BAJO / OK). Toca el nombre del producto para ver stock, cajas disponibles, box y precio.

**③ Buscar/Seleccionar Productos** — Buscador global en el header (SKU/nombre/EAN, con micrófono) + chips de segmento (Viniball / Vinifan / Representadas). Configura cantidad con el stepper o "+1 Box".

**④ Carrito 🛒** — Botón flotante con contador. El drawer muestra items, cantidades editables y total referencial; incluye el chip del cliente en atención.

**⑤ Hoja de Pedido** — "Generar Hoja de Pedido" → resumen con total, exportar a Excel (descarga directa o por Email).

### Navegación

| Acceso | Descripción |
|--------|-------------|
| **Inicio** | Catálogo de productos con búsqueda y flujo de tienda |
| **Catálogo** | Enlace externo al catálogo online (FlipHTML5) |
| **Cargar** | Importar pedido desde archivo Excel (reconstruye el carrito) |
| **Sincro** | Refrescar catálogo/stock desde la Stock API |
| **Cliente** | Datos del cliente + búsqueda Supabase |
| **🛒 (flotante)** | Único acceso al carrito: drawer con items y CTA "Generar Hoja de Pedido" (→ orden/export) |

---

## 📋 Formato de Exportación Excel

| Columna | Descripción | Ejemplo |
|---------|-------------|---------|
| RUC | RUC del cliente (11 dígitos) | 20456127917 |
| OC | Orden de compra | 280226 |
| SKU | Código de producto | 03290 |
| CANTIDAD | Cantidad en unidades | 100.00 |
| PRECIO | Precio base referencial (sin IGV) | 5.14 |
| OBSERVACIONES | Notas del producto | Entregar en tienda |
| ID_CLIENTE | Código canónico del cliente (v3) | 00056101 |
| VENDEDOR | Vendedor autocompletado (v3) | MILCA SARAY REYES BALLENA |

**Nota:** las columnas ID_CLIENTE y VENDEDOR se agregan al final (G, H); el contrato original de 6 columnas (A-F) se mantiene para el proceso downstream. El importador acepta ambos formatos.

**Filas de resumen al pie** (sin SKU, el importador las saltea): unidades totales, cajas, total referencial, nota de precios, **fecha de los datos del catálogo** (trazabilidad de frescura: si el export se hizo offline/base, queda estampado), fecha de generación y signature G360. El mensaje de Email también incluye productos, unidades y total.

**Integridad de precios**: el carrito se reconcilia automáticamente contra el catálogo fresco de la API (`sincronizarCarrito.js`) — el dato del servidor siempre gana para precio/box/nombre/línea; cantidades y orden intactas. Así un item agregado desde el catálogo base o cache vieja se corrige solo al sincronizar.

**Nombre del archivo:** `OC_20456127917_trujillo_280226.xlsx`
**Nombre de pestaña:** Provincia (ej: "Trujillo")

---

## 🎨 Paleta de Colores

Sistema de dos niveles: **base neutra** para la UI (simétrica entre temas) + **identidad de color por categoría**.

### Base neutra (botones y elementos)
| Rol | Claro | Oscuro |
|-----|-------|--------|
| Fondo | `#f8fafc` | `#0b1220` |
| Cards | `#ffffff` glassmorphism | `#151e2e` glassmorphism |
| Acento (relleno de botones) | `#0f172a` (gráfito oscuro) | `#e2e8f0` (gris claro) |
| Fuente sobre acento (`--g360-accent-contrast`) | `#ffffff` | `#0b1220` |
| Texto | `#0f172a` | `#f0f4f8` |

La inversión simétrica (botón oscuro en claro / botón claro en oscuro) garantiza contraste máximo con neutros.

### Identidad por categoría (chips activos, SKU y contador)
| Categoría | Colores de marca | Primario aplicado |
|-----------|------------------|-------------------|
| **Viniball** | rojo y negro | `#dc2626` |
| **Vinifan** | naranja y azul | `#ea580c` (azul `#1d4ed8` como secundario) |
| **Representadas** | verde y blanco | `#16a34a` |

Definidas en `CATEGORY_COLORS` (`src/pages/CatalogoPage.jsx`).

### Colores semánticos (estados, no marca)
- **Bajo stock**: ámbar `#f59e0b`
- **Agotado/Error**: rojo `#ef4444`

---

## 🏗️ Arquitectura

### Estado Global (Context API)

```
AppContext
├── selectedProducts     # Carrito de compras
├── clientData          # Datos del cliente (RUC, nombre, OC, etc.)
├── isDarkMode          # Tema claro/oscuro
├── showPedidoModal     # Control del modal de cliente
│
└── Métodos:
    ├── addToCart()
    ├── removeFromCart()
    ├── updateCartQuantity()
    ├── clearCart()
    ├── updateClientData()
    └── toggleTheme()
```

### Rutas (React Router)

| Ruta | Componente | Descripción |
|------|-------------|-------------|
| `/` | Redirect → `/catalogo` | Redirección |
| `/catalogo` | CatalogoPage | Catálogo y búsqueda |
| `/orden` | OrdenPage | Resumen y exportación |

### Persistencia (localStorage)

| Clave | Contenido |
|-------|------------|
| `hoja_pedido_cart` | Carrito de productos |
| `hoja_pedido_client` | Datos del cliente |
| `hoja_pedido_order_index` | Índice de orden |
| `hoja_pedido_theme` | Tema claro/oscuro |

---

## 🔧 Tecnologías Utilizadas

- **React 18** - Framework UI
- **React Router v6** - Navegación SPA
- **Vite 5** - Build tool y dev server
- **Tailwind CSS 3** - Framework CSS utilitario
- **XLSX (SheetJS)** - Generación y parsing de archivos Excel
- **Supabase PostgREST** (fetch directo) - Búsqueda de clientes
- **Stock API (Render)** - Catálogo, precio base y stock en vivo

---

## 📝 Notas Técnicas

### Versionado
- **APP_VERSION**: `v3.0.0-tienda`

### Variables de Entorno
Ver [Fuentes de Datos (APIs)](#-fuentes-de-datos-apis). Las credenciales son de solo lectura; en producción se inyectan vía GitHub Secrets (configuradas en `deploy-frontend.yml`).

### Límites Conocidos
- Catálogo: ~2000 SKUs del catálogo maestro (paginado de 24 por página)
- Cold start de Render (free tier): 30-90 s al despertar; el keep-alive `/health` lo mitiga en horario operativo
- Búsqueda de clientes: solo lectura sobre la tabla `ventas` (sin RLS por usuario — mismo modelo que g360-ventas-pulse fase actual)

---

## 🔧 Solución de Problemas

### Problemas Comunes

| Problema | Causa Posible | Solución |
|----------|---------------|----------|
| No carga el catálogo | Render dormido (cold start) o sin conexión | Esperar 30-90 s y "Reintentar"; el badge del header indica el estado |
| Stock en 🟡 (cache local) | Sin conexión con la Stock API | Botón "Sincronizar"; los datos de cache siguen disponibles |
| Búsqueda de clientes falla | Supabase no configurado | Verificar `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` (.env.local o secrets) |
| Cliente no aparece en búsqueda | Código/RUC no está en `ventas` | Cargar datos manualmente en el modal de cliente |
| Exportación falla | RUC inválido o sin productos | Verificar datos completos (modal Cliente) |
| Pérdida de pedido | Limpieza de navegador | Recuperar desde Excel exportado (Cargar XLSX) |
| Iconos no cargan | Sin conexión a Google Fonts | Los iconos fallback no están implementados |

---

## 🛡️ Seguridad del Repositorio

### Medidas Implementadas

| Medida | Descripción | Estado |
|--------|-------------|--------|
| **Branch Protection (main)** | Requiere PR + 1 aprobación para hacer merge | ✅ Script disponible |
| **Branch Protection (gh-pages)** | Rama de solo lectura, solo Actions puede escribir | ✅ Script disponible |
| **Permisos Workflow** | Permisos mínimos: contents:read, pages:write, id-token:write | ✅ Implementado |
| **Secrets** | Sin credenciales hardcodeadas en el código | ✅ Verificado |

### Configuración de Protección

#### 1. Proteger rama principal (main) y permitir GitHub Actions

El script configura la rama main para:
- ✅ Require Pull Request para hacer merge
- ✅ Require al menos 1 aprobación
- ✅ **GitHub Actions puede hacer push directamente (bypass)**

```bash
# Configurar variables de entorno
$env:GITHUB_TOKEN="tu_token_personal"
$env:REPO_OWNER="tu_usuario"
$env:REPO_NAME="g360-order-form"

# Ejecutar script
node scripts/setup-branch-protection.js
```

```bash
# Configurar variables de entorno
$env:GITHUB_TOKEN="tu_token_personal"
$env:REPO_OWNER="tu_usuario"
$env:REPO_NAME="g360-order-form"

# Ejecutar script
node scripts/setup-branch-protection.js
```

#### 2. Proteger rama de despliegue (gh-pages)

```bash
# Configurar variables de entorno
$env:GITHUB_TOKEN="tu_token_personal"
$env:REPO_OWNER="tu_usuario"
$env:REPO_NAME="g360-order-form"

# Ejecutar script
node scripts/setup-gh-pages-protection.js
```

### Permisos del Workflow

El workflow [`update-stock.yml`](.github/workflows/update-stock.yml) usa el principio de menor privilegio:

```yaml
permissions:
  contents: read    # Solo leer archivos
  pages: write     # Escribir en GitHub Pages
  id-token: write  # needed for pages deployment
```

### Recomendaciones Adicionales

1. **Crear un Environment de producción** en GitHub (Settings → Environments)
   - Nombre: `production`
   - Requerir aprobación manual antes del despliegue

2. **Configurar secrets** si el workflow necesita acceder a APIs externas:
   - Ve a Settings → Secrets and variables → Actions
   - Agrega las variables necesarias

3. **Habilitar 2FA** en tu cuenta de GitHub para mayor seguridad

---

## 🤝 Contribución

**Desarrollador**: Carlos Cusi
**Desarrollo**: Con asistencia de herramientas de código IA (Vibe Code)
**Última actualización**: 2026

## 📄 Licencia

MIT License - ver [LICENSE](LICENSE) para más detalles.

---

**Versión**: 3.0.0-tienda
**Estado**: ✅ Estable y listo para producción

---
**Marca**: G360
**Isotipo**: 3 puntos verticales paralelos (gris-verde-gris) + chevron `>`
**Autor**: Carlos Cusi
**Desarrollo**: Con asistencia de herramientas de código IA (Vibe Code)
**Powered by**: [g360-signature](https://github.com/carloscus/g360-signature)
