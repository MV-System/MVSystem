import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IMyDrpOptions } from 'mydaterangepicker';
import { Pagination } from 'src/app/core/interfaces/pagination.interfaces';
import { MantenimientoService } from '../../../../core/services/mantenimiento.service';
import { FacturaFilter, FacturaConsulta, DetalleFacturaList } from '../../../../core/interfaces/mantenimiento';
import { CatalogosService } from 'src/app/core/services/catalogos.service';
import { VendedorService } from 'src/app/core/services/vendedor.service';
import { Almacen } from 'src/app/core/interfaces/catalogo.interface';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { CreatorPDFFile } from '../../../../helpers/helper';
import { ValidatorPermissionService } from 'src/app/core/services/validator-permission.service';
import { LoginService } from 'src/app/auth/login.service';
import { RDialogService } from 'src/app/shared/components/r-dialog/r-dialog.service';
import { LoadingService } from 'src/app/shared/components/r-loading/loading.service';
import { UserTrackingService } from 'src/app/core/services/user-tracking.service';

@Component({
  selector: 'app-facturacion-consulta',
  templateUrl: './facturacion-consulta.component.html',
  styleUrls: ['./facturacion-consulta.component.css']
})
export class FacturacionConsultaComponent implements OnInit, OnDestroy {
  detalleFactura: DetalleFacturaList[]=[];
  vendedores: any[] = [];

  constructor(private fb: FormBuilder,
    private loading: LoadingService,
    private mantenimientoService: MantenimientoService,
    private catalogosService: CatalogosService,
    private vendedorService: VendedorService,
    private toast: ToastrService,
    private loginService: LoginService,
  private validatorPermissionService:ValidatorPermissionService,
  private rDialogService: RDialogService,
  private tracking: UserTrackingService) { }

   // Método que se llama cuando cambia el tamaño de la página
   onPageSizeChange(newPageSize: number) {
    // Validar que pageSize sea válido
    const validPageSizes = [5, 10, 50, 100];

    // Permitir también totalRecord si es un número válido
    if (!validPageSizes.includes(newPageSize) && newPageSize !== this.totalRecord) {
      console.warn('Tamaño de página inválido:', newPageSize);
      return;
    }

    // Actualizar AMBAS propiedades
    this.pageSize = newPageSize;
    this.paginate.pageSize = newPageSize;

    // Resetear a la primera página al cambiar el tamaño
    this.pageIndex = 1;
    this.paginate.pageIndex = 1;
    this.currentPage = 1;

    // Llamar a la función que maneja la paginación y carga de datos
    this.getFacturas();
  }

    SelectSucursal(): boolean {
      return this.validatorPermissionService.validateUserRole("CB_SUCURSAL");
    }
    CheckComprobante(): boolean {
      return this.validatorPermissionService.validateUserRole("ComprobanteCheck");
    }
    CheckAnuladas(): boolean {
      return this.validatorPermissionService.validateUserRole("vercheckfacturasAnuladas");
    }
  ngOnDestroy(): void {
    this.subs.forEach(sub => sub.unsubscribe())
  }
  ngOnInit(): void {
    this.getFacturas();
    this.getAlmacenes();
    this.getVendedores();

    // Suscribirse a cambios en el campo criterio para sincronizar con el componente hijo
    this.form.get('criterio')?.valueChanges.subscribe(value => {
      this.criterioActual = value || '';
    });

    // 📊 Tracking: Registro de acceso al módulo
    this.tracking.trackPageView('Facturas', {
      seccion: 'consulta',
      vista: 'principal'
    }).subscribe();
  }

  getVendedores() {
    const sub = this.vendedorService.getVendedorLista().subscribe({
      next: (vendedores: any[]) => {
        this.vendedores = vendedores;
      },
      error: (err) => {
        console.error('Error al obtener vendedores:', err);
        this.toast.error('Error al cargar la lista de vendedores');
        this.vendedores = []; // Array vacío en caso de error
      }
    });
    this.subs.push(sub);
  }

