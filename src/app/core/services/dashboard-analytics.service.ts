import { Injectable } from '@angular/core';
import { EquipoVendido } from '../interfaces/equipo.interface';
import {
  TopModeloInsight,
  RentabilidadModelo,
  VendedorPerformance,
  RotacionInventario,
  SuplidorPerformance,
  TendenciaVentas,
  VentasPorDia,
  VentasPorDiaSemana,
  PrediccionVentas,
  PrediccionDia,
  ProductoMatrizBCG,
  DeteccionAnomalias,
  Anomalia,
  AnalisisTipoFactura,
  ResumenEjecutivoIA,
  Insight
} from '../interfaces/dashboard-ia.interface';

@Injectable({
  providedIn: 'root'
})
export class DashboardAnalyticsService {

  constructor() { }

  // ============================================================================
  // 1. ANÁLISIS DE TOP MODELOS MÁS VENDIDOS
  // ============================================================================

  analizarTopModelos(equipos: EquipoVendido[], limite: number = 5): TopModeloInsight[] {
    if (!equipos || equipos.length === 0) return [];

    // Agrupar por modelo
    const modeloStats = new Map<string, {
      cantidad: number,
      ventas: number,
      costos: number,
      diasRotacion: number[]
    }>();

    equipos.forEach(equipo => {
      const modelo = equipo.descripcion || 'Sin modelo';
      const stats = modeloStats.get(modelo) || {
        cantidad: 0,
        ventas: 0,
        costos: 0,
        diasRotacion: []
      };

      stats.cantidad++;
      stats.ventas += equipo.precioVendido || 0;
      stats.costos += equipo.costoEquipo || 0;

      const dias = this.calcularDiasRotacion(equipo.fechaRegistro, equipo.fechaFacturado);
      if (dias >= 0) {
        stats.diasRotacion.push(dias);
      }

      modeloStats.set(modelo, stats);
    });

    // Convertir a array y calcular métricas
    const topModelos = Array.from(modeloStats.entries())
      .map(([modelo, stats]) => {
        const ganancia = stats.ventas - stats.costos;
        const margen = stats.ventas > 0 ? (ganancia / stats.ventas) * 100 : 0;
        const diasPromedio = stats.diasRotacion.length > 0
          ? this.calcularPromedio(stats.diasRotacion)
          : 0;

        return {
          ranking: 0, // Se asignará después de ordenar
          modelo: modelo,
          cantidadVendida: stats.cantidad,
          totalVentas: stats.ventas,
          gananciaTotal: ganancia,
          margenPromedio: margen,
          diasPromedioRotacion: diasPromedio,
          velocidadVenta: this.clasificarVelocidadVenta(diasPromedio),
          tendencia: 'stable' as 'up' | 'down' | 'stable' // TODO: Comparar con período anterior
        };
      })
      .sort((a, b) => b.cantidadVendida - a.cantidadVendida)
      .slice(0, limite)
      .map((modelo, index) => ({ ...modelo, ranking: index + 1 }));

    return topModelos;
  }

  // ============================================================================
  // 2. ANÁLISIS DE RENTABILIDAD POR MODELO
  // ============================================================================

  analizarRentabilidad(equipos: EquipoVendido[]): RentabilidadModelo[] {
    if (!equipos || equipos.length === 0) return [];

    const modeloStats = new Map<string, {
      cantidad: number,
      costos: number,
      ventas: number
    }>();

    equipos.forEach(equipo => {
      const modelo = equipo.descripcion || 'Sin modelo';
      const stats = modeloStats.get(modelo) || { cantidad: 0, costos: 0, ventas: 0 };

      stats.cantidad++;
      stats.costos += equipo.costoEquipo || 0;
      stats.ventas += equipo.precioVendido || 0;

      modeloStats.set(modelo, stats);
    });

    return Array.from(modeloStats.entries())
      .map(([modelo, stats]) => {
        const ganancia = stats.ventas - stats.costos;
        const margen = stats.ventas > 0 ? (ganancia / stats.ventas) * 100 : 0;
        const precioPromedio = stats.cantidad > 0 ? stats.ventas / stats.cantidad : 0;

        return {
          modelo: modelo,
          cantidadVendida: stats.cantidad,
          costoTotal: stats.costos,
          ventaTotal: stats.ventas,
          gananciaTotal: ganancia,
          margenPromedio: margen,
          precioPromedioVenta: precioPromedio,
          clasificacion: this.clasificarRentabilidad(margen),
          recomendacion: this.generarRecomendacionRentabilidad(margen, modelo),
          colorIndicador: this.obtenerColorRentabilidad(margen)
        };
      })
      .sort((a, b) => b.margenPromedio - a.margenPromedio);
  }

  // ============================================================================
  // 3. ANÁLISIS DE PERFORMANCE DE VENDEDORES
  // ============================================================================

  analizarVendedores(equipos: EquipoVendido[]): VendedorPerformance[] {
    if (!equipos || equipos.length === 0) return [];

    const vendedorStats = new Map<string, {
      cantidad: number,
      ventas: number,
      costos: number,
      comisiones: number
    }>();

    let totalVentas = 0;

    equipos.forEach(equipo => {
      const vendedor = equipo.vendedor || 'Sin vendedor';
      const stats = vendedorStats.get(vendedor) || {
        cantidad: 0,
        ventas: 0,
        costos: 0,
        comisiones: 0
      };

      const precioVendido = equipo.precioVendido || 0;
      const costoEquipo = equipo.costoEquipo || 0;
      const comision = equipo.tipoFactura === 'Detalle'
        ? (equipo.comisionDetalle || 0)
        : (equipo.comisionPorMayor || 0);

      stats.cantidad++;
      stats.ventas += precioVendido;
      stats.costos += costoEquipo;
      stats.comisiones += comision;
      totalVentas += precioVendido;

      vendedorStats.set(vendedor, stats);
    });

    return Array.from(vendedorStats.entries())
      .map(([nombre, stats]) => {
        const ganancia = stats.ventas - stats.costos;
        const ticketPromedio = stats.cantidad > 0 ? stats.ventas / stats.cantidad : 0;
        const participacion = totalVentas > 0 ? (stats.ventas / totalVentas) * 100 : 0;

        return {
          nombre: nombre,
          cantidadVentas: stats.cantidad,
          montoTotalVendido: stats.ventas,
          gananciaTotalGenerada: ganancia,
          comisionesTotales: stats.comisiones,
          ticketPromedio: ticketPromedio,
          clasificacion: this.clasificarVendedor(participacion, stats.cantidad),
          porcentajeParticipacion: participacion
        };
      })
      .sort((a, b) => b.montoTotalVendido - a.montoTotalVendido);
  }

