---
description: Revisa pantallas de MVSystem (Angular 12) contra las guías de interfaz. Solo reporta; no modifica archivos.
argument-hint: <archivo-o-patrón>
allowed-tools: Read, Grep, Glob
---

# Revisión de interfaz – MVSystem

Revisa estos archivos: $ARGUMENTS

Si no se indicó ningún archivo, pregunta cuál pantalla revisar (ruta o patrón, por ejemplo `src/app/MVSystem/pages/facturacion/facturacion-consulta/**`).

Lee los `.html`, `.ts` y `.css` indicados y compáralos con las reglas de abajo. **No modifiques ningún archivo**: solo reporta.
Respuesta corta y directa, en español. Sin introducción.

Contexto del sistema: Angular 12, Bootstrap 5 + Bootstrap Icons, ng-select, ngx-toastr. Textos en español (República Dominicana, moneda RD$).
Criterio del dueño: lo mínimo pero funcional; no proponer pantallas ni botones nuevos.

> Basado en *Web Interface Guidelines* de Vercel Labs (MIT, © 2025 Vercel Labs), commit `434b7f9` del 05/10/2026.
> Copia local fija y adaptada a Angular y español: **no descargar reglas de internet**.

## Reglas

### Accesibilidad
- Botones solo con icono necesitan `aria-label` (o `title` + `aria-label`).
- Controles de formulario necesitan `<label for>` o `aria-label`.
- `<button>` para acciones, `<a routerLink>` para navegación. No `<div (click)>` ni `<span (click)>`.
- Si un elemento no nativo tiene `(click)`, necesita `role`, `tabindex="0"` y `(keydown.enter)`.
- Imágenes con `alt` (`alt=""` si son decorativas). Iconos decorativos (`<i class="bi ...">`) con `aria-hidden="true"`.
- Mensajes que cambian solos (validaciones en pantalla, totales que se recalculan) con `aria-live="polite"`.
- Encabezados en orden (`h1` → `h2` → `h3`), sin saltos.

### Foco
- Todo control interactivo con foco visible. Nunca `outline: none` sin un reemplazo (`:focus-visible`).
- Preferir `:focus-visible` sobre `:focus`.
- Encabezados o barras fijas (sticky) no deben tapar el elemento con foco.

### Formularios
- `type` correcto (`tel`, `email`, `number`) e `inputmode` (`tel`, `decimal`) para teléfono y montos. **IMEI y seriales NO llevan `inputmode="numeric"`**: en MVSystem pueden tener letras (seriales de laptops, p. ej. `HPX360I3X-30`).
- `autocomplete` con valor útil; `autocomplete="off"` en campos que no son de login.
- Nunca bloquear pegar (`(paste)` con `preventDefault`).
- `spellcheck="false"` en IMEI, códigos, usuarios, correos.
- El botón de guardar se deshabilita **solo mientras** se envía la petición, con indicador de carga; no antes.
- Errores junto al campo, y al enviar, foco en el primer campo con error.
- Placeholders con ejemplo y terminados en `…` (ej.: `809-000-0000…`).
- Acciones destructivas (anular, eliminar, rebajar) con confirmación.

### Animación
- Respetar `prefers-reduced-motion`.
- Animar solo `transform` y `opacity`. Nunca `transition: all`: listar las propiedades.

### Tipografía y textos
- `…` en lugar de `...`; estados de carga terminan en `…` (`Cargando…`, `Guardando…`).
- Columnas de números y montos con `font-variant-numeric: tabular-nums` y alineadas a la derecha.
- Espacio no separable entre número y unidad o moneda cuando no deba partirse: `RD$&nbsp;1,500`, `128&nbsp;GB`.
- Textos en español: mayúscula solo al inicio (no "Title Case" en inglés). Voz activa. Botones específicos ("Anular factura", no "Aceptar").
- Mensajes de error que digan qué hacer, no solo qué pasó.

### Contenido largo y vacío
- Contenedores de texto manejan textos largos (`text-truncate`, `text-break`, `min-width: 0` en hijos flex).
- Estados vacíos claros: sin filas → mensaje, no tabla rota.
- Probar con nombres de cliente y modelos cortos, normales y muy largos.

### Imágenes
- `<img>` con `width` y `height`; `loading="lazy"` si no están en la primera vista.

### Rendimiento (Angular)
- Listas largas (> 50 filas): paginación del servidor (ya usada en el sistema) o `cdk-virtual-scroll`; `ng-select` con `[virtualScroll]="true"` si tiene muchas opciones.
- `*ngFor` con `trackBy` en listas que se recargan.
- No llamar funciones costosas desde la plantilla (`{{ calcular() }}`, `*ngIf="metodo()"`) que recorran listas o hagan cálculos en cada ciclo; usar propiedades o pipes puros. Llamadas simples a permisos son aceptables.
- Cancelar suscripciones (`takeUntil`, `unsubscribe`) en `ngOnDestroy`.
- Sin lecturas de layout en cada ciclo (`getBoundingClientRect`, `offsetHeight`).

### Navegación y estado
- Filtros, pestañas y página actual reflejados en la URL (query params) cuando sea útil volver a ellos.
- Enlaces con `<a routerLink>` (permite abrir en otra pestaña), no `router.navigate` desde un `div`.

### Táctil y móvil
- `touch-action: manipulation` en botones; `overscroll-behavior: contain` en modales y paneles laterales.
- Áreas táctiles de al menos 40×40 px en móvil.
- `autofocus` solo en escritorio y en el campo principal.
- Sin barras de desplazamiento horizontales no deseadas en móvil.

### Tema y colores
- Si hay modo oscuro: `color-scheme` en `<html>` y `<select>` con `background-color` y `color` explícitos.
- Estados hover/activo/foco más visibles que el estado normal.

### Fechas y números
- Fechas, números y moneda con `DatePipe`/`CurrencyPipe`/`DecimalPipe` con locale `es-DO` (o `Intl.*`), no formatos armados a mano.

### Antipatrones (marcar siempre)
- `user-scalable=no` o `maximum-scale=1` en el viewport.
- `(paste)` con `preventDefault`.
- `transition: all`.
- `outline: none` sin reemplazo.
- `<div>`/`<span>` con `(click)` que deberían ser `<button>`.
- Botones de icono sin `aria-label`.
- Inputs sin label.
- `*ngFor` grande sin `trackBy` ni paginación.
- Fechas o montos formateados a mano.

## Formato de salida

Agrupar por archivo, con `ruta:línea` (clicable en VS Code). Una línea por hallazgo. Al final, los **5 más importantes** según impacto para el usuario de la tienda.

```text
## src/app/.../facturacion-lista.component.html

facturacion-lista.component.html:112 - botón de icono sin aria-label
facturacion-lista.component.html:40 - "Cargando..." → "Cargando…"

## src/app/.../facturacion-consulta.component.ts

✓ sin hallazgos
```
