# 📊 Plan de Mejora del Dashboard con IA - MVSystem

## 🎯 Objetivo
Transformar el dashboard actual en un panel inteligente que proporcione insights predictivos, alertas automáticas y análisis avanzados utilizando IA para mejorar la toma de decisiones del usuario.

---

## 📋 Estado Actual del Dashboard

### Características Actuales:
- **Visualizaciones básicas**: 3 gráficos de pie (Día, Semana, Mes)
- **Datos mostrados**: Ventas por categoría (Equipos, Accesorios, Desbloqueos, Reparaciones)
- **Periodo**: Filtros por día actual, semana actual, mes actual
- **Limitaciones**:
  - Sin predicciones ni tendencias
  - Sin alertas inteligentes
  - Sin recomendaciones personalizadas
  - Sin detección de anomalías
  - Sin análisis comparativo
  - Sin insights automáticos

---

## 🚀 Fase 1: Widgets Inteligentes Básicos (1-2 semanas)

### 1.1 **Widget: Resumen Inteligente con IA**
**Descripción**: Panel superior con métricas clave y análisis automático generado por IA.

**Características**:
- 📈 **Ventas Totales del Día** con comparación vs día anterior (%, ↑↓)
- 💰 **Ganancia Neta del Día** con indicador de tendencia
- 🎯 **Producto Estrella del Día** (el de mayor venta)
- 📊 **Rendimiento del Mes** vs mes anterior
- 🤖 **Insight Generado por IA**: Análisis automático en lenguaje natural
  - Ejemplo: *"Las ventas de equipos aumentaron un 25% respecto a ayer. Se detecta alta demanda de accesorios en las últimas 4 horas."*

**Endpoints Necesarios**:
```typescript
// Nuevo endpoint: Resumen inteligente
GET /api/dashboard/resumen-inteligente
Query Params: {
  sucursal: number,
  fechaActual: string
}
Response: {
  ventasHoy: number,
  ventasAyer: number,
  porcentajeCambio: number,
  gananciaHoy: number,
  gananciaAyer: number,
  productoEstrella: {
    nombre: string,
    categoria: string,
    cantidad: number,
    totalVenta: number
  },
  ventasMes: number,
  ventasMesAnterior: number,
  insightIA: string // Generado por algoritmo de IA
}
```

**Algoritmo IA Backend**:
```csharp
// Lógica para generar insights automáticos
public class InsightGenerator {
    public string GenerarInsight(DatosVentas datos) {
        var insights = new List<string>();

        // Análisis de tendencia
        if (datos.CambioPorcentual > 20) {
            insights.Add($"📈 Excelente día: Las ventas aumentaron un {datos.CambioPorcentual}% respecto a ayer.");
        } else if (datos.CambioPorcentual < -10) {
            insights.Add($"⚠️ Atención: Las ventas bajaron un {Math.Abs(datos.CambioPorcentual)}%. Considera promociones.");
        }

        // Producto estrella
        insights.Add($"🌟 {datos.ProductoEstrella} es el producto más vendido hoy.");

        // Recomendación
        if (datos.InventarioBajo.Any()) {
            insights.Add($"🔔 Stock bajo en: {string.Join(", ", datos.InventarioBajo)}. Considera reabastecer.");
        }

        return string.Join(" ", insights);
    }
}
```

---

### 1.2 **Widget: Top 5 Productos/Modelos Más Vendidos**
**Descripción**: Lista visual de los productos más populares con análisis de tendencia.

**Características**:
- 🏆 Ranking visual de top 5 productos
- 📊 Cantidad vendida y monto total
- 📈 Indicador de tendencia (subiendo/bajando)
- 🎨 Barra de progreso visual
- 🔄 Filtros: Hoy, Semana, Mes

**Endpoints Necesarios**:
```typescript
// Nuevo endpoint: Top productos
GET /api/dashboard/top-productos
Query Params: {
  sucursal: number,
  fechaInicio: string,
  fechaFinal: string,
  limite: number // default: 5
}
Response: {
  productos: [
    {
      ranking: number,
      nombre: string,
      modelo: string,
      categoria: string, // 'Equipo' | 'Accesorio' | 'Reparacion' | 'Desbloqueo'
      cantidadVendida: number,
      totalVenta: number,
      tendencia: 'up' | 'down' | 'stable', // Comparado con periodo anterior
      porcentajeTendencia: number
    }
  ]
}
```

---

### 1.3 **Widget: Alertas Inteligentes en Tiempo Real**
**Descripción**: Sistema de notificaciones automáticas basado en reglas de IA.

**Características**:
- 🔴 **Alertas Críticas**: Stock bajo, ventas inusuales, facturas pendientes antiguas
- 🟡 **Advertencias**: Tendencias negativas, metas no alcanzadas
- 🟢 **Oportunidades**: Productos en alta demanda, momento óptimo para promociones
- 🔔 Badge con contador de alertas pendientes
- 📱 Notificaciones push (opcional)

