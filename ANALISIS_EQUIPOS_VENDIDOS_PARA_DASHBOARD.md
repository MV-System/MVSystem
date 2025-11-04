# 📊 Análisis: Endpoint Equipos Vendidos para Dashboard IA

## 🎯 Endpoint Existente Analizado

### **Endpoint**: `GET /api/equipos/vendidos`
**Servicio**: `EquipoService.getEquipoVendidoParaInsights()`

### ✅ Datos Disponibles en `EquipoVendido` Interface:

```typescript
interface EquipoVendido {
    imei: string;
    descripcion: string;              // ⭐ Modelo del equipo
    precioPorMayor: number;
    precioVendido: number;            // ⭐ Precio real de venta
    precioDetalle: number;
    costoEquipo: number;              // ⭐ Costo del equipo
    itbis: number;                    // ⭐ ITBIS aplicado
    comisionDetalle: number;
    comisionPorMayor: number;
    tipoFactura: string;              // ⭐ "Por Mayor" o "Detalle"
    isDesbloqueado: string;
    notaAdicional: string;
    descripcionAlmacen: string;       // ⭐ Sucursal/Almacén
    suplidor: string;                 // ⭐ Proveedor
    cliente: string;                  // ⭐ Cliente que compró
    vendedor: string;                 // ⭐ Vendedor que realizó la venta
    fechaRegistro: string;            // ⭐ Fecha de entrada al inventario
    fechaFacturado: string;           // ⭐ Fecha de venta
    line: number;
    lastLine: number;
    totalRecord: number;
    totalInventario: number;          // ⭐ Inventario total
    totalGanancia: number;            // ⭐ Ganancia total
    totalFacturado: number;           // ⭐ Total facturado
    totalItbis: number;               // ⭐ Total de ITBIS
}
```

---

## 🚀 Insights IA que se Pueden Generar

### 1. **Top Modelos Más Vendidos** ⭐⭐⭐
**Ya implementado parcialmente en `equipo-consulta-vendido.component.ts`**

**Análisis Mejorado Propuesto**:
```typescript
interface TopModeloInsight {
    ranking: number;
    modelo: string;
    cantidadVendida: number;
    totalVentas: number;              // Suma de precioVendido
    gananciaTotal: number;            // Suma de (precioVendido - costoEquipo)
    margenPromedio: number;           // Promedio de margen %
    tendencia: 'up' | 'down' | 'stable';
    diasPromedioRotacion: number;     // Promedio de días entre fechaRegistro y fechaFacturado
    velocidadVenta: 'alta' | 'media' | 'baja';
}
```

**Valor para Dashboard**:
- ✅ Widget "Top 5 Modelos Más Vendidos"
- ✅ Identificar productos estrella
- ✅ Detectar tendencias de demanda
- ✅ Optimizar inventario (qué reabastecer)

---

### 2. **Análisis de Rentabilidad por Modelo** ⭐⭐⭐
**Nuevo - No implementado**

**Datos Calculables**:
```typescript
interface RentabilidadModelo {
    modelo: string;
    cantidadVendida: number;
    costoTotal: number;               // Suma de costoEquipo
    ventaTotal: number;               // Suma de precioVendido
    gananciaTotal: number;            // ventaTotal - costoTotal
    margenPromedio: number;           // (gananciaTotal / ventaTotal) * 100
    precioPromedioVenta: number;
    clasificacion: 'alta' | 'media' | 'baja'; // Según margen
    recomendacion: string;            // IA genera texto
}
```

**Algoritmo IA**:
```typescript
generarRecomendacionRentabilidad(modelo: RentabilidadModelo): string {
    if (modelo.margenPromedio > 30) {
        return `🌟 Excelente margen (${modelo.margenPromedio.toFixed(1)}%). Mantener stock alto.`;
    } else if (modelo.margenPromedio > 15) {
        return `✅ Margen aceptable (${modelo.margenPromedio.toFixed(1)}%). Continuar ventas.`;
    } else if (modelo.margenPromedio > 5) {
        return `⚠️ Margen bajo (${modelo.margenPromedio.toFixed(1)}%). Revisar precios o costos.`;
    } else {
        return `🔴 Margen crítico (${modelo.margenPromedio.toFixed(1)}%). ¡Ajustar precios urgentemente!`;
    }
}
```

