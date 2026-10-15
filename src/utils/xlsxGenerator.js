import * as XLSX from 'xlsx';
import stockApi from '../services/stockApi.js';

/**
 * Generador de la Hoja de Pedido (Excel)
 * Contrato de columnas (fila 1, intocable para el proceso downstream):
 *   A RUC | B OC | C SKU | D CANTIDAD | E PRECIO | F OBSERVACIONES | G ID_CLIENTE | H VENDEDOR
 * Al final se agregan filas de resumen (sin SKU, el importador las omite):
 *   unidades totales, cajas, total referencial, nota y fecha de generación.
 */

export const PEDIDO_HEADERS = [
  'RUC',
  'OC',
  'SKU',
  'CANTIDAD',
  'PRECIO',
  'OBSERVACIONES',
  'ID_CLIENTE',
  'VENDEDOR'
];

/**
 * Filas de productos (8 columnas, formato del contrato)
 */
export function buildProductRows(clientData, selectedProducts) {
  return selectedProducts.map(product => [
    clientData.ruc || '',                       // A: RUC (se repite)
    clientData.oc || '',                        // B: OC (se repite)
    product.codigo,                             // C: SKU
    Number(product.cantidad).toFixed(2),        // D: Cantidad con 2 decimales
    Number(product.precioLista).toFixed(2),     // E: Precio con 2 decimales
    product.observacion || '',                  // F: Observaciones
    clientData.id_cliente || '',                // G: ID Cliente (canónico)
    clientData.vendedor || ''                   // H: Vendedor
  ]);
}

/**
 * Totales del pedido
 */
export function calcularTotales(selectedProducts) {
  return selectedProducts.reduce(
    (acc, p) => {
      acc.unidades += Number(p.cantidad) || 0;
      acc.cajas += Math.ceil((Number(p.cantidad) || 0) / Math.max(1, Number(p.bxSize) || 1));
      acc.monto += (Number(p.precioLista) || 0) * (Number(p.cantidad) || 0);
      return acc;
    },
    { unidades: 0, cajas: 0, monto: 0 }
  );
}

/**
 * Filas de resumen al pie (sin SKU → el importador las saltea)
 * Signature G360: isotipo = 3 puntos verticales paralelos (⋮) + chevron (>)
 */
export function buildResumenRows(selectedProducts) {
  const { unidades, cajas, monto } = calcularTotales(selectedProducts);
  const ahora = new Date();
  const fecha = ahora.toLocaleString('es-PE', { timeZone: 'America/Lima' });
  // Trazabilidad de frescura: qué vintage de datos generó esta hoja
  const st = stockApi.getState?.() || {};
  const datosLinea = st.fechaDescarga
    ? `Datos del catálogo: ${st.fechaDescarga}`
    : `Datos del catálogo: base local${st.fuente === 'base' ? ' (sin sincronizar)' : ''}`;
  return [
    [],
    ['', '', '', '', '', `UNIDADES TOTALES: ${unidades} · CAJAS: ${cajas}`],
    ['', '', '', '', '', `TOTAL REFERENCIAL: S/ ${monto.toFixed(2)}`],
    ['', '', '', '', '', 'NOTA: Precios referenciales sin descuentos ni IGV. Sujeto a cotización final.'],
    ['', '', '', '', '', datosLinea],
    ['', '', '', '', '', `Generado: ${fecha} · CIPSA OrderX`],
    ['', '', '', '', '', '⋮> powered by G360']
  ];
}

/**
 * Nombre de archivo estándar: OC_(ruc)_(provincia)_(oc_o_fecha).xlsx
 */
export function buildFileName(clientData) {
  const now = new Date();
  const dateStr = `${String(now.getDate()).padStart(2, '0')}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getFullYear()).slice(-2)}`;
  const provincia = (clientData.provincia || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const ruc = clientData.ruc || 'sin_ruc';
  const ocOrFecha = clientData.oc || dateStr;
  return `OC_${ruc}_${provincia || 'sin_sucursal'}_${ocOrFecha}.xlsx`;
}

/**
 * Genera el workbook de la Hoja de Pedido (sin descargarlo)
 */
export function buildWorkbook(clientData, selectedProducts) {
  const wb = XLSX.utils.book_new();
  // Metadatos del archivo (Propiedades del documento en Excel)
  wb.Props = {
    Title: `Hoja de Pedido${clientData.nombre ? ' - ' + clientData.nombre : ''}`,
    Subject: 'Pedido CIPSA',
    Author: 'CCUSI',
    Company: 'G360',
    LastModifiedBy: 'CIPSA OrderX',
    CreatedDate: new Date()
  };
  const data = [
    PEDIDO_HEADERS,
    ...buildProductRows(clientData, selectedProducts),
    ...buildResumenRows(selectedProducts)
  ];
  const ws = XLSX.utils.aoa_to_sheet(data);
  ws['!cols'] = [
    { wch: 15 },  // A: RUC
    { wch: 12 },  // B: OC
    { wch: 12 },  // C: SKU
    { wch: 12 },  // D: CANTIDAD
    { wch: 12 },  // E: PRECIO
    { wch: 55 },  // F: OBSERVACIONES / resumen
    { wch: 12 },  // G: ID_CLIENTE
    { wch: 24 },  // H: VENDEDOR
  ];
  const sheetName = clientData.provincia ? clientData.provincia.substring(0, 30) : 'Hoja Pedido';
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  return wb;
}

/**
 * Genera y descarga el archivo Excel de la Hoja de Pedido
 */
export function generateExcel(clientData, selectedProducts) {
  if (!selectedProducts || selectedProducts.length === 0) {
    alert('No hay productos seleccionados para exportar');
    return;
  }
  const wb = buildWorkbook(clientData, selectedProducts);
  XLSX.writeFile(wb, buildFileName(clientData));
}

export default generateExcel;