  // ============================================================================
  // 4. ANÁLISIS DE VELOCIDAD DE ROTACIÓN
  // ============================================================================

  analizarRotacion(equipos: EquipoVendido[]): RotacionInventario[] {
    if (!equipos || equipos.length === 0) return [];

    const modeloStats = new Map<string, {
      cantidad: number,
      diasRotacion: number[]
    }>();

    equipos.forEach(equipo => {
      const modelo = equipo.descripcion || 'Sin modelo';
      const stats = modeloStats.get(modelo) || { cantidad: 0, diasRotacion: [] };

      const dias = this.calcularDiasRotacion(equipo.fechaRegistro, equipo.fechaFacturado);
      if (dias >= 0) {
        stats.cantidad++;
        stats.diasRotacion.push(dias);
        modeloStats.set(modelo, stats);
      }
    });

    return Array.from(modeloStats.entries())
      .map(([modelo, stats]) => {
        const diasPromedio = this.calcularPromedio(stats.diasRotacion);
        const velocidad = this.clasificarVelocidadRotacion(diasPromedio);
        const esLento = diasPromedio > 60;

        return {
          modelo: modelo,
          diasPromedioEnInventario: diasPromedio,
          velocidad: velocidad,
          unidadesVendidas: stats.cantidad,
          alertaInventarioLento: esLento,
          recomendacion: this.generarRecomendacionRotacion(diasPromedio, modelo),
          colorVelocidad: this.obtenerColorVelocidad(velocidad)
        };
      })
      .sort((a, b) => a.diasPromedioEnInventario - b.diasPromedioEnInventario);
  }

  // ============================================================================
  // 5. ANÁLISIS DE PERFORMANCE DE SUPLIDORES
  // ============================================================================

  analizarSuplidores(equipos: EquipoVendido[]): SuplidorPerformance[] {
    if (!equipos || equipos.length === 0) return [];

    const suplidorStats = new Map<string, {
      cantidad: number,
      costos: number,
      ventas: number,
      diasRotacion: number[],
      modelos: Map<string, number>
    }>();

    equipos.forEach(equipo => {
      const suplidor = equipo.suplidor || 'Sin suplidor';
      const stats = suplidorStats.get(suplidor) || {
        cantidad: 0,
        costos: 0,
        ventas: 0,
        diasRotacion: [],
        modelos: new Map<string, number>()
      };

      stats.cantidad++;
      stats.costos += equipo.costoEquipo || 0;
      stats.ventas += equipo.precioVendido || 0;

      const dias = this.calcularDiasRotacion(equipo.fechaRegistro, equipo.fechaFacturado);
      if (dias >= 0) stats.diasRotacion.push(dias);

      const modelo = equipo.descripcion || 'Sin modelo';
      const gananciaModelo = (equipo.precioVendido || 0) - (equipo.costoEquipo || 0);
      stats.modelos.set(modelo, (stats.modelos.get(modelo) || 0) + gananciaModelo);

      suplidorStats.set(suplidor, stats);
    });

    return Array.from(suplidorStats.entries())
      .map(([nombre, stats]) => {
        const ganancia = stats.ventas - stats.costos;
        const margen = stats.ventas > 0 ? (ganancia / stats.ventas) * 100 : 0;
        const diasPromedio = stats.diasRotacion.length > 0
          ? this.calcularPromedio(stats.diasRotacion)
          : 0;

        // Top 3 modelos más rentables
        const topModelos = Array.from(stats.modelos.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([modelo]) => modelo);

        return {
          nombreSuplidor: nombre,
          cantidadEquiposVendidos: stats.cantidad,
          montoTotalComprado: stats.costos,
          montoTotalVendido: stats.ventas,
          gananciaTotalGenerada: ganancia,
          margenPromedio: margen,
          modelosMasRentables: topModelos,
          diasPromedioRotacion: diasPromedio,
          clasificacion: this.clasificarSuplidor(margen, diasPromedio)
        };
      })
      .sort((a, b) => b.gananciaTotalGenerada - a.gananciaTotalGenerada);
  }

  // ============================================================================
  // 6. ANÁLISIS DE TENDENCIAS TEMPORALES
  // ============================================================================

  analizarTendencias(equipos: EquipoVendido[]): TendenciaVentas | null {
    if (!equipos || equipos.length === 0) return null;

    // Agrupar por día
    const ventasPorDia = this.agruparPorDia(equipos);

    // Agrupar por día de la semana
    const ventasPorDiaSemana = this.agruparPorDiaSemana(equipos);

    // Calcular promedios
    const totalDias = ventasPorDia.length;
    const totalVentas = ventasPorDia.reduce((sum, v) => sum + v.cantidad, 0);
    const promedioDiario = totalDias > 0 ? totalVentas / totalDias : 0;

    // Encontrar día con más y menos ventas
    const ordenadosPorCantidad = [...ventasPorDia].sort((a, b) => b.cantidad - a.cantidad);
    const diaConMasVentas = ordenadosPorCantidad[0] || { dia: '', cantidad: 0, monto: 0 };
    const diaConMenosVentas = ordenadosPorCantidad[ordenadosPorCantidad.length - 1] || { dia: '', cantidad: 0, monto: 0 };

    // Calcular tendencia (regresión lineal simple)
    const tendencia = this.calcularTendencia(ventasPorDia);

    return {
      periodoAnalizado: this.formatearPeriodo(equipos),
      totalDias: totalDias,
      ventasPorDia: ventasPorDia,
      ventasPorDiaSemana: ventasPorDiaSemana,
      promedioVentasDiarias: promedioDiario,
      diaConMasVentas: {
        dia: diaConMasVentas.dia,
        cantidad: diaConMasVentas.cantidad,
        monto: diaConMasVentas.montoTotal
      },
      diaConMenosVentas: {
        dia: diaConMenosVentas.dia,
        cantidad: diaConMenosVentas.cantidad,
        monto: diaConMenosVentas.montoTotal
      },
      tendenciaGeneral: tendencia.tipo,
      tasaCrecimiento: tendencia.tasa
    };
  }