**Valor para Dashboard**:
- ✅ Widget "Rentabilidad por Modelo"
- ✅ Identificar modelos poco rentables
- ✅ Decisiones de pricing inteligente

---

### 3. **Análisis de Vendedores** ⭐⭐⭐
**Ya implementado parcialmente**

**Mejora Propuesta**:
```typescript
interface VendedorPerformance {
    nombre: string;
    cantidadVentas: number;
    montoTotalVendido: number;
    gananciaTotalGenerada: number;
    comisionesTotales: number;
    ticketPromedio: number;           // Promedio de precioVendido
    tasaConversion: number;           // % de ventas exitosas (si hay datos de cotizaciones)
    clasificacion: 'estrella' | 'bueno' | 'regular' | 'bajo';
    tendenciaMensual: 'ascendente' | 'descendente' | 'estable';
    metaMensual?: number;
    porcentajeMeta?: number;
}
```

**Valor para Dashboard**:
- ✅ Widget "Ranking de Vendedores"
- ✅ Identificar top performers
- ✅ Detectar necesidades de capacitación
- ✅ Sistema de gamificación

---

### 4. **Velocidad de Rotación de Inventario** ⭐⭐⭐
**Nuevo - Muy útil**

**Cálculo**:
```typescript
interface RotacionInventario {
    modelo: string;
    diasPromedioEnInventario: number; // Promedio de (fechaFacturado - fechaRegistro)
    velocidad: 'muy rápida' | 'rápida' | 'media' | 'lenta' | 'muy lenta';
    unidadesVendidas: number;
    alertaInventarioLento: boolean;   // true si > 60 días
    recomendacion: string;
}

calcularDiasRotacion(equipo: EquipoVendido): number {
    const fechaEntrada = new Date(equipo.fechaRegistro);
    const fechaSalida = new Date(equipo.fechaFacturado);
    return Math.floor((fechaSalida.getTime() - fechaEntrada.getTime()) / (1000 * 60 * 60 * 24));
}
```

**Alertas IA**:
```typescript
if (diasPromedio > 90) {
    alerta = "🔴 Rotación MUY LENTA. Considerar descuentos o promociones.";
} else if (diasPromedio > 60) {
    alerta = "🟡 Rotación lenta. Evaluar estrategia de ventas.";
} else if (diasPromedio < 15) {
    alerta = "🟢 Rotación EXCELENTE. Alta demanda detectada. Reabastecer.";
}
```

**Valor para Dashboard**:
- ✅ Widget "Velocidad de Rotación"
- ✅ Optimizar compras a suplidores
- ✅ Reducir capital inmovilizado
- ✅ Identificar productos obsoletos

---

### 5. **Análisis de Suplidores** ⭐⭐
**Nuevo**

**Datos Calculables**:
```typescript
interface SuplidorPerformance {
    nombreSuplidor: string;
    cantidadEquiposVendidos: number;
    montoTotalComprado: number;       // Suma de costoEquipo
    montoTotalVendido: number;        // Suma de precioVendido
    gananciaTotalGenerada: number;
    margenPromedio: number;
    modelosMasRentables: string[];    // Top 3 modelos de este suplidor
    diasPromedioRotacion: number;
    clasificacion: 'premium' | 'bueno' | 'regular';
}
```

**Valor para Dashboard**:
- ✅ Widget "Top Suplidores"
- ✅ Decisiones de compra más informadas
- ✅ Negociaciones basadas en datos

---

### 6. **Detección de Tendencias Temporales** ⭐⭐⭐
**Nuevo - Muy valioso**

