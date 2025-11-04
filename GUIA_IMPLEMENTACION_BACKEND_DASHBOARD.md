# 🔧 Guía de Implementación Backend - Dashboard IA

## 📋 Resumen
Este documento describe los endpoints que el backend debe implementar para soportar el Dashboard con IA.

**NOTA IMPORTANTE**: El frontend ya tiene un servicio `DashboardAnalyticsService` que procesa los datos de equipos vendidos localmente. Los endpoints del backend pueden ser **opcionales** inicialmente, ya que el frontend puede usar el endpoint existente `GET /api/Equipos/GetEquiposVendidos` y procesar los datos con IA del lado del cliente.

---

## 🎯 Estrategia de Implementación

### **Opción A: Procesamiento Cliente (Recomendado para MVP)**
✅ **Más rápido de implementar**
✅ **No requiere cambios en backend**
✅ **Usa el servicio `DashboardAnalyticsService` existente**

El frontend llamará a:
```typescript
// Endpoint YA existente
GET /api/Equipos/GetEquiposVendidos
```

Y procesará los datos localmente con:
```typescript
// Servicio Angular ya creado
this.dashboardAnalyticsService.analizarTopModelos(equipos);
this.dashboardAnalyticsService.analizarRentabilidad(equipos);
this.dashboardAnalyticsService.analizarVendedores(equipos);
this.dashboardAnalyticsService.detectarAnomalias(equipos);
// ... etc
```

**Ventajas**:
- ⚡ Implementación inmediata
- 🔄 Sin cambios en backend
- 🧪 Fácil de probar y ajustar
- 📊 Toda la lógica IA en un solo lugar

**Desventajas**:
- 🐌 Puede ser lento con muchos datos (>10,000 registros)
- 🌐 Requiere traer todos los datos al cliente
- 💾 Mayor uso de memoria del navegador

---

### **Opción B: Procesamiento Servidor (Para Producción)**
✅ **Mejor rendimiento con grandes volúmenes**
✅ **Menor carga en el cliente**
✅ **Cacheo más efectivo**

Requiere implementar los endpoints descritos abajo.

**Ventajas**:
- ⚡ Más rápido con muchos datos
- 💾 Menor uso de memoria en cliente
- 🔒 Lógica de negocio protegida en servidor
- 📊 Posibilidad de usar ML.NET para predicciones más avanzadas

**Desventajas**:
- ⏱️ Requiere tiempo de desarrollo backend
- 🧪 Más complejo de mantener
- 🔄 Lógica duplicada (cliente + servidor)

---

## 📦 Endpoints a Implementar (Opción B)

### 1. Resumen Ejecutivo IA
```http
GET /api/Dashboard/ResumenEjecutivo
```

**Query Params**:
```typescript
{
  sucursal: number,
  fechaInicio: string, // YYYY-MM-DD
  fechaFinal: string    // YYYY-MM-DD
}
```

**Response**:
```json
{
  "periodo": "01 nov - 04 nov",
  "insightPrincipal": "Durante este período se vendieron 45 equipos generando RD$125,000 de ganancia (28.5% margen). El modelo más exitoso fue \"iPhone 15 Pro\" y el vendedor destacado es Juan Pérez.",
  "metricsDestacadas": [
    {
      "title": "Total Vendido",
      "value": "RD$438,596",
      "description": "45 equipos",
      "icon": "bi bi-currency-dollar",
      "iconColor": "text-success",
      "tendencia": "up"
    }
  ],
  "alertasImportantes": [
    "⚠️ 3 anomalías críticas detectadas. Revisar urgentemente."
  ],
  "recomendacionesAccion": [
    {
      "prioridad": "alta",
      "accion": "Incrementar stock de \"iPhone 15 Pro\" (producto estrella)",
      "beneficioEstimado": "+37500 en ganancia"
    }
  ],
  "scoreRendimiento": 85
}
```

**Stored Procedure**:
```sql
CREATE PROCEDURE SP_Dashboard_ResumenEjecutivo
    @Sucursal INT,
    @FechaInicio DATE,
    @FechaFinal DATE
AS
BEGIN
    -- Lógica similar al servicio TypeScript pero en SQL
    -- Calcular métricas generales, identificar top modelo, top vendedor
    -- Detectar anomalías críticas
    -- Generar recomendaciones
END
```

---

### 2. Top Modelos Más Vendidos
```http
GET /api/Dashboard/TopProductos
```

**Query Params**:
```typescript
{
  sucursal: number,
  fechaInicio: string,
  fechaFinal: string,
  limite?: number // default: 5
}
```

