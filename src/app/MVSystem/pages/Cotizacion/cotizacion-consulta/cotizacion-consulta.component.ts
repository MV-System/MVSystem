import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LoginService } from 'src/app/auth/login.service';
import { CotizacionConsulta, CotizacionConsultaFiltro, CotizacionDetalle } from 'src/app/core/interfaces/cotizacion.interface';
import { CotizacionService } from 'src/app/core/services/cotizacion.service';
import { CreatorPDFFile } from 'src/app/helpers/helper';

@Component({
  selector: 'app-cotizacion-consulta',
  templateUrl: './cotizacion-consulta.component.html',
  styleUrls: ['./cotizacion-consulta.component.css']
})
export class CotizacionConsultaComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  form: FormGroup;
  cotizaciones: CotizacionConsulta[] = [];
  isLoading = false;
  pageIndex = 1;
  pageSize = 10;
  totalRecord = 0;
  lastLine = 0;
  detalles: { [codigo: number]: CotizacionDetalle[] } = {};
  detallesVisibles: { [codigo: number]: boolean } = {};
  cargandoDetalle: { [codigo: number]: boolean } = {};
  reimprimiendoCodigo: number | null = null;
  // Cotización que espera confirmación de cancelación / la que se está cancelando
  confirmandoCodigo: number | null = null;
  cancelandoCodigo: number | null = null;
  private readonly sucursal: number;

  constructor(
    private fb: FormBuilder,
    private cotizacionService: CotizacionService,
    private loginService: LoginService,
    private toast: ToastrService
  ) {
    this.sucursal = Number(this.loginService.getUserIdSucursal) || 0;
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    this.form = this.fb.group({
      criterio: [''],
      verCanceladas: [false],
      fechaInicio: [this.toDateInput(firstDay)],
      fechaFinal: [this.toDateInput(today)]
    });
  }

  ngOnInit(): void {
    this.buscar();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  buscar(pageIndex = 1): void {
    this.pageIndex = pageIndex;
    const filtro: CotizacionConsultaFiltro = {
      pageIndex: this.pageIndex,
      pageSize: this.pageSize,
      criterio: (this.form.get('criterio')?.value || '').trim(),
      sucursal: this.sucursal,
      vendedor: 0,
      idTipoPago: 0,
      // Por defecto solo las activas; "Ver canceladas" muestra únicamente las canceladas
      estado: this.form.get('verCanceladas')?.value ? 'X' : 'A',
      fechaInicio: this.form.get('fechaInicio')?.value,
      fechaFinal: this.form.get('fechaFinal')?.value
    };

    this.isLoading = true;
    this.cotizacionService.getCotizaciones(filtro)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: cotizaciones => {
          this.cotizaciones = cotizaciones || [];
          this.totalRecord = this.cotizaciones.length ? this.cotizaciones[0].totalRecord : 0;
          this.lastLine = this.cotizaciones.length ? this.cotizaciones[0].lastLine : 0;
          this.isLoading = false;
        },
        error: () => {
          this.cotizaciones = [];
          this.totalRecord = 0;
          this.lastLine = 0;
          this.isLoading = false;
          this.toast.error('No fue posible consultar las cotizaciones');
        }
      });
  }

  paginaAnterior(): void {
    if (this.pageIndex > 1) this.buscar(this.pageIndex - 1);
  }

  paginaSiguiente(): void {
    if (this.pageIndex * this.pageSize < this.totalRecord) this.buscar(this.pageIndex + 1);
  }

  toggleDetalle(cotizacion: CotizacionConsulta): void {
    const codigo = cotizacion.codigo;
    this.detallesVisibles[codigo] = !this.detallesVisibles[codigo];
    if (this.detallesVisibles[codigo] && !this.detalles[codigo] && !this.cargandoDetalle[codigo]) {
      this.cargandoDetalle[codigo] = true;
      this.cotizacionService.getDetallePorCodigo(codigo)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: detalle => {
            this.detalles[codigo] = detalle || [];
            this.cargandoDetalle[codigo] = false;
          },
          error: () => {
            this.detalles[codigo] = [];
            this.cargandoDetalle[codigo] = false;
            this.toast.error('No fue posible cargar el detalle de la cotización');
          }
        });
    }
  }

  puedeCancelar(cotizacion: CotizacionConsulta): boolean {
    return cotizacion.estado === 'A' && cotizacion.facturado === 'N';
  }

  estaCancelada(cotizacion: CotizacionConsulta): boolean {
    return cotizacion.estado === 'X';
  }

  pedirConfirmacion(cotizacion: CotizacionConsulta): void {
    this.confirmandoCodigo = cotizacion.codigo;
  }

  cancelarConfirmacion(): void {
    this.confirmandoCodigo = null;
  }

  confirmarCancelacion(cotizacion: CotizacionConsulta): void {
    if (!this.puedeCancelar(cotizacion) || this.cancelandoCodigo !== null) return;

    this.cancelandoCodigo = cotizacion.codigo;
    this.cotizacionService.cancelar(cotizacion.codigo, this.loginService.getUserName())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.cancelandoCodigo = null;
          this.confirmandoCodigo = null;
          this.toast.success(`Cotización ${cotizacion.literal}${cotizacion.numeroFactura} cancelada`);
          // Si era el último registro de la página, volver a la anterior
          const quedanEnPagina = this.cotizaciones.length > 1;
          this.buscar(!quedanEnPagina && this.pageIndex > 1 ? this.pageIndex - 1 : this.pageIndex);
        },
        error: () => {
          // El mensaje del servidor ya lo muestra el interceptor de errores
          this.cancelandoCodigo = null;
          this.confirmandoCodigo = null;
        }
      });
  }

  reimprimir(cotizacion: CotizacionConsulta): void {
    this.reimprimiendoCodigo = cotizacion.codigo;
    this.cotizacionService.reimprimir(cotizacion.codigo, Number(this.loginService.getUserIdEmpresa))
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: pdf => {
          this.reimprimiendoCodigo = null;
          CreatorPDFFile(pdf);
        },
        error: () => {
          this.reimprimiendoCodigo = null;
          this.toast.error('No fue posible reimprimir la cotización');
        }
      });
  }

  private toDateInput(date: Date): string {
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${date.getFullYear()}-${month}-${day}`;
  }
}