  ComprobanteCheck: number=1;
  EstadoFactura: string="A"; // Activas
  isLoading: boolean = false; // Variable para controlar el estado de carga
  subs: Subscription[] = [];
  title: string = "Consulta Facturas";
  breadcrumbItem: string = "Consulta Facturas"
  breadcrumb: string = "Consulta"
  facturas: FacturaConsulta[]=[];
  almacenes!: Almacen[];
  tipoBusqueda:    number = 3;
  totalFacturado!: number;
  currentPage:     number = 1;
  pageIndex:       number = 1;
  pageSize:        number = 10;
  totalRecord!:    number;
  line!:           number;
  lastLine!:       number;
  numerofactura!:  number;
  IdAlmacen!:  number;
  iD_Vendedor!:  number;
  facturasCantidad:number = 0;
  rangeDatePlaceholder: Date =new Date()
  onFacturaButton: boolean = false;
  printing: boolean = false;
  facturaSeleccionada: number | null = null; // Para rastrear qué factura está seleccionada
  criterioActual: string = ''; // Nueva propiedad para sincronizar criterio
  myDateRangePickerOptions: IMyDrpOptions = {
    dateFormat: 'dd.mm.yyyy',
  };


// Obtener la fecha actual
 fechaHoy = new Date();
  // Crear una nueva fecha para el primer día del mes actual
  FechaInicio = new Date(this.fechaHoy.getFullYear(), this.fechaHoy.getMonth(), 1);

  // Utiliza el mismo formato que el filtro (YYYY/M/D)
  paginate: Pagination = {
    pageIndex: 1,
    pageSize: 10,
    fechaInicio: `${this.FechaInicio.getFullYear()}/${this.FechaInicio.getMonth() + 1}/${this.FechaInicio.getDate()}`,
    fechaFinal: `${this.fechaHoy.getFullYear()}/${this.fechaHoy.getMonth() + 1}/${this.fechaHoy.getDate()}`
  }
  form: FormGroup = this.fb.group({
    almacen: [this.loginService.getUserIdSucursal, [Validators.required]],
    criterio: ['', [Validators.minLength(1), Validators.maxLength(100), Validators.pattern(/^[a-zA-Z0-9\sñÑáéíóúÁÉÍÓÚ-]*$/)]],
    rangeDate: [''],
    iD_Vendedor: ['', [Validators.pattern(/^[0-9]*$/)]]
  });

  /**
   * Getter para mensajes de error del campo criterio
   */
  get criterioErrorMsg(): string {
    const errors = this.form.get('criterio')?.errors;
    if (errors?.minlength) return 'Mínimo 1 carácter';
    if (errors?.maxlength) return 'Máximo 100 caracteres';
    if (errors?.pattern) return 'Solo se permiten letras, números y espacios';
    return '';
  }

  /**
   * Getter para mensajes de error del campo vendedor
   */
  get vendedorErrorMsg(): string {
    const errors = this.form.get('iD_Vendedor')?.errors;
    if (errors?.pattern) return 'Seleccione un vendedor válido';
    return '';
  }

  /**
   * Getter para mensajes de error del campo almacén
   */
  get almacenErrorMsg(): string {
    const errors = this.form.get('almacen')?.errors;
    if (errors?.required) return 'Debe seleccionar una sucursal';
    return '';
  }