  // ============================================================================
  // 7. PREDICCIÓN DE VENTAS (Algoritmo Simple)
  // ============================================================================

  predecirVentas(equipos: EquipoVendido[], diasFuturos: number = 7): PrediccionVentas | null {
    if (!equipos || equipos.length === 0) return null;

    const ventasPorDia = this.agruparPorDia(equipos);
    if (ventasPorDia.length < 7) {
      return null; // Necesitamos al menos 7 días de historial
    }

    // Calcular promedio móvil de últimos 7 días
    const ultimosDias = ventasPorDia.slice(-7);
    const promedioCantidad = this.calcularPromedio(ultimosDias.map(v => v.cantidad));
    const promedioMonto = this.calcularPromedio(ultimosDias.map(v => v.montoTotal));

    // Calcular tendencia
    const tendencia = this.calcularTendencia(ventasPorDia);

    // Calcular factor estacional por día de la semana
    const factorEstacional = this.calcularFactorEstacional(ventasPorDia);

    // Generar predicciones
    const fechaBase = new Date(ventasPorDia[ventasPorDia.length - 1].fecha);
    const predicciones: PrediccionDia[] = [];

    for (let i = 1; i <= diasFuturos; i++) {
      const fechaPrediccion = new Date(fechaBase);
      fechaPrediccion.setDate(fechaBase.getDate() + i);
      const diaSemana = fechaPrediccion.getDay();

      const factorDia = factorEstacional[diaSemana] || 1;
      const ajusteTendencia = tendencia.tasa * i;

      const cantidadEstimada = Math.max(0, Math.round(
        (promedioCantidad + ajusteTendencia) * factorDia
      ));
      const montoEstimado = (promedioMonto + ajusteTendencia * 5000) * factorDia;

      predicciones.push({
        fecha: this.formatearFecha(fechaPrediccion),
        ventasEstimadas: cantidadEstimada,
        montoEstimado: montoEstimado,
        rangoMinimo: Math.round(cantidadEstimada * 0.8),
        rangoMaximo: Math.round(cantidadEstimada * 1.2),
        confianza: this.calcularConfianzaPrediccion(ventasPorDia.length, i)
      });
    }

    return {
      diasPredicciones: predicciones,
      metodologia: 'Promedio móvil + tendencia lineal + estacionalidad semanal',
      nivelConfianza: this.calcularConfianzaPrediccion(ventasPorDia.length, diasFuturos),
      factoresInfluyentes: [
        { factor: 'Tendencia histórica', impacto: Math.abs(tendencia.tasa) * 10 },
        { factor: 'Estacionalidad semanal', impacto: 30 },
        { factor: 'Promedio últimos 7 días', impacto: 40 }
      ],
      alertas: this.generarAlertasPrediccion(predicciones, promedioCantidad)
    };
  }

  // ============================================================================
  // 8. MATRIZ BCG DE PRODUCTOS
  // ============================================================================

  generarMatrizBCG(equipos: EquipoVendido[]): ProductoMatrizBCG[] {
    if (!equipos || equipos.length === 0) return [];

    const modeloStats = new Map<string, {
      ventas: number,
      costos: number,
      diasRotacion: number[]
    }>();

    equipos.forEach(equipo => {
      const modelo = equipo.descripcion || 'Sin modelo';
      const stats = modeloStats.get(modelo) || { ventas: 0, costos: 0, diasRotacion: [] };

      stats.ventas += equipo.precioVendido || 0;
      stats.costos += equipo.costoEquipo || 0;

      const dias = this.calcularDiasRotacion(equipo.fechaRegistro, equipo.fechaFacturado);
      if (dias >= 0) stats.diasRotacion.push(dias);

      modeloStats.set(modelo, stats);
    });

    return Array.from(modeloStats.entries())
      .map(([modelo, stats]) => {
        const ganancia = stats.ventas - stats.costos;
        const margen = stats.ventas > 0 ? (ganancia / stats.ventas) * 100 : 0;
        const diasPromedio = stats.diasRotacion.length > 0
          ? this.calcularPromedio(stats.diasRotacion)
          : 0;

        const clasificacion = this.clasificarProductoBCG(margen, diasPromedio);
        const config = this.obtenerConfigBCG(clasificacion);

        return {
          modelo: modelo,
          margen: margen,
          diasRotacion: diasPromedio,
          clasificacion: clasificacion,
          accionRecomendada: config.accion,
          prioridad: config.prioridad,
          icono: config.icono,
          color: config.color
        };
      });
  }

  // ============================================================================
  // 9. DETECCIÓN DE ANOMALÍAS (MEJORADO - Análisis por Modelo)
  // ============================================================================