**Response**:
```json
{
  "topModelos": [
    {
      "ranking": 1,
      "modelo": "iPhone 15 Pro",
      "cantidadVendida": 12,
      "totalVentas": 240000,
      "gananciaTotal": 72000,
      "margenPromedio": 30,
      "diasPromedioRotacion": 15,
      "velocidadVenta": "alta",
      "tendencia": "up"
    }
  ]
}
```

**Stored Procedure**:
```sql
CREATE PROCEDURE SP_Dashboard_TopModelos
    @Sucursal INT,
    @FechaInicio DATE,
    @FechaFinal DATE,
    @Limite INT = 5
AS
BEGIN
    ;WITH VentasModelo AS (
        SELECT
            COALESCE(M.Descripcion, 'Sin modelo') AS Modelo,
            COUNT(*) AS CantidadVendida,
            SUM(DF.Precio) AS TotalVentas,
            SUM(E.Costo_Equipo) AS TotalCostos,
            AVG(DATEDIFF(DAY, E.FechaRegistro, F.FechaRegistro)) AS DiasPromRotacion
        FROM DetalleFacturas DF
        INNER JOIN Facturas F ON DF.NumeroFactura = F.NumeroFactura
        LEFT JOIN Equipos E ON DF.IMEI = E.IMEI
        LEFT JOIN Modelos M ON E.ID_Modelo = M.ID
        WHERE F.ID_Sucursal = @Sucursal
        AND CAST(F.FechaRegistro AS DATE) BETWEEN @FechaInicio AND @FechaFinal
        GROUP BY M.Descripcion
    )
    SELECT TOP (@Limite)
        ROW_NUMBER() OVER (ORDER BY CantidadVendida DESC) AS Ranking,
        Modelo,
        CantidadVendida,
        TotalVentas,
        (TotalVentas - TotalCostos) AS GananciaTotal,
        CASE
            WHEN TotalVentas > 0 THEN ((TotalVentas - TotalCostos) / TotalVentas) * 100
            ELSE 0
        END AS MargenPromedio,
        DiasPromRotacion AS DiasPromedioRotacion,
        CASE
            WHEN DiasPromRotacion < 20 THEN 'alta'
            WHEN DiasPromRotacion < 45 THEN 'media'
            ELSE 'baja'
        END AS VelocidadVenta,
        'stable' AS Tendencia -- TODO: Comparar con período anterior
    FROM VentasModelo
    ORDER BY CantidadVendida DESC;
END
```

---

### 3. Detección de Anomalías
```http
GET /api/Dashboard/DeteccionAnomalias
```

**Query Params**:
```typescript
{
  sucursal: number,
  diasAnalisis?: number // default: 30
}
```

**Response**:
```json
{
  "totalAnomalias": 5,
  "anomaliasCriticas": 2,
  "anomalias": [
    {
      "id": 1,
      "tipo": "margen_negativo",
      "descripcion": "¡Margen negativo! Se vendió por debajo del costo (-5.2%)",
      "imei": "123456789012345",
      "modelo": "Samsung Galaxy S23",
      "vendedor": "Pedro López",
      "fechaDeteccion": "2025-11-03",
      "valor": -5.2,
      "valorEsperado": 20,
      "desvio": 25.2,
      "severidad": "critica",
      "accionRecomendada": "¡URGENTE! Revisar transacción inmediatamente.",
      "colorSeveridad": "#dc3545"
    }
  ],
  "resumenPorTipo": [
    {
      "tipo": "Margen Bajo",
      "cantidad": 3,
      "porcentaje": 60
    }
  ]
}
```

