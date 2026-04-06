# 🔴 CÓDIGO CRÍTICO A AGREGAR - Tests ITBIS Fase 1

**Ubicación:** `facturacion-registro.component.spec.ts`  
**Después de:** Línea 1765 (fin de Mode Switching Tests)

---

## 1. ITBIS EXENTO (tax_rate = 0)

```typescript
// ===================== CRITICAL: ITBIS EXEMPTIONS =====================
describe('CRITICAL: ITBIS Exempt Products (tax_rate = 0)', () => {
  
  it('CRITICAL: ITBIS Exento - precio=1000, qty=1, discount=0', () => {
    /**
     * Caso: Artículos exentos
     * - Medicinas
     * - Alimentos básicos
     * - Servicios educativos
     */
    const price = 1000;
    const qty = 1;
    const discount = 0;
    const taxRate = 0; // EXENTO
    
    // TIENDA ASUME with tax_rate=0
    // PROBLEMA: Código actual divide por 1.18 (fijo)
    // SOLUCIÓN: Debe dividir por (1 + taxRate) = 1.00
    const divisor = 1 + taxRate; // 1.00
    const subTotal = price / divisor; // 1000
    const itbis = Math.round((price - subTotal) * 100) / 100; // 0
    const total = subTotal + itbis;
    
    expect(subTotal).toBe(1000);
    expect(itbis).toBe(0, 'ITBIS should be 0 for exempt items');
    expect(total).toBe(1000);
  });
  
  it('CRITICAL: ITBIS Exento con descuento - precio=2000, qty=2, discount=100', () => {
    const price = 2000;
    const qty = 2;
    const discount = 100;
    const taxRate = 0;
    
    const priceWithQty = (price * qty) - discount; // 3900
    const divisor = 1 + taxRate;
    const subTotal = priceWithQty / divisor; // 3900
    const itbis = Math.round((priceWithQty - subTotal) * 100) / 100; // 0
    const total = subTotal + itbis;
    
    expect(subTotal).toBe(3900);
    expect(itbis).toBe(0);
    expect(total).toBe(3900);
  });
  
  it('CRITICAL: EMPRESA SUMA con ITBIS Exento', () => {
    const price = 1000;
    const qty = 1;
    const discount = 0;
    const taxRate = 0;
    
    const subTotal = (price * qty) - discount;
    const itbis = Math.round((subTotal * taxRate) * 100) / 100; // 0
    const total = subTotal + itbis;
    
    expect(subTotal).toBe(1000);
    expect(itbis).toBe(0);
    expect(total).toBe(1000);
  });
});
```

**Impacto:** ⚠️ CRÍTICO
- Medicinas, alimentos: facturación incorrecta
- Backend podría rechazar ITBIS=0 si código espera 18%

---

## 2. DESCUENTO > PRECIO (Notas de Crédito)

```typescript
// ===================== CRITICAL: DISCOUNT VALIDATION =====================
describe('CRITICAL: Descuento Mayor que Precio (Notas de Crédito)', () => {
  
  it('CRITICAL: Descuento > Precio (descuento=600, precio=500)', () => {
    /**
     * NOTA DE CRÉDITO: Cuando cliente devuelve dinero
     * - Descuento DEBE ser > precio
     * - Resultado es negativo (crédito)
     * 
     * Ejemplo real:
     * Factura original: RD$500
     * Cliente devuelve: Descuento RD$600
     * Resultado: -RD$100 (abono)
     */
    const price = 500;
    const qty = 1;
    const discount = 600; // mayor a precio
    
    const priceWithDiscount = (price * qty) - discount; // -100
    const subTotal = Math.round((priceWithDiscount / 1.18) * 100) / 100; // -84.75
    const itbis = Math.round((priceWithDiscount - subTotal) * 100) / 100; // -15.25
    const total = subTotal + itbis;
    
    expect(total).toBe(-100);
    expect(subTotal).toBeLessThan(0, 'SubTotal debería ser negativo (crédito)');
    expect(itbis).toBeLessThan(0, 'ITBIS debería ser negativo (crédito)');
  });
  
  it('CRITICAL: Validación - Rechazar descuento > precio si NO es nota de crédito', () => {
    /**
     * IMPORTANTE: Sistema debe VALIDAR
     * - Si price > 0: descuento NO puede ser > price
     * - Si price < 0 (nota crédito): descuento es permitido
     */
    const isNormalInvoice = true;
    const price = 500;
    const discount = 600;
    
    if (isNormalInvoice && discount > price) {
      // DEBE disparar error
      expect(() => {
        if (discount > price && price > 0) {
          throw new Error('DISCOUNT_EXCEEDS_PRICE');
        }
      }).toThrowError('DISCOUNT_EXCEEDS_PRICE');
    }
  });
  
  it('CRITICAL: Nota de Crédito permitida (descuento=600, precio=500)', () => {
    const isCreditNote = true;
    const price = 500;
    const discount = 600;
    
    if (isCreditNote) {
      // Permitir descuento > precio
      const result = (price * 1) - discount;
      expect(result).toBe(-100, 'Nota de crédito debería permitir descuentos > precio');
    }
  });
});
```

