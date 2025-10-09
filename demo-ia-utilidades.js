/**
 * DEMOSTRACIÓN INTERACTIVA - Cómo Funciona el Sistema de IA
 *
 * Ejecuta este archivo en la consola del navegador para ver
 * el análisis de IA en acción con diferentes escenarios.
 */

console.log('%c🤖 DEMOSTRACIÓN DEL SISTEMA DE IA - ANÁLISIS DE UTILIDADES', 'font-size: 20px; color: #4CAF50; font-weight: bold;');
console.log('═'.repeat(80));

// ============================================================================
// ESCENARIO 1: Negocio Equilibrado y Rentable
// ============================================================================
console.log('\n%c📊 ESCENARIO 1: Negocio Equilibrado y Rentable', 'font-size: 16px; color: #2196F3; font-weight: bold;');
console.log('─'.repeat(80));

const datos1 = {
    venta_Equipos: 10000,
    ganancia_Equipos: 3500,
    costo_Equipos: 6500,

    venta_Accesorios: 5000,
    ganancia_Accesorios: 1000,
    costo_Accesorios: 4000,

    venta_Reparaciones: 3000,
    ganancia_Reparaciones: 1500,
    costo_Reparaciones: 1500,

    venta_Desbloqueos: 2000,
    ganancia_Desbloqueos: 1000,
    costo_Desbloqueos: 1000
};

console.log('📥 Datos de entrada:', datos1);

// Ejecutar análisis
const insights1 = analizarDatos(datos1);

console.log('\n💡 Insights generados:');
insights1.forEach((insight, index) => {
    const color = insight.tipo === 'success' ? '#4CAF50' :
        insight.tipo === 'warning' ? '#FF9800' :
        insight.tipo === 'info' ? '#2196F3' : '#F44336';

    console.log(`\n%c${insight.icono} ${insight.mensaje}`, `color: ${color}; font-weight: bold;`);
    if (insight.detalle) {
        console.log(`   ${insight.detalle}`);
    }
});

// ============================================================================
// ESCENARIO 2: Negocio con Problemas de Margen
// ============================================================================
console.log('\n\n%c📊 ESCENARIO 2: Negocio con Problemas de Margen', 'font-size: 16px; color: #FF9800; font-weight: bold;');
console.log('─'.repeat(80));

const datos2 = {
    venta_Equipos: 10000,
    ganancia_Equipos: 500, // Margen muy bajo: 5%
    costo_Equipos: 9500,

    venta_Accesorios: 8000,
    ganancia_Accesorios: 400, // Margen muy bajo: 5%
    costo_Accesorios: 7600,

    venta_Reparaciones: 2000,
    ganancia_Reparaciones: 100, // Margen muy bajo: 5%
    costo_Reparaciones: 1900,

    venta_Desbloqueos: 1000,
    ganancia_Desbloqueos: 50, // Margen muy bajo: 5%
    costo_Desbloqueos: 950
};

console.log('📥 Datos de entrada:', datos2);

const insights2 = analizarDatos(datos2);

console.log('\n💡 Insights generados:');
insights2.forEach((insight, index) => {
    const color = insight.tipo === 'success' ? '#4CAF50' :
        insight.tipo === 'warning' ? '#FF9800' :
        insight.tipo === 'info' ? '#2196F3' : '#F44336';

    console.log(`\n%c${insight.icono} ${insight.mensaje}`, `color: ${color}; font-weight: bold;`);
    if (insight.detalle) {
        console.log(`   ${insight.detalle}`);
    }
});

// ============================================================================
// ESCENARIO 3: Alta Dependencia en Una Categoría
// ============================================================================
console.log('\n\n%c📊 ESCENARIO 3: Alta Dependencia en Una Categoría', 'font-size: 16px; color: #9C27B0; font-weight: bold;');
console.log('─'.repeat(80));

const datos3 = {
    venta_Equipos: 15000, // 75% de las ventas totales
    ganancia_Equipos: 5000,
    costo_Equipos: 10000,

    venta_Accesorios: 2000,
    ganancia_Accesorios: 600,
    costo_Accesorios: 1400,

    venta_Reparaciones: 2000,
    ganancia_Reparaciones: 800,
    costo_Reparaciones: 1200,

    venta_Desbloqueos: 1000,
    ganancia_Desbloqueos: 400,
    costo_Desbloqueos: 600
};