  modelFacturaFilter(){
    const {criterio,almacen,iD_Vendedor} = this.form.value;
    const model:FacturaFilter = {
      almacen: Number(almacen),
      criterio: criterio,
      IdVendedor: Number(iD_Vendedor),
      fechaInicio: this.paginate.fechaInicio,
      fechaFinal: this.paginate.fechaFinal,
      pageIndex: this.paginate.pageIndex,
      pageSize: this.paginate.pageSize,
      empresa: this.loginService.getUserEmpresa,
      IdEmpresa:this.loginService.getUserIdEmpresa,
      IdSucursal:this.loginService.getUserIdSucursal,
      ComprobanteCheck: this.ComprobanteCheck,
      EstadoFactura: this.EstadoFactura,
      Usuario: this.loginService.getUserName(),
    }
    return model;
  }
  getFacturas() {
    this.isLoading = true; // Iniciar loading
    this.loading.showLoading();
    this.facturas = []; // Limpiar facturas antes de la nueva búsqueda
    this.resetearSeleccionFactura();

    // 📊 Tracking: Registro de consulta de facturas
    this.tracking.trackAction('Facturas', 'Consultar', {
      fechaInicio: this.paginate.fechaInicio,
      fechaFin: this.paginate.fechaFinal,
      sucursal: this.form.get('almacen')?.value,
      estado: this.EstadoFactura
    }).subscribe();

    const sub = this.mantenimientoService.getFacturas(this.modelFacturaFilter())
  .subscribe({
    next: (facturas) => {
      if (facturas && facturas.length > 0) {
        // Hay facturas: usar los valores del API (del primer registro)
        this.totalRecord = facturas[0].totalRecord;
        this.totalFacturado = facturas[0].totalFacturado;
        this.facturasCantidad = facturas[0].totalRecord;
        this.line = facturas[0].line;
        this.lastLine = facturas[0].lastLine;
      } else {
        // Sin facturas: establecer todo en 0 para evitar mostrar datos incorrectos
        this.totalRecord = 0;
        this.totalFacturado = 0;
        this.facturasCantidad = 0;
        this.line = 0;
        this.lastLine = 0;
      }

      this.facturas = facturas;
      this.isLoading = false; // Terminar loading
      this.loading.hideLoading();
    },
    error: (error) => {
      console.error('Error al cargar facturas:', error);
      this.isLoading = false;
      this.loading.hideLoading();
    }
  });
    this.subs.push(sub);
  }
  getDetalleFactura(numeroFactura: number){
    // Validar numeroFactura
    if (!numeroFactura || numeroFactura <= 0) {
      this.toast.error('Número de factura inválido');
      return;
    }

    //this.isLoading = true; // Iniciar carga
    this.numerofactura = numeroFactura;
    this.facturaSeleccionada = numeroFactura; // Rastrear la factura seleccionada
    const { almacen } = this.form.value;

    const sub = this.mantenimientoService.getDetalleFactura(numeroFactura,Number(almacen))
    .subscribe({
      next: (detalle) => {
        this.detalleFactura = detalle;
      },
      error: (err) => {
        console.error('Error al obtener detalle de factura:', err);
        this.toast.error('Error al cargar el detalle de la factura');
        this.detalleFactura = []; // Limpiar detalle en caso de error
      }
    });
    this.subs.push(sub);
  }
  printReportFacturaConsulta(){
    // Validar que haya facturas para imprimir
    if (!this.facturas || this.facturas.length === 0) {
      this.toast.warning('No hay facturas para imprimir. Por favor, realice una búsqueda primero.');
      return;
    }

    this.loading.showLoading();
    //this.isLoading = true; // Iniciar carga
    const sub = this.mantenimientoService.postFacturaConsultaReport(this.modelFacturaFilter())
    .subscribe(blob =>{
      CreatorPDFFile(blob);
    },err=>{
      this.printing = !this.printing;
      this.toast.error('Error al imprimir factura');
    });
    this.subs.push(sub);
    this.loading.hideLoading();
  }
  printFactura(){
     this.loading.showLoading();
    const sub = this.mantenimientoService.postFacturaReport(this.modelFacturaFilter(),this.numerofactura)
    .subscribe(blob =>{
      CreatorPDFFile(blob);
       this.loading.hideLoading();
    },err=>{

      this.toast.error('Error al imprimir factura');
    });
    this.subs.push(sub);

  }
  ReimprimeFactura() {
    // Validar que haya una factura seleccionada
    if (!this.puedeReimprimir()) {
      this.toast.warning('Por favor, seleccione una factura para reimprimir.');
      return;
    }

    // Validación adicional: numeroFactura debe ser mayor a 0
    if (!this.numerofactura || this.numerofactura <= 0) {
      this.toast.error('Número de factura inválido para reimprimir.');
      return;
    }

    // Validación adicional: verificar que la factura existe en la lista actual
    const facturaExiste = this.facturas.some(f => f.numeroFactura === this.numerofactura);
    if (!facturaExiste) {
      this.toast.warning('La factura seleccionada ya no está disponible. Por favor, actualice la búsqueda.');
      return;
    }

    this.rDialogService.openDialog(
      "Aviso",
      "¿Desea imprimir la factura mini o normal?",
      // Si selecciona "Normal", ejecuta printFactura
      () => {
        this.printFactura();
      },
      // Si selecciona "Mini", ejecuta printFacturaMini
      () => {
        this.printFacturaMini();
      },
      "Mini", // Etiqueta del botón para la opción Mini
      "Normal" // Etiqueta del botón para la opción Normal
    );

  }

  printFacturaMini(){
     this.loading.showLoading();
    this.printing = !this.printing;
    const sub = this.mantenimientoService.postFacturaMiniReport(this.modelFacturaFilter(),this.numerofactura)
    .subscribe(blob =>{
      CreatorPDFFile(blob);
   this.loading.hideLoading();
  },err=>{
      this.toast.error('Error al imprimir factura');
    });
    this.subs.push(sub);
  }