**Tipos de Alertas IA**:
1. **Stock Crítico**: "⚠️ Solo quedan 3 unidades del iPhone 15 Pro"
2. **Anomalía de Ventas**: "📊 Ventas 40% por debajo del promedio histórico"
3. **Cliente Importante**: "👤 Cliente con 5 facturas pendientes hace >30 días"
4. **Oportunidad**: "🚀 Alta demanda de accesorios en las últimas 2 horas"
5. **Reparación Atrasada**: "⏰ 3 reparaciones llevan >7 días en estatus Pendiente"

**Endpoints Necesarios**:
```typescript
// Nuevo endpoint: Alertas inteligentes
GET /api/dashboard/alertas-inteligentes
Query Params: {
  sucursal: number,
  usuario: string
}
Response: {
  alertas: [
    {
      id: number,
      tipo: 'critica' | 'advertencia' | 'oportunidad',
      icono: string,
      titulo: string,
      mensaje: string,
      fecha: string,
      accion?: {
        texto: string,
        ruta: string // Para navegar al módulo correspondiente
      },
      leida: boolean
    }
  ],
  totalNoLeidas: number
}
```

---

## 🔮 Fase 2: Análisis Predictivo y Tendencias (2-3 semanas)

### 2.1 **Widget: Pronóstico de Ventas (Machine Learning)**
**Descripción**: Predicción de ventas usando algoritmos de IA basados en datos históricos.

**Características**:
- 📈 Gráfico de línea con datos reales vs predicción
- 🎯 Predicción de ventas para próximos 7/15/30 días
- 🧮 Nivel de confianza de la predicción (%)
- 📊 Factores que influyen en la predicción
- 🔄 Se actualiza automáticamente con nuevos datos

**Algoritmo IA (Backend)**:
```csharp
// Modelo de predicción simple usando regresión lineal o ARIMA
public class PrediccionVentas {
    public ResultadoPrediccion PredecirVentas(List<VentaDiaria> historial, int diasFuturos) {
        // 1. Analizar tendencia histórica (últimos 60 días)
        var tendencia = CalcularTendencia(historial);

        // 2. Detectar estacionalidad (días de la semana, días del mes)
        var estacionalidad = DetectarEstacionalidad(historial);

        // 3. Aplicar modelo de predicción
        var predicciones = new List<PrediccionDia>();
        for (int i = 1; i <= diasFuturos; i++) {
            var prediccion = tendencia * i + estacionalidad[i % 7] + AjustarPorEventos(i);
            predicciones.Add(new PrediccionDia {
                Fecha = DateTime.Now.AddDays(i),
                VentaEstimada = prediccion,
                ConfianzaMin = prediccion * 0.85,
                ConfianzaMax = prediccion * 1.15
            });
        }

        return new ResultadoPrediccion {
            Predicciones = predicciones,
            NivelConfianza = CalcularConfianza(historial),
            Factores = ObtenerFactoresInfluyentes()
        };
    }
}
```

**Endpoints Necesarios**:
```typescript
// Nuevo endpoint: Predicción de ventas
GET /api/dashboard/prediccion-ventas
Query Params: {
  sucursal: number,
  diasFuturos: number // 7, 15, 30
}
Response: {
  predicciones: [
    {
      fecha: string,
      ventaEstimada: number,
      rangoMinimo: number,
      rangoMaximo: number
    }
  ],
  nivelConfianza: number, // 0-100%
  factoresInfluyentes: [
    { factor: string, impacto: number }
  ],
  tendenciaGeneral: 'alcista' | 'bajista' | 'estable'
}
```

---

### 2.2 **Widget: Análisis de Rentabilidad por Categoría**
**Descripción**: Visualización detallada de costos, ventas y márgenes de ganancia.

**Características**:
- 💵 **Costo Total** por categoría
- 💰 **Venta Total** por categoría
- 📊 **Margen de Ganancia** (%) con código de colores
- 📈 Comparación mes actual vs mes anterior
- 🎯 Indicador de categoría más rentable
- ⚠️ Alertas de márgenes bajos

**Endpoints Necesarios**:
```typescript
// Mejorar endpoint existente con más detalle
GET /api/dashboard/rentabilidad-categorias
Query Params: {
  sucursal: number,
  fechaInicio: string,
  fechaFinal: string
}
Response: {
  categorias: [
    {
      nombre: string,
      costoTotal: number,
      ventaTotal: number,
      gananciaTotal: number,
      margenPorcentaje: number,
      cantidadVendida: number,
      promedioVentaPorUnidad: number,
      tendencia: {
        cambioVentas: number,
        cambioMargen: number
      },
      recomendacionIA: string // "Margen bajo. Considera ajustar precios."
    }
  ],
  mejorCategoria: string,
  peorCategoria: string
}
```

