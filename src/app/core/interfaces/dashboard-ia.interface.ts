// ============================================================================
// Interfaces para Dashboard con IA
// ============================================================================

import { EquipoVendido } from './equipo.interface';

// ============================================================================
// Top Modelos Más Vendidos
// ============================================================================
export interface TopModeloInsight {
    ranking: number;
    modelo: string;
    cantidadVendida: number;
    totalVentas: number;
    gananciaTotal: number;
    margenPromedio: number;
    diasPromedioRotacion: number;
    velocidadVenta: 'alta' | 'media' | 'baja';
    tendencia: 'up' | 'down' | 'stable';
    porcentajeTendencia?: number;
}

// ============================================================================
// Rentabilidad por Modelo
// ============================================================================
export interface RentabilidadModelo {
    modelo: string;
    cantidadVendida: number;
    costoTotal: number;
    ventaTotal: number;
    gananciaTotal: number;
    margenPromedio: number;
    precioPromedioVenta: number;
    clasificacion: 'alta' | 'media' | 'baja';
    recomendacion: string;
    colorIndicador: string;
}

// ============================================================================
// Performance de Vendedores
// ============================================================================
export interface VendedorPerformance {
    nombre: string;
    cantidadVentas: number;
    montoTotalVendido: number;
    gananciaTotalGenerada: number;
    comisionesTotales: number;
    ticketPromedio: number;
    clasificacion: 'estrella' | 'bueno' | 'regular' | 'bajo';
    porcentajeParticipacion: number; // % del total de ventas
    tendencia?: 'ascendente' | 'descendente' | 'estable';
}

// ============================================================================
// Velocidad de Rotación
// ============================================================================
export interface RotacionInventario {
    modelo: string;
    diasPromedioEnInventario: number;
    velocidad: 'muy_rapida' | 'rapida' | 'media' | 'lenta' | 'muy_lenta';
    unidadesVendidas: number;
    alertaInventarioLento: boolean;
    recomendacion: string;
    colorVelocidad: string;
}

// ============================================================================
// Performance de Suplidores
// ============================================================================
export interface SuplidorPerformance {
    nombreSuplidor: string;
    cantidadEquiposVendidos: number;
    montoTotalComprado: number;
    montoTotalVendido: number;
    gananciaTotalGenerada: number;
    margenPromedio: number;
    modelosMasRentables: string[];
    diasPromedioRotacion: number;
    clasificacion: 'premium' | 'bueno' | 'regular';
}

// ============================================================================
// Análisis Temporal y Tendencias
// ============================================================================
export interface VentasPorDia {
    dia: string;
    fecha: string;
    cantidad: number;
    montoTotal: number;
    gananciaTotal: number;
}

export interface VentasPorDiaSemana {
    diaSemana: string; // 'Lunes', 'Martes', etc.
    numerodia: number; // 0-6
    cantidad: number;
    montoTotal: number;
    porcentaje: number;
}

export interface TendenciaVentas {
    periodoAnalizado: string;
    totalDias: number;
    ventasPorDia: VentasPorDia[];
    ventasPorDiaSemana: VentasPorDiaSemana[];
    promedioVentasDiarias: number;
    diaConMasVentas: { dia: string; cantidad: number; monto: number };
    diaConMenosVentas: { dia: string; cantidad: number; monto: number };
    tendenciaGeneral: 'creciente' | 'decreciente' | 'estable';
    tasaCrecimiento?: number; // % de crecimiento
}

// ============================================================================
// Predicción de Ventas
// ============================================================================
export interface PrediccionDia {
    fecha: string;
    ventasEstimadas: number;
    montoEstimado: number;
    rangoMinimo: number;
    rangoMaximo: number;
    confianza: number; // 0-100%
}

export interface PrediccionVentas {
    diasPredicciones: PrediccionDia[];
    metodologia: string;
    nivelConfianza: number;
    factoresInfluyentes: { factor: string; impacto: number }[];
    alertas: string[];
}

// ============================================================================
// Matriz BCG de Productos
// ============================================================================
export interface ProductoMatrizBCG {
    modelo: string;
    margen: number;
    diasRotacion: number;
    clasificacion: 'estrella' | 'vaca_lechera' | 'interrogante' | 'perro';
    accionRecomendada: string;
    prioridad: 'alta' | 'media' | 'baja';
    icono: string;
    color: string;
}

// ============================================================================
// Detección de Anomalías
// ============================================================================
export interface Anomalia {
    id: number;
    tipo: 'precio_alto' | 'precio_bajo' | 'precio_inusual' | 
          'costo_alto' | 'costo_bajo' | 
          'margen_bajo' | 'margen_negativo' | 
          'venta_rapida' | 'descuento_alto' | 'rotacion_anormal';
    descripcion: string;
    imei: string;
    modelo: string;
    vendedor?: string;
    fechaDeteccion: string;
    valor: number;
    valorEsperado: number;
    desvio: number;
    severidad: 'critica' | 'alta' | 'media' | 'baja';
    accionRecomendada: string;
    colorSeveridad: string;
}

export interface DeteccionAnomalias {
    totalAnomalias: number;
    anomaliasCriticas: number;
    anomalias: Anomalia[];
    resumenPorTipo: {
        tipo: string;
        cantidad: number;
        porcentaje: number;
    }[];
}

// ============================================================================
// Análisis Por Mayor vs Detalle
// ============================================================================
export interface AnalisisTipoFactura {
    porMayor: {
        cantidad: number;
        montoTotal: number;
        margenPromedio: number;
        porcentajeVentas: number;
        gananciaTota: number;
    };
    detalle: {
        cantidad: number;
        montoTotal: number;
        margenPromedio: number;
        porcentajeVentas: number;
        gananciaTotal: number;
    };
    recomendacion: string;
    mejorOpcion: 'porMayor' | 'detalle' | 'equilibrado';
}

// ============================================================================
// Resumen Ejecutivo IA
// ============================================================================
export interface ResumenEjecutivoIA {
    periodo: string;
    insightPrincipal: string;
    metricsDestacadas: Insight[];
    alertasImportantes: string[];
    recomendacionesAccion: {
        prioridad: 'alta' | 'media' | 'baja';
        accion: string;
        beneficioEstimado: string;
    }[];
    scoreRendimiento: number; // 0-100
}

// ============================================================================
// Filtros para Dashboard IA
// ============================================================================
export interface DashboardIAFiltros {
    sucursal: number;
    fechaInicio: string;
    fechaFinal: string;
    vendedor?: string;
    modelo?: string;
    suplidor?: string;
}

// ============================================================================
// Configuración de Widgets
// ============================================================================
export interface WidgetConfig {
    id: string;
    nombre: string;
    activo: boolean;
    orden: number;
    tamaño: 'small' | 'medium' | 'large' | 'full';
    refrescarCada?: number; // minutos
}

// ============================================================================
// Insight Genérico
// ============================================================================
export interface Insight {
    title: string;
    value: string;
    description: string;
    icon: string;
    iconColor: string;
    tendencia?: 'up' | 'down' | 'neutral';
    porcentajeCambio?: number;
}
