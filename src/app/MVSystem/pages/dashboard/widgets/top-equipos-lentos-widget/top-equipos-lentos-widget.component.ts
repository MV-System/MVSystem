import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EquipoService } from 'src/app/core/services/equipo.service';
import { LoginService } from 'src/app/auth/login.service';
import { EquipoDisponible, EquipoDisponibleParam } from 'src/app/core/interfaces/equipo.interface';

interface TopEquipoLentoInsight {
  modelo: string;
  diasPromedio: number;
  cantidadEquipos: number;
  costoTotal: number;
  almacen: string;
  categoriaRotacion: 'critico' | 'advertencia' | 'aceptable';
  sugerencia: string;
  equipos: EquipoDisponible[]; // Para el detalle
}

@Component({
  selector: 'app-top-equipos-lentos-widget',
  templateUrl: './top-equipos-lentos-widget.component.html',
  styleUrls: ['./top-equipos-lentos-widget.component.css']
})
export class TopEquiposLentosWidgetComponent implements OnInit, OnDestroy {

  @Input() fechaInicio: string = '';
  @Input() fechaFinal: string = '';
  @Input() limite: number = 5;
  @Input() titulo: string = 'Top 5 Equipos con Más Tiempo en Inventario';

  @Output() equipoLentoClicked = new EventEmitter<string>(); // Emitir cuando el usuario hace click en un equipo lento

  topEquiposLentos: TopEquipoLentoInsight[] = [];
  equiposCompletos: EquipoDisponible[] = [];
  modeloSeleccionado: TopEquipoLentoInsight | null = null;
  equiposDelModelo: EquipoDisponible[] = [];
  mostrarDetalle: boolean = false;

  isLoading: boolean = false;
  hasError: boolean = false;
  errorMessage: string = '';

  // Mensajes inteligentes para loading
  private mensajesDisponibles = [
    {
      titulo: '🧠 Estoy analizando tu inventario, dame un momento...',
      subtitulo: 'Estoy identificando qué equipos llevan más tiempo sin venderse.'
    },
    {
      titulo: '🔍 Estoy revisando el tiempo de permanencia, espera...',
      subtitulo: 'Estoy calculando cuánto tiempo lleva cada modelo en tu almacén.'
    },
    {
      titulo: '📊 Estoy calculando días de inventario, ya casi...',
      subtitulo: 'Estoy detectando equipos que necesitan atención urgente.'
    },
    {
      titulo: '💡 Voy a mostrarte equipos estancados, dame un chance...',
      subtitulo: 'Estoy analizando cuáles equipos están afectando tu capital de trabajo.'
    },
    {
      titulo: '🎯 Estoy detectando inventario de lenta rotación, no tardo...',
      subtitulo: 'Estoy identificando oportunidades de descuentos y promociones.'
    },
    {
      titulo: '✨ Voy a generar análisis de antigüedad, un segundo...',
      subtitulo: 'Estoy organizando los datos por tiempo de permanencia en stock.'
    },
    {
      titulo: '⚙️ Estoy conectando con tu inventario actual, dame un momento...',
      subtitulo: 'Estoy validando fechas de registro para darte información exacta.'
    },
    {
      titulo: '📌 Validando tiempos de rotación...',
      subtitulo: 'Estoy asegurándome de que cada cálculo sea preciso y útil para ti.'
    },
    {
      titulo: '🚀 Optimizando el análisis de inventario...',
      subtitulo: 'Estoy maximizando la velocidad para mostrarte los resultados rápido.'
    }
  ];

  mensajeCarga = this.mensajesDisponibles[0];

  private destroy$ = new Subject<void>();

  constructor(
    private equipoService: EquipoService,
    private loginService: LoginService
  ) { }