---

### 2.3 **Widget: Mapa de Calor de Actividad**
**Descripción**: Visualización de patrones de ventas por hora y día de la semana.

**Características**:
- 🗓️ Grid visual de 7 días x 24 horas
- 🎨 Código de colores según intensidad de ventas
- 📊 Identificación de horas pico y valles
- 🤖 Recomendaciones de horarios óptimos para promociones

**Endpoints Necesarios**:
```typescript
// Nuevo endpoint: Patrón de actividad
GET /api/dashboard/patron-actividad
Query Params: {
  sucursal: number,
  semanas: number // últimas N semanas a analizar
}
Response: {
  mapaCalor: [
    {
      diaSemana: number, // 0=Domingo, 6=Sábado
      hora: number, // 0-23
      cantidadVentas: number,
      montoTotal: number,
      intensidad: number // 0-100
    }
  ],
  horasPico: [
    { dia: string, hora: number, promedio: number }
  ],
  recomendaciones: string[]
}
```

---

## 🎨 Fase 3: Personalización e Insights Avanzados (2-3 semanas)

### 3.1 **Widget: Recomendaciones Personalizadas por Usuario**
**Descripción**: Sistema de recomendaciones basado en rol, permisos y comportamiento del usuario.

**Características**:
- 👤 Recomendaciones adaptadas al rol (Vendedor, Administrador, Gerente)
- 🎯 Acciones sugeridas priorizadas
- 📋 Quick actions (botones directos a acciones comunes)
- 🏆 Metas y logros personalizados

**Ejemplos por Rol**:
- **Vendedor**:
  - "📞 Tienes 3 clientes con facturas por cobrar"
  - "🎯 Te faltan $5,000 para alcanzar tu meta mensual"
  - "🏆 ¡Eres el vendedor #1 de la semana!"

- **Gerente**:
  - "📊 Revisar inventario: 12 productos con stock crítico"
  - "💰 Rentabilidad de reparaciones bajó 15% esta semana"
  - "👥 3 vendedores bajo su meta mensual"

**Endpoints Necesarios**:
```typescript
// Nuevo endpoint: Recomendaciones personalizadas
GET /api/dashboard/recomendaciones-personalizadas
Query Params: {
  usuario: string,
  rol: string,
  sucursal: number
}
Response: {
  recomendaciones: [
    {
      prioridad: 'alta' | 'media' | 'baja',
      icono: string,
      titulo: string,
      descripcion: string,
      accion: {
        texto: string,
        tipo: 'navegacion' | 'modal' | 'externa',
        destino: string
      }
    }
  ],
  metasUsuario: {
    ventasMes: number,
    metaMensual: number,
    porcentajeAlcanzado: number,
    diasRestantes: number
  },
  logros: [
    { titulo: string, icono: string, desbloqueado: boolean }
  ]
}
```

---

### 3.2 **Widget: Comparador de Períodos Inteligente**
**Descripción**: Análisis comparativo automático entre diferentes períodos de tiempo.

**Características**:
- 📅 Comparación configurable (Día vs Día, Semana vs Semana, Mes vs Mes)
- 📊 Gráficos de barras comparativas
- 🔢 Tabla de métricas clave con variaciones
- 🤖 Análisis automático de diferencias significativas
- 💡 Insights sobre causas probables

**Endpoints Necesarios**:
```typescript
// Nuevo endpoint: Comparación de períodos
GET /api/dashboard/comparacion-periodos
Query Params: {
  sucursal: number,
  periodo1Inicio: string,
  periodo1Final: string,
  periodo2Inicio: string,
  periodo2Final: string
}
Response: {
  comparacion: {
    periodo1: { inicio: string, final: string, ventas: number, ganancia: number },
    periodo2: { inicio: string, final: string, ventas: number, ganancia: number },
    diferencias: {
      ventas: { absoluta: number, porcentaje: number },
      ganancia: { absoluta: number, porcentaje: number },
      transacciones: { absoluta: number, porcentaje: number }
    },
    categorias: [
      {
        nombre: string,
        periodo1: number,
        periodo2: number,
        variacion: number
      }
    ],
    analisisIA: string // Explicación de las diferencias
  }
}
```

---

### 3.3 **Widget: Detección de Anomalías**
**Descripción**: Sistema automático que detecta comportamientos inusuales en ventas, inventario y operaciones.

**Características**:
- 🔍 Detección automática de patrones anormales
- 🚨 Alertas de fraude potencial o errores
- 📉 Identificación de caídas abruptas en ventas
- 📈 Detección de picos inusuales (positivos o negativos)
- 🧠 Aprendizaje continuo de patrones normales