  detectarAnomalias(equipos: EquipoVendido[]): DeteccionAnomalias {
    if (!equipos || equipos.length === 0) {
      return {
        totalAnomalias: 0,
        anomaliasCriticas: 0,
        anomalias: [],
        resumenPorTipo: []
      };
    }

    const anomalias: Anomalia[] = [];
    let idCounter = 1;

    // MEJORA: Agrupar equipos por modelo para análisis más preciso
    const equiposPorModelo = this.agruparPorModelo(equipos);

    // Analizar cada grupo de modelo por separado
    Object.entries(equiposPorModelo).forEach(([modelo, equiposModelo]) => {
      // Solo analizar si hay suficiente muestra (mínimo 5 equipos)
      const MINIMO_MUESTRA = 5;

      if (equiposModelo.length >= MINIMO_MUESTRA) {
        // Calcular estadísticas específicas del modelo
        const preciosModelo = equiposModelo.map(e => e.precioVendido || 0);
        const costosModelo = equiposModelo.map(e => e.costoEquipo || 0);

        const promedioPrecio = this.calcularPromedio(preciosModelo);
        const desviacionPrecio = this.calcularDesviacionEstandar(preciosModelo);
        const promedioCosto = this.calcularPromedio(costosModelo);
        const desviacionCosto = this.calcularDesviacionEstandar(costosModelo);

        // Evaluar cada equipo del modelo
        equiposModelo.forEach(equipo => {
          const precioVendido = equipo.precioVendido || 0;
          const costoEquipo = equipo.costoEquipo || 0;

          // 1. Detectar PRECIOS inusuales (por modelo)
          if (desviacionPrecio > 0) {
            const zScorePrecio = (precioVendido - promedioPrecio) / desviacionPrecio;

            if (Math.abs(zScorePrecio) > 2.5) {
              const porcentajeDiferencia = ((precioVendido - promedioPrecio) / promedioPrecio * 100);
              anomalias.push({
                id: idCounter++,
                tipo: zScorePrecio > 0 ? 'precio_alto' : 'precio_bajo',
                descripcion: `Precio ${zScorePrecio > 0 ? 'muy alto' : 'muy bajo'} para ${modelo} (${porcentajeDiferencia > 0 ? '+' : ''}${porcentajeDiferencia.toFixed(1)}%)`,
                imei: equipo.imei,
                modelo: modelo,
                vendedor: equipo.vendedor,
                fechaDeteccion: equipo.fechaFacturado,
                valor: precioVendido,
                valorEsperado: promedioPrecio,
                desvio: Math.abs(zScorePrecio),
                severidad: Math.abs(zScorePrecio) > 3 ? 'critica' : 'alta',
                accionRecomendada: 'Revisar transacción y verificar precio correcto del modelo',
                colorSeveridad: Math.abs(zScorePrecio) > 3 ? '#dc3545' : '#fd7e14'
              });
            }
          }

          // 2. Detectar COSTOS inusuales (por modelo)
          if (desviacionCosto > 0) {
            const zScoreCosto = (costoEquipo - promedioCosto) / desviacionCosto;

            if (Math.abs(zScoreCosto) > 2.5) {
              const porcentajeDiferencia = ((costoEquipo - promedioCosto) / promedioCosto * 100);
              anomalias.push({
                id: idCounter++,
                tipo: zScoreCosto > 0 ? 'costo_alto' : 'costo_bajo',
                descripcion: `Costo ${zScoreCosto > 0 ? 'muy alto' : 'muy bajo'} para ${modelo} (${porcentajeDiferencia > 0 ? '+' : ''}${porcentajeDiferencia.toFixed(1)}%)`,
                imei: equipo.imei,
                modelo: modelo,
                vendedor: equipo.vendedor,
                fechaDeteccion: equipo.fechaFacturado,
                valor: costoEquipo,
                valorEsperado: promedioCosto,
                desvio: Math.abs(zScoreCosto),
                severidad: Math.abs(zScoreCosto) > 3 ? 'critica' : 'alta',
                accionRecomendada: zScoreCosto > 0
                  ? 'Verificar proveedor. Posible sobrecosto.'
                  : 'Verificar costo. Posible error de captura.',
                colorSeveridad: Math.abs(zScoreCosto) > 3 ? '#dc3545' : '#fd7e14'
              });
            }
          }
        });
      }
    });

    // Analizar TODOS los equipos para detectar márgenes y patrones generales
    equipos.forEach(equipo => {
      const precioVendido = equipo.precioVendido || 0;
      const costoEquipo = equipo.costoEquipo || 0;
      const margen = precioVendido > 0
        ? ((precioVendido - costoEquipo) / precioVendido) * 100
        : 0;

      // 3. Detectar MÁRGENES negativos (crítico)
      if (margen < 0) {
        anomalias.push({
          id: idCounter++,
          tipo: 'margen_negativo',
          descripcion: `¡Margen negativo! Vendido por debajo del costo (${margen.toFixed(1)}%)`,
          imei: equipo.imei,
          modelo: equipo.descripcion || 'Sin modelo',
          vendedor: equipo.vendedor,
          fechaDeteccion: equipo.fechaFacturado,
          valor: margen,
          valorEsperado: 20,
          desvio: Math.abs(margen - 20),
          severidad: 'critica',
          accionRecomendada: '¡URGENTE! Revisar transacción inmediatamente. Posible error o fraude.',
          colorSeveridad: '#dc3545'
        });
      } else if (margen < 5 && margen >= 0) {
        anomalias.push({
          id: idCounter++,
          tipo: 'margen_bajo',
          descripcion: `Margen muy bajo (${margen.toFixed(1)}%). Ganancia mínima`,
          imei: equipo.imei,
          modelo: equipo.descripcion || 'Sin modelo',
          vendedor: equipo.vendedor,
          fechaDeteccion: equipo.fechaFacturado,
          valor: margen,
          valorEsperado: 20,
          desvio: 20 - margen,
          severidad: 'alta',
          accionRecomendada: 'Verificar precios y costos. Considerar ajustar estrategia de pricing.',
          colorSeveridad: '#fd7e14'
        });
      }

      // 4. Detectar ROTACIÓN inusualmente rápida (< 2 días = alta demanda)
      const diasRotacion = this.calcularDiasRotacion(equipo.fechaRegistro, equipo.fechaFacturado);
      if (diasRotacion >= 0 && diasRotacion < 2) {
        anomalias.push({
          id: idCounter++,
          tipo: 'venta_rapida',
          descripcion: `Vendido en solo ${diasRotacion} día(s). Alta demanda detectada`,
          imei: equipo.imei,
          modelo: equipo.descripcion || 'Sin modelo',
          vendedor: equipo.vendedor,
          fechaDeteccion: equipo.fechaFacturado,
          valor: diasRotacion,
          valorEsperado: 30,
          desvio: 0,
          severidad: 'baja',
          accionRecomendada: 'Producto de alta demanda. Considerar aumentar stock.',
          colorSeveridad: '#28a745'
        });
      }

      // 5. Detectar DESCUENTOS muy altos (> 30%)
      const precioEsperado = equipo.tipoFactura === 'Detalle'
        ? equipo.precioDetalle
        : equipo.precioPorMayor;

      if (precioEsperado > 0) {
        const descuento = ((precioEsperado - precioVendido) / precioEsperado) * 100;
        if (descuento > 30) {
          anomalias.push({
            id: idCounter++,
            tipo: 'descuento_alto',
            descripcion: `Descuento muy alto aplicado (${descuento.toFixed(1)}%)`,
            imei: equipo.imei,
            modelo: equipo.descripcion || 'Sin modelo',
            vendedor: equipo.vendedor,
            fechaDeteccion: equipo.fechaFacturado,
            valor: descuento,
            valorEsperado: 10,
            desvio: descuento - 10,
            severidad: descuento > 50 ? 'critica' : 'media',
            accionRecomendada: 'Verificar autorización de descuento. Evaluar impacto en márgenes.',
            colorSeveridad: descuento > 50 ? '#dc3545' : '#ffc107'
          });
        }
      }
    });

    // Ordenar por severidad (críticas primero)
    const ordenSeveridad: { [key: string]: number } = {
      'critica': 4,
      'alta': 3,
      'media': 2,
      'baja': 1
    };
    anomalias.sort((a, b) => ordenSeveridad[b.severidad] - ordenSeveridad[a.severidad]);

    // Generar resumen por tipo
    const resumenPorTipo = this.calcularResumenAnomalias(anomalias);

    return {
      totalAnomalias: anomalias.length,
      anomaliasCriticas: anomalias.filter(a => a.severidad === 'critica').length,
      anomalias: anomalias,
      resumenPorTipo: resumenPorTipo
    };
  }

