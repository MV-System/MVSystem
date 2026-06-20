import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { LoginService } from 'src/app/auth/login.service';
import { MantenimientoService } from 'src/app/core/services/mantenimiento.service';
import { ReparacionConsulta } from 'src/app/core/interfaces/equipo.interface';
import { LoadingService } from 'src/app/shared/components/r-loading/loading.service';
import { IMyDrpOptions } from 'mydaterangepicker';
import { CatalogosService } from 'src/app/core/services/catalogos.service';
import { StatusTaller } from 'src/app/core/interfaces/catalogo.interface';
import { EquipoService } from 'src/app/core/services/equipo.service';
import { UserTrackingService } from 'src/app/core/services/user-tracking.service';

@Component({
  selector: 'app-reparaciones-consulta',
  templateUrl: './reparaciones-consulta.component.html',
  styleUrls: ['./reparaciones-consulta.component.css']
})
export class ReparacionesConsultaComponent implements OnInit, OnDestroy {

  // Propiedades para la lista
  reparaciones: ReparacionConsulta[] = [];
  reparacionSeleccionada: ReparacionConsulta | null = null;

  // Paginación
  pageSize: number = 10;
  pageIndex: number = 1;
  totalRecord: number = 0;
  currentPage: number = 1;
  line: number = 0;
  lastLine: number = 0;

  // Totales para resumen
  totalPrecioReparaciones: number = 0;

  // Modal
  showModalDetalle: boolean = false;

  // Búsqueda optimizada
  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;
  criterio: string = '';
  minSearchLength: number = 1;
  debounceTime: number = 800;

  // DateRangePicker
  myDateRangePickerOptions: IMyDrpOptions = {
    dateFormat: 'dd.mm.yyyy',
  };

  // Obtener la fecha actual
  fechaHoy = new Date();
  // Crear una nueva fecha para el primer día del mes actual
  FechaInicio = new Date(this.fechaHoy.getFullYear(), this.fechaHoy.getMonth(), 1);

  // Formulario de filtros
  formFiltros: FormGroup = this.fb.group({
    criterio: [''],
    estatus: [''],
    rangeDate: ['']
  });

  // Fechas de filtro
  fechaInicio: string = `${this.FechaInicio.getFullYear()}/${this.FechaInicio.getMonth() + 1}/${this.FechaInicio.getDate()}`;
  fechaFinal: string = `${this.fechaHoy.getFullYear()}/${this.fechaHoy.getMonth() + 1}/${this.fechaHoy.getDate()}`;

  // Control de carga
  isLoading: boolean = false;
  destroy$: Subject<any> = new Subject<any>();

  // Lista de estatus disponibles
  estatusList: StatusTaller[] = [];

  constructor(
    private fb: FormBuilder,
    private mantenimientoService: MantenimientoService,
    private catalogosService: CatalogosService,
    private equipoService: EquipoService,
    private loginService: LoginService,
    private toastr: ToastrService,
    private loading: LoadingService,
    private tracking: UserTrackingService
  ) {}