**Algoritmo IA (Backend)**:
```csharp
public class DetectorAnomalias {
    // Usa desviación estándar para detectar outliers
    public List<Anomalia> DetectarAnomalias(List<VentaDiaria> historial) {
        var anomalias = new List<Anomalia>();
        var promedio = historial.Average(v => v.Total);
        var desviacionEstandar = CalcularDesviacionEstandar(historial);

        foreach (var venta in historial) {
            var zScore = (venta.Total - promedio) / desviacionEstandar;

            if (Math.Abs(zScore) > 2.5) { // Más de 2.5 desviaciones
                anomalias.Add(new Anomalia {
                    Fecha = venta.Fecha,
                    Tipo = zScore > 0 ? "Pico inusual" : "Caída inusual",
                    ValorEsperado = promedio,
                    ValorReal = venta.Total,
                    Severidad = Math.Abs(zScore) > 3 ? "Alta" : "Media",
                    PosibleCausa = AnalizarCausa(venta, historial)
                });
            }
        }

        return anomalias;
    }
}
```

**Endpoints Necesarios**:
```typescript
// Nuevo endpoint: Detección de anomalías
GET /api/dashboard/deteccion-anomalias
Query Params: {
  sucursal: number,
  diasAnalisis: number // últimos N días
}
Response: {
  anomalias: [
    {
      fecha: string,
      tipo: string,
      descripcion: string,
      severidad: 'alta' | 'media' | 'baja',
      valorEsperado: number,
      valorReal: number,
      posibleCausa: string,
      recomendacion: string
    }
  ],
  totalAnomalias: number,
  periodosRiesgo: string[]
}
```

---

## 🛠️ Fase 4: Implementación Técnica

### 4.1 **Arquitectura de Componentes Angular**

```typescript
// Estructura de carpetas
src/app/MVSystem/pages/dashboard/
  ├── dashboard.component.ts (componente principal)
  ├── dashboard.component.html
  ├── dashboard.component.css
  ├── widgets/
  │   ├── resumen-inteligente/
  │   │   ├── resumen-inteligente.component.ts
  │   │   ├── resumen-inteligente.component.html
  │   │   └── resumen-inteligente.component.css
  │   ├── top-productos/
  │   ├── alertas-inteligentes/
  │   ├── prediccion-ventas/
  │   ├── rentabilidad-categorias/
  │   ├── mapa-calor/
  │   ├── recomendaciones-personalizadas/
  │   ├── comparador-periodos/
  │   └── deteccion-anomalias/
  ├── services/
  │   ├── dashboard-ia.service.ts
  │   └── alertas.service.ts
  └── interfaces/
      └── dashboard-ia.interface.ts
```

### 4.2 **Servicios Angular**

```typescript
// dashboard-ia.service.ts
@Injectable({ providedIn: 'root' })
export class DashboardIAService {
  constructor(private http: HttpClient) {}

  getResumenInteligente(sucursal: number, fecha: string): Observable<ResumenInteligente> {
    return this.http.get<ResumenInteligente>(
      `${APIURL.Dashboard.ResumenInteligente}`,
      { params: { sucursal, fechaActual: fecha } }
    );
  }

  getTopProductos(filtro: TopProductosFiltro): Observable<TopProductos> {
    return this.http.get<TopProductos>(
      `${APIURL.Dashboard.TopProductos}`,
      { params: { ...filtro } }
    );
  }

  getAlertasInteligentes(sucursal: number, usuario: string): Observable<AlertasResponse> {
    return this.http.get<AlertasResponse>(
      `${APIURL.Dashboard.AlertasInteligentes}`,
      { params: { sucursal, usuario } }
    );
  }

  getPrediccionVentas(sucursal: number, diasFuturos: number): Observable<PrediccionVentas> {
    return this.http.get<PrediccionVentas>(
      `${APIURL.Dashboard.PrediccionVentas}`,
      { params: { sucursal, diasFuturos } }
    );
  }

  // ... más métodos para otros widgets
}
```

### 4.3 **Interfaces TypeScript**

```typescript
// dashboard-ia.interface.ts
export interface ResumenInteligente {
  ventasHoy: number;
  ventasAyer: number;
  porcentajeCambio: number;
  gananciaHoy: number;
  gananciaAyer: number;
  productoEstrella: ProductoEstrella;
  ventasMes: number;
  ventasMesAnterior: number;
  insightIA: string;
}

export interface ProductoEstrella {
  nombre: string;
  categoria: 'Equipo' | 'Accesorio' | 'Reparacion' | 'Desbloqueo';
  cantidad: number;
  totalVenta: number;
}

export interface TopProducto {
  ranking: number;
  nombre: string;
  modelo: string;
  categoria: string;
  cantidadVendida: number;
  totalVenta: number;
  tendencia: 'up' | 'down' | 'stable';
  porcentajeTendencia: number;
}

export interface Alerta {
  id: number;
  tipo: 'critica' | 'advertencia' | 'oportunidad';
  icono: string;
  titulo: string;
  mensaje: string;
  fecha: string;
  accion?: {
    texto: string;
    ruta: string;
  };
  leida: boolean;
}

export interface PrediccionDia {
  fecha: string;
  ventaEstimada: number;
  rangoMinimo: number;
  rangoMaximo: number;
}

export interface PrediccionVentas {
  predicciones: PrediccionDia[];
  nivelConfianza: number;
  factoresInfluyentes: { factor: string; impacto: number }[];
  tendenciaGeneral: 'alcista' | 'bajista' | 'estable';
}
```

