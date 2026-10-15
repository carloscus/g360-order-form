import * as XLSX from 'xlsx';
import { buildWorkbook, buildFileName } from './xlsxGenerator';

/**
 * Genera un archivo Excel como Blob para usarlo con Share API
 * (misma hoja que generateExcel: builder compartido, sin drift)
 * @param {Object} clientData - Datos del cliente
 * @param {Array} selectedProducts - Productos seleccionados
 * @returns {Promise<{blob: Blob, fileName: string}>} - El Blob del archivo Excel y su nombre sugerido
 */
export async function generateExcelBlob(clientData, selectedProducts) {
  if (!selectedProducts || selectedProducts.length === 0) {
    throw new Error('No hay productos seleccionados para exportar');
  }

  const wb = buildWorkbook(clientData, selectedProducts);
  const fileName = buildFileName(clientData);

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
 * Comparte por Email (descarga + abre cliente de email con instrucciones)
 */
export async function shareViaEmail(clientData, selectedProducts) {
  try {
    // Descargar el archivo automáticamente
    const downloadResult = await downloadExcel(clientData, selectedProducts);

    if (downloadResult.success) {
      const { unidades, monto } = selectedProducts.reduce(
        (acc, p) => ({ unidades: acc.unidades + (Number(p.cantidad) || 0), monto: acc.monto + (Number(p.precioLista) || 0) * (Number(p.cantidad) || 0) }),
        { unidades: 0, monto: 0 }
      );
      // Mostrar alerta con instrucciones
      alert(`✅ Archivo Excel descargado: ${downloadResult.fileName}\n\n📧 Abra su cliente de email y:\n1. Cree un nuevo mensaje\n2. Haga clic en adjuntar/archivar\n3. Busque el archivo en Descargas\n4. Complete destinatario y envíe`);

      // Abrir cliente de email con datos básicos
      const subject = encodeURIComponent(`Pedido CIPSA - ${clientData.nombre || 'Cliente'}`);
      const body = encodeURIComponent(
        `Adjunto detalle del pedido CIPSA.\n\n` +
        `Cliente: ${clientData.nombre || 'No especificado'}\n` +
        `RUC: ${clientData.ruc || 'No especificado'}\n` +
        `OC: ${clientData.oc || 'No especificado'}\n` +
        `Provincia: ${clientData.provincia || 'No especificado'}\n` +
        `Productos: ${selectedProducts.length} · Unidades: ${unidades}\n` +
        `Total referencial: S/ ${monto.toFixed(2)}\n\n` +
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