**Stored Procedure**:
```sql
CREATE PROCEDURE SP_Dashboard_DeteccionAnomalias
    @Sucursal INT,
    @DiasAnalisis INT = 30
AS
BEGIN
    DECLARE @FechaInicio DATE = DATEADD(DAY, -@DiasAnalisis, GETDATE());

    -- Calcular promedio y desviación estándar de precios
    DECLARE @PromedioPrecio DECIMAL(18,2);
    DECLARE @DesviacionPrecio DECIMAL(18,2);

    SELECT
        @PromedioPrecio = AVG(DF.Precio),
        @DesviacionPrecio = STDEV(DF.Precio)
    FROM DetalleFacturas DF
    INNER JOIN Facturas F ON DF.NumeroFactura = F.NumeroFactura
    WHERE F.ID_Sucursal = @Sucursal
    AND CAST(F.FechaRegistro AS DATE) >= @FechaInicio;

    -- Detectar anomalías
    CREATE TABLE #Anomalias (
        ID INT IDENTITY(1,1),
        Tipo VARCHAR(50),
        Descripcion VARCHAR(500),
        IMEI VARCHAR(20),
        Modelo VARCHAR(200),
        Vendedor VARCHAR(200),
        FechaDeteccion DATE,
        Valor DECIMAL(18,2),
        ValorEsperado DECIMAL(18,2),
        Desvio DECIMAL(18,2),
        Severidad VARCHAR(20),
        AccionRecomendada VARCHAR(500),
        ColorSeveridad VARCHAR(10)
    );

    -- 1. Detectar márgenes negativos
    INSERT INTO #Anomalias
    SELECT
        'margen_negativo',
        '¡Margen negativo! Se vendió por debajo del costo (' +
            CAST(ROUND(((DF.Precio - E.Costo_Equipo) / DF.Precio) * 100, 1) AS VARCHAR) + '%)',
        DF.IMEI,
        M.Descripcion,
        V.Nombre,
        CAST(F.FechaRegistro AS DATE),
        ((DF.Precio - E.Costo_Equipo) / DF.Precio) * 100,
        20,
        ABS(((DF.Precio - E.Costo_Equipo) / DF.Precio) * 100 - 20),
        'critica',
        '¡URGENTE! Revisar transacción inmediatamente. Posible error o fraude.',
        '#dc3545'
    FROM DetalleFacturas DF
    INNER JOIN Facturas F ON DF.NumeroFactura = F.NumeroFactura
    LEFT JOIN Equipos E ON DF.IMEI = E.IMEI
    LEFT JOIN Modelos M ON E.ID_Modelo = M.ID
    LEFT JOIN Vendedores V ON F.ID_Vendedor = V.ID
    WHERE F.ID_Sucursal = @Sucursal
    AND CAST(F.FechaRegistro AS DATE) >= @FechaInicio
    AND DF.Precio < E.Costo_Equipo;

    -- 2. Detectar márgenes muy bajos (< 5%)
    INSERT INTO #Anomalias
    SELECT
        'margen_bajo',
        'Margen muy bajo (' +
            CAST(ROUND(((DF.Precio - E.Costo_Equipo) / DF.Precio) * 100, 1) AS VARCHAR) + '%). Revisar transacción',
        DF.IMEI,
        M.Descripcion,
        V.Nombre,
        CAST(F.FechaRegistro AS DATE),
        ((DF.Precio - E.Costo_Equipo) / DF.Precio) * 100,
        20,
        20 - ((DF.Precio - E.Costo_Equipo) / DF.Precio) * 100,
        'alta',
        'Verificar precios y costos. Considerar ajustar estrategia de pricing.',
        '#fd7e14'
    FROM DetalleFacturas DF
    INNER JOIN Facturas F ON DF.NumeroFactura = F.NumeroFactura
    LEFT JOIN Equipos E ON DF.IMEI = E.IMEI
    LEFT JOIN Modelos M ON E.ID_Modelo = M.ID
    LEFT JOIN Vendedores V ON F.ID_Vendedor = V.ID
    WHERE F.ID_Sucursal = @Sucursal
    AND CAST(F.FechaRegistro AS DATE) >= @FechaInicio
    AND DF.Precio >= E.Costo_Equipo
    AND ((DF.Precio - E.Costo_Equipo) / DF.Precio) * 100 < 5;

    -- 3. Detectar precios inusuales (Z-Score > 2.5)
    INSERT INTO #Anomalias
    SELECT
        'precio_inusual',
        CASE
            WHEN (DF.Precio - @PromedioPrecio) / @DesviacionPrecio > 0
            THEN 'Precio de venta muy alto para este modelo'
            ELSE 'Precio de venta muy bajo para este modelo'
        END,
        DF.IMEI,
        M.Descripcion,
        V.Nombre,
        CAST(F.FechaRegistro AS DATE),
        DF.Precio,
        @PromedioPrecio,
        ABS((DF.Precio - @PromedioPrecio) / @DesviacionPrecio),
        CASE
            WHEN ABS((DF.Precio - @PromedioPrecio) / @DesviacionPrecio) > 3 THEN 'critica'
            ELSE 'alta'
        END,
        'Revisar transacción y verificar precio correcto',
        CASE
            WHEN ABS((DF.Precio - @PromedioPrecio) / @DesviacionPrecio) > 3 THEN '#dc3545'
            ELSE '#fd7e14'
        END
    FROM DetalleFacturas DF
    INNER JOIN Facturas F ON DF.NumeroFactura = F.NumeroFactura
    LEFT JOIN Equipos E ON DF.IMEI = E.IMEI
    LEFT JOIN Modelos M ON E.ID_Modelo = M.ID
    LEFT JOIN Vendedores V ON F.ID_Vendedor = V.ID
    WHERE F.ID_Sucursal = @Sucursal
    AND CAST(F.FechaRegistro AS DATE) >= @FechaInicio
    AND @DesviacionPrecio > 0
    AND ABS((DF.Precio - @PromedioPrecio) / @DesviacionPrecio) > 2.5;

    -- Resultado final
    SELECT * FROM #Anomalias
    ORDER BY
        CASE Severidad
            WHEN 'critica' THEN 4
            WHEN 'alta' THEN 3
            WHEN 'media' THEN 2
            ELSE 1
        END DESC;

    -- Resumen por tipo
    SELECT
        CASE Tipo
            WHEN 'precio_inusual' THEN 'Precio Inusual'
            WHEN 'margen_bajo' THEN 'Margen Bajo'
            WHEN 'margen_negativo' THEN 'Margen Negativo'
            ELSE Tipo
        END AS Tipo,
        COUNT(*) AS Cantidad,
        CAST(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM #Anomalias) AS DECIMAL(5,2)) AS Porcentaje
    FROM #Anomalias
    GROUP BY Tipo
    ORDER BY COUNT(*) DESC;

    DROP TABLE #Anomalias;
END
```