### 4.4 **URL Configuration**

```typescript
// config/url.ts - Agregar nuevas rutas
export const APIURL = {
  // ... rutas existentes
  Dashboard: {
    ResumenInteligente: `${BASE_URL}/api/dashboard/resumen-inteligente`,
    TopProductos: `${BASE_URL}/api/dashboard/top-productos`,
    AlertasInteligentes: `${BASE_URL}/api/dashboard/alertas-inteligentes`,
    PrediccionVentas: `${BASE_URL}/api/dashboard/prediccion-ventas`,
    RentabilidadCategorias: `${BASE_URL}/api/dashboard/rentabilidad-categorias`,
    PatronActividad: `${BASE_URL}/api/dashboard/patron-actividad`,
    RecomendacionesPersonalizadas: `${BASE_URL}/api/dashboard/recomendaciones-personalizadas`,
    ComparacionPeriodos: `${BASE_URL}/api/dashboard/comparacion-periodos`,
    DeteccionAnomalias: `${BASE_URL}/api/dashboard/deteccion-anomalias`,
    MarcarAlertaLeida: `${BASE_URL}/api/dashboard/alertas/marcar-leida`
  }
};
```

---

## 🎨 Fase 5: Diseño UX/UI Mejorado

### 5.1 **Layout Responsive del Dashboard**

```html
<!-- dashboard.component.html - Nuevo diseño -->
<div class="dashboard-ia-container">

  <!-- Header con filtros y controles -->
  <div class="dashboard-header">
    <h2>Dashboard Inteligente</h2>
    <div class="dashboard-controls">
      <select [(ngModel)]="sucursalSeleccionada" (change)="cargarDatos()">
        <option *ngFor="let s of sucursales" [value]="s.id">{{s.nombre}}</option>
      </select>
      <button class="btn-refresh" (click)="refrescarDashboard()">
        <i class="bi bi-arrow-clockwise"></i> Actualizar
      </button>
    </div>
  </div>

  <!-- Badge de alertas -->
  <app-alertas-badge
    [totalNoLeidas]="totalAlertas"
    (abrirAlertas)="mostrarAlertas()">
  </app-alertas-badge>

  <!-- Grid de widgets -->
  <div class="dashboard-grid">

    <!-- Fila 1: Resumen inteligente (ancho completo) -->
    <div class="widget-full-width">
      <app-resumen-inteligente
        [sucursal]="sucursalSeleccionada"
        [fecha]="fechaActual">
      </app-resumen-inteligente>
    </div>

    <!-- Fila 2: Top productos + Predicción -->
    <div class="widget-half">
      <app-top-productos
        [sucursal]="sucursalSeleccionada"
        [periodo]="periodoSeleccionado">
      </app-top-productos>
    </div>
    <div class="widget-half">
      <app-prediccion-ventas
        [sucursal]="sucursalSeleccionada"
        [diasFuturos]="7">
      </app-prediccion-ventas>
    </div>

    <!-- Fila 3: Rentabilidad + Mapa de calor -->
    <div class="widget-half">
      <app-rentabilidad-categorias
        [sucursal]="sucursalSeleccionada"
        [fechaInicio]="inicioMes"
        [fechaFinal]="fechaActual">
      </app-rentabilidad-categorias>
    </div>
    <div class="widget-half">
      <app-mapa-calor
        [sucursal]="sucursalSeleccionada"
        [semanas]="4">
      </app-mapa-calor>
    </div>

    <!-- Fila 4: Gráficos originales mejorados -->
    <div class="widget-third">
      <app-grafico-ventas
        titulo="Ventas Hoy"
        [datos]="ventasHoy"
        [colorScheme]="colorScheme">
      </app-grafico-ventas>
    </div>
    <div class="widget-third">
      <app-grafico-ventas
        titulo="Ventas Semana"
        [datos]="ventasSemana"
        [colorScheme]="Neon">
      </app-grafico-ventas>
    </div>
    <div class="widget-third">
      <app-grafico-ventas
        titulo="Ventas Mes"
        [datos]="ventasMes"
        [colorScheme]="Ordinal">
      </app-grafico-ventas>
    </div>

    <!-- Fila 5: Recomendaciones + Anomalías -->
    <div class="widget-half">
      <app-recomendaciones-personalizadas
        [usuario]="usuarioActual"
        [rol]="rolUsuario"
        [sucursal]="sucursalSeleccionada">
      </app-recomendaciones-personalizadas>
    </div>
    <div class="widget-half">
      <app-deteccion-anomalias
        [sucursal]="sucursalSeleccionada"
        [diasAnalisis]="30">
      </app-deteccion-anomalias>
    </div>

  </div>

  <!-- Panel lateral de alertas (slide-in) -->
  <app-panel-alertas
    [mostrar]="mostrarPanelAlertas"
    [alertas]="alertas"
    (cerrar)="ocultarAlertas()"
    (accionAlerta)="ejecutarAccion($event)">
  </app-panel-alertas>

</div>
```