**Análisis de Patrones**:
```typescript
interface TendenciaVentas {
    periodoAnalizado: string;
    ventasPorDiaSemana: {
        dia: string;
        cantidad: number;
        montoTotal: number;
        horasPico?: number[]; // Si se tiene hora en fechaFacturado
    }[];
    ventasPorMes: {
        mes: string;
        cantidad: number;
        montoTotal: number;
    }[];
    estacionalidad: {
        mesAlto: string;
        mesBajo: string;
        variacionPorcentual: number;
    };
    prediccion7Dias: {
        fecha: string;
        ventasEstimadas: number;
        confianza: number;
    }[];
}
```

**Algoritmo Predictivo Simple**:
```typescript
predecirVentas(historial: EquipoVendido[], diasFuturos: number) {
    // 1. Calcular promedio móvil de últimos 30 días
    const ventasPorDia = agruparPorDia(historial);
    const promedioMovil = calcularPromedioMovil(ventasPorDia, 30);
    
    // 2. Detectar tendencia (creciente/decreciente)
    const tendencia = calcularTendenciaLineal(ventasPorDia);
    
    // 3. Aplicar estacionalidad (día de la semana)
    const factorEstacional = calcularFactorEstacional(ventasPorDia);
    
    // 4. Generar predicción
    const predicciones = [];
    for (let i = 1; i <= diasFuturos; i++) {
        const diaSemana = obtenerDiaSemana(i);
        const prediccion = promedioMovil + (tendencia * i) * factorEstacional[diaSemana];
        predicciones.push({
            fecha: agregarDias(hoy, i),
            ventasEstimadas: Math.round(prediccion),
            confianza: calcularConfianza(historial.length) // Mayor historial = mayor confianza
        });
    }
    
    return predicciones;
}
```

**Valor para Dashboard**:
- ✅ Widget "Pronóstico de Ventas"
- ✅ Planificación de inventario
- ✅ Optimización de turnos de vendedores
- ✅ Detección de temporadas altas/bajas

---

### 7. **Análisis de Tipo de Factura (Mayor vs Detalle)** ⭐⭐
**Nuevo**

**Datos Calculables**:
```typescript
interface AnalisisTipoFactura {
    porMayor: {
        cantidad: number;
        montoTotal: number;
        margenPromedio: number;
        porcentajeVentas: number;
    };
    detalle: {
        cantidad: number;
        montoTotal: number;
        margenPromedio: number;
        porcentajeVentas: number;
    };
    recomendacion: string;
}
```

**Insight IA**:
```typescript
if (porMayor.margenPromedio > detalle.margenPromedio) {
    insight = "💡 Ventas por mayor generan mejor margen. Enfocarse en clientes mayoristas.";
} else {
    insight = "💡 Ventas al detalle son más rentables. Fortalecer marketing B2C.";
}
```

**Valor para Dashboard**:
- ✅ Widget "Por Mayor vs Detalle"
- ✅ Estrategia comercial informada

---

### 8. **Análisis de Margen vs Velocidad** ⭐⭐⭐
**Nuevo - Insight avanzado**

**Matriz de Decisión**:
```typescript
interface MatrizProducto {
    modelo: string;
    clasificacion: 'estrella' | 'vaca_lechera' | 'interrogante' | 'perro';
    // Estrella: Alto margen + Alta rotación
    // Vaca Lechera: Bajo margen + Alta rotación
    // Interrogante: Alto margen + Baja rotación
    // Perro: Bajo margen + Baja rotación
    accion: string;
}

clasificarProducto(margen: number, diasRotacion: number): string {
    if (margen > 20 && diasRotacion < 30) {
        return '⭐ ESTRELLA: Promover agresivamente y mantener stock alto.';
    } else if (margen < 15 && diasRotacion < 30) {
        return '🐄 VACA LECHERA: Alta rotación compensa bajo margen. Continuar.';
    } else if (margen > 20 && diasRotacion > 60) {
        return '❓ INTERROGANTE: Buen margen pero venta lenta. Evaluar promociones.';
    } else {
        return '🐕 PERRO: Bajo margen y rotación lenta. Considerar descontinuar.';
    }
}
```