console.log('📥 Datos de entrada:', datos3);

const insights3 = analizarDatos(datos3);

console.log('\n💡 Insights generados:');
insights3.forEach((insight, index) => {
    const color = insight.tipo === 'success' ? '#4CAF50' :
        insight.tipo === 'warning' ? '#FF9800' :
        insight.tipo === 'info' ? '#2196F3' : '#F44336';

    console.log(`\n%c${insight.icono} ${insight.mensaje}`, `color: ${color}; font-weight: bold;`);
    if (insight.detalle) {
        console.log(`   ${insight.detalle}`);
    }
});

// ============================================================================
// FUNCIÓN DE ANÁLISIS (Réplica del código del componente)
// ============================================================================
function analizarDatos(data) {
    const insights = [];

    // Calcular totales
    const totalVentas = data.venta_Equipos + data.venta_Accesorios +
        data.venta_Reparaciones + data.venta_Desbloqueos;
    const totalGanancias = data.ganancia_Equipos + data.ganancia_Accesorios +
        data.ganancia_Reparaciones + data.ganancia_Desbloqueos;
    const totalCostos = data.costo_Equipos + data.costo_Accesorios +
        data.costo_Reparaciones + data.costo_Desbloqueos;

    console.log('\n📊 Cálculos iniciales:');
    console.log(`   Total Ventas: $${totalVentas.toFixed(2)}`);
    console.log(`   Total Ganancias: $${totalGanancias.toFixed(2)}`);
    console.log(`   Total Costos: $${totalCostos.toFixed(2)}`);

    // 1. Análisis de categoría más rentable
    const categorias = [
        { nombre: 'Equipos', ganancia: data.ganancia_Equipos, venta: data.venta_Equipos },
        { nombre: 'Accesorios', ganancia: data.ganancia_Accesorios, venta: data.venta_Accesorios },
        { nombre: 'Reparaciones', ganancia: data.ganancia_Reparaciones, venta: data.venta_Reparaciones },
        { nombre: 'Desbloqueos', ganancia: data.ganancia_Desbloqueos, venta: data.venta_Desbloqueos }
    ];

    const mejorCategoria = categorias.reduce((prev, current) =>
        (prev.ganancia > current.ganancia) ? prev : current
    );

    if (mejorCategoria.ganancia > 0) {
        const porcentajeContribucion = ((mejorCategoria.ganancia / totalGanancias) * 100).toFixed(1);
        insights.push({
            tipo: 'success',
            icono: '🏆',
            mensaje: `${mejorCategoria.nombre} es tu categoría más rentable`,
            detalle: `Representa el ${porcentajeContribucion}% de tus ganancias totales ($${mejorCategoria.ganancia.toFixed(2)})`
        });
    }

    // 2. Análisis de margen de ganancia general
    const margenGeneral = totalVentas > 0 ? ((totalGanancias / totalVentas) * 100) : 0;

    console.log(`\n📈 Margen General: ${margenGeneral.toFixed(2)}%`);

    if (margenGeneral > 30) {
        insights.push({
            tipo: 'success',
            icono: '📈',
            mensaje: `Excelente margen de ganancia: ${margenGeneral.toFixed(1)}%`,
            detalle: `Tus ganancias representan más del 30% de las ventas totales`
        });
    } else if (margenGeneral < 15) {
        insights.push({
            tipo: 'warning',
            icono: '⚠️',
            mensaje: `Margen de ganancia bajo: ${margenGeneral.toFixed(1)}%`,
            detalle: `Considera revisar precios o reducir costos para mejorar rentabilidad`
        });
    } else {
        insights.push({
            tipo: 'info',
            icono: '📊',
            mensaje: `Margen de ganancia moderado: ${margenGeneral.toFixed(1)}%`,
            detalle: `Hay oportunidad de optimizar para aumentar rentabilidad`
        });
    }

    // 3. Análisis de márgenes por categoría
    console.log('\n📊 Márgenes por categoría:');
    categorias.forEach(cat => {
        if (cat.venta > 0) {
            const margen = ((cat.ganancia / cat.venta) * 100);
            console.log(`   ${cat.nombre}: ${margen.toFixed(2)}%`);

            if (margen < 10 && cat.venta > totalVentas * 0.1) {
                insights.push({
                    tipo: 'warning',
                    icono: '⚡',
                    mensaje: `${cat.nombre}: Margen muy bajo (${margen.toFixed(1)}%)`,
                    detalle: `Revisa costos o ajusta precios en esta categoría`
                });
            }
        }
    });

    // 4. Identificar categoría con peor rendimiento
    const peorCategoria = categorias
        .filter(c => c.venta > 0)
        .reduce((prev, current) => {
            const margenPrev = prev.venta > 0 ? (prev.ganancia / prev.venta) : 0;
            const margenCurrent = current.venta > 0 ? (current.ganancia / current.venta) : 0;
            return margenPrev < margenCurrent ? prev : current;
        });

    if (peorCategoria && peorCategoria.venta > 0) {
        const margenPeor = ((peorCategoria.ganancia / peorCategoria.venta) * 100);
        if (margenPeor < margenGeneral - 10) {
            insights.push({
                tipo: 'info',
                icono: '💡',
                mensaje: `Oportunidad en ${peorCategoria.nombre}`,
                detalle: `Esta categoría tiene un margen del ${margenPeor.toFixed(1)}%, menor al promedio`
            });
        }
    }

    // 5. Análisis de distribución de ventas
    const categoriaConMasVentas = categorias.reduce((prev, current) =>
        (prev.venta > current.venta) ? prev : current
    );

    const porcentajeVentas = (categoriaConMasVentas.venta / totalVentas) * 100;
    console.log(`\n⚖️ Distribución: ${categoriaConMasVentas.nombre} = ${porcentajeVentas.toFixed(2)}% de las ventas`);

    if (categoriaConMasVentas.venta > totalVentas * 0.6) {
        insights.push({
            tipo: 'warning',
            icono: '⚖️',
            mensaje: `Alta dependencia en ${categoriaConMasVentas.nombre}`,
            detalle: `El ${((categoriaConMasVentas.venta / totalVentas) * 100).toFixed(1)}% de tus ventas provienen de esta categoría. Considera diversificar.`
        });
    }

    // 6. Resumen general positivo
    if (totalGanancias > 0) {
        insights.push({
            tipo: 'success',
            icono: '💰',
            mensaje: `Ganancias totales: $${totalGanancias.toFixed(2)}`,
            detalle: `Ventas: $${totalVentas.toFixed(2)} | Costos: $${totalCostos.toFixed(2)}`
        });
    }

    // 7. Alerta si no hay datos
    if (totalVentas === 0) {
        insights.push({
            tipo: 'info',
            icono: 'ℹ️',
            mensaje: 'No hay datos para el período seleccionado',
            detalle: 'Intenta seleccionar un rango de fechas diferente'
        });
    }

    return insights;
}