### 5.2 **Estilos CSS Modernos**

```css
/* dashboard.component.css */
.dashboard-ia-container {
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.widget-full-width {
  grid-column: 1 / -1;
}

.widget-half {
  grid-column: span 1;
}

@media (min-width: 768px) {
  .widget-half {
    grid-column: span 1;
  }
}

@media (min-width: 1200px) {
  .dashboard-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  .widget-third {
    grid-column: span 1;
  }
}

/* Estilos para widgets */
.widget-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: transform 0.2s, box-shadow 0.2s;
}

.widget-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0,0,0,0.12);
}

/* Badge de alertas */
.alertas-badge {
  position: fixed;
  top: 80px;
  right: 20px;
  background: #ff4757;
  color: white;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(255,71,87,0.4);
  z-index: 1000;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

/* Animaciones de entrada */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.widget-card {
  animation: fadeInUp 0.5s ease-out;
}
```

---

## 📊 Fase 6: Endpoints Backend (APIs .NET)

### 6.1 **Controlador Dashboard**

```csharp
// DashboardController.cs
[ApiController]
[Route("api/dashboard")]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;
    private readonly IInsightGeneratorService _insightGenerator;

    public DashboardController(
        IDashboardService dashboardService,
        IInsightGeneratorService insightGenerator)
    {
        _dashboardService = dashboardService;
        _insightGenerator = insightGenerator;
    }

    [HttpGet("resumen-inteligente")]
    public async Task<ActionResult<ResumenInteligenteDto>> GetResumenInteligente(
        [FromQuery] int sucursal,
        [FromQuery] string fechaActual)
    {
        var resumen = await _dashboardService.ObtenerResumenInteligente(sucursal, fechaActual);
        resumen.InsightIA = _insightGenerator.GenerarInsight(resumen);
        return Ok(resumen);
    }

    [HttpGet("top-productos")]
    public async Task<ActionResult<TopProductosDto>> GetTopProductos(
        [FromQuery] int sucursal,
        [FromQuery] string fechaInicio,
        [FromQuery] string fechaFinal,
        [FromQuery] int limite = 5)
    {
        var topProductos = await _dashboardService.ObtenerTopProductos(
            sucursal, fechaInicio, fechaFinal, limite);
        return Ok(topProductos);
    }

    [HttpGet("alertas-inteligentes")]
    public async Task<ActionResult<AlertasDto>> GetAlertasInteligentes(
        [FromQuery] int sucursal,
        [FromQuery] string usuario)
    {
        var alertas = await _dashboardService.GenerarAlertasInteligentes(sucursal, usuario);
        return Ok(alertas);
    }

    [HttpGet("prediccion-ventas")]
    public async Task<ActionResult<PrediccionVentasDto>> GetPrediccionVentas(
        [FromQuery] int sucursal,
        [FromQuery] int diasFuturos = 7)
    {
        var prediccion = await _dashboardService.PredecirVentas(sucursal, diasFuturos);
        return Ok(prediccion);
    }

    [HttpGet("rentabilidad-categorias")]
    public async Task<ActionResult<RentabilidadCategoriasDto>> GetRentabilidadCategorias(
        [FromQuery] int sucursal,
        [FromQuery] string fechaInicio,
        [FromQuery] string fechaFinal)
    {
        var rentabilidad = await _dashboardService.AnalisisRentabilidadCategorias(
            sucursal, fechaInicio, fechaFinal);
        return Ok(rentabilidad);
    }

    [HttpGet("patron-actividad")]
    public async Task<ActionResult<PatronActividadDto>> GetPatronActividad(
        [FromQuery] int sucursal,
        [FromQuery] int semanas = 4)
    {
        var patron = await _dashboardService.AnalizarPatronActividad(sucursal, semanas);
        return Ok(patron);
    }

    [HttpGet("deteccion-anomalias")]
    public async Task<ActionResult<DeteccionAnomaliasDto>> GetDeteccionAnomalias(
        [FromQuery] int sucursal,
        [FromQuery] int diasAnalisis = 30)
    {
        var anomalias = await _dashboardService.DetectarAnomalias(sucursal, diasAnalisis);
        return Ok(anomalias);
    }

    [HttpPost("alertas/marcar-leida")]
    public async Task<IActionResult> MarcarAlertaLeida([FromBody] int alertaId)
    {
        await _dashboardService.MarcarAlertaComoLeida(alertaId);
        return Ok(new { mensaje = "Alerta marcada como leída" });
    }
}
```

