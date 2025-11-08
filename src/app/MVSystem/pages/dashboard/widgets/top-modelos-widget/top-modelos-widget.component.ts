import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EquipoService } from 'src/app/core/services/equipo.service';
import { DashboardAnalyticsService } from 'src/app/core/services/dashboard-analytics.service';
import { LoginService } from 'src/app/auth/login.service';
import { TopModeloInsight } from 'src/app/core/interfaces/dashboard-ia.interface';
import { EquipoVendidoFilter, EquipoVendido } from 'src/app/core/interfaces/equipo.interface';

@Component({
  selector: 'app-top-modelos-widget',
  templateUrl: './top-modelos-widget.component.html',
  styleUrls: ['./top-modelos-widget.component.css']
})
export class TopModelosWidgetComponent implements OnInit, OnDestroy {

  @Input() fechaInicio: string = '';
  @Input() fechaFinal: string = '';
  @Input() limite: number = 5;
  @Input() titulo: string = 'Top 5 Modelos Más Vendidos';

  @Output() modeloClicked = new EventEmitter<string>(); // Emitir cuando el usuario hace click en un modelo

  topModelos: TopModeloInsight[] = [];
  equiposCompletos: EquipoVendido[] = []; // Guardar todos los equipos
  modeloSeleccionado: TopModeloInsight | null = null;
  equiposDelModelo: EquipoVendido[] = [];
  mostrarDetalle: boolean = false;

  isLoading: boolean = false;
  hasError: boolean = false;
  errorMessage: string = '';

  // Array de mensajes para mostrar aleatoriamente en cada visita
  private mensajesDisponibles = [
    {
      titulo: '🧠 Estoy analizando tus ventas, Dame un momento...',
      subtitulo: 'Estoy evaluando qué modelos están destacando últimamente para darte información más precisa.'
    },
    {
      titulo: '🔍 Estoy Revisando tu inventario, no voy a tardar mucho...',
      subtitulo: 'Estoy comparando entradas vs salidas para detectar dónde está tu verdadera rotación.'
    },
    {
      titulo: '📊 Estoy Calculando estadísticas de tus equipos vendidos, espera...',
      subtitulo: 'Estoy preparando métricas inteligentes para que tomes mejores decisiones sin perder tiempo.'
    },
    {
      titulo: '💡 Voy a procesar información actualizada para mostrarte una cosa que te va a gustar, dame un chance...',
      subtitulo: 'Estoy analizando los patrones de compra reales de tus clientes… esto te dará ventaja.'
    },
    {
      titulo: '🎯 Estoy Detectando tendencias del mercado segun tus ventas, no te desesperes, ya casi te muestro...',
      subtitulo: 'Estoy identificando cuál modelo está teniendo mayor demanda en este momento.'
    },
    {
      titulo: '✨ Voy a Generar tu reporte personalizado, dame un chance...',
      subtitulo: 'Estoy organizando los datos para presentártelos de la forma más clara posible.'
    },
    {
      titulo: '⚙️ Voy a conectar con tus datos históricos, Dame un segundo...',
      subtitulo: 'Estoy validando comportamiento previo para mejorar la predicción actual.'
    },
    {
      titulo: '📌 Validando información con precisión...',
      subtitulo: 'Estoy asegurándome de que cada dato mostrado refleje la realidad de tu tienda.'
    },
    {
      titulo: '🚀 Optimizando la consulta...',
      subtitulo: 'Estoy maximizando la eficiencia para que todo cargue rápido y exacto.'
    }
  ];

  // Mensaje seleccionado aleatoriamente (se mantiene fijo durante la carga)
  mensajeCarga = this.mensajesDisponibles[0];

  private destroy$ = new Subject<void>();

  constructor(
    private equipoService: EquipoService,
    private analyticsService: DashboardAnalyticsService,
    private loginService: LoginService
  ) { }