  /**
   * Comparte la factura usando la API nativa de compartir del navegador
   * Genera un PDF y permite compartir por WhatsApp, Email, etc.
   */
  compartirFactura(numeroFactura: number) {
    // Validar numeroFactura
    if (!numeroFactura || numeroFactura <= 0) {
      this.toast.error('Número de factura inválido');
      return;
    }

    // Verificar si el navegador soporta la Web Share API
    if (!navigator.share) {
      this.toast.warning('Tu navegador no soporta la función de compartir. Por favor, usa un navegador moderno en tu dispositivo móvil.');
      return;
    }

    // Mostrar loading
    this.loading.showLoading();
    this.isLoading = true;

    // Generar el PDF usando el mismo endpoint que la impresión normal
    const sub = this.mantenimientoService.postFacturaReport(this.modelFacturaFilter(), numeroFactura)
      .subscribe({
        next: async (blob) => {
          try {
            // Convertir el Blob a File (necesario para navigator.share)
            const fileName = `Factura_${numeroFactura}.pdf`;
            const file = new File([blob], fileName, { type: 'application/pdf' });

            // Intentar compartir el archivo
            try {
              await navigator.share({
                title: `Factura #${numeroFactura}`,
                text: `Factura #${numeroFactura} - MVSystem`,
                files: [file]
              } as any); // usar 'as any' para evitar error de tipos en TS

              this.toast.success('Factura compartida exitosamente');
            } catch (shareError: any) {
              // Si falla el share con archivos, intentar solo descargar
              if (shareError.name === 'NotAllowedError' || shareError.message?.includes('files')) {
                this.toast.warning('No se puede compartir el archivo. Se descargará en su lugar.');
                CreatorPDFFile(blob);
              } else if (shareError.name !== 'AbortError') {
                // Cualquier otro error que no sea cancelación del usuario
                console.error('Error al compartir:', shareError);
                this.toast.warning('Error al compartir. Descargando archivo...');
                CreatorPDFFile(blob);
              }
            }
          } catch (error: any) {
            console.error('Error al procesar archivo:', error);
            this.toast.error('Error al preparar la factura para compartir');
          } finally {
            this.loading.hideLoading();
            this.isLoading = false;
          }
        },
        error: (err) => {
          console.error('Error al generar PDF:', err);
          this.toast.error('Error al generar la factura para compartir');
          this.loading.hideLoading();
          this.isLoading = false;
        }
      });

    this.subs.push(sub);
  }
  pageChanged(index: number) {
  this.currentPage = index;
  this.pageIndex = index;
  this.paginate.pageIndex = this.pageIndex;
  // Resetear selección al cambiar de página
  this.resetearSeleccionFactura();
  this.getFacturas();  // Llamar nuevamente para obtener las facturas con la nueva página
}  /**
   * Maneja el cambio de rango de fechas con validaciones completas
   */
  onDateRangeChanged(event: any) {
    if (event.beginDate.year === 0) {
      this.paginate.fechaInicio = '';
      this.paginate.fechaFinal = '';
    } else {
      // Crear objetos Date para las validaciones
      const fechaInicio = new Date(event.beginDate.year, event.beginDate.month - 1, event.beginDate.day);
      const fechaFinal = new Date(event.endDate.year, event.endDate.month - 1, event.endDate.day);
      const hoy = new Date();
      hoy.setHours(23, 59, 59, 999); // Establecer al final del día

      // Validación 1: Fecha inicial no puede ser mayor que fecha final
      if (fechaInicio > fechaFinal) {
        this.toast.warning('La fecha inicial no puede ser mayor que la fecha final');
        return;
      }

      // Validación 2: No se pueden seleccionar fechas futuras
      if (fechaFinal > hoy) {
        this.toast.warning('No se pueden seleccionar fechas futuras');
        return;
      }

      // Validación 3: El rango no puede ser mayor a 1 año
      const unAnoEnMs = 365 * 24 * 60 * 60 * 1000;
      const rangoEnMs = fechaFinal.getTime() - fechaInicio.getTime();
      if (rangoEnMs > unAnoEnMs) {
        this.toast.warning('El rango de fechas no puede ser mayor a 1 año. Por favor, seleccione un período más corto.');
        return;
      }

      // Si todas las validaciones pasan, asignar las fechas
      this.paginate.fechaInicio = `${event.beginDate.year}/${event.beginDate.month}/${event.beginDate.day}`;
      this.paginate.fechaFinal = `${event.endDate.year}/${event.endDate.month}/${event.endDate.day}`;
    }
    this.getFacturas();
  }

