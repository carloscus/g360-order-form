import * as XLSX from 'xlsx';
import { getFechaCompacta } from './formatters';

/**
 * Genera un archivo Excel como Blob para usarlo con Share API
 * @param {Object} clientData - Datos del cliente
 * @param {Array} selectedProducts - Productos seleccionados
 * @returns {Promise<{blob: Blob, fileName: string}>} - El Blob del archivo Excel y su nombre sugerido
 */
export async function generateExcelBlob(clientData, selectedProducts) {
  if (!selectedProducts || selectedProducts.length === 0) {
    throw new Error('No hay productos seleccionados para exportar');
  }

  const wb = XLSX.utils.book_new();

  const headers = ['RUC', 'OC', 'SKU', 'CANTIDAD', 'PRECIO', 'OBSERVACIONES'];

  const productRows = selectedProducts.map(product => [
    clientData.ruc || '',
    clientData.oc || '',
    product.codigo,
    Number(product.cantidad).toFixed(2),
    Number(product.precioLista).toFixed(2),
    product.observacion || ''
  ]);

  // Agregar nota de precios referenciales
  const disclaimerRow = ['', '', '', '', '', 'NOTA: Precios referenciales sin descuentos ni IGV. Sujeto a cotización final.'];

  const data = [headers, ...productRows, [], disclaimerRow];
  const ws = XLSX.utils.aoa_to_sheet(data);

  ws['!cols'] = [
    { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 50 },
  ];

  const sheetName = clientData.provincia ? clientData.provincia.substring(0, 30) : 'Hoja Pedido';
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  const now = new Date();
  const dateStr = `${String(now.getDate()).padStart(2, '0')}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getFullYear()).slice(-2)}`;
  
  const provincia = (clientData.provincia || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const ruc = clientData.ruc || 'sin_ruc';
  const ocOrFecha = clientData.oc || dateStr;
  const fileName = `OC_${ruc}_${provincia || 'sin_sucursal'}_${ocOrFecha}.xlsx`;

  // Generar el archivo como ArrayBuffer
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

  return { blob, fileName };
}

/**
 * Descarga el Excel automáticamente
 */
export async function downloadExcel(clientData, selectedProducts) {
  try {
    const { blob, fileName } = await generateExcelBlob(clientData, selectedProducts);

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    return { success: true, method: 'download', fileName };
  } catch (error) {
    throw new Error('Error al descargar Excel: ' + error.message);
  }
}

/**
 * Comparte el Excel usando la Web Share API nativa (Móviles Android/iOS o PC compatibles)
 */
export async function shareExcel(clientData, selectedProducts) {
  try {
    const { blob, fileName } = await generateExcelBlob(clientData, selectedProducts);

    // Crear objeto File desde el Blob
    const file = new File([blob], fileName, { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    // Verificar soporte de la API Share con archivos
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: `Pedido CIPSA - ${clientData.nombre || 'Cliente'}`,
        text: `Adjunto detalle del pedido para procesar.`
      });
      return { success: true, method: 'native_share' };
    } else {
      // Fallback: Lanzar error para que se maneje arriba
      throw new Error('Web Share API no soportada');
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      return { success: false, method: 'cancelled' };
    }
    throw error;
  }
}

/**
 * Comparte por WhatsApp (descarga + abre WhatsApp con instrucciones)
 */
export async function shareViaWhatsApp(clientData, selectedProducts) {
  try {
    // Descargar el archivo automáticamente
    const downloadResult = await downloadExcel(clientData, selectedProducts);

    if (downloadResult.success) {
      // Mostrar alerta con instrucciones
      alert(`✅ Archivo Excel descargado: ${downloadResult.fileName}\n\n📱 Abra WhatsApp y:\n1. Seleccione el contacto\n2. Haga clic en adjuntar (📎)\n3. Busque el archivo en Descargas\n4. Envío el mensaje`);

      // Abrir WhatsApp con mensaje básico
      const message = encodeURIComponent(
        `📋 *PEDIDO CIPSA*\n\n` +
        `Cliente: ${clientData.nombre || 'No especificado'}\n` +
        `RUC: ${clientData.ruc || 'No especificado'}\n` +
        `OC: ${clientData.oc || 'No especificado'}\n\n` +
        `Adjunto archivo Excel con detalle del pedido.`
      );

      const whatsappUrl = `https://wa.me/?text=${message}`;
      window.open(whatsappUrl, '_blank');

      return { success: true, method: 'whatsapp' };
    }
  } catch (error) {
    throw new Error('Error al preparar archivo para WhatsApp: ' + error.message);
  }
}

/**
 * Comparte por Email (descarga + abre cliente de email con instrucciones)
 */
export async function shareViaEmail(clientData, selectedProducts) {
  try {
    // Descargar el archivo automáticamente
    const downloadResult = await downloadExcel(clientData, selectedProducts);

    if (downloadResult.success) {
      // Mostrar alerta con instrucciones
      alert(`✅ Archivo Excel descargado: ${downloadResult.fileName}\n\n📧 Abra su cliente de email y:\n1. Cree un nuevo mensaje\n2. Haga clic en adjuntar/archivar\n3. Busque el archivo en Descargas\n4. Complete destinatario y envíe`);

      // Abrir cliente de email con datos básicos
      const subject = encodeURIComponent(`Pedido CIPSA - ${clientData.nombre || 'Cliente'}`);
      const body = encodeURIComponent(
        `Adjunto detalle del pedido CIPSA.\n\n` +
        `Cliente: ${clientData.nombre || 'No especificado'}\n` +
        `RUC: ${clientData.ruc || 'No especificado'}\n` +
        `OC: ${clientData.oc || 'No especificado'}\n` +
        `Provincia: ${clientData.provincia || 'No especificado'}\n\n` +
        `Archivo Excel generado automáticamente.`
      );

      const emailUrl = `mailto:?subject=${subject}&body=${body}`;
      window.open(emailUrl, '_blank');

      return { success: true, method: 'email' };
    }
  } catch (error) {
    throw new Error('Error al preparar archivo para Email: ' + error.message);
  }
}