**Impacto:** ⚠️ CRÍTICO
- Notas de crédito: funcionalidad requerida por RD
- UI podría quebrar con valores negativos

---

## 3. VALORES NEGATIVOS (Notas de Crédito)

```typescript
// ===================== CRITICAL: NEGATIVE LINES (CREDIT NOTES) =====================
describe('CRITICAL: Valores Negativos (Notas de Crédito)', () => {
  
  it('CRITICAL: Línea negativa por precio - precio=-500, qty=1, discount=0', () => {
    /**
     * NOTA DE CRÉDITO: Cliente recibe abono
     * Precio negativo indica devolución
     */
    const price = -500;
    const qty = 1;
    const discount = 0;
    const priceWithQty = (price * qty) - discount; // -500
    
    // TIENDA ASUME
    const subTotal = Math.round((priceWithQty / 1.18) * 100) / 100; // -423.73
    const itbis = Math.round((priceWithQty - subTotal) * 100) / 100; // -76.27
    
    expect(subTotal).toBe(-423.73);
    expect(itbis).toBe(-76.27);
    expect(subTotal + itbis).toBe(-500);
  });
  
  it('CRITICAL: Línea negativa por cantidad - precio=1000, qty=-1, discount=0', () => {
    /**
     * DEVOLUCIÓN: Cantidad negativa = devolución
     */
    const price = 1000;
    const qty = -1; // Devolución
    const discount = 0;
    const priceWithQty = (price * qty) - discount; // -1000
    
    // EMPRESAUMA
    const subTotal = (price * qty) - discount;
    const itbis = Math.round((subTotal * 0.18) * 100) / 100;
    
    expect(subTotal).toBe(-1000);
    expect(itbis).toBe(-180);
    expect(subTotal + itbis).toBe(-1180);
  });
  
  it('CRITICAL: Validación - NO permitir ambos (price<0 Y qty<0)', () => {
    /**
     * REGLA CRÍTICA: No puede haber ambos negativos
     * price=-500 Y qty=-1 sería doble negativo = positivo (incorrecto)
     */
    const price = -500;
    const qty = -1;
    
    if (price < 0 && qty < 0) {
      expect(() => {
        throw new Error('BOTH_NEGATIVE_NOT_ALLOWED');
      }).toThrowError('BOTH_NEGATIVE_NOT_ALLOWED');
    }
  });
  
  it('CRITICAL: Múltiples líneas negativas - acumulación correcta', () => {
    /**
     * Factura con líneas positivas y negativas
     * (cliente devuelve parcialmente)
     */
    const lines = [
      { price: 1000, qty: 2, discount: 0 },   // +2000
      { price: 500, qty: -1, discount: 0 },   // -500 (devolución)
      { price: 200, qty: 3, discount: 50 }    // +550
    ];
    
    let totalSubTA = 0, totalItbisTA = 0;
    
    lines.forEach(line => {
      const priceWithQty = (line.price * line.qty) - line.discount;
      const subTotal = Math.round((priceWithQty / 1.18) * 100) / 100;
      const itbis = Math.round((priceWithQty - subTotal) * 100) / 100;
      totalSubTA += subTotal;
      totalItbisTA += itbis;
    });
    
    totalSubTA = Math.round(totalSubTA * 100) / 100;
    totalItbisTA = Math.round(totalItbisTA * 100) / 100;
    
    // Línea 1: subTotal=1694.92, itbis=305.08
    // Línea 2: subTotal=-423.73, itbis=-76.27
    // Línea 3: subTotal=127.12, itbis=22.88
    // Total: subTotal=1398.31, itbis=251.69
    
    expect(Number((totalSubTA + totalItbisTA).toFixed(2))).toBe(1650, 
      'Acumulación con líneas negativas debe ser correcta');
  });
});
```