  getAlmacenes() {
    const sub = this.catalogosService.getSucursales().subscribe({
      next: (almacen) => {
        this.almacenes = almacen;
      },
      error: (err) => {
        console.error('Error al obtener almacenes:', err);
        this.toast.error('Error al cargar la lista de sucursales');
        this.almacenes = []; // Array vacío en caso de error
      }
    });
    this.subs.push(sub);
  }
  onCheckboxComprobanteChange(event: Event) {
    // Validar que el evento y el target existan
    if (!event || !event.target) {
      console.warn('Evento o target del checkbox no válido');
      return;
    }


    const checkbox = event.target as HTMLInputElement;

    // Validar que sea un elemento input
    if (checkbox.tagName !== 'INPUT' || checkbox.type !== 'checkbox') {
      console.warn('El target no es un checkbox válido');
      return;
    }

    // Si está seleccionado, usar valor 2 (solo comprobantes)
    // Si está deseleccionado, usar valor 1 (todas las facturas)
  this.ComprobanteCheck = checkbox.checked ? 2 : 1;

    this.getFacturas();
  }

  onCheckboxAnuladasChange(event: Event) {
    // Validar que el evento y el target existan
    if (!event || !event.target) {
      console.warn('Evento o target del checkbox no válido');
      return;
    }

    const checkbox = event.target as HTMLInputElement;

    // Validar que sea un elemento input
    if (checkbox.tagName !== 'INPUT' || checkbox.type !== 'checkbox') {
      console.warn('El target no es un checkbox válido');
      return;
    }

    // Si está marcado, enviar 'X' (anuladas), si no, 'A' (activas)
    this.EstadoFactura = checkbox.checked ? "X" : "A";
    this.getFacturas();
  }


  facturasFiltradas(): FacturaConsulta[] {
    const vendedorSeleccionadoId = this.form.get('iD_Vendedor')?.value;
    if (!vendedorSeleccionadoId) {
      return this.facturas;
    }
    // Buscar el nombre del vendedor según el ID seleccionado
    const vendedorObj = this.vendedores.find(v => String(v.iD_Vendedor) === String(vendedorSeleccionadoId));
    if (!vendedorObj) {
      return this.facturas;
    }
    const nombreVendedor = vendedorObj.nombres || vendedorObj.nombre;
    // Filtrar por el nombre del vendedor
    return this.facturas.filter(f => f.vendedor === nombreVendedor);
  }

  /**
   * Calcula el total facturado en el cliente sumando los montos de todas las facturas filtradas
   */
  getTotalFacturadoCliente(): number {
    return this.totalFacturado  || 0;

    //return this.facturasFiltradas().reduce((acc, factura) => acc + (factura.total || 0), 0);
  }

  /**
   * Devuelve la cantidad de facturas filtradas en el cliente
   */
  getCantidadFacturasCliente(): number {
     return this.totalRecord || 0;

  }

  /**
   * Detecta si hay filtros activos aplicados
   */
  hayFiltrosActivos(): boolean {
    const formValues = this.form.value;

    // Verificar filtros de formulario
    const criterioActivo = formValues.criterio && formValues.criterio.trim() !== '';
    const vendedorActivo = formValues.iD_Vendedor && formValues.iD_Vendedor !== '';
    const sucursalActiva = formValues.almacen && formValues.almacen !== '';
    const fechasActivas = formValues.rangeDate && formValues.rangeDate !== '';
    const comprobanteActivo = this.ComprobanteCheck === 2;
    const anuladasActivo = this.EstadoFactura === "A";

    return criterioActivo || vendedorActivo || sucursalActiva || fechasActivas || comprobanteActivo || anuladasActivo;
  }

  /**
   * Maneja las búsquedas desde el componente hijo (facturacion-lista)
   * Este método recibe el criterio de búsqueda y pageIndex del debounce optimizado
   */
  onBuscarFacturas(event: {criterio: string, pageIndex: number}) {
    // Actualizar el formulario con el criterio de búsqueda
    this.form.patchValue({ criterio: event.criterio });

    // Actualizar la paginación
    this.pageIndex = event.pageIndex;
    this.paginate.pageIndex = event.pageIndex;

    // Ejecutar la búsqueda
    this.getFacturas();
  }

  /**
   * Resetea la selección de factura cuando se filtran los datos
   */
  resetearSeleccionFactura() {
    this.onFacturaButton = false;
    this.facturaSeleccionada = null;
    this.numerofactura = 0;
  }

  /**
   * Valida si se puede reimprimir la factura
   */
  puedeReimprimir(): boolean {
    return this.onFacturaButton && this.facturaSeleccionada !== null;
  }

}
