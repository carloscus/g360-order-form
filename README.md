# ðŸ›’ CIPSA OrderX v3.0.0 â€” Tienda Virtual

> Tienda virtual de pedidos para fuerza de ventas CIPSA: catÃ¡logo y stock en vivo, bÃºsqueda de clientes y generaciÃ³n de Hoja de Pedido. Forma parte de la familia de microherramientas G360.

![VersiÃ³n](https://img.shields.io/badge/version-3.0.0--tienda-blue)
![React](https://img.shields.io/badge/React-18-61DAFB)
![Vite](https://img.shields.io/badge/Vite-5-646CFF)
![Tailwind](https://img.shields.io/badge/Tailwind-3-38B2AC)
![G360](https://img.shields.io/badge/G360-Ecosystem-0d9488)
![Status](https://img.shields.io/badge/status-production-green)

---

## ðŸ“‘ Tabla de Contenidos

- [CaracterÃ­sticas Principales](#-caracterÃ­sticas-principales)
- [Novedades v3.0.0](#-novedades-v300)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [InstalaciÃ³n y Uso](#ï¸-instalaciÃ³n-y-uso)
- [Fuentes de Datos (APIs)](#-fuentes-de-datos-apis)
- [SincronizaciÃ³n de Stock](#-sincronizaciÃ³n-de-stock)
- [GuÃ­a de Uso (Flujo de Tienda)](#-guÃ­a-de-uso-flujo-de-tienda)
- [Formato de ExportaciÃ³n Excel](#-formato-de-exportaciÃ³n-excel)
- [Paleta de Colores](#-paleta-de-colores)
- [Arquitectura](#ï¸-arquitectura)
- [TecnologÃ­as Utilizadas](#-tecnologÃ­as-utilizadas)
- [Notas TÃ©cnicas](#-notas-tÃ©cnicas)
- [SoluciÃ³n de Problemas](#-soluciÃ³n-de-problemas)
- [ContribuciÃ³n](#-contribuciÃ³n)
- [Licencia](#-licencia)

---

## Familia G360

Este proyecto forma parte de la familia de microherramientas **G360** para apoyo CRM y gestiÃ³n de datos en escritorio, enfocadas en Ã¡reas como ventas, finanzas y logÃ­stica.

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

## ðŸš€ CaracterÃ­sticas Principales

### ðŸ“± Interfaz Responsive con NavegaciÃ³n Tipo App
- **Modo MÃ³vil**: Barra de navegaciÃ³n inferior fija (5 accesos directos)
- **Modo Desktop**: Sidebar lateral fijo + contenido principal
- **Modo Oscuro/Claro**: Alternancia instantÃ¡nea con persistencia local
- **Glassmorphism**: DiseÃ±o moderno con efectos de transparencia

### ðŸ”„ GestiÃ³n de Productos
- **BÃºsqueda por CÃ³digo/Nombre/EAN**: Universo completo (incluye sin catÃ¡logo y descontinuados, con badge visible)
- **CategorÃ­as Fijas**: Chips Viniball, Vinifan y Representadas (producto vendible de cada lÃ­nea)
- **Stock en Vivo (almacÃ©n VES)**: SemÃ¡foro por producto â€” AGOTADO / BAJO (<10 bx) / OK
- **Detalle de Stock**: Toca el nombre del producto para revisar stock VES, cajas disponibles, box y precio
- **Equivalencias DinÃ¡micas**: ConversiÃ³n automÃ¡tica Unidades â†” Cajas
- **Paginador con Salto**: NÃºmeros de pÃ¡gina con elipsis + primera/Ãºltima
- **Orden de Ingreso**: NumeraciÃ³n secuencial para cotejo con listas manuales

### ðŸ§‘â€ðŸ’¼ Clientes (Supabase)
- **BÃºsqueda de Clientes**: Por cÃ³digo exacto o parcial (RUC / cÃ³digo / nombre) contra la tabla `ventas` del ERP replicado
- **Autocompletado**: Nombre, RUC y vendedor se completan al seleccionar el cliente
- **Cliente en AtenciÃ³n**: Chip visible en catÃ¡logo y carrito durante todo el flujo

### ðŸ›’ Carrito de Compra
- **Drawer Lateral**: BotÃ³n flotante ðŸ›’ con contador; revisa y ajusta cantidades sin salir del catÃ¡logo
- **Persistencia**: Carrito y cliente guardados automÃ¡ticamente en localStorage
- **RecuperaciÃ³n de Pedidos**: Importar pedidos Excel previamente exportados (coteja contra el catÃ¡logo en vivo)

### ðŸ’¾ Persistencia y SincronizaciÃ³n
- **localStorage**: Carrito y datos de cliente persistidos automÃ¡ticamente
- **Cache Offline-First (sin data vieja persistida)**: memoria â†’ sesiÃ³n (5 min) â†’ **localStorage sin expiraciÃ³n** (siempre marcada como cache, edad visible en el badge; >7 dÃ­as en rojo). Con conexiÃ³n refresca automÃ¡tico; sin conexiÃ³n **sigue operando con los Ãºltimos datos**
- **Sync liviano**: en cargas calientes un probe `?limit=1` (1 KB) compara `fecha_descarga` â€” si el servidor no cambiÃ³, **no se descarga el payload completo**
- **CatÃ¡logo base**: si no hay cache (primer visita / storage limpio) se muestra al instante `productos_local.json` estÃ¡tico (mismo origen) â€” **solo en memoria, nunca se persiste como cache**; al conectar, la API lo reemplaza

### ðŸ“¤ ExportaciÃ³n y Carga XLSX
- **Exportar a Excel**: Hoja de Pedido con datos del cliente (RUC, OC, SKU, cantidad, precio, ID cliente, vendedor)
- **Compartir**: Descarga directa o Email
- **Cargar XLSX**: Importar pedidos guardados previamente

---

## ðŸ†• Novedades v3.0.0 (Tienda Virtual)

| Feature | DescripciÃ³n |
|---------|-------------|
| **CatÃ¡logo en Vivo** | Precio base referencial + stock real del almacÃ©n VES desde la Stock API (Render) |
| **Flujo de Tienda** | Cargar cliente â†’ revisar stock â†’ buscar/seleccionar productos â†’ ðŸ›’ â†’ Hoja de Pedido |
| **Carrito Drawer** | Panel lateral deslizante con items, cantidades y total referencial |
| **BÃºsqueda de Clientes** | Supabase PostgREST timeout-safe: cÃ³digo exacto â†’ RUC/DNI completo â†’ prefijo de nombre, vendedor autocompletado |
| **Detalle de Stock** | Modal por producto con stock VES, cajas disponibles y estado |
| **CategorÃ­as Fijas** | Chips Viniball / Vinifan / Representadas; la pestaÃ±a BÃºsqueda abarca el universo completo (~2.100 SKUs, incl. sin catÃ¡logo y descontinuados con badge) |
| **Paginador con Salto** | NÃºmeros de pÃ¡gina con elipsis + botones primera/anterior/siguiente/Ãºltima |
| **Importador XLSX** | Reconstruye el carrito cotejando SKUs contra el catÃ¡logo en vivo |
| **Export con Resumen** | Contrato de 8 columnas + filas de totales al pie (unidades, cajas, total referencial, fecha); totales tambiÃ©n en el mensaje de Email |

---

## ðŸ“ Estructura del Proyecto

```
g360-order-form/
â”œâ”€â”€ ðŸ“„ index.html                 # Punto de entrada HTML
â”œâ”€â”€ ðŸ“„ package.json               # Dependencias y scripts
â”œâ”€â”€ ðŸ“„ vite.config.js            # ConfiguraciÃ³n Vite
â”œâ”€â”€ ðŸ“„ tailwind.config.js        # ConfiguraciÃ³n Tailwind CSS
â”œâ”€â”€ ðŸ“„ postcss.config.js         # ConfiguraciÃ³n PostCSS
â”œâ”€â”€ ðŸ“„ README.md                 # Este archivo
â”‚
â”œâ”€â”€ ðŸ“ .github/
â”‚   â””â”€â”€ ðŸ“ workflows/
â”‚       â””â”€â”€ ðŸ“„ update-stock.yml  # GitHub Actions para stock
â”‚
â”œâ”€â”€ ðŸ“ public/                    # Archivos estÃ¡ticos
â”‚   â”œâ”€â”€ ðŸ“„ productos_local.json  # CatÃ¡logo de productos
â”‚
â”œâ”€â”€ ðŸ“ scripts/
â”‚   â””â”€â”€ ðŸ“„ download-stock.js     # Script de sincronizaciÃ³n
â”‚
â”œâ”€â”€ ðŸ“ stock-api/                 # API local opcional
â”‚   â”œâ”€â”€ ðŸ“„ server.js
â”‚   â””â”€â”€ ðŸ“„ package.json
â”‚
â”œâ”€â”€ ðŸ“ docs/
â”‚   â””â”€â”€ ðŸ“„ MANUAL_USUARIO.md     # Manual de usuario
â”‚
â””â”€â”€ ï¿½ src/                       # CÃ³digo fuente
    â”œâ”€â”€ ðŸ“„ main.jsx              # Punto de entrada React
    â”œâ”€â”€ ðŸ“„ App.jsx              # Componente principal + Rutas
    â”œâ”€â”€ ðŸ“„ index.css            # Estilos globales + CSS variables
    â”‚
    â”œâ”€â”€ ðŸ“ components/          # Componentes reutilizables
    â”‚   â”œâ”€â”€ ðŸ“„ ClientDataModal.jsx  # Modal datos del cliente + bÃºsqueda Supabase
    â”‚   â”œâ”€â”€ ðŸ“„ CartDrawer.jsx   # Carrito deslizante (ðŸ›’)
    â”‚   â”œâ”€â”€ ðŸ“„ Paginador.jsx    # PaginaciÃ³n con salto de pÃ¡ginas
    â”‚
    â”œâ”€â”€ ðŸ“ context/             # Estado global
    â”‚   â””â”€â”€ ðŸ“„ AppContext.jsx   # Context API (carrito, tema, cliente)
    â”‚
    â”œâ”€â”€ ðŸ“ pages/               # PÃ¡ginas principales
    â”‚   â”œâ”€â”€ ðŸ“„ Layout.jsx       # Layout, nav, frescura de stock, import XLSX
    â”‚   â”œâ”€â”€ ðŸ“„ CatalogoPage.jsx # CatÃ¡logo en vivo + flujo de tienda
    â”‚   â””â”€â”€ ðŸ“„ OrdenPage.jsx    # Hoja de Pedido: resumen y exportaciÃ³n
    â”‚
    â”œâ”€â”€ ðŸ“ hooks/
    â”‚   â”œâ”€â”€ ðŸ“„ useDebounce.js   # Hook de debounce
    â”‚   â””â”€â”€ ðŸ“„ useStockCatalog.js # Hook del catÃ¡logo/stock en vivo
    â”‚
    â”œâ”€â”€ ðŸ“ services/
    â”‚   â”œâ”€â”€ ðŸ“„ stockApi.js      # Stock API Render (catÃ¡logo, stock VES, cache, probe)
    â”‚   â”œâ”€â”€ ðŸ“„ supabaseRest.js  # Cliente PostgREST mÃ­nimo (fetch directo)
    â”‚   â”œâ”€â”€ ðŸ“„ clientesService.js # BÃºsqueda de clientes (tabla ventas)
    â”‚
    â””â”€â”€ ðŸ“ utils/
        â”œâ”€â”€ ðŸ“„ formatters.js    # Formateadores de datos
        â”œâ”€â”€ ðŸ“„ xlsxGenerator.js # Generador de Excel
        â””â”€â”€ ðŸ“„ xlsxLoader.js    # Loader de archivos XLSX
```

---

## ðŸ› ï¸ InstalaciÃ³n y Uso

### Requisitos Previos
- Node.js 18+ 
- npm o yarn

### InstalaciÃ³n

```bash
# Clonar o descargar el proyecto
cd g360-order-form

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Construir para producciÃ³n
npm run build
```

### Acceso
- Desarrollo: `http://localhost:5173`
- ProducciÃ³n: Desplegar carpeta `dist/` en GitHub Pages, Netlify, Vercel, etc.

---

## ðŸ—„ï¸ Fuentes de Datos (APIs)

### Stock API (Render) â€” catÃ¡logo, precio y stock en vivo

```
GET https://g360-stock-api.onrender.com/api/v1/stock
Header: X-API-Key: cipsa2026 (solo lectura)
```

Respuesta (por item, transformada en `src/services/stockApi.js`):

| Campo API | Normalizado a | DescripciÃ³n |
|-----------|---------------|-------------|
| `sku` | `codigo` | CÃ³digo de producto |
| `descripcion` / `nombre_corto` | `nombre` | Nombre del producto |
| `un_bx` | `bxSize` | Unidades por caja/bulto |
| `precio` / `precio_lista` | `precioLista` | Precio base referencial (sin IGV) |
| `peso_kg` | `pesoUm` | Peso unitario |
| `ean13` / `ean14` | `ean` / `ean14` | CÃ³digos de barras |
| `linea` / `categoria` | `linea` / `categoria` | LÃ­nea y categorÃ­a (categorÃ­as dinÃ¡micas) |
| `almacenes[VES].disponible` | `stock` | **Disponible de venta = almacÃ©n VES exacto** (129/40/121/122: informativos) |
| `estado_linea` / `sin_catalogo` / `descontinuado` | filtros | Solo se venden productos del catÃ¡logo maestro |
| `orden` | `orden` | Orden del catÃ¡logo maestro |

Regla de negocio (heredada de g360-stock-reporter): `un_bx > 1` â†’ venta en cajas; estado de stock: AGOTADO (0), BAJO (<10 bx), OK (â‰¥10 bx).

### Supabase PostgREST â€” bÃºsqueda de clientes

```
GET {VITE_SUPABASE_URL}/rest/v1/ventas
  ?select=id_cliente,doc_cliente,nom_cliente,id_vendedor,nom_vendedor
  &id_cliente=eq.00056101&limit=1              # 1) cÃ³digo exacto (padded a 8, indexado)
  &doc_cliente=eq.20601024714&limit=10          # 2) RUC/DNI completo (rÃ¡pido)
  &nom_cliente=ilike.MULTI*&limit=10            # 3) prefijo de nombre (indexado)
Headers: apikey + Authorization: Bearer {anon key} (solo lectura)
```

- `id_cliente` canÃ³nico: 8 dÃ­gitos con ceros (`56101` â†’ `00056101`); para display se recortan los ceros
- El vendedor (`nom_vendedor`) viaja embebido en la fila de `ventas` y se autocompleta al elegir el cliente
- **SemÃ¡ntica de bÃºsqueda**: cÃ³digo completo, RUC/DNI completo o inicio del nombre. La bÃºsqueda parcial (`%contains%`) hace full-scan sobre `ventas` y excede el statement_timeout de Supabase (500/57014) â€” por eso el servicio es timeout-safe con las 3 estrategias indexadas
- ImplementaciÃ³n: `src/services/clientesService.js` + `src/services/supabaseRest.js` (fetch directo, sin supabase-js)

### Variables de Entorno

Crear `.env.local` (dev) o configurar secretos en GitHub Actions (prod). Ver `.env.example`:

```
VITE_SUPABASE_URL=https://<proyecto>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key solo lectura>
VITE_STOCK_API_URL=https://g360-stock-api.onrender.com/api/v1/stock
VITE_STOCK_API_KEY=cipsa2026
```

---

## ðŸ”„ SincronizaciÃ³n de Stock

### Flujo actual (API en vivo)

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  Stock API (Render)      â”‚
â”‚  g360-stock-api          â”‚
â”‚  refresca ERP ~15 min    â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
         â”‚ GET /api/v1/stock (X-API-Key)
         â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  stockApi.js             â”‚
â”‚  transform + cache 3 capasâ”‚ â”€â”€â–º memoria / sessionStorage (5 min) / localStorage (7 dÃ­as)
â””â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
         â”‚ pub/sub (useSyncExternalStore)
         â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  UI                      â”‚
â”‚  badge frescura ðŸŸ¢/ðŸŸ¡/ðŸ”µ â”‚ â”€â”€â–º probe ?limit=1 cada 10 min + keep-alive /health cada 5 min
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

- **Badge de frescura** en el header: ðŸŸ¢ en vivo / ðŸŸ¡ cache local / ðŸ”µ cargando (cold start Render ~30-90 s) / ðŸ”´ sin conexiÃ³n
- Fuera de la ventana operativa Lima (Lun-SÃ¡b 07:00-22:59) no se hace polling en background
- BotÃ³n "Sincronizar" fuerza un refetch completo

### Workflow `update-stock.yml` (DEPRECATED)


---

## ðŸ’¡ GuÃ­a de Uso (Flujo de Tienda)

### Flujo principal

```
â‘  Cargar Cliente â”€â”€â–º â‘¡ Revisar Stock â”€â”€â–º â‘¢ Buscar/Seleccionar â”€â”€â–º â‘£ ðŸ›’ â”€â”€â–º â‘¤ Hoja de Pedido
```

**â‘  Cargar Cliente** â€” Chip del cliente en el header (o botÃ³n ðŸ›’ â†’ "Cargar Cliente"); si no hay cliente cargado muestra el prompt "Cargar cliente". Busca por cÃ³digo, RUC o nombre; al seleccionar se autocompletan nombre, RUC y vendedor.

**â‘¡ Revisar Stock** â€” Cada tarjeta muestra el semÃ¡foro del almacÃ©n VES (AGOTADO / BAJO / OK). Toca el nombre del producto para ver stock, cajas disponibles, box y precio.

**â‘¢ Buscar/Seleccionar Productos** â€” Buscador global en el header (SKU/nombre/EAN, con micrÃ³fono) + chips de segmento (Viniball / Vinifan / Representadas). Configura cantidad con el stepper o "+1 Box".

**â‘£ Carrito ðŸ›’** â€” BotÃ³n flotante con contador. El drawer muestra items, cantidades editables y total referencial; incluye el chip del cliente en atenciÃ³n.

**â‘¤ Hoja de Pedido** â€” "Generar Hoja de Pedido" â†’ resumen con total, exportar a Excel (descarga directa o por Email).

### NavegaciÃ³n

| Acceso | DescripciÃ³n |
|--------|-------------|
| **Inicio** | CatÃ¡logo de productos con bÃºsqueda y flujo de tienda |
| **CatÃ¡logo** | Enlace externo al catÃ¡logo online (FlipHTML5) |
| **Cargar** | Importar pedido desde archivo Excel (reconstruye el carrito) |
| **Sincro** | Refrescar catÃ¡logo/stock desde la Stock API |
| **Cliente** | Datos del cliente + bÃºsqueda Supabase |
| **ðŸ›’ (flotante)** | Ãšnico acceso al carrito: drawer con items y CTA "Generar Hoja de Pedido" (â†’ orden/export) |

---

## ðŸ“‹ Formato de ExportaciÃ³n Excel

| Columna | DescripciÃ³n | Ejemplo |
|---------|-------------|---------|
| RUC | RUC del cliente (11 dÃ­gitos) | 20456127917 |
| OC | Orden de compra | 280226 |
| SKU | CÃ³digo de producto | 03290 |
| CANTIDAD | Cantidad en unidades | 100.00 |
| PRECIO | Precio base referencial (sin IGV) | 5.14 |
| OBSERVACIONES | Notas del producto | Entregar en tienda |
| ID_CLIENTE | CÃ³digo canÃ³nico del cliente (v3) | 00056101 |
| VENDEDOR | Vendedor autocompletado (v3) | MILCA SARAY REYES BALLENA |

**Nota:** las columnas ID_CLIENTE y VENDEDOR se agregan al final (G, H); el contrato original de 6 columnas (A-F) se mantiene para el proceso downstream. El importador acepta ambos formatos.

**Filas de resumen al pie** (sin SKU, el importador las saltea): unidades totales, cajas, total referencial, nota de precios, **fecha de los datos del catÃ¡logo** (trazabilidad de frescura: si el export se hizo offline/base, queda estampado), fecha de generaciÃ³n y signature G360. El mensaje de Email tambiÃ©n incluye productos, unidades y total.

**Integridad de precios**: el carrito se reconcilia automÃ¡ticamente contra el catÃ¡logo fresco de la API (`sincronizarCarrito.js`) â€” el dato del servidor siempre gana para precio/box/nombre/lÃ­nea; cantidades y orden intactas. AsÃ­ un item agregado desde el catÃ¡logo base o cache vieja se corrige solo al sincronizar.

**Nombre del archivo:** `OC_20456127917_trujillo_280226.xlsx`
**Nombre de pestaÃ±a:** Provincia (ej: "Trujillo")

---

## ðŸŽ¨ Paleta de Colores

Sistema de dos niveles: **base neutra** para la UI (simÃ©trica entre temas) + **identidad de color por categorÃ­a**.

### Base neutra (botones y elementos)
| Rol | Claro | Oscuro |
|-----|-------|--------|
| Fondo | `#f8fafc` | `#0b1220` |
| Cards | `#ffffff` glassmorphism | `#151e2e` glassmorphism |
| Acento (relleno de botones) | `#0f172a` (grÃ¡fito oscuro) | `#e2e8f0` (gris claro) |
| Fuente sobre acento (`--g360-accent-contrast`) | `#ffffff` | `#0b1220` |
| Texto | `#0f172a` | `#f0f4f8` |

La inversiÃ³n simÃ©trica (botÃ³n oscuro en claro / botÃ³n claro en oscuro) garantiza contraste mÃ¡ximo con neutros.

### Identidad por categorÃ­a (chips activos, SKU y contador)
| CategorÃ­a | Colores de marca | Primario aplicado |
|-----------|------------------|-------------------|
| **Viniball** | rojo y negro | `#dc2626` |
| **Vinifan** | naranja y azul | `#ea580c` (azul `#1d4ed8` como secundario) |
| **Representadas** | verde y blanco | `#16a34a` |

Definidas en `CATEGORY_COLORS` (`src/pages/CatalogoPage.jsx`).

### Colores semÃ¡nticos (estados, no marca)
- **Bajo stock**: Ã¡mbar `#f59e0b`
- **Agotado/Error**: rojo `#ef4444`

---

## ðŸ—ï¸ Arquitectura

### Estado Global (Context API)

```
AppContext
â”œâ”€â”€ selectedProducts     # Carrito de compras
â”œâ”€â”€ clientData          # Datos del cliente (RUC, nombre, OC, etc.)
â”œâ”€â”€ isDarkMode          # Tema claro/oscuro
â”œâ”€â”€ showPedidoModal     # Control del modal de cliente
â”‚
â””â”€â”€ MÃ©todos:
    â”œâ”€â”€ addToCart()
    â”œâ”€â”€ removeFromCart()
    â”œâ”€â”€ updateCartQuantity()
    â”œâ”€â”€ clearCart()
    â”œâ”€â”€ updateClientData()
    â””â”€â”€ toggleTheme()
```

### Rutas (React Router)

| Ruta | Componente | DescripciÃ³n |
|------|-------------|-------------|
| `/` | Redirect â†’ `/catalogo` | RedirecciÃ³n |
| `/catalogo` | CatalogoPage | CatÃ¡logo y bÃºsqueda |
| `/orden` | OrdenPage | Resumen y exportaciÃ³n |

### Persistencia (localStorage)

| Clave | Contenido |
|-------|------------|
| `hoja_pedido_cart` | Carrito de productos |
| `hoja_pedido_client` | Datos del cliente |
| `hoja_pedido_order_index` | Ãndice de orden |
| `hoja_pedido_theme` | Tema claro/oscuro |

---

## ðŸ”§ TecnologÃ­as Utilizadas

- **React 18** - Framework UI
- **React Router v6** - NavegaciÃ³n SPA
- **Vite 5** - Build tool y dev server
- **Tailwind CSS 3** - Framework CSS utilitario
- **XLSX (SheetJS)** - GeneraciÃ³n y parsing de archivos Excel
- **Supabase PostgREST** (fetch directo) - BÃºsqueda de clientes
- **Stock API (Render)** - CatÃ¡logo, precio base y stock en vivo

---

## ðŸ“ Notas TÃ©cnicas

### Versionado
- **APP_VERSION**: `v3.0.0-tienda`

### Variables de Entorno
Ver [Fuentes de Datos (APIs)](#-fuentes-de-datos-apis). Las credenciales son de solo lectura; en producciÃ³n se inyectan vÃ­a GitHub Secrets (configuradas en `deploy-frontend.yml`).

### LÃ­mites Conocidos
- CatÃ¡logo: ~2000 SKUs del catÃ¡logo maestro (paginado de 24 por pÃ¡gina)
- Cold start de Render (free tier): 30-90 s al despertar; el keep-alive `/health` lo mitiga en horario operativo
- BÃºsqueda de clientes: solo lectura sobre la tabla `ventas` (sin RLS por usuario â€” mismo modelo que g360-ventas-pulse fase actual)

---

## ðŸ”§ SoluciÃ³n de Problemas

### Problemas Comunes

| Problema | Causa Posible | SoluciÃ³n |
|----------|---------------|----------|
| No carga el catÃ¡logo | Render dormido (cold start) o sin conexiÃ³n | Esperar 30-90 s y "Reintentar"; el badge del header indica el estado |
| Stock en ðŸŸ¡ (cache local) | Sin conexiÃ³n con la Stock API | BotÃ³n "Sincronizar"; los datos de cache siguen disponibles |
| BÃºsqueda de clientes falla | Supabase no configurado | Verificar `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` (.env.local o secrets) |
| Cliente no aparece en bÃºsqueda | CÃ³digo/RUC no estÃ¡ en `ventas` | Cargar datos manualmente en el modal de cliente |
| ExportaciÃ³n falla | RUC invÃ¡lido o sin productos | Verificar datos completos (modal Cliente) |
| PÃ©rdida de pedido | Limpieza de navegador | Recuperar desde Excel exportado (Cargar XLSX) |
| Iconos no cargan | Sin conexiÃ³n a Google Fonts | Los iconos fallback no estÃ¡n implementados |

---

## ðŸ›¡ï¸ Seguridad del Repositorio

### Medidas Implementadas

| Medida | DescripciÃ³n | Estado |
|--------|-------------|--------|
| **Branch Protection (main)** | Requiere PR + 1 aprobaciÃ³n para hacer merge | âœ… Script disponible |
| **Branch Protection (gh-pages)** | Rama de solo lectura, solo Actions puede escribir | âœ… Script disponible |
| **Permisos Workflow** | Permisos mÃ­nimos: contents:read, pages:write, id-token:write | âœ… Implementado |
| **Secrets** | Sin credenciales hardcodeadas en el cÃ³digo | âœ… Verificado |

### ConfiguraciÃ³n de ProtecciÃ³n

#### 1. Proteger rama principal (main) y permitir GitHub Actions

El script configura la rama main para:
- âœ… Require Pull Request para hacer merge
- âœ… Require al menos 1 aprobaciÃ³n
- âœ… **GitHub Actions puede hacer push directamente (bypass)**

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

1. **Crear un Environment de producciÃ³n** en GitHub (Settings â†’ Environments)
   - Nombre: `production`
   - Requerir aprobaciÃ³n manual antes del despliegue

2. **Configurar secrets** si el workflow necesita acceder a APIs externas:
   - Ve a Settings â†’ Secrets and variables â†’ Actions
   - Agrega las variables necesarias

3. **Habilitar 2FA** en tu cuenta de GitHub para mayor seguridad

---

## ðŸ¤ ContribuciÃ³n

**Desarrollador**: Carlos Cusi
**Desarrollo**: Con asistencia de herramientas de cÃ³digo IA (Vibe Code)
**Ãšltima actualizaciÃ³n**: 2026

## ðŸ“„ Licencia

MIT License - ver [LICENSE](LICENSE) para mÃ¡s detalles.

---

**VersiÃ³n**: 3.0.0-tienda
**Estado**: âœ… Estable y listo para producciÃ³n

---
**Marca**: G360
**Isotipo**: 3 puntos verticales paralelos (gris-verde-gris) + chevron `>`
**Autor**: Carlos Cusi
**Desarrollo**: Con asistencia de herramientas de cÃ³digo IA (Vibe Code)
**Powered by**: [g360-signature](https://github.com/carloscus/g360-signature)