// ============================================================================
// RESUMEN FINAL
// ============================================================================
console.log('\n\n%c═══════════════════════════════════════════════════════════════════════════════', 'color: #4CAF50;');
console.log('%c✅ RESUMEN DEL SISTEMA DE IA', 'font-size: 16px; color: #4CAF50; font-weight: bold;');
console.log('%c═══════════════════════════════════════════════════════════════════════════════', 'color: #4CAF50;');

console.log('\n%cEl sistema analiza automáticamente:', 'font-weight: bold;');
console.log('  ✓ Categoría más rentable');
console.log('  ✓ Márgenes de ganancia (excelente, moderado, bajo)');
console.log('  ✓ Alertas de margen bajo por categoría');
console.log('  ✓ Oportunidades de mejora');
console.log('  ✓ Distribución de ventas y dependencias');
console.log('  ✓ Resumen financiero completo');

console.log('\n%cTipos de Insights:', 'font-weight: bold;');
console.log('  %c🟢 Success (Verde)', 'color: #4CAF50', ' - Resultados positivos y logros');
console.log('  %c🟡 Warning (Amarillo)', 'color: #FF9800', ' - Alertas y precauciones');
console.log('  %c🔵 Info (Azul)', 'color: #2196F3', ' - Información y oportunidades');
console.log('  %c🔴 Danger (Rojo)', 'color: #F44336', ' - Problemas críticos');

console.log('\n%cTodo esto se genera automáticamente al cargar los datos! 🚀', 'font-size: 14px; color: #673AB7; font-weight: bold;');
