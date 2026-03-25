# 📋 CIPSA OrderX v2.1

Sistema de gestión de hojas de pedido para fuerza de ventas en el ecosistema G360. Optimizado para móvil y desktop con navegación tipo app, sincronización de stock y catálogo de productos.

![Versión](https://img.shields.io/badge/version-2.1-blue)
![React](https://img.shields.io/badge/React-18-61DAFB)
![Vite](https://img.shields.io/badge/Vite-5-646CFF)
![Tailwind](https://img.shields.io/badge/Tailwind-3-38B2AC)
![G360](https://img.shields.io/badge/G360-Ecosystem-0d9488)
![G360 Skill](https://img.shields.io/badge/G360-Skill-22c55e)
![Status](https://img.shields.io/badge/status-production-green)

---

## 📑 Tabla de Contenidos

- [Características Principales](#-características-principales)
- [Novedades v1.3.0](#-novedades-v130)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Instalación y Uso](#️-instalación-y-uso)
- [Configuración del Catálogo](#-configuración-del-catálogo)
- [Sincronización de Stock](#-sincronización-de-stock)
- [Guía de Uso](#-guía-de-uso)
- [Formato de Exportación Excel](#-formato-de-exportación-excel)
- [Paleta de Colores](#-paleta-de-colores)
- [Arquitectura](#️-arquitectura)
- [Tecnologías Utilizadas](#-tecnologías-utilizadas)
- [Notas Técnicas](#-notas-técnicas)
- [Solución de Problemas](#-solución-de-problemas)
- [Contribución](#-contribución)
- [Licencia](#-licencia)

---

## 🌐 Ecosistema G360

Este proyecto forma parte del **ecosistema G360**, un conjunto de herramientas y aplicaciones para gestión empresarial. Implementa los lineamientos de marca G360 y utiliza el Glosario de Componentes para asegurar consistencia en el naming y estructura.

### 🔗 Proyectos Relacionados
- **g360-order-xlsx**: Generador de hojas de pedido en formato Excel
- **g360-portfolio**: Sitio web de presentación del ecosistema
- **G360 Assets**: Librerías compartidas y templates base

### 📚 Glosario de Componentes
Sigue las convenciones definidas en `g360-assets/GLOSARIO_COMPONENTES.md`:
- Componentes: PascalCase (ej: `ClientDataModal`)
- Clases CSS: Kebab-case (ej: `data-card`)
- Props: camelCase (ej: `onChange`)

### ⚙️ G360 Skill System
El proyecto utiliza el **G360 Skill System** para configuración unificada del cliente:

```javascript
// src/core/g360-skill.js
import { getClientSkill } from '@assets/engine/g360-skill-client.js';

const baseClientSkill = getClientSkill('mobile');

export const G360_CONFIG = {
  ...baseClientSkill,
  branding: {
    clientName: 'CIPSA',
    appTitle: 'CIPSA OrderX v2.0',
    clientLogoFile: './logo-cipsa.svg',
    clientFavicon: './favicon.svg'
  }
};
```

**Características del Skill System:**
- Configuración centralizada de branding (logo, favicon, nombre)
- Soporte multi-plataforma (mobile, desktop)
- Herencia de configuración base del ecosistema G360
- Inyección automática en `window.G360_CONFIG`

**Archivos relacionados:**
- `src/core/g360-skill.js` - Configuración del skill para CIPSA
- `g360-assets/engine/g360-skill-client.js` - Skill base del ecosistema
- `g360-assets/engine/g360-theme.css` - Estilos del tema G360

---

## 🚀 Características Principales

### 📱 Interfaz Responsive con Navegación Tipo App
- **Modo Móvil**: Barra de navegación inferior fija (5 accesos directos)
- **Modo Desktop**: Sidebar lateral fijo + contenido principal
- **Modo Oscuro/Claro**: Alternancia instantánea con persistencia local
- **Glassmorphism**: Diseño moderno con efectos de transparencia

### 🔄 Gestión de Productos
- **Búsqueda por Código/Nombre/EAN**: Búsqueda rápida y flexible
- **Categorías Dinámicas**: VINIBALL, VINIFAN, REPRESENTADAS (desde JSON)
- **Tooltip en Nombre**: Al pasar el cursor muestra nombre completo
- **Badge de Agotados**: Productos sin stock marcados visualmente
- **Equivalencias Dinámicas**: Conversión automática Unidades ↔ Cajas
- **Validación de Stock**: Advertencias antes de agregar al carrito
- **Confirmación de Agotado**: Al agregar producto sin stock
- **Orden de Ingreso**: Numeración secuencial para cotejo con listas manuales

### 💾 Persistencia y Sincronización
- **localStorage**: Carrito y datos de cliente persistidos automáticamente
- **Recuperación de Pedidos**: Cargar pedidos Excel previamente exportados
- **Modo Offline**: Funciona sin conexión después de la primera carga

### 📤 Exportación y Carga XLSX
- **Exportar a Excel**: Archivo formato estándar con datos del cliente
- **Cargar XLSX**: Importar pedidos guardados previamente

---

## 🆕 Novedades v2.1

| Feature | Descripción |
|---------|-------------|
| **Modal de Producto Compacto** | Click en nombre muestra SKU, nombre, Box y Stock |
| **Colores Unificados** | Variables CSS en ClientDataModal y Tooltip |
| **Accesibilidad ARIA** | Atributos role, aria-label, aria-modal en componentes |
| **Input Optimizado** | Spinners nativos eliminados, solo botones +/- |
| **Cierre por Click Fuera** | Modal se cierra al click fuera del área |

## 🆕 Novedades v1.3.0

| Feature | Descripción |
|---------|-------------|
| **React Router v7** | Navegación SPA multi-página |
| **Context API** | Estado global compartido (carrito, tema, cliente) |
| **Navegación Móvil** | Barra inferior fija estilo app nativa |
| **Sidebar PC** | Navegación lateral en pantallas grandes |
| **Carga XLSX** | Importar pedidos desde archivos Excel |
| **Tema Moderno** | Paleta Teal/Cyan con glassmorphism |
| **Nueva Arquitectura** | Componentes, Context, Pages, Utils separados |

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
│       ├── 📄 update-stock.yml  # GitHub Actions para stock
│       └── 📄 sync-stock.yml    # GitHub Actions para sincronización
│
├── 📁 g360-assets/              # Assets del ecosistema G360
│   └── 📁 engine/
│       ├── 📄 g360-skill-client.js  # Skill base del ecosistema
│       ├── 📄 g360-theme.css        # Estilos del tema G360
│       └── 📁 components/
│           └── 📄 G360DragModal.jsx # Modal arrastrable G360
│
├── 📁 public/                    # Archivos estáticos
│   ├── 📄 catalogo_productos.json # Catálogo de productos (fuente oficial)
│   ├── 📄 stock_data.json       # Datos de stock (generado por GitHub Actions)
│   ├── 📄 favicon.svg           # Icono de la app
│   ├── 📄 logo-cipsa.svg        # Logo de CIPSA
│   └── 📄 404.html              # Página 404 para GitHub Pages
│
├── 📁 scripts/
│   ├── 📄 download-stock.js     # Script de sincronización
│   ├── 📄 setup-branch-protection.js  # Configurar protección de ramas
│   └── 📄 setup-gh-pages-protection.js # Configurar protección gh-pages
│
├── 📁 stock-api/                 # API local opcional
│   ├── 📄 server.js
│   └── 📄 package.json
│
├── 📁 docs/
│   ├── 📄 MANUAL_USUARIO.md     # Manual de usuario
│   └── 📄 PROTEGER_REPO.md      # Guía de protección del repo
│
└── 📁 src/                       # Código fuente
    ├── 📄 main.jsx              # Punto de entrada React
    ├── 📄 App.jsx               # Componente principal + Rutas
    ├── 📄 index.css             # Estilos globales + CSS variables
    │
    ├── 📁 core/                 # Configuración G360
    │   └── 📄 g360-skill.js     # Skill configurado para CIPSA
    │
    ├── 📁 components/           # Componentes reutilizables
    │   ├── 📄 ClientDataModal.jsx  # Modal datos del cliente
    │   ├── 📄 DocumentInput.jsx # Input de documentos
    │   └── 📄 Tooltip.jsx       # Tooltip informativo
    │
    ├── 📁 context/              # Estado global
    │   └── 📄 AppContext.jsx    # Context API (carrito, tema, cliente)
    │
    ├── 📁 pages/                # Páginas principales
    │   ├── 📄 Layout.jsx        # Layout con navegación
    │   ├── 📄 CatalogoPage.jsx  # Catálogo y búsqueda
    │   └── 📄 OrdenPage.jsx     # Resumen y exportación
    │
    ├── 📁 hooks/
    │   └── 📄 useDebounce.js    # Hook de debounce
    │
    ├── 📁 services/
    │   └── 📄 stockService.js   # Servicios de stock
    │
    └── 📁 utils/
        ├── 📄 formatters.js     # Formateadores de datos
        ├── 📄 xlsxGenerator.js  # Generador de Excel
        ├── 📄 xlsxLoader.js     # Loader de archivos XLSX
        ├── 📄 xlsxShare.js      # Utilidades para compartir
        └── 📄 baseUrl.js        # Configuración de URL base
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

## 📦 Configuración del Catálogo

### Ubicación
El archivo **`catalogo_productos.json`** debe estar en la carpeta **`public/`**:

```
public/
└── catalogo_productos.json
```

### Estructura del JSON

```json
[
  {
    "codigo": "03290",
    "descripcion": "FOLDER N VINIFAN DOBLE TAPA OFICIO CELESTE GUSANO",
    "uni_caja": 50,
    "precio": 5.14,
    "ean": "7751832032908",
    "linea": "OFICIO",
    "stock_referencial": 100,
    "orden": 1
  }
]
```

### Mapeo de Campos

El sistema acepta múltiples nombres de campo y los normaliza automáticamente:

### Estructura del JSON (catalogo_productos.json)

```json
{
  "metadata": {
    "version": "2.0.0",
    "generated_at": "24/03/2026 20:28:21",
    "total_productos": 1088
  },
  "productos": [
    {
      "orden": 1,
      "sku": "016763",
      "nombre": "FUTBOL PU FUTURE #5",
      "ean13": "",
      "categoria": "VINIBALL",
      "linea": "PELOTAS",
      "peso_kg": 0.4,
      "un_bx": 18,
      "precio_lista": 70.0,
      "precio_final": 70.0,
      "es_remate": false
    }
  ]
}
```

### Mapeo de Campos

| Campo en JSON | Normalizado a | Descripción |
|---------------|---------------|-------------|
| `sku` | `codigo` | Código del producto |
| `nombre` | `nombre` | Nombre del producto |
| `un_bx` | `bxSize` | Unidades por caja/bulto |
| `precio_final` / `precio_lista` | `precioLista` | Precio de lista (sin IGV) |
| `ean13` | `ean` | Código de barras |
| `categoria` | `categoria` | Categoría (VINIBALL, VINIFAN, REPRESENTADAS) |
| `linea` | `linea` | Línea de producto |
| `peso_kg` | `pesoUm` | Peso en KG |
| `es_remate` | `esRemate` | Producto en oferta |

---

## 🔄 Sincronización de Stock

### Flujo con Pull Request (Recomendado)

```
┌─────────────────────┐
│  GitHub Actions     │
│  (update-stock)     │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  Descarga stock     │
│  desde appweb       │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  Crea rama          │ ──► update/stock-YYYYMMDD-HHMMSS
│  temporal           │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  Crea Pull Request │ ──► Revisión requerida
│  a main             │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  Merge a main       │ ──► Aprobación manual
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  Sync a gh-pages   │ ──► Producción
└─────────────────────┘
```

**Este flujo es el más seguro porque:**
- ✅ Todo cambio pasa por revisión (Pull Request)
- ✅ Requiere aprobación manual para hacer merge
- ✅ gh-pages se actualiza automáticamente después del merge

---

## 💡 Guía de Uso

### Navegación

| Acceso | Descripción |
|--------|-------------|
| **Inicio** | Catálogo de productos con búsqueda |
| **Catálogo** | Enlace externo al catálogo online |
| **Cargar** | Importar pedido desde archivo Excel |
| **Actualizar** | Recargar catálogos y datos |
| **Cliente** | Datos del cliente (RUC, nombre, OC, dirección) |

### Flujo de Trabajo

1. **Ingresar Datos del Cliente**
   - RUC (11 dígitos) o DNI (8 dígitos) - Obligatorio para exportar
   - Nombre del cliente, OC/Referencia, Provincia, Dirección, Vendedor

2. **Buscar y Agregar Productos**
   - Escribir código, nombre o EAN en el buscador
   - Seleccionar categoría (Búsqueda, VINIBALL, VINIFAN, REPRESENTADAS)
   - Al hacer click en búsqueda, cambia automáticamente a modo búsqueda
   - Configurar cantidad y agregar al carrito

3. **Revisar Orden**
   - Ver resumen de productos seleccionados
   - Modificar cantidades o eliminar productos
   - Validar datos del cliente

4. **Exportar**
   - Hacer clic en "Descargar OC"
   - Archivo Excel: `OC_{ruc}_{provincia}_{oc}.xlsx`

---

## 📋 Formato de Exportación Excel

| Columna | Descripción | Ejemplo |
|---------|-------------|---------|
| RUC | RUC del cliente (11 dígitos) | 20456127917 |
| OC | Orden de compra | 280226 |
| SKU | Código de producto | 03290 |
| CANTIDAD | Cantidad en unidades | 100.00 |
| PRECIO | Precio de lista (sin IGV) | 5.14 |
| OBSERVACIONES | Notas del producto | Entregar en tienda |

**Nombre del archivo:** `OC_20456127917_trujillo_280226.xlsx`
**Nombre de pestaña:** Provincia (ej: "Trujillo")

---

## 🎨 Paleta de Colores

### Modo Claro
- **Fondo**: `#f8fafc` (slate-50)
- **Cards**: `#ffffff` con glassmorphism
- **Primario**: `#0d9488` (teal-600)
- **Acento**: `#06b6d4` (cyan-500)
- **Texto**: `#0f172a` (slate-900)

### Modo Oscuro
- **Fondo**: `#020617` (slate-950)
- **Cards**: `#0f172a` con glassmorphism
- **Primario**: `#14b8a6` (teal-500)
- **Acento**: `#22d3ee` (cyan-400)
- **Texto**: `#f8fafc` (slate-50)

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
- **React Router v7** - Navegación SPA
- **Vite 5** - Build tool y dev server
- **Tailwind CSS 3** - Framework CSS utilitario
- **XLSX (SheetJS)** - Generación y parsing de archivos Excel
- **localStorage** - Persistencia de datos
- **G360 Skill System** - Configuración unificada del cliente y branding
- **G360 Assets Engine** - Componentes y estilos compartidos del ecosistema

---

## 📝 Notas Técnicas

### Versionado
- **APP_VERSION**: `v1.3.0` (versión de la aplicación)

### Variables de Entorno (opcional)
Crear archivo `.env`:
```
VITE_API_URL=https://api.ejemplo.com
VITE_BASE_PATH=/g360-order-form
VITE_APP_NAME=g360 Order Form
```

### Límites Conocidos
- Catálogo: ~5000 productos (optimizado con paginado)
- Búsqueda: 30 productos por página
- Exportación: Sin límite de productos

---

## 🔧 Solución de Problemas

### Problemas Comunes

| Problema | Causa Posible | Solución |
|----------|---------------|----------|
| No carga el catálogo | Error de red | Recargar la página |
| Stock no se sincroniza | Problema de red o repo | Verificar conexión y permisos |
| Exportación falla | RUC inválido o sin productos | Verificar datos completos |
| Pérdida de pedido | Limpieza de navegador | Recuperar desde Excel exportado |
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
**Asistencia de código**: Kilo Code - Coding Assistant  
**Última actualización**: 2026-03-25

---

## 📄 Licencia

Proyecto privado - Uso exclusivo para fuerza de ventas.

---

**Versión**: 2.1  
**Estado**: ✅ Estable y listo para producción