  // ============================================================================
  // 10. ANÁLISIS POR MAYOR VS DETALLE
  // ============================================================================

  analizarTipoFactura(equipos: EquipoVendido[]): AnalisisTipoFactura {
    const porMayor = { cantidad: 0, monto: 0, ganancia: 0 };
    const detalle = { cantidad: 0, monto: 0, ganancia: 0 };

    equipos.forEach(equipo => {
      const precio = equipo.precioVendido || 0;
      const costo = equipo.costoEquipo || 0;
      const ganancia = precio - costo;

      if (equipo.tipoFactura === 'Por Mayor') {
        porMayor.cantidad++;
        porMayor.monto += precio;
        porMayor.ganancia += ganancia;
      } else {
        detalle.cantidad++;
        detalle.monto += precio;
        detalle.ganancia += ganancia;
      }
    });

    const totalMonto = porMayor.monto + detalle.monto;
    const margenPorMayor = porMayor.monto > 0 ? (porMayor.ganancia / porMayor.monto) * 100 : 0;
    const margenDetalle = detalle.monto > 0 ? (detalle.ganancia / detalle.monto) * 100 : 0;

    let mejorOpcion: 'porMayor' | 'detalle' | 'equilibrado';
    let recomendacion: string;

    if (Math.abs(margenPorMayor - margenDetalle) < 5) {
      mejorOpcion = 'equilibrado';
      recomendacion = '⚖️ Ambos canales tienen márgenes similares. Mantener estrategia mixta.';
    } else if (margenPorMayor > margenDetalle) {
      mejorOpcion = 'porMayor';
      recomendacion = `💼 Ventas por mayor generan mejor margen (+${(margenPorMayor - margenDetalle).toFixed(1)}%). Enfocarse en clientes mayoristas.`;
    } else {
      mejorOpcion = 'detalle';
      recomendacion = `🛍️ Ventas al detalle son más rentables (+${(margenDetalle - margenPorMayor).toFixed(1)}%). Fortalecer marketing B2C.`;
    }

    return {
      porMayor: {
        cantidad: porMayor.cantidad,
        montoTotal: porMayor.monto,
        margenPromedio: margenPorMayor,
        porcentajeVentas: totalMonto > 0 ? (porMayor.monto / totalMonto) * 100 : 0,
        gananciaTota: porMayor.ganancia
      },
      detalle: {
        cantidad: detalle.cantidad,
        montoTotal: detalle.monto,
        margenPromedio: margenDetalle,
        porcentajeVentas: totalMonto > 0 ? (detalle.monto / totalMonto) * 100 : 0,
        gananciaTotal: detalle.ganancia
      },
      recomendacion: recomendacion,
      mejorOpcion: mejorOpcion
    };
  }

  // ============================================================================
  // 11. RESUMEN EJECUTIVO CON IA
  // ============================================================================