  ngOnInit(): void {
    this.setupSearchOptimization();
    this.cargarEstatusTaller();
    this.buscarReparaciones();

    // 📊 Tracking: Registro de acceso al módulo
    this.tracking.trackPageView('MNU_CONS_REPARACIONES', 'PageView').subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();

    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  /**
   * Configurar optimización de búsqueda con debounce
   */
  private setupSearchOptimization(): void {
    this.searchSubscription = this.searchSubject
      .pipe(
        debounceTime(this.debounceTime),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(searchTerm => {
        if (searchTerm.length >= this.minSearchLength || searchTerm.length === 0) {
          this.pageIndex = 1; // Resetear a primera página
          this.buscarReparaciones();
        }
      });
  }

  /**
   * Cargar lista de estatus del taller desde el catálogo
   */
  cargarEstatusTaller(): void {
    this.catalogosService.getStatusTallerLista()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.estatusList = response;
        },
        error: (error) => {
          console.error('Error al cargar estatus del taller:', error);
          this.toastr.error('Error al cargar la lista de estatus');
        }
      });
  }

  /**
   * Maneja el input de búsqueda
   */
  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.criterio = target.value.trim();
    this.searchSubject.next(this.criterio);
  }

  /**
   * Maneja Enter en el campo de búsqueda
   */
  onSearchKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (this.searchSubscription) {
        this.searchSubscription.unsubscribe();
        this.setupSearchOptimization();
      }
      this.buscarReparaciones();
    }
  }

  /**
   * Buscar reparaciones con los filtros actuales
   */
  buscarReparaciones(): void {
    this.isLoading = true;
    this.loading.showLoading();

    const filtros = {
      criterio: this.formFiltros.get('criterio')?.value || this.criterio,
      estatus: this.formFiltros.get('estatus')?.value || '',
      fechaInicio: this.fechaInicio,
      fechaFinal: this.fechaFinal,
      pageIndex: this.pageIndex,
      pageSize: this.pageSize
    };

    this.mantenimientoService.getReparacionesLista(filtros)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.reparaciones = response.data || [];

          if (this.reparaciones.length > 0) {
            this.totalRecord = this.reparaciones[0].totalRecords || 0;
            this.line = this.reparaciones[0].line || 0;
            this.lastLine = this.reparaciones[0].lastLine || 0;
            // Calcular el total de precios
            this.totalPrecioReparaciones = this.reparaciones.reduce((sum, rep) => sum + (rep.precio || 0), 0);
          } else {
            this.totalRecord = 0;
            this.line = 0;
            this.lastLine = 0;
            this.totalPrecioReparaciones = 0;
          }

          this.isLoading = false;
          this.loading.hideLoading();
        },
        error: (error) => {
          console.error('Error al buscar reparaciones:', error);
          this.toastr.error('Error al cargar las reparaciones');
          this.isLoading = false;
          this.loading.hideLoading();
        }
      });
  }

  /**
   * Maneja el cambio de rango de fechas
   */
  onDateRangeChanged(event: any): void {
    if (event.beginDate.year === 0) {
      // Resetear a fechas por defecto
      this.fechaInicio = `${this.FechaInicio.getFullYear()}/${this.FechaInicio.getMonth() + 1}/${this.FechaInicio.getDate()}`;
      this.fechaFinal = `${this.fechaHoy.getFullYear()}/${this.fechaHoy.getMonth() + 1}/${this.fechaHoy.getDate()}`;
    } else {
      // Crear objetos Date para las validaciones
      const fechaInicio = new Date(event.beginDate.year, event.beginDate.month - 1, event.beginDate.day);
      const fechaFinal = new Date(event.endDate.year, event.endDate.month - 1, event.endDate.day);
      const hoy = new Date();
      hoy.setHours(23, 59, 59, 999);

      // Validación 1: Fecha inicial no puede ser mayor que fecha final
      if (fechaInicio > fechaFinal) {
        this.toastr.warning('La fecha inicial no puede ser mayor que la fecha final');
        return;
      }

      // Validación 2: No se pueden seleccionar fechas futuras
      if (fechaFinal > hoy) {
        this.toastr.warning('No se pueden seleccionar fechas futuras');
        return;
      }

      // Validación 3: El rango no puede ser mayor a 1 año
      const unAnoEnMs = 365 * 24 * 60 * 60 * 1000;
      const rangoEnMs = fechaFinal.getTime() - fechaInicio.getTime();
      if (rangoEnMs > unAnoEnMs) {
        this.toastr.warning('El rango de fechas no puede ser mayor a 1 año');
        return;
      }

      // Si todas las validaciones pasan, asignar las fechas
      this.fechaInicio = `${event.beginDate.year}/${event.beginDate.month}/${event.beginDate.day}`;
      this.fechaFinal = `${event.endDate.year}/${event.endDate.month}/${event.endDate.day}`;
    }

    this.pageIndex = 1;
    this.buscarReparaciones();
  }

  /**
   * Limpiar filtros y búsqueda
   */
  clearSearch(): void {
    this.criterio = '';
    this.formFiltros.reset();
    // Resetear a fechas por defecto
    this.fechaInicio = `${this.FechaInicio.getFullYear()}/${this.FechaInicio.getMonth() + 1}/${this.FechaInicio.getDate()}`;
    this.fechaFinal = `${this.fechaHoy.getFullYear()}/${this.fechaHoy.getMonth() + 1}/${this.fechaHoy.getDate()}`;
    this.pageIndex = 1;
    this.buscarReparaciones();
  }

  /**
   * Cambiar tamaño de página
   */
  onPageSizeChange(newSize: number): void {
    const normalizedSize = Number(newSize);
    const validPageSizes = [5, 10, 50, 100];

    if (!validPageSizes.includes(normalizedSize) && normalizedSize !== this.totalRecord) {
      console.warn('Tamaño de página inválido:', newSize);
      return;
    }

    this.pageSize = normalizedSize;
    this.pageIndex = 1;
    this.buscarReparaciones();
  }

  /**
   * Cambiar página
   */
  onPageChange(newPage: number): void {
    this.pageIndex = newPage;
    this.buscarReparaciones();
  }

  /**
   * Evento cuando se hace click en una reparación
   */
  onReparacionClick(idReparacion: number): void {
    // Buscar la reparación en la lista actual
    const reparacion = this.reparaciones.find(r => r.idReparacion === idReparacion);

    if (reparacion) {
      this.reparacionSeleccionada = reparacion;
      this.showModalDetalle = true;
    } else {
      this.toastr.error('No se encontró la reparación seleccionada');
    }
  }

  /**
   * Cerrar modal de detalle
   */
  cerrarModal(): void {
    this.showModalDetalle = false;
    this.reparacionSeleccionada = null;
  }

  /**
   * Guardar cambios en costo/precio
   */
  guardarCambios(): void {
    if (!this.reparacionSeleccionada) return;

    // Validar que el costo no sea mayor al precio
    if (this.reparacionSeleccionada.costo > this.reparacionSeleccionada.precio) {
      this.toastr.warning('El costo no puede ser mayor al precio de la Reparación');
      return;
    }

    this.loading.showLoading();

    this.mantenimientoService.actualizarCostoPrecioReparacion(
      this.reparacionSeleccionada.idReparacion,
      this.reparacionSeleccionada.costo,
      this.reparacionSeleccionada.precio,
      this.loginService.getUserName()
    ).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          // Mostrar mensaje del backend
          this.toastr.success(response.mensaje);
          this.loading.hideLoading();
          this.buscarReparaciones(); // Recargar lista
          this.cerrarModal();
        },
        error: (error) => {
          console.error('Error al guardar cambios:', error);
          const mensajeError = error?.error?.mensaje || 'Error al guardar los cambios';
          this.toastr.error(mensajeError);
          this.loading.hideLoading();
        }
      });
  }

  /**
   * Imprimir recibo de reparación
   * Genera y muestra el reporte de reparación en PDF
   * Crea un iframe temporal para mostrar el PDF y permite su impresión
   */
  imprimirRecibo(): void {
    if (!this.reparacionSeleccionada) return;

    this.loading.showLoading();

    this.equipoService.getEquipoReparadoReporte(
      this.reparacionSeleccionada.idReparacion,
      this.loginService.getUserIdEmpresa,
      this.loginService.getUserIdSucursal
    ).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob) => {
          const newBlob = new Blob([blob], { type: 'application/pdf' });
          const blobUrl = URL.createObjectURL(newBlob);

          const iframe = document.createElement('iframe');
          iframe.style.display = 'none';
          iframe.src = blobUrl;

          // Espera a que el PDF se cargue en el iframe antes de quitar el loading
          iframe.onload = () => {
            this.loading.hideLoading();
            iframe.contentWindow?.print();
          };

          document.body.appendChild(iframe);
        },
        error: (error) => {
          console.error('Error al generar reporte:', error);
          this.loading.hideLoading();
          this.toastr.error('No se pudo generar el reporte');
        }
      });
  }

  /**
   * Verifica si se puede editar costo/precio
   */
  puedeEditarCostoPrecio(): boolean {
    if (!this.reparacionSeleccionada) return false;
    return this.reparacionSeleccionada.estatus === 'Pendiente';
  }

  /**
   * Obtiene la cantidad total de reparaciones
   */
  getCantidadReparaciones(): number {
    return this.totalRecord || 0;
  }

  /**
   * Obtiene el total de precios de reparaciones
   */
  getTotalPrecioReparaciones(): number {
    return this.totalPrecioReparaciones || 0;
  }

  /**
   * Detecta si hay filtros activos aplicados
   */
  hayFiltrosActivos(): boolean {
    const criterioActivo = this.criterio && this.criterio.trim() !== '';
    const estatusActivo = this.formFiltros.get('estatus')?.value !== '';

    // Verificar si las fechas son diferentes a las predeterminadas
    const fechaInicioDefault = `${this.FechaInicio.getFullYear()}/${this.FechaInicio.getMonth() + 1}/${this.FechaInicio.getDate()}`;
    const fechaFinalDefault = `${this.fechaHoy.getFullYear()}/${this.fechaHoy.getMonth() + 1}/${this.fechaHoy.getDate()}`;
    const fechasActivas = this.fechaInicio !== fechaInicioDefault || this.fechaFinal !== fechaFinalDefault;

    return criterioActivo || estatusActivo || fechasActivas;
  }
}