**Valor para Dashboard**:
- ✅ Widget "Matriz de Productos BCG"
- ✅ Decisiones estratégicas de inventario

---

### 9. **Detección de Anomalías** ⭐⭐⭐
**Nuevo - IA avanzada**

**Algoritmo**:
```typescript
interface Anomalia {
    tipo: 'precio_inusual' | 'margen_bajo' | 'venta_rapida' | 'descuento_alto';
    descripcion: string;
    imei: string;
    modelo: string;
    valor: number;
    valorEsperado: number;
    desvio: number; // En desviaciones estándar
    severidad: 'alta' | 'media' | 'baja';
}

detectarAnomalias(equipos: EquipoVendido[]): Anomalia[] {
    const anomalias: Anomalia[] = [];
    
    // 1. Precio de venta inusual
    const preciosVenta = equipos.map(e => e.precioVendido);
    const promedioPrecio = calcularPromedio(preciosVenta);
    const desviacionPrecio = calcularDesviacion(preciosVenta);
    
    equipos.forEach(equipo => {
        const zScore = (equipo.precioVendido - promedioPrecio) / desviacionPrecio;
        
        if (Math.abs(zScore) > 2.5) { // Más de 2.5 desviaciones estándar
            anomalias.push({
                tipo: 'precio_inusual',
                descripcion: `Precio de venta ${zScore > 0 ? 'muy alto' : 'muy bajo'} para este modelo`,
                imei: equipo.imei,
                modelo: equipo.descripcion,
                valor: equipo.precioVendido,
                valorEsperado: promedioPrecio,
                desvio: Math.abs(zScore),
                severidad: Math.abs(zScore) > 3 ? 'alta' : 'media'
            });
        }
        
        // 2. Margen inusualmente bajo (posible error o fraude)
        const margen = ((equipo.precioVendido - equipo.costoEquipo) / equipo.precioVendido) * 100;
        if (margen < 5) {
            anomalias.push({
                tipo: 'margen_bajo',
                descripcion: `Margen muy bajo (${margen.toFixed(1)}%). Revisar transacción.`,
                imei: equipo.imei,
                modelo: equipo.descripcion,
                valor: margen,
                valorEsperado: 20,
                desvio: (20 - margen) / 5,
                severidad: margen < 0 ? 'alta' : 'media'
            });
        }
        
        // 3. Rotación inusualmente rápida (< 2 días)
        const diasRotacion = calcularDiasRotacion(equipo);
        if (diasRotacion < 2) {
            anomalias.push({
                tipo: 'venta_rapida',
                descripcion: `Vendido en ${diasRotacion} días. Posible alta demanda.`,
                imei: equipo.imei,
                modelo: equipo.descripcion,
                valor: diasRotacion,
                valorEsperado: 30,
                desvio: 0,
                severidad: 'baja'
            });
        }
    });
    
    return anomalias;
}
```

**Valor para Dashboard**:
- ✅ Widget "Alertas de Anomalías"
- ✅ Detección de fraude
- ✅ Control de calidad de transacciones
- ✅ Identificación de oportunidades

---

## 🎯 Implementación Propuesta para Dashboard

### **Widget 1: Top 5 Modelos Más Vendidos** (Prioridad Alta)

**Componente**: `top-modelos-widget.component.ts`