---

## 🚀 Recomendación de Implementación

### **Fase 1: MVP (Esta Semana)** ✅
1. ✅ **No implementar endpoints backend** (ya creados pero opcionales)
2. ✅ **Usar `DashboardAnalyticsService` del frontend** (ya existe)
3. ✅ **Consumir endpoint existente** `GetEquiposVendidos`
4. ✅ **Crear widgets visuales** que muestren los insights

**Código de ejemplo**:
```typescript
// dashboard.component.ts
export class DashboardComponent implements OnInit {
  insights: TopModeloInsight[] = [];
  anomalias: DeteccionAnomalias;

  constructor(
    private equipoService: EquipoService,
    private analyticsService: DashboardAnalyticsService
  ) {}

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    const filtro: EquipoVendidoFilter = {
      almacen: this.getUserSucursal(),
      fechaInicioFactura: this.getInicioMes(),
      fechaFinalFactura: this.getFechaActual(),
      // ... otros filtros
      pageIndex: 1,
      pageSize: 999999 // Traer todos
    };

    // Usar el endpoint existente
    this.equipoService.getEquipoVendidoParaInsights(filtro)
      .subscribe(equipos => {
        // Procesar con IA en el cliente
        this.insights = this.analyticsService.analizarTopModelos(equipos, 5);
        this.anomalias = this.analyticsService.detectarAnomalias(equipos);
        this.vendedores = this.analyticsService.analizarVendedores(equipos);
        // ... etc
      });
  }
}
```

**Ventajas**:
- ⚡ Listo para usar HOY
- 🧪 Fácil de probar y ajustar
- 🔄 No requiere backend

---

### **Fase 2: Optimización (Próxima Semana)**
1. Implementar endpoints backend **solo si hay problemas de rendimiento**
2. Mover lógica compleja al servidor (predicciones, ML)
3. Implementar caché en backend
4. Usar ML.NET para predicciones más avanzadas

---

## 📊 Resumen de Archivos Creados

### Frontend (Ya Implementado) ✅
- ✅ `dashboard-ia.interface.ts` - Todas las interfaces TypeScript
- ✅ `dashboard-analytics.service.ts` - Servicio con 11 métodos de análisis IA
- ✅ `url.ts` - URLs configuradas (opcionales por ahora)

### Backend (Opcional - Para Fase 2)
- ⏳ `DashboardController.cs` - Controlador con endpoints REST
- ⏳ `SP_Dashboard_ResumenEjecutivo.sql` - Stored Procedure
- ⏳ `SP_Dashboard_TopModelos.sql` - Stored Procedure
- ⏳ `SP_Dashboard_DeteccionAnomalias.sql` - Stored Procedure

---

## 🎯 Próximos Pasos Frontend

1. **Crear widget Top Modelos** usando `DashboardAnalyticsService`
2. **Crear widget Detección de Anomalías**
3. **Crear widget Ranking Vendedores**
4. **Integrar en dashboard principal**

¿Procedo con crear los componentes visuales (widgets)?