  generarResumenEjecutivo(equipos: EquipoVendido[]): ResumenEjecutivoIA {
    if (!equipos || equipos.length === 0) {
      return this.resumenVacio();
    }

    const topModelos = this.analizarTopModelos(equipos, 1);
    const vendedores = this.analizarVendedores(equipos);
    const anomalias = this.detectarAnomalias(equipos);
    const tipoFactura = this.analizarTipoFactura(equipos);

    // Calcular métricas generales
    const totalVentas = equipos.reduce((sum, e) => sum + (e.precioVendido || 0), 0);
    const totalCostos = equipos.reduce((sum, e) => sum + (e.costoEquipo || 0), 0);
    const gananciaTotal = totalVentas - totalCostos;
    const margenGeneral = totalVentas > 0 ? (gananciaTotal / totalVentas) * 100 : 0;

    // Generar insight principal
    const modeloEstrella = topModelos[0]?.modelo || 'N/A';
    const vendedorTop = vendedores[0]?.nombre || 'N/A';

    const insightPrincipal = `Durante este período se vendieron ${equipos.length} equipos generando RD$${this.formatNumber(gananciaTotal)} de ganancia (${margenGeneral.toFixed(1)}% margen). El modelo más exitoso fue "${modeloEstrella}" y el vendedor destacado es ${vendedorTop}.`;

    // Métricas destacadas
    const metricsDestacadas: Insight[] = [
      {
        title: 'Total Vendido',
        value: `RD$${this.formatNumber(totalVentas)}`,
        description: `${equipos.length} equipos`,
        icon: 'bi bi-currency-dollar',
        iconColor: 'text-success',
        tendencia: 'neutral'
      },
      {
        title: 'Ganancia Total',
        value: `RD$${this.formatNumber(gananciaTotal)}`,
        description: `${margenGeneral.toFixed(1)}% margen`,
        icon: 'bi bi-graph-up-arrow',
        iconColor: margenGeneral > 20 ? 'text-success' : 'text-warning',
        tendencia: margenGeneral > 20 ? 'up' : 'down'
      },
      {
        title: 'Modelo Top',
        value: modeloEstrella,
        description: `${topModelos[0]?.cantidadVendida || 0} unidades`,
        icon: 'bi bi-trophy-fill',
        iconColor: 'text-warning',
        tendencia: 'up'
      },
      {
        title: 'Anomalías',
        value: anomalias.totalAnomalias.toString(),
        description: `${anomalias.anomaliasCriticas} críticas`,
        icon: 'bi bi-exclamation-triangle-fill',
        iconColor: anomalias.anomaliasCriticas > 0 ? 'text-danger' : 'text-success',
        tendencia: anomalias.anomaliasCriticas > 0 ? 'down' : 'neutral'
      }
    ];

    // Alertas importantes
    const alertasImportantes: string[] = [];
    if (anomalias.anomaliasCriticas > 0) {
      alertasImportantes.push(`⚠️ ${anomalias.anomaliasCriticas} anomalías críticas detectadas. Revisar urgentemente.`);
    }
    if (margenGeneral < 15) {
      alertasImportantes.push(`📉 Margen general bajo (${margenGeneral.toFixed(1)}%). Considerar ajustar precios.`);
    }

    // Recomendaciones
    const recomendacionesAccion = [
      {
        prioridad: 'alta' as 'alta' | 'media' | 'baja',
        accion: `Incrementar stock de "${modeloEstrella}" (producto estrella)`,
        beneficioEstimado: `+${(topModelos[0]?.gananciaTotal * 0.3 || 0).toFixed(0)} en ganancia`
      },
      {
        prioridad: anomalias.anomaliasCriticas > 0 ? 'alta' as 'alta' : 'baja' as 'baja',
        accion: 'Revisar y resolver anomalías detectadas',
        beneficioEstimado: 'Prevenir pérdidas y fraudes'
      },
      {
        prioridad: 'media' as 'media',
        accion: tipoFactura.recomendacion,
        beneficioEstimado: 'Optimizar estrategia comercial'
      }
    ];

    // Calcular score de rendimiento (0-100)
    let score = 50; // Base
    if (margenGeneral > 20) score += 20;
    if (margenGeneral > 30) score += 10;
    if (anomalias.anomaliasCriticas === 0) score += 20;
    if (anomalias.totalAnomalias < 5) score += 10;
    score = Math.min(100, score);

    return {
      periodo: this.formatearPeriodo(equipos),
      insightPrincipal: insightPrincipal,
      metricsDestacadas: metricsDestacadas,
      alertasImportantes: alertasImportantes,
      recomendacionesAccion: recomendacionesAccion,
      scoreRendimiento: score
    };
  }

  // ============================================================================
  // MÉTODOS AUXILIARES
  // ============================================================================

  private calcularDiasRotacion(fechaRegistro: string, fechaFacturado: string): number {
    if (!fechaRegistro || !fechaFacturado) return -1;

    try {
      const entrada = new Date(fechaRegistro);
      const salida = new Date(fechaFacturado);
      const diff = salida.getTime() - entrada.getTime();
      return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
    } catch {
      return -1;
    }
  }

  private calcularPromedio(valores: number[]): number {
    if (valores.length === 0) return 0;
    return valores.reduce((sum, val) => sum + val, 0) / valores.length;
  }

  private calcularDesviacionEstandar(valores: number[]): number {
    if (valores.length === 0) return 0;
    const promedio = this.calcularPromedio(valores);
    const varianza = valores.reduce((sum, val) => sum + Math.pow(val - promedio, 2), 0) / valores.length;
    return Math.sqrt(varianza);
  }

  private clasificarVelocidadVenta(diasPromedio: number): 'alta' | 'media' | 'baja' {
    if (diasPromedio < 20) return 'alta';
    if (diasPromedio < 45) return 'media';
    return 'baja';
  }

  private clasificarVelocidadRotacion(diasPromedio: number): 'muy_rapida' | 'rapida' | 'media' | 'lenta' | 'muy_lenta' {
    if (diasPromedio < 15) return 'muy_rapida';
    if (diasPromedio < 30) return 'rapida';
    if (diasPromedio < 60) return 'media';
    if (diasPromedio < 90) return 'lenta';
    return 'muy_lenta';
  }

  private clasificarRentabilidad(margen: number): 'alta' | 'media' | 'baja' {
    if (margen > 25) return 'alta';
    if (margen > 15) return 'media';
    return 'baja';
  }

  private clasificarVendedor(participacion: number, cantidad: number): 'estrella' | 'bueno' | 'regular' | 'bajo' {
    if (participacion > 30 && cantidad > 20) return 'estrella';
    if (participacion > 15 || cantidad > 15) return 'bueno';
    if (cantidad > 5) return 'regular';
    return 'bajo';
  }

  private clasificarSuplidor(margen: number, diasRotacion: number): 'premium' | 'bueno' | 'regular' {
    if (margen > 25 && diasRotacion < 30) return 'premium';
    if (margen > 15 || diasRotacion < 45) return 'bueno';
    return 'regular';
  }

