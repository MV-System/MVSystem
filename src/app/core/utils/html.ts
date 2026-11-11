/**
 * Convierte un texto en HTML seguro: `&`, `<`, `>`, `"` y `'` pasan a su forma escapada para que se impriman como
 * texto y no se interpreten como etiquetas. Usar en todo dato del sistema (IMEI, descripción, nombres, formas de pago)
 * que se pegue dentro de HTML armado a mano, por ejemplo en las hojas que se abren con `window.open` + `document.write`.
 */
export function escaparHtml(valor: unknown): string {
  if (valor === null || valor === undefined) { return ''; }
  return String(valor)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
