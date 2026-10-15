---
deck: CIPSA OrderX v3.0.0 - Manual de presentacion para fuerza de ventas
audience: Fuerza de ventas CIPSA (vendedores y asistentes). Conoce la empresa, aun no ha usado OrderX.
register: read
structure: ink-open paper evidence ink-close
motif: the same deep-ink band carrying the CIPSA CP isotipo on the right edge, and slate-900 section dividers numbered '01..'
---

## Slide 1
layout: title
Brief: El capuchon de portada evoca el CP rojo de CIPSA sobre una portada ink. Un badge institucional de venta CIPSA. Titulo + subtitulo con el version.
Title: CIPSA OrderX
Subtitle: Tienda virtual de pedidos para la fuerza de ventas - v3.0.0

## Slide 2
layout: statement
Brief: Un solo claim sagrero para el conductor de la palma: una oracion que dice por que esta herramienta importa. Grande, centrado, ink.
Statement: De la fuerza de ventas a la hoja de pedido en 5 pasos, sin salir del navegador.

## Slide 3
layout: composed
Brief: Panorama del flujo principal como proceso lineal de 5 pasos - un proceso earned, no chevron-ribbon. Lead: el prompt de resultado final.
Title: El flujo completo
Block: process
- Cargar cliente (chip en el header)
- Revisar stock del almacan VES
- Buscar y seleccionar productos
- Carrito y confirmacion
- Generar hoja de pedido (Excel)
Notes: Recorre los 5 pasos en orden. Cada tarjeta de producto muestra un semaforo de stock.

## Slide 4
layout: two-column
Brief: Contraste que resuelve - lo viejo vs lo nuevo, estilo comparacion, sin tabla aburrida. Lead: la columna derecha (Tienda v3).
Title: De planilla a tienda
Left:
- Flor de datos estáticos (productos_local.json)
- descarga por PRs update/stock-*
- sin búsqueda de clientes viva
- un solo botón exportar
Right:
- catálogo y stock en vivo (API Render)
- sincronización con una tecla
- búsqueda de clientes por código, RUC o nombre (Supabase)
- PWA instalable en el móviles

## Slide 5
layout: section
Brief: Divisor muscular para la seccion de uso operativo. Ink band with number large.
Title: 01 - Cargar el cliente

## Slide 6
layout: composed
Brief: Chip en el header como hero, muestra: sin cliente cargado muestra el prompt 'Cargar cliente' en naranja. Lead: el chip. Anota que el cliente opciona legible.
Title: Paso 1 - Cargar cliente
Block: stat-row
- vacío | estado inicial (naranja)
- 1 | chance 'Cargar cliente' al cambiar el encabezamiento
- 3 | campos autocompletados (nombre, RUC, vendedor)
Notes: Tocar el chip abre el modal de busqueda (con micrófono). Buscar por código, RUC/DNI completo o inicio del nombre.

## Slide 7
layout: composed
Brief: Semaforo de stock como card-grid de 3 estados; cada color devuelve stock VES.
Title: Paso 2 - Revisar stock
Block: card-grid
- AGOTADO: gris, deshabilitado
- BAJO: ambar #d97706
- OK: verde #059669
- Tocar nombre: stock, cajas, box y precio
Notes: Disponible vs pronto por llegar. Almacén mostrado es VES (principal).

## Slide 8
layout: composed
Brief: Focus on search hierarchy: buscador global en el header + chips Viniball/Vinifan/Representadas. La búsqueda por voz y filtro por segmento son el diferenciador. Lead: el buscador.
Title: Paso 3 - Buscar y filtrar
Block: icon-list
- filter | Buscador global + micrófono (voz es-PE)
- data | Código, RUC completo o inicio del nombre
- global | Chips Viniball, Vinifan, Representadas, Búsqueda
- filter | Resultados paginados, 24 por página
Notes: Los chips afectan solo la línea de representer-vendedor; búsqueda libre muestra el universo completo (incl. descontinuados).

## Slide 9
layout: composed
Brief: Stepper + +1 Box; carrito como drawer flotante. Lead: el carrito.
Title: Paso 4 - Cantidad y carrito
Block: process
- Stepper +/- unidades
- Botón '+1 Box' (multiplica box size)
- 🛒 FAB con contador
- Drawer con totales y chip del cliente
Notes: Carrito se reconcilia con el catálogo fresco en cada sincronización (precio, box, nombre, línea, EAN). Las cantidades nunca se pierden.

## Slide 10
layout: composed
Brief: Export a Excel como el acto final: button Exportar Hoja de Pedido -> summary + generación xlsx. Lead: Exportar.
Title: Paso 5 - Hoja de pedido
Block: stat-row
- 5 | pasos de extremo a extremo
- Excel | exportación generada (xlsx)
- Email | alternativa por correo (mailto)
- 8 | columnas en la hoja final
Notes: Footer del Excel lleva 'powered by G360' e isotipo 3 puntos + chevron. Metadatos (Author=CCUSI, Company=G360).

## Slide 11
layout: two-column
Brief: Contraste que resuelve - datos vivos vs cacha. lExample piezas de arquitectura. Lead derecha: sincronizar.
Title: Datos y sincronización
Left:
- Stock + catálogo: API Render vivo
- Clientes/vendedores: Supabase PostgREST
- Autocache 3 capas, probe ?limit=1
- Badge frescura: verde/amarillo/rojo/offline
Right:
- 'Sincronizar' refresca todo
- Fuera de L-Sa 07-23 no polling
- Cold start Render: 30-90 s (reintento automático)
- Base solo se cachea en memoria

## Slide 12
layout: composed
Brief: Formas de llegada a la app: PWA, voz, responsive, dark. Lead: PWA.
Title: Adicionales v3
Block: icon-list
- check  | PWA instalable (manifest, theme #0f172a)
- chat  | Búsqueda por voz es-PE (Chrome)
- global  | Responsive móvil + desktop
- key    | Tema claro/oscuro
- next  | Rutas /catalogo y /orden

## Slide 13
layout: section
Brief: Divisor para créditos y soporte. Ink band numerado.
Title: 02 - Soporte y créditos

## Slide 14
layout: composed
Brief: Créditos + contacto + recursos (README, SQL pendiente). Lead: G360.
Title: Créditos
Block: icon-list
- bank   | CIPSA: base del ERP (stock, 482.791 filas)
- community  | Desarrollador: CCUSI (CCUSI)
- company   | Ecosistema g360-order-form over G360
- link   | Hoja de pedido/Excel: CCUSI / G360
Notes: Documentación en README.md del repo. Supabase 500 (57014) se corrige aplicando docs/SQL_INDICE_CLIENTES.md.

## Slide 15
layout: statement
Brief: Cierre sobre un claim motivador - accion del asistente de presentación. Lead: claim.
Statement: Practica mas tarde: carga un cliente, sincroniza el stock, genera una hoja de pedido.
Notes: Flujo de demo sugerido en vivo ~3 min. Cierre con preguntas.