  private clasificarProductoBCG(margen: number, diasRotacion: number): 'estrella' | 'vaca_lechera' | 'interrogante' | 'perro' {
    const altoMargen = margen > 20;
    const altaRotacion = diasRotacion < 30;

    if (altoMargen && altaRotacion) return 'estrella';
    if (!altoMargen && altaRotacion) return 'vaca_lechera';
    if (altoMargen && !altaRotacion) return 'interrogante';
    return 'perro';
  }

  private obtenerConfigBCG(clasificacion: 'estrella' | 'vaca_lechera' | 'interrogante' | 'perro') {
    const configs = {
      estrella: {
        accion: '⭐ ESTRELLA: Promover agresivamente y mantener stock alto. Producto ideal.',
        prioridad: 'alta' as 'alta',
        icono: 'bi bi-star-fill',
        color: '#ffd700'
      },
      vaca_lechera: {
        accion: '🐄 VACA LECHERA: Alta rotación compensa bajo margen. Mantener volumen.',
        prioridad: 'media' as 'media',
        icono: 'bi bi-cash-stack',
        color: '#28a745'
      },
      interrogante: {
        accion: '❓ INTERROGANTE: Buen margen pero venta lenta. Evaluar promociones o descontinuar.',
        prioridad: 'media' as 'media',
        icono: 'bi bi-question-circle-fill',
        color: '#ffc107'
      },
      perro: {
        accion: '🐕 PERRO: Bajo margen y rotación lenta. Considerar descontinuar o liquidar.',
        prioridad: 'baja' as 'baja',
        icono: 'bi bi-x-circle-fill',
        color: '#dc3545'
      }
    };
    return configs[clasificacion];
  }

  private generarRecomendacionRentabilidad(margen: number, modelo: string): string {
    if (margen > 30) {
      return `🌟 Excelente margen (${margen.toFixed(1)}%). Producto muy rentable. Mantener stock alto.`;
    } else if (margen > 20) {
      return `✅ Buen margen (${margen.toFixed(1)}%). Rentabilidad saludable. Continuar ventas.`;
    } else if (margen > 10) {
      return `⚠️ Margen aceptable (${margen.toFixed(1)}%). Evaluar optimización de costos o precios.`;
    } else if (margen > 0) {
      return `🔴 Margen bajo (${margen.toFixed(1)}%). Revisar estrategia de pricing urgentemente.`;
    } else {
      return `🚨 MARGEN NEGATIVO (${margen.toFixed(1)}%). ¡Producto no rentable! Descontinuar o ajustar precios.`;
    }
  }

  private generarRecomendacionRotacion(diasPromedio: number, modelo: string): string {
    if (diasPromedio < 15) {
      return `🚀 Rotación MUY RÁPIDA (${diasPromedio.toFixed(0)} días). Alta demanda. Incrementar stock.`;
    } else if (diasPromedio < 30) {
      return `✅ Rotación RÁPIDA (${diasPromedio.toFixed(0)} días). Buen movimiento de inventario.`;
    } else if (diasPromedio < 60) {
      return `⚠️ Rotación MEDIA (${diasPromedio.toFixed(0)} días). Monitorear tendencia.`;
    } else if (diasPromedio < 90) {
      return `🐌 Rotación LENTA (${diasPromedio.toFixed(0)} días). Considerar promociones.`;
    } else {
      return `🔴 Rotación MUY LENTA (${diasPromedio.toFixed(0)} días). Evaluar descuentos o descontinuar.`;
    }
  }

  private obtenerColorRentabilidad(margen: number): string {
    if (margen > 25) return '#28a745'; // Verde
    if (margen > 15) return '#ffc107'; // Amarillo
    if (margen > 5) return '#fd7e14';  // Naranja
    return '#dc3545'; // Rojo
  }

  private obtenerColorVelocidad(velocidad: string): string {
    const colores: { [key: string]: string } = {
      'muy_rapida': '#28a745',
      'rapida': '#20c997',
      'media': '#ffc107',
      'lenta': '#fd7e14',
      'muy_lenta': '#dc3545'
    };
    return colores[velocidad] || '#6c757d';
  }

  private agruparPorDia(equipos: EquipoVendido[]): VentasPorDia[] {
    const ventasPorDia = new Map<string, { cantidad: number, monto: number, ganancia: number }>();

    equipos.forEach(equipo => {
      const fecha = equipo.fechaFacturado?.split('T')[0] || '';
      if (!fecha) return;

      const stats = ventasPorDia.get(fecha) || { cantidad: 0, monto: 0, ganancia: 0 };
      stats.cantidad++;
      stats.monto += equipo.precioVendido || 0;
      stats.ganancia += (equipo.precioVendido || 0) - (equipo.costoEquipo || 0);
      ventasPorDia.set(fecha, stats);
    });

    return Array.from(ventasPorDia.entries())
      .map(([fecha, stats]) => ({
        dia: this.formatearFechaCorta(fecha),
        fecha: fecha,
        cantidad: stats.cantidad,
        montoTotal: stats.monto,
        gananciaTotal: stats.ganancia
      }))
      .sort((a, b) => a.fecha.localeCompare(b.fecha));
  }

  private agruparPorDiaSemana(equipos: EquipoVendido[]): VentasPorDiaSemana[] {
    const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const ventasPorDia = new Map<number, { cantidad: number, monto: number }>();

    // Inicializar todos los días
    for (let i = 0; i < 7; i++) {
      ventasPorDia.set(i, { cantidad: 0, monto: 0 });
    }

    equipos.forEach(equipo => {
      if (!equipo.fechaFacturado) return;
      const fecha = new Date(equipo.fechaFacturado);
      const dia = fecha.getDay();

      const stats = ventasPorDia.get(dia)!;
      stats.cantidad++;
      stats.monto += equipo.precioVendido || 0;
    });

    const totalMonto = Array.from(ventasPorDia.values()).reduce((sum, v) => sum + v.monto, 0);

    return Array.from(ventasPorDia.entries())
      .map(([numero, stats]) => ({
        diaSemana: diasSemana[numero],
        numerodia: numero,
        cantidad: stats.cantidad,
        montoTotal: stats.monto,
        porcentaje: totalMonto > 0 ? (stats.monto / totalMonto) * 100 : 0
      }));
  }