### 6.2 **Stored Procedures SQL Server**

```sql
-- SP_Dashboard_ResumenInteligente
CREATE PROCEDURE SP_Dashboard_ResumenInteligente
    @Sucursal INT,
    @FechaActual DATE
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @FechaAyer DATE = DATEADD(DAY, -1, @FechaActual);
    DECLARE @InicioMes DATE = DATEFROMPARTS(YEAR(@FechaActual), MONTH(@FechaActual), 1);
    DECLARE @MesAnterior DATE = DATEADD(MONTH, -1, @InicioMes);

    -- Ventas de hoy
    DECLARE @VentasHoy DECIMAL(18,2) = (
        SELECT ISNULL(SUM(Total), 0)
        FROM Facturas
        WHERE ID_Sucursal = @Sucursal
        AND CAST(FechaRegistro AS DATE) = @FechaActual
    );

    -- Ventas de ayer
    DECLARE @VentasAyer DECIMAL(18,2) = (
        SELECT ISNULL(SUM(Total), 0)
        FROM Facturas
        WHERE ID_Sucursal = @Sucursal
        AND CAST(FechaRegistro AS DATE) = @FechaAyer
    );

    -- Producto estrella del día
    SELECT TOP 1
        @VentasHoy AS VentasHoy,
        @VentasAyer AS VentasAyer,
        CASE
            WHEN @VentasAyer > 0 THEN ((@VentasHoy - @VentasAyer) / @VentasAyer) * 100
            ELSE 0
        END AS PorcentajeCambio,
        -- ... más campos
    FROM DetalleFacturas DF
    -- ... lógica para producto estrella
END
GO

-- SP_Dashboard_TopProductos
CREATE PROCEDURE SP_Dashboard_TopProductos
    @Sucursal INT,
    @FechaInicio DATE,
    @FechaFinal DATE,
    @Limite INT = 5
AS
BEGIN
    -- Productos más vendidos con tendencia
    ;WITH VentasActuales AS (
        SELECT
            COALESCE(E.Modelo, A.Nombre, 'Servicio') AS Nombre,
            COUNT(*) AS CantidadVendida,
            SUM(DF.Precio) AS TotalVenta
        FROM DetalleFacturas DF
        INNER JOIN Facturas F ON DF.NumeroFactura = F.NumeroFactura
        LEFT JOIN Equipos E ON DF.IMEI = E.IMEI
        LEFT JOIN Accesorios A ON DF.ID_Accesorio = A.ID
        WHERE F.ID_Sucursal = @Sucursal
        AND CAST(F.FechaRegistro AS DATE) BETWEEN @FechaInicio AND @FechaFinal
        GROUP BY COALESCE(E.Modelo, A.Nombre, 'Servicio')
    )
    SELECT TOP (@Limite)
        ROW_NUMBER() OVER (ORDER BY TotalVenta DESC) AS Ranking,
        Nombre,
        CantidadVendida,
        TotalVenta,
        -- Calcular tendencia comparando con período anterior
        'up' AS Tendencia, -- Simplificado
        0 AS PorcentajeTendencia
    FROM VentasActuales
    ORDER BY TotalVenta DESC;
END
GO

-- SP_Dashboard_AlertasInteligentes
CREATE PROCEDURE SP_Dashboard_AlertasInteligentes
    @Sucursal INT,
    @Usuario VARCHAR(50)
AS
BEGIN
    -- Stock crítico
    INSERT INTO #AlertasTemp (Tipo, Icono, Titulo, Mensaje, Prioridad)
    SELECT
        'critica',
        'exclamation-triangle-fill',
        'Stock Crítico',
        'Solo quedan ' + CAST(COUNT(*) AS VARCHAR) + ' unidades de ' + Modelo,
        'alta'
    FROM Equipos
    WHERE ID_Sucursal = @Sucursal
    AND Estado = 'Disponible'
    GROUP BY Modelo
    HAVING COUNT(*) <= 3;

    -- Facturas pendientes antiguas
    INSERT INTO #AlertasTemp
    SELECT
        'advertencia',
        'clock-history',
        'Facturas Pendientes',
        CAST(COUNT(*) AS VARCHAR) + ' facturas con más de 30 días pendientes',
        'media'
    FROM Facturas
    WHERE Estado = 'Pendiente'
    AND DATEDIFF(DAY, FechaRegistro, GETDATE()) > 30;

    -- ... más lógica de alertas

    SELECT * FROM #AlertasTemp ORDER BY Prioridad DESC;
END
GO
```

---

## 📈 Fase 7: Cronograma de Implementación