```typescript
@Component({
  selector: 'app-top-modelos-widget',
  templateUrl: './top-modelos-widget.component.html'
})
export class TopModelosWidgetComponent implements OnInit {
  topModelos: TopModeloInsight[] = [];
  isLoading = false;

  constructor(
    private equipoService: EquipoService,
    private loginService: LoginService
  ) {}

  ngOnInit() {
    this.cargarTopModelos();
  }

  cargarTopModelos() {
    this.isLoading = true;
    
    const filtro: EquipoVendidoFilter = {
      almacen: this.loginService.getUserIdSucursal,
      fechaInicioFactura: this.obtenerFechaInicioMes(),
      fechaFinalFactura: this.obtenerFechaActual(),
      // ... otros filtros vacíos
      pageIndex: 1,
      pageSize: 999999 // Traer todos para análisis
    };

    this.equipoService.getEquipoVendidoParaInsights(filtro)
      .subscribe(equipos => {
        this.topModelos = this.analizarTopModelos(equipos);
        this.isLoading = false;
      });
  }

  analizarTopModelos(equipos: EquipoVendido[]): TopModeloInsight[] {
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
      stats.ventas += equipo.precioVendido;
      stats.costos += equipo.costoEquipo;
      
      const dias = this.calcularDiasRotacion(
        equipo.fechaRegistro, 
        equipo.fechaFacturado
      );
      stats.diasRotacion.push(dias);

      modeloStats.set(modelo, stats);
    });

    // Convertir a array y ordenar
    const topModelos = Array.from(modeloStats.entries())
      .map(([modelo, stats], index) => ({
        ranking: index + 1,
        modelo: modelo,
        cantidadVendida: stats.cantidad,
        totalVentas: stats.ventas,
        gananciaTotal: stats.ventas - stats.costos,
        margenPromedio: ((stats.ventas - stats.costos) / stats.ventas) * 100,
        diasPromedioRotacion: this.calcularPromedio(stats.diasRotacion),
        velocidadVenta: this.clasificarVelocidad(
          this.calcularPromedio(stats.diasRotacion)
        ),
        tendencia: 'stable' as 'up' | 'down' | 'stable' // TODO: Calcular comparando con período anterior
      }))
      .sort((a, b) => b.cantidadVendida - a.cantidadVendida)
      .slice(0, 5);

    return topModelos;
  }

  calcularDiasRotacion(fechaRegistro: string, fechaFacturado: string): number {
    const entrada = new Date(fechaRegistro);
    const salida = new Date(fechaFacturado);
    return Math.floor((salida.getTime() - entrada.getTime()) / (1000 * 60 * 60 * 24));
  }

  calcularPromedio(valores: number[]): number {
    return valores.reduce((sum, val) => sum + val, 0) / valores.length;
  }

  clasificarVelocidad(diasPromedio: number): 'alta' | 'media' | 'baja' {
    if (diasPromedio < 20) return 'alta';
    if (diasPromedio < 45) return 'media';
    return 'baja';
  }
}
```

**HTML Template**:
```html
<div class="widget-card">
  <h5 class="widget-title">
    <i class="bi bi-trophy-fill text-warning"></i>
    Top 5 Modelos Más Vendidos - Este Mes
  </h5>

  <div *ngIf="isLoading" class="text-center p-4">
    <div class="spinner-border" role="status"></div>
  </div>

  <div *ngIf="!isLoading && topModelos.length > 0" class="top-modelos-list">
    <div *ngFor="let modelo of topModelos" class="modelo-item">
      <div class="ranking-badge">
        <span class="ranking-number" 
              [class.rank-1]="modelo.ranking === 1"
              [class.rank-2]="modelo.ranking === 2"
              [class.rank-3]="modelo.ranking === 3">
          #{{modelo.ranking}}
        </span>
      </div>
      
      <div class="modelo-info">
        <h6 class="modelo-nombre">{{modelo.modelo}}</h6>
        <div class="modelo-stats">
          <span class="badge bg-primary">
            {{modelo.cantidadVendida}} vendidos
          </span>
          <span class="badge bg-success">
            RD${{formatNumber(modelo.gananciaTotal)}} ganancia
          </span>
          <span class="badge" 
                [class.bg-success]="modelo.velocidadVenta === 'alta'"
                [class.bg-warning]="modelo.velocidadVenta === 'media'"
                [class.bg-danger]="modelo.velocidadVenta === 'baja'">
            {{modelo.diasPromedioRotacion}} días rotación
          </span>
        </div>
      </div>

      <div class="modelo-tendencia">
        <i class="bi" 
           [class.bi-arrow-up-circle-fill]="modelo.tendencia === 'up'"
           [class.bi-arrow-down-circle-fill]="modelo.tendencia === 'down'"
           [class.bi-dash-circle-fill]="modelo.tendencia === 'stable'"
           [class.text-success]="modelo.tendencia === 'up'"
           [class.text-danger]="modelo.tendencia === 'down'"
           [class.text-secondary]="modelo.tendencia === 'stable'">
        </i>
      </div>
    </div>
  </div>

  <div *ngIf="!isLoading && topModelos.length === 0" class="text-center p-4 text-muted">
    No hay datos de ventas en este período
  </div>
</div>
```

