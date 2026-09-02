import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { HistorialAbonoDTO } from 'src/app/core/interfaces/cliente.interface';
import { ClientesService } from 'src/app/core/services/clientes.service';
import { LoadingService } from 'src/app/shared/components/r-loading/loading.service';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-detalle-abonos',
  templateUrl: './detalle-abonos.component.html',
  styleUrls: ['./detalle-abonos.component.css']
})
export class DetalleAbonosComponent implements OnInit, OnChanges, OnDestroy {
  @Input() idCliente: number = 0;
  @Input() visibleDetalle: boolean = false;
  @Output() filtroChanged = new EventEmitter<boolean>();

  historialAbonos: HistorialAbonoDTO[] = [];
  isLoading: boolean = false;
  noData: boolean = false;
  mostrarSoloConPendiente: boolean = true;

  private destroy$ = new Subject<boolean>();

  constructor(
    private clientesService: ClientesService,
    private loading: LoadingService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    if (this.visibleDetalle && this.idCliente > 0) {
      this.obtenerHistorialAbonos();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.visibleDetalle && this.idCliente > 0) {
      this.obtenerHistorialAbonos();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  /**
   * Detecta si la pantalla es móvil (ancho <= 600px)
   */
  isMobileScreen(): boolean {
    return window.innerWidth <= 600;
  }

  obtenerHistorialAbonos(): void {
    this.isLoading = true;
    this.loading.showLoading();

    this.clientesService.getHistorialAbonos(this.idCliente)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: HistorialAbonoDTO[]) => {
          this.historialAbonos = data || [];
          this.noData = this.historialAbonos.length === 0;
          this.loading.hideLoading();
          this.isLoading = false;

          if (this.noData) {
            this.toastr.info('No hay historial de abonos para este cliente');
          }
        },
        error: (err) => {
          console.error('Error al obtener historial de abonos:', err);
          this.loading.hideLoading();
          this.isLoading = false;
          this.noData = true;
          this.toastr.error('Error al cargar el historial de abonos');
        }
      });
  }

  /**
   * Formatea un número como moneda
   */
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP'
    }).format(value);
  }

  /**
   * Formatea una fecha
   */
  formatDate(date: string): string {
    const fecha = new Date(date);
    return fecha.toLocaleDateString('es-DO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Determina si un abono está vencido
   */
  isVencido(fechaVencimiento: string): boolean {
    return new Date(fechaVencimiento) < new Date();
  }

  /**
   * Determina clase CSS según estado
   */
  getEstadoClass(estado: string): string {
    const estadoLower = (estado || '').toLowerCase();
    if (estadoLower === 'a' || estadoLower === 'activo') return 'badge-success';
    if (estadoLower === 'x' || estadoLower === 'cancelado') return 'badge-danger';
    return 'badge-secondary';
  }

  /**
   * Aplica el filtro de facturas (método llamado al cambiar el toggle)
   */
  aplicarFiltro(): void {
    // Emitir el estado actual del filtro al componente padre
    this.filtroChanged.emit(this.mostrarSoloConPendiente);
  }

  /**
   * Retorna el historial filtrado según la selección
   * Usa TieneActualmentePendiente del backend que verifica el último movimiento de cada factura
   */
  getHistorialFiltrado(): HistorialAbonoDTO[] {
    if (!this.mostrarSoloConPendiente) {
      return this.historialAbonos;
    }

    // Filtrar solo facturas que actualmente tienen saldo pendiente (basado en último movimiento)
    return this.historialAbonos.filter(abono => abono.tieneActualmentePendiente === 1);
  }
}