| Semana | Tarea | Responsable | Estado |
|--------|-------|-------------|---------|
| 1-2 | **Fase 1**: Widgets básicos (Resumen, Top Productos, Alertas) | Frontend + Backend | 🔲 Pendiente |
| 3-4 | **Fase 2**: Análisis predictivo (Pronóstico, Rentabilidad, Mapa Calor) | Backend IA + Frontend | 🔲 Pendiente |
| 5-6 | **Fase 3**: Personalización (Recomendaciones, Comparador, Anomalías) | Full Stack | 🔲 Pendiente |
| 7 | **Fase 4-5**: Implementación técnica y diseño UX | Frontend | 🔲 Pendiente |
| 8 | **Fase 6**: Endpoints backend y SP | Backend | 🔲 Pendiente |
| 9 | **Integración y pruebas** | QA | 🔲 Pendiente |
| 10 | **Ajustes finales y deployment** | DevOps | 🔲 Pendiente |

---

## 🔧 Tecnologías y Librerías Necesarias

### Frontend (Angular)
- **ngx-charts**: Gráficos avanzados ✅ (ya instalado)
- **chart.js** o **echarts**: Gráficos de predicción y tendencias
- **@angular/animations**: Animaciones fluidas
- **rxjs**: Manejo de streams de datos en tiempo real
- **date-fns**: Manipulación de fechas
- **lodash**: Utilidades para análisis de datos

### Backend (.NET)
- **ML.NET**: Machine Learning para predicciones
- **MathNet.Numerics**: Cálculos estadísticos
- **Dapper**: ORM ligero para consultas SQL
- **SignalR**: Notificaciones en tiempo real (opcional)
- **Hangfire**: Jobs programados para actualizar insights

### Base de Datos
- **SQL Server**: Stored Procedures optimizados
- **Índices**: Para mejorar rendimiento de consultas analíticas
- **Vistas materializadas**: Para datos agregados frecuentes

---

## 📊 Métricas de Éxito

### KPIs del Nuevo Dashboard:
1. ✅ **Reducción de tiempo de análisis**: De 30 min a 2 min
2. ✅ **Precisión de predicciones**: >80% de accuracy
3. ✅ **Alertas accionables**: >70% de alertas con acción tomada
4. ✅ **Engagement de usuarios**: >90% uso diario del dashboard
5. ✅ **Detección de anomalías**: Identificar >95% de outliers
6. ✅ **Tiempo de carga**: <3 segundos para todos los widgets
7. ✅ **Satisfacción del usuario**: >4.5/5 en encuestas

---

## 🚀 Próximos Pasos Inmediatos

### Semana 1-2: Quick Wins
1. **Crear servicio `dashboard-ia.service.ts`**
2. **Implementar widget Resumen Inteligente** (el más impactante)
3. **Crear SP_Dashboard_ResumenInteligente** en backend
4. **Diseñar layout responsive** del nuevo dashboard
5. **Implementar sistema de alertas** básico

### Comandos para comenzar:
```bash
# Generar componentes Angular
ng g component MVSystem/pages/dashboard/widgets/resumen-inteligente
ng g component MVSystem/pages/dashboard/widgets/top-productos
ng g component MVSystem/pages/dashboard/widgets/alertas-inteligentes

# Generar servicios
ng g service core/services/dashboard-ia
ng g service core/services/alertas

# Generar interfaces
ng g interface core/interfaces/dashboard-ia
```

---

## 💡 Recomendaciones Finales

### Enfoque Ágil:
1. **Implementar por fases**: No intentar todo a la vez
2. **MVP primero**: Comenzar con widgets más impactantes
3. **Feedback continuo**: Involucrar a usuarios en cada fase
4. **Mejora iterativa**: Refinar algoritmos de IA con datos reales

### Optimización de Rendimiento:
1. **Caché inteligente**: Guardar insights por 15-30 min
2. **Lazy loading**: Cargar widgets bajo demanda
3. **Consultas optimizadas**: Índices y vistas materializadas
4. **Procesamiento asíncrono**: Jobs en background para cálculos pesados

### Seguridad:
1. **Permisos por rol**: No todos ven todos los insights
2. **Validación de datos**: Sanitizar entradas de usuario
3. **Rate limiting**: Evitar abuso de APIs de IA
4. **Auditoría**: Registrar acceso a datos sensibles

---

## ✨ Resultado Final Esperado

El dashboard transformado será:
- 🎯 **Proactivo**: Anticipa problemas antes de que ocurran
- 🧠 **Inteligente**: Aprende de patrones históricos
- 👤 **Personalizado**: Adaptado a cada rol y usuario
- ⚡ **Rápido**: Información clave en segundos
- 📱 **Responsive**: Funciona en móvil, tablet y desktop
- 🎨 **Atractivo**: Diseño moderno y profesional
- 🔔 **Accionable**: Insights que generan acciones concretas

**¡El dashboard pasará de ser un simple visor de gráficos a un asistente inteligente de toma de decisiones!** 🚀