---

### **Widget 2: Velocidad de Rotación de Inventario** (Prioridad Alta)

Similar estructura pero enfocado en días promedio de rotación con alertas:

```typescript
// Lógica para identificar productos con rotación lenta
const productosLentos = topModelos
  .filter(m => m.diasPromedioRotacion > 60)
  .map(m => ({
    modelo: m.modelo,
    diasRotacion: m.diasPromedioRotacion,
    alerta: `⚠️ Rotación lenta (${m.diasPromedioRotacion} días). Considerar promoción.`
  }));
```

---

### **Widget 3: Ranking de Vendedores** (Prioridad Alta)

Similar a `generateSalesInsights()` pero con visualización mejorada.

---

## ✅ Conclusión y Recomendaciones

### **El endpoint de Equipos Vendidos ES MUY ÚTIL** porque:

1. ✅ **Datos Completos**: Tiene toda la información necesaria (modelo, precio, costo, fechas, vendedor, suplidor)
2. ✅ **Ya Funcional**: El método `getEquipoVendidoParaInsights()` ya existe
3. ✅ **Base Sólida**: Ya hay lógica de insights en `equipo-consulta-vendido.component.ts`
4. ✅ **Análisis Avanzados Posibles**: Permite calcular rentabilidad, rotación, tendencias, anomalías

### **Próximos Pasos Sugeridos**:

1. **Extraer lógica de insights a un servicio compartido**:
   ```typescript
   // dashboard-analytics.service.ts
   export class DashboardAnalyticsService {
     analizarTopModelos(equipos: EquipoVendido[])
     analizarRentabilidad(equipos: EquipoVendido[])
     analizarVendedores(equipos: EquipoVendido[])
     analizarRotacion(equipos: EquipoVendido[])
     detectarAnomalias(equipos: EquipoVendido[])
     predecirVentas(equipos: EquipoVendido[], diasFuturos: number)
   }
   ```

2. **Crear widgets reutilizables** para el dashboard

3. **Combinar con endpoint de Utilidades** para tener visión 360°:
   - Utilidades: Resumen agregado (más rápido)
   - Equipos Vendidos: Análisis detallado (más profundo)

4. **Implementar caché** para no consultar en cada refresh (15-30 min)

---

## 🎯 Prioridad de Implementación

| Widget | Prioridad | Complejidad | Impacto | Días Estimados |
|--------|-----------|-------------|---------|----------------|
| Top 5 Modelos | 🔴 Alta | Baja | Alto | 1-2 |
| Ranking Vendedores | 🔴 Alta | Baja | Alto | 1-2 |
| Velocidad Rotación | 🟡 Media | Media | Alto | 2-3 |
| Rentabilidad por Modelo | 🟡 Media | Media | Medio | 2-3 |
| Detección Anomalías | 🟢 Baja | Alta | Medio | 3-4 |
| Predicción Ventas | 🟢 Baja | Alta | Alto | 4-5 |

**Total estimado Fase 1 (widgets prioritarios)**: 4-7 días de desarrollo