  ngOnInit(): void {
    // Seleccionar un mensaje aleatorio al iniciar el componente
    this.seleccionarMensajeAleatorio();

    this.cargarTopModelos();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarTopModelos(): void {
    this.isLoading = true;
    this.hasError = false;


    // Usar fechas del mes actual si no se proporcionan
    if (!this.fechaInicio || !this.fechaFinal) {
      const hoy = new Date();
      const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      this.fechaInicio = this.formatearFecha(inicioMes);
      this.fechaFinal = this.formatearFecha(hoy);
    }

    const filtro: EquipoVendidoFilter = {
      almacen: 4, // Sucursal 4 = Todas las sucursales
      fechaInicioFactura: this.fechaInicio,
      fechaFinalFactura: this.fechaFinal,
      suplidor: '',
      vendedor: '',
      imei: '',
      telefono: 0,
      fechaRegistro: '',
      ID_Modelo: 0,
      fechaInicio: '',
      fechaFinal: '',
      pageIndex: 1,
      pageSize: 999999 // Traer todos para análisis
    };

    this.equipoService.getEquipoVendidoParaInsights(filtro)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (equipos) => {
          if (equipos && equipos.length > 0) {
            // Guardar equipos completos para el detalle
            this.equiposCompletos = equipos;

            // Procesar con IA en el cliente
            this.topModelos = this.analyticsService.analizarTopModelos(equipos, this.limite);
            this.isLoading = false;
          } else {
            this.topModelos = [];
            this.equiposCompletos = [];
            this.isLoading = false;
          }
        },
        error: (error) => {
          console.error('[TopModelosWidget] Error al cargar top modelos:', error);
          this.hasError = true;
          this.errorMessage = 'Error al cargar datos. Intente nuevamente.';
          this.isLoading = false;
        }
      });
  }

  refrescar(): void {
    this.cargarTopModelos();
  }

  // Formatear números con separadores de miles
  formatNumber(value: number): string {
    return value.toLocaleString('es-DO', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }

  // Formatear moneda
  formatCurrency(value: number): string {
    return `RD$${this.formatNumber(value)}`;
  }

  // Obtener clase CSS según velocidad de venta
  getVelocidadClass(velocidad: string): string {
    const clases: { [key: string]: string } = {
      'alta': 'bg-success',
      'media': 'bg-warning',
      'baja': 'bg-danger'
    };
    return clases[velocidad] || 'bg-secondary';
  }

  // Obtener ícono según velocidad
  getVelocidadIcon(velocidad: string): string {
    const iconos: { [key: string]: string } = {
      'alta': 'bi-speedometer',
      'media': 'bi-speedometer2',
      'baja': 'bi-hourglass-split'
    };
    return iconos[velocidad] || 'bi-dash-circle';
  }

  // Obtener texto de velocidad
  getVelocidadTexto(velocidad: string): string {
    const textos: { [key: string]: string } = {
      'alta': 'Rotación Rápida',
      'media': 'Rotación Media',
      'baja': 'Rotación Lenta'
    };
    return textos[velocidad] || velocidad;
  }

  // Obtener clase de ranking (para destacar top 3)
  getRankingClass(ranking: number): string {
    if (ranking === 1) return 'rank-gold';
    if (ranking === 2) return 'rank-silver';
    if (ranking === 3) return 'rank-bronze';
    return 'rank-default';
  }

  // Obtener clase compacta de ranking
  getRankingCompactClass(ranking: number): string {
    if (ranking === 1) return 'ranking-gold';
    if (ranking === 2) return 'ranking-silver';
    if (ranking === 3) return 'ranking-bronze';
    return 'ranking-default';
  }

  // Obtener clase de margen compacta
  getMargenCompactClass(margen: number): string {
    if (margen > 25) return 'text-success';
    if (margen > 15) return 'text-warning';
    return 'text-danger';
  }

  // Obtener tooltip del ranking
  getRankingTooltip(ranking: number): string {
    const tooltips: { [key: number]: string } = {
      1: '🥇 Primer lugar - Modelo más vendido',
      2: '🥈 Segundo lugar - Segundo modelo más vendido',
      3: '🥉 Tercer lugar - Tercer modelo más vendido',
      4: 'Cuarto lugar',
      5: 'Quinto lugar'
    };
    return tooltips[ranking] || `Posición #${ranking}`;
  }

  // Obtener ícono de tendencia
  getTendenciaIcon(tendencia: string): string {
    const iconos: { [key: string]: string } = {
      'up': 'bi-arrow-up-circle-fill text-success',
      'down': 'bi-arrow-down-circle-fill text-danger',
      'stable': 'bi-dash-circle-fill text-secondary'
    };
    return iconos[tendencia] || 'bi-dash-circle-fill text-secondary';
  }

  private formatearFecha(fecha: Date): string {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // ========== Métodos para Mensajes Inteligentes de Carga ==========

  /**
   * Selecciona un mensaje aleatorio del array para mostrarlo durante la carga
   * Se ejecuta una vez al iniciar el componente
   */
  private seleccionarMensajeAleatorio(): void {
    const indiceAleatorio = Math.floor(Math.random() * this.mensajesDisponibles.length);
    this.mensajeCarga = this.mensajesDisponibles[indiceAleatorio];
  }

  // Calcular totales para el footer
  getTotalVendido(): number {
    return this.topModelos.reduce((sum, m) => sum + m.cantidadVendida, 0);
  }

  getGananciaTotal(): number {
    return this.topModelos.reduce((sum, m) => sum + m.gananciaTotal, 0);
  }

  getMargenPromedio(): number {
    if (this.topModelos.length === 0) return 0;
    const suma = this.topModelos.reduce((sum, m) => sum + m.margenPromedio, 0);
    return suma / this.topModelos.length;
  }

  // Mostrar detalle de equipos vendidos por modelo
  verDetalleModelo(modelo: TopModeloInsight): void {
    this.modeloSeleccionado = modelo;

    // 📊 Emitir evento para tracking en el componente padre
    this.modeloClicked.emit(`Top Equipos Vendidos - ${modelo.modelo}`);

    // Filtrar los equipos que pertenecen a este modelo
    this.equiposDelModelo = this.equiposCompletos.filter(
      equipo => equipo.descripcion.trim().toLowerCase() === modelo.modelo.trim().toLowerCase()
    );

    // Ordenar por fecha de venta descendente (más recientes primero)
    this.equiposDelModelo.sort((a, b) => {
      const fechaA = new Date(a.fechaFacturado || a.fechaRegistro);
      const fechaB = new Date(b.fechaFacturado || b.fechaRegistro);
      return fechaB.getTime() - fechaA.getTime();
    });

    this.mostrarDetalle = true;
  }

  cerrarDetalle(): void {
    this.mostrarDetalle = false;
    this.modeloSeleccionado = null;
    this.equiposDelModelo = [];
  }

  // Formatear fecha para mostrar
  formatearFechaDetalle(fecha: string): string {
    if (!fecha) return 'N/A';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-DO', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });
  }
}
