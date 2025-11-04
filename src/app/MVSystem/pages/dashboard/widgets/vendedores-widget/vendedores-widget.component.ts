import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EquipoService } from 'src/app/core/services/equipo.service';
import { DashboardAnalyticsService } from 'src/app/core/services/dashboard-analytics.service';
import { LoginService } from 'src/app/auth/login.service';
import { VendedorPerformance } from 'src/app/core/interfaces/dashboard-ia.interface';
import { EquipoVendidoFilter } from 'src/app/core/interfaces/equipo.interface';

@Component({
  selector: 'app-vendedores-widget',
  templateUrl: './vendedores-widget.component.html',
  styleUrls: ['./vendedores-widget.component.css']
})
export class VendedoresWidgetComponent implements OnInit, OnDestroy {
  @Input() fechaInicio!: string;
  @Input() fechaFinal!: string;
  @Input() limite: number = 10;
  @Input() titulo: string = 'Ranking de Vendedores';

  vendedores: VendedorPerformance[] = [];
  isLoading: boolean = false;
  hasError: boolean = false;
  errorMessage: string = '';

  // Ordenamiento
  ordenarPor: 'ventas' | 'ganancia' | 'cantidad' = 'ventas';

  private destroy$ = new Subject<void>();

  constructor(
    private equipoService: EquipoService,
    private analyticsService: DashboardAnalyticsService,
    private loginService: LoginService
  ) {}

  ngOnInit(): void {
    this.cargarVendedores();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarVendedores(): void {
    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = '';

    if (!this.fechaInicio || !this.fechaFinal) {
      const hoy = new Date();
      const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      this.fechaInicio = this.formatearFecha(inicioMes);
      this.fechaFinal = this.formatearFecha(hoy);
    }

    const filtro: EquipoVendidoFilter = {
      almacen: parseInt(this.loginService.getUserIdSucursal, 10),
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
      pageSize: 999999
    };

    this.equipoService.getEquipoVendidoParaInsights(filtro)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (equipos) => {
          if (equipos && equipos.length > 0) {
            const analisis = this.analyticsService.analizarVendedores(equipos);
            this.vendedores = analisis.slice(0, this.limite);
            this.aplicarOrdenamiento();
          } else {
            this.vendedores = [];
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error al cargar vendedores:', error);
          this.hasError = true;
          this.errorMessage = 'No se pudo cargar la información. Por favor, intente nuevamente.';
          this.isLoading = false;
        }
      });
  }

  refrescar(): void {
    this.cargarVendedores();
  }

  cambiarOrden(orden: 'ventas' | 'ganancia' | 'cantidad'): void {
    this.ordenarPor = orden;
    this.aplicarOrdenamiento();
  }

  aplicarOrdenamiento(): void {
    this.vendedores.sort((a, b) => {
      switch (this.ordenarPor) {
        case 'ventas':
          return b.montoTotalVendido - a.montoTotalVendido;
        case 'ganancia':
          return b.gananciaTotalGenerada - a.gananciaTotalGenerada;
        case 'cantidad':
          return b.cantidadVentas - a.cantidadVentas;
        default:
          return 0;
      }
    });
  }

  getRankingClass(posicion: number): string {
    if (posicion === 1) return 'ranking-gold';
    if (posicion === 2) return 'ranking-silver';
    if (posicion === 3) return 'ranking-bronze';
    return 'ranking-default';
  }

  getRankingIcon(posicion: number): string {
    if (posicion === 1) return 'bi-trophy-fill';
    if (posicion === 2) return 'bi-award-fill';
    if (posicion === 3) return 'bi-star-fill';
    return 'bi-person-fill';
  }

  getPerformanceBadge(ticketPromedio: number): { class: string; text: string } {
    if (ticketPromedio > 10000) {
      return { class: 'badge bg-success', text: 'Premium' };
    } else if (ticketPromedio > 5000) {
      return { class: 'badge bg-primary', text: 'Alto' };
    } else if (ticketPromedio > 2000) {
      return { class: 'badge bg-info text-dark', text: 'Medio' };
    } else {
      return { class: 'badge bg-secondary', text: 'Básico' };
    }
  }

  getProgressWidth(vendedor: VendedorPerformance): number {
    if (this.vendedores.length === 0) return 0;
    const maxValue = this.getMaxValue();
    const currentValue = this.getCurrentValue(vendedor);
    return maxValue > 0 ? (currentValue / maxValue) * 100 : 0;
  }

  getMaxValue(): number {
    if (this.vendedores.length === 0) return 0;
    switch (this.ordenarPor) {
      case 'ventas':
        return Math.max(...this.vendedores.map(v => v.montoTotalVendido));
      case 'ganancia':
        return Math.max(...this.vendedores.map(v => v.gananciaTotalGenerada));
      case 'cantidad':
        return Math.max(...this.vendedores.map(v => v.cantidadVentas));
      default:
        return 0;
    }
  }

  getCurrentValue(vendedor: VendedorPerformance): number {
    switch (this.ordenarPor) {
      case 'ventas':
        return vendedor.montoTotalVendido;
      case 'ganancia':
        return vendedor.gananciaTotalGenerada;
      case 'cantidad':
        return vendedor.cantidadVentas;
      default:
        return 0;
    }
  }

  formatNumber(value: number): string {
    return value.toLocaleString('es-DO', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('es-DO', { style: 'currency', currency: 'DOP', minimumFractionDigits: 2 });
  }

  formatPorcentaje(value: number): string {
    return value.toFixed(1) + '%';
  }

  private formatearFecha(fecha: Date): string {
    return fecha.toISOString().split('T')[0];
  }

  // Getters para footer
  getTotalVentas(): number {
    return this.vendedores.reduce((sum, v) => sum + v.montoTotalVendido, 0);
  }

  getTotalGanancias(): number {
    return this.vendedores.reduce((sum, v) => sum + v.gananciaTotalGenerada, 0);
  }

  getTotalEquipos(): number {
    return this.vendedores.reduce((sum, v) => sum + v.cantidadVentas, 0);
  }

  getTicketPromedioGeneral(): number {
    const total = this.getTotalEquipos();
    return total > 0 ? this.getTotalVentas() / total : 0;
  }
}