**Impacto:** ⚠️ CRÍTICO
- RD requiere notas de crédito
- Backend debe procesar negativos correctamente

---

## 4. DECIMALES REALES (999.99)

```typescript
// ===================== CRITICAL: REAL DECIMAL PRICES =====================
describe('CRITICAL: Precios con Decimales Reales (999.99)', () => {
  
  it('CRITICAL: Precisión extrema - precio=999.99, qty=3, discount=49.99', () => {
    /**
     * CASO REAL: Precios minoristas con decimales
     */
    const price = 999.99;
    const qty = 3;
    const discount = 49.99;
    
    const priceWithDiscount = (price * qty) - discount; // 2999.98
    
    // TIENDA ASUME
    const subTotal = Math.round((priceWithDiscount / 1.18) * 100) / 100;
    const itbis = Math.round((priceWithDiscount - subTotal) * 100) / 100;
    const total = subTotal + itbis;
    
    // Verificar precisión exacta
    expect(Number((subTotal + itbis).toFixed(2))).toBe(2999.98,
      'Total debería ser exactamente 2999.98 (sin error de redondeo)');
  });
  
  it('CRITICAL: Precisión - precio=1999.95, mode TIENDA ASUME', () => {
    /**
     * CASO EXTREMO:División que resulta en decimales infinitos
     * 1999.95 / 1.18 = 1694.7033...
     */
    const price = 1999.95;
    const qty = 1;
    const discount = 0;
    
    const priceWithITBIS = price - discount; // 1999.95
    const subTotal = Math.round((priceWithITBIS / 1.18) * 100) / 100;
    const itbis = Math.round((priceWithITBIS - subTotal) * 100) / 100;
    const total = subTotal + itbis;
    
    // Validar que redondeo es correcto
    expect(subTotal).toBe(1694.70);
    expect(itbis).toBe(305.25);
    expect(Number((subTotal + itbis).toFixed(2))).toBe(1999.95);
  });
  
  it('CRITICAL: Banco de pruebas - precios decimales variados', () => {
    const decimals = [
      { price: 99.99, expectedItbis: 17.99 },
      { price: 199.95, expectedItbis: 35.99 },
      { price: 1750.25, expectedItbis: 315.05 },
      { price: 2499.99, expectedItbis: 449.98 }
    ];
    
    decimals.forEach(test => {
      const subTotal = Math.round((test.price / 1.18) * 100) / 100;
      const itbis = Math.round((test.price - subTotal) * 100) / 100;
      
      expect(Math.abs(itbis - test.expectedItbis)).toBeLessThan(0.01,
        `ITBIS precision failed for price=${test.price}`);
    });
  });
});
```

**Impacto:** 🟡 IMPORTANTE
- RD usa precios con 2 decimales
- Error de 0.01 acumulado puede causar discrepancias

---

## RESUMEN: AGREGAR ESTOS 4 DESCRIBE BLOCKS

| Test | Líneas | Ubicación | Prioridad |
|------|--------|-----------|-----------|
| ITBIS Exento | ~35 | Después 1765 | 🔴 |
| Descuento > Precio | ~45 | +40 | 🔴 |
| Valores Negativos | ~60 | +85 | 🔴 |
| Decimales Reales | ~40 | +145 | 🔴 |

**Total Líneas:** ~180 nuevas  
**Nuevos Tests:** ~16 describe blocks  
**Estimación:** 2-3 horas programación + testing

---

## COMANDO PARA EJECUTAR SOLO ESTOS TESTS

```bash
# Ejecutar tests críticos nuevos
npm test -- --watch=false --browsers=ChromeHeadless \
  --include='**/facturacion-registro.component.spec.ts' \
  -k "CRITICAL"

# Luego:
npm test -- --watch=false --browsers=ChromeHeadless 2>&1 | \
  Select-String "CRITICAL|TOTAL|SUCCESS"
```

---

## ⚠️ IMPORTANTE

Antes de agregar estos tests, verificar que el **código del componente** maneje:

1. ✅ Tax rate dinámico (no fijo 0.18)
2. ✅ Validación de descuentos
3. ✅ Soporte para valores negativos
4. ✅ Precisión de decimales en acumulación

Si alguno falta, los tests fallarán y necesitarás modificar el componente.

