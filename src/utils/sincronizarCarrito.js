/**
 * sincronizarCarrito.js
 * Reconcilia el carrito contra el catálogo fresco (Stock API).
 * Regla: el dato del servidor SIEMPRE gana para los campos de catálogo
 * (precio referencial, box, nombre, línea, peso, EAN). Se conserva cantidad,
 * orden de ingreso y cualquier SKU que ya no exista en el catálogo.
 * Devuelve la MISMA referencia si no hay cambios (evita re-renders y escrituras
 * innecesarias a localStorage).
 */

// Campos numéricos: solo se sobreescriben si el valor fresco es > 0
const CAMPOS_NUMERICOS = ['precioLista', 'bxSize', 'pesoUm'];
// Campos de texto: solo se sobreescriben si el valor fresco es verdadero
const CAMPOS_TEXTO = ['nombre', 'linea', 'ean'];

export function sincronizarCarritoConCatalogo(carrito, items) {
  if (!carrito || !items || !items.length) return carrito;
  const catalogo = new Map(items.map(p => [String(p.codigo), p]));

  let changed = false;
  const next = {};
  for (const [codigo, item] of Object.entries(carrito)) {
    const fresco = catalogo.get(String(codigo));
    if (!fresco) {
      next[codigo] = item;
      continue;
    }
    const actualizado = { ...item };
    let itemChanged = false;
    for (const campo of CAMPOS_NUMERICOS) {
      const valor = Number(fresco[campo]);
      if (valor > 0 && valor !== Number(actualizado[campo])) {
        actualizado[campo] = valor;
        itemChanged = true;
      }
    }
    for (const campo of CAMPOS_TEXTO) {
      const valor = fresco[campo];
      if (valor && valor !== actualizado[campo]) {
        actualizado[campo] = valor;
        itemChanged = true;
      }
    }
    next[codigo] = actualizado;
    if (itemChanged) changed = true;
  }
  return changed ? next : carrito;
}

export default sincronizarCarritoConCatalogo;