  ngOnInit(): void {
    this.seleccionarMensajeAleatorio();
    this.cargarTopEquiposLentos();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarTopEquiposLentos(): void {
    this.isLoading = true;
    this.hasError = false;

    const filtro: EquipoDisponibleParam = {
      almacen: 4, // Sucursal 4 = Todas las sucursales
      suplidor: '',
      imei: '',
      modelo: '',
      pageIndex: 1,
      pageSize: 999999, // Traer todos para análisis
      fechaInicio: '',
      fechaFinal: ''
    };

    this.equipoService.getEquipoDisponible(filtro)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (equipos) => {
          if (equipos && equipos.length > 0) {
            this.equiposCompletos = equipos;
            this.topEquiposLentos = this.analizarTiempoEnInventario(equipos);
            this.isLoading = false;
          } else {
            this.topEquiposLentos = [];
            this.equiposCompletos = [];
            this.isLoading = false;
          }
        },
        error: (error) => {
          console.error('[TopEquiposLentosWidget] Error al cargar equipos:', error);
          this.hasError = true;
          this.errorMessage = 'Error al cargar datos. Intente nuevamente.';
          this.isLoading = false;
        }
      });
  }

  analizarTiempoEnInventario(equipos: EquipoDisponible[]): TopEquipoLentoInsight[] {
    // Agrupar por modelo
    const modeloMap = new Map<string, EquipoDisponible[]>();

    equipos.forEach(equipo => {
      const modelo = equipo.descripcion || 'Sin modelo';
      if (!modeloMap.has(modelo)) {
        modeloMap.set(modelo, []);
      }
      modeloMap.get(modelo)!.push(equipo);
    });

    // Calcular métricas por modelo
    const insights: TopEquipoLentoInsight[] = [];

    modeloMap.forEach((equiposModelo, modelo) => {
      const diasTotales = equiposModelo.reduce((sum, eq) => {
        return sum + this.calcularDiasEnInventario(eq.fecharegistro);
      }, 0);

      const diasPromedio = Math.round(diasTotales / equiposModelo.length);
      const costoTotal = equiposModelo.reduce((sum, eq) => sum + (eq.costoEquipo || 0), 0);
      const almacen = equiposModelo[0].descripcionAlmacen || 'N/A';

      // Categorizar según días
      let categoria: 'critico' | 'advertencia' | 'aceptable';
      let sugerencia: string;

      if (diasPromedio > 180) {
        categoria = 'critico';
        sugerencia = 'Aplica descuento agresivo o considera devolución al suplidor';
      } else if (diasPromedio > 90) {
        categoria = 'advertencia';
        sugerencia = 'Considera promoción o bundle para acelerar la venta';
      } else {
        categoria = 'aceptable';
        sugerencia = 'Rotación normal, mantén el seguimiento';
      }

      insights.push({
        modelo,
        diasPromedio,
        cantidadEquipos: equiposModelo.length,
        costoTotal,
        almacen,
        categoriaRotacion: categoria,
        sugerencia,
        equipos: equiposModelo
      });
    });

    // Ordenar por días promedio (descendente) y tomar top 5
    return insights
      .sort((a, b) => b.diasPromedio - a.diasPromedio)
      .slice(0, this.limite);
  }

  calcularDiasEnInventario(fechaRegistro: string): number {
    if (!fechaRegistro) return 0;

    const hoy = new Date();
    const fecha = new Date(fechaRegistro);
    const diferencia = hoy.getTime() - fecha.getTime();
    return Math.floor(diferencia / (1000 * 60 * 60 * 24));
  }

  refrescar(): void {
    this.cargarTopEquiposLentos();
  }

  formatNumber(value: number): string {
    return value.toLocaleString('es-DO', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }

  formatCurrency(value: number): string {
    return `RD$${this.formatNumber(value)}`;
  }

  getCategoriaClass(categoria: string): string {
    const clases: { [key: string]: string } = {
      'critico': 'categoria-critico',
      'advertencia': 'categoria-advertencia',
      'aceptable': 'categoria-aceptable'
    };
    return clases[categoria] || 'categoria-aceptable';
  }

  getCategoriaIcon(categoria: string): string {
    const iconos: { [key: string]: string } = {
      'critico': 'bi-exclamation-triangle-fill',
      'advertencia': 'bi-exclamation-circle-fill',
      'aceptable': 'bi-check-circle-fill'
    };
    return iconos[categoria] || 'bi-dash-circle';
  }

  getCategoriaTexto(categoria: string): string {
    const textos: { [key: string]: string } = {
      'critico': 'Crítico',
      'advertencia': 'Advertencia',
      'aceptable': 'Aceptable'
    };
    return textos[categoria] || categoria;
  }

  getRankingClass(ranking: number): string {
    if (ranking === 1) return 'rank-gold';
    if (ranking === 2) return 'rank-silver';
    if (ranking === 3) return 'rank-bronze';
    return 'rank-default';
  }

  getRankingCompactClass(ranking: number): string {
    if (ranking === 1) return 'ranking-gold';
    if (ranking === 2) return 'ranking-silver';
    if (ranking === 3) return 'ranking-bronze';
    return 'ranking-default';
  }

  private seleccionarMensajeAleatorio(): void {
    const indiceAleatorio = Math.floor(Math.random() * this.mensajesDisponibles.length);
    this.mensajeCarga = this.mensajesDisponibles[indiceAleatorio];
  }

  verDetalleModelo(modelo: TopEquipoLentoInsight): void {
    this.modeloSeleccionado = modelo;
    this.equiposDelModelo = modelo.equipos;
    this.mostrarDetalle = true;

    // 📊 Emitir evento para tracking en el componente padre
    this.equipoLentoClicked.emit(`Top Equipos Lentos - ${modelo.modelo}`);
  }

  cerrarDetalle(): void {
    this.mostrarDetalle = false;
    this.modeloSeleccionado = null;
    this.equiposDelModelo = [];
  }

  formatearFechaDetalle(fecha: string): string {
    if (!fecha) return 'N/A';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-DO', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });
  }

  getDiasTexto(dias: number): string {
    if (dias === 1) return '1 día';
    if (dias < 30) return `${dias} días`;
    if (dias < 60) return `${Math.floor(dias / 30)} mes`;
    if (dias < 365) return `${Math.floor(dias / 30)} meses`;
    const años = Math.floor(dias / 365);
    const mesesRestantes = Math.floor((dias % 365) / 30);
    if (mesesRestantes === 0) return `${años} ${años === 1 ? 'año' : 'años'}`;
    return `${años} ${años === 1 ? 'año' : 'años'} y ${mesesRestantes} ${mesesRestantes === 1 ? 'mes' : 'meses'}`;
  }
}
