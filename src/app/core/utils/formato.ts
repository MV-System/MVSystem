/**
 * Formato único de montos y números para todo el sistema (español de República Dominicana, moneda RD$).
 * Usar estas funciones en el código TypeScript en lugar de armar el texto a mano con `toFixed`, `toLocaleString`
 * o un `$` escrito; en las plantillas usar los pipes `currency` y `number`.
 */

const SIN_VALOR = '—';
const LOCALE = 'es-DO';

function aNumero(valor: number | string | null | undefined): number | null {
  if (valor === null || valor === undefined || valor === '') { return null; }
  const numero = typeof valor === 'string' ? Number(valor) : valor;
  return Number.isFinite(numero) ? numero : null;
}

/** Monto en pesos dominicanos: `RD$1,500.00`. Sin valor (null, vacío, NaN) devuelve `—`. */
export function formatearMonto(valor: number | string | null | undefined, decimales: number = 2): string {
  const numero = aNumero(valor);
  if (numero === null) { return SIN_VALOR; }
  return new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency: 'DOP',
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales
  }).format(numero);
}

/**
 * Número con separador de miles: `1,500`. Sin `decimales` usa el formato por defecto del locale
 * (hasta 3 decimales). Sin valor devuelve `—`.
 */
export function formatearNumero(valor: number | string | null | undefined, decimales?: number): string {
  const numero = aNumero(valor);
  if (numero === null) { return SIN_VALOR; }
  return decimales === undefined
    ? numero.toLocaleString(LOCALE)
    : numero.toLocaleString(LOCALE, { minimumFractionDigits: decimales, maximumFractionDigits: decimales });
}

/** Porcentaje: `12.5%`. Sin valor devuelve `—`. */
export function formatearPorcentaje(valor: number | string | null | undefined, decimales: number = 1): string {
  const numero = aNumero(valor);
  if (numero === null) { return SIN_VALOR; }
  return `${formatearNumero(numero, decimales)}%`;
}