  private calcularTendencia(ventasPorDia: VentasPorDia[]): { tipo: 'creciente' | 'decreciente' | 'estable', tasa: number } {
    if (ventasPorDia.length < 2) {
      return { tipo: 'estable', tasa: 0 };
    }

    // Regresión lineal simple
    const n = ventasPorDia.length;
    const sumX = (n * (n + 1)) / 2;
    const sumY = ventasPorDia.reduce((sum, v) => sum + v.cantidad, 0);
    const sumXY = ventasPorDia.reduce((sum, v, i) => sum + (i + 1) * v.cantidad, 0);
    const sumX2 = (n * (n + 1) * (2 * n + 1)) / 6;

    const pendiente = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

    let tipo: 'creciente' | 'decreciente' | 'estable';
    if (pendiente > 0.1) tipo = 'creciente';
    else if (pendiente < -0.1) tipo = 'decreciente';
    else tipo = 'estable';

    return { tipo, tasa: pendiente };
  }

  private calcularFactorEstacional(ventasPorDia: VentasPorDia[]): { [dia: number]: number } {
    const ventasPorDiaSemana = new Map<number, number[]>();

    ventasPorDia.forEach(venta => {
      const fecha = new Date(venta.fecha);
      const dia = fecha.getDay();

      if (!ventasPorDiaSemana.has(dia)) {
        ventasPorDiaSemana.set(dia, []);
      }
      ventasPorDiaSemana.get(dia)!.push(venta.cantidad);
    });

    const promedioGeneral = this.calcularPromedio(ventasPorDia.map(v => v.cantidad));
    const factores: { [dia: number]: number } = {};

    for (let i = 0; i < 7; i++) {
      const ventas = ventasPorDiaSemana.get(i) || [];
      const promedioDia = ventas.length > 0 ? this.calcularPromedio(ventas) : promedioGeneral;
      factores[i] = promedioGeneral > 0 ? promedioDia / promedioGeneral : 1;
    }

    return factores;
  }

  private calcularConfianzaPrediccion(diasHistorial: number, diasFuturos: number): number {
    // Más historial y menos días futuros = mayor confianza
    let confianza = 50; // Base

    if (diasHistorial > 30) confianza += 20;
    else if (diasHistorial > 14) confianza += 10;

    if (diasFuturos <= 7) confianza += 20;
    else if (diasFuturos <= 15) confianza += 10;

    return Math.min(95, confianza); // Máximo 95%
  }

  private generarAlertasPrediccion(predicciones: PrediccionDia[], promedio: number): string[] {
    const alertas: string[] = [];

    predicciones.forEach((pred, index) => {
      if (pred.ventasEstimadas < promedio * 0.7) {
        alertas.push(`⚠️ ${pred.fecha}: Se proyecta baja en ventas (-30% vs promedio)`);
      } else if (pred.ventasEstimadas > promedio * 1.3) {
        alertas.push(`🚀 ${pred.fecha}: Se proyecta pico de ventas (+30% vs promedio)`);
      }
    });

    return alertas;
  }

  private calcularResumenAnomalias(anomalias: Anomalia[]): { tipo: string; cantidad: number; porcentaje: number }[] {
    const resumen = new Map<string, number>();

    anomalias.forEach(a => {
      resumen.set(a.tipo, (resumen.get(a.tipo) || 0) + 1);
    });

    const total = anomalias.length;

    return Array.from(resumen.entries())
      .map(([tipo, cantidad]) => ({
        tipo: this.traducirTipoAnomalia(tipo),
        cantidad,
        porcentaje: total > 0 ? (cantidad / total) * 100 : 0
      }))
      .sort((a, b) => b.cantidad - a.cantidad);
  }

  private agruparPorModelo(equipos: EquipoVendido[]): { [modelo: string]: EquipoVendido[] } {
    const grupos: { [modelo: string]: EquipoVendido[] } = {};

    equipos.forEach(equipo => {
      const modelo = equipo.descripcion || 'Sin modelo';
      if (!grupos[modelo]) {
        grupos[modelo] = [];
      }
      grupos[modelo].push(equipo);
    });

    return grupos;
  }

  private traducirTipoAnomalia(tipo: string): string {
    const traducciones: { [key: string]: string } = {
      'precio_alto': 'Precio Alto',
      'precio_bajo': 'Precio Bajo',
      'precio_inusual': 'Precio Inusual',
      'costo_alto': 'Costo Alto',
      'costo_bajo': 'Costo Bajo',
      'margen_bajo': 'Margen Bajo',
      'margen_negativo': 'Margen Negativo',
      'venta_rapida': 'Venta Rápida',
      'descuento_alto': 'Descuento Alto',
      'rotacion_anormal': 'Rotación Anormal'
    };
    return traducciones[tipo] || tipo;
  }

  private formatearPeriodo(equipos: EquipoVendido[]): string {
    if (equipos.length === 0) return '';

    const fechas = equipos.map(e => e.fechaFacturado).filter(f => f).sort();
    if (fechas.length === 0) return '';

    const inicio = this.formatearFechaCorta(fechas[0]);
    const fin = this.formatearFechaCorta(fechas[fechas.length - 1]);

    return `${inicio} - ${fin}`;
  }

  private formatearFecha(fecha: Date): string {
    return fecha.toISOString().split('T')[0];
  }

  private formatearFechaCorta(fecha: string): string {
    try {
      const date = new Date(fecha);
      return date.toLocaleDateString('es-DO', { day: '2-digit', month: 'short' });
    } catch {
      return fecha;
    }
  }

  private formatNumber(value: number): string {
    return value.toLocaleString('es-DO', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }

  private resumenVacio(): ResumenEjecutivoIA {
    return {
      periodo: 'Sin datos',
      insightPrincipal: 'No hay datos suficientes para generar insights.',
      metricsDestacadas: [],
      alertasImportantes: ['No hay datos en este período'],
      recomendacionesAccion: [],
      scoreRendimiento: 0
    };
  }
}
