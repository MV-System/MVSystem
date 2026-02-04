import { Component, Input, OnInit, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { VendedorLista } from 'src/app/core/interfaces/vendedor.interface';
import { VendedorService } from 'src/app/core/services/vendedor.service';
import { FacturaConsulta, DetalleFacturaList } from '../../../../../core/interfaces/mantenimiento';
import { ToastrService } from 'ngx-toastr';
import { RDialogService } from 'src/app/shared/components/r-dialog/r-dialog.service';
import { MantenimientoService } from 'src/app/core/services/mantenimiento.service';
import { Subject, Subscription } from 'rxjs';
import { LoginService } from 'src/app/auth/login.service';
import { ValidatorPermissionService } from 'src/app/core/services/validator-permission.service';
import { CatalogosService } from 'src/app/core/services/catalogos.service';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { LoadingService } from 'src/app/shared/components/r-loading/loading.service';

@Component({
  selector: 'app-facturacion-lista',
  templateUrl: './facturacion-lista.component.html',
  styleUrls: ['./facturacion-lista.component.css']
})
export class FacturacionListaComponent implements OnInit, OnChanges {
  @Input() estadoFactura: string = 'A';
  @Output() pageSizeChanged = new EventEmitter<number>(); // Emitir evento para el cambio de pageSize
selectedRowIndex: number | null = null;
  // Aquí seguimos teniendo la propiedad facturaVisibility
  facturaVisibility: { [key: number]: boolean } = {};

  // Este método se ejecuta cuando el select cambia
  onPageSizeChange(event: any) {
        const newSize = event.target.value;
        this.pageSizeChanged.emit(Number(newSize));
    }

  // La función para manejar ambos clics
  handleClick(facturaId: number, index: number) {
    // Primero, llama a la función que obtiene la factura
    this.getIdFactura(facturaId, index);

    // Luego, alterna la visibilidad de los detalles
    this.toggleDetalleFactura(facturaId);

    // Cambia el índice de la fila seleccionada para aplicar el color de fondo
    this.selectedRowIndex = index;
  }
  destroy$: Subject<any> = new Subject<any>();
  index!: number;
  numeroFactura!: number;
  isLoading: boolean = false; // Variable para controlar el estado de carga
  subs: Subscription[] = [];
  constructor(
     private loading: LoadingService,
    private catalogosService: CatalogosService,
    private validatorPermissionService: ValidatorPermissionService,
    private loginService: LoginService,
    private mantenimientoService: MantenimientoService,
    private rDialogService: RDialogService,
    private toast: ToastrService,
    private vendedorService: VendedorService) { }
  ngOnInit(): void {
    this.setupSearchOptimization();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Sincronizar criterio cuando cambia desde el padre
    if (changes['criterioInput'] && changes['criterioInput'].currentValue !== undefined) {
      const newCriterio = changes['criterioInput'].currentValue || '';

      // Solo actualizar si el criterio es diferente para evitar loops infinitos
      if (this.criterio !== newCriterio) {
        this.criterio = newCriterio;

        // Activar el sistema de debounce cuando cambia el criterio desde el padre
        this.searchSubject.next(this.criterio);
      }
    }
  }
  @Input() pageSize!:    number;
  @Input() pageIndex!:   number;
  @Input() totalRecord!: number;
  @Input() currentPage:  number = 1;
  @Input() line!:  number;
  @Input() lastLine!:  number;
  @Input() criterioInput!: string; // Nuevo Input para recibir criterio del padre
  @Input() facturas: FacturaConsulta[]=[];
  @Input() detalleFactura: DetalleFacturaList[]=[];
  @Output() onFacturaButton =new EventEmitter<boolean>();
  @Output() numerofactura =new EventEmitter<number>();
  @Output() onBuscarFacturas = new EventEmitter<{criterio: string, pageIndex: number}>();
  @Output() onCompartirFactura = new EventEmitter<FacturaConsulta>();
  @Output() pageChanged = new EventEmitter<number>();


  vendedores: VendedorLista[] = []

  // Nuevas propiedades para optimizar búsquedas
  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;
  criterio: string = '';
  minSearchLength: number = 1; // Mínimo de caracteres para buscar (permite buscar facturas con un solo dígito)
  debounceTime: number = 800; // Tiempo de espera en milisegundos

  btnAnulaFactura(): boolean {
    return this.validatorPermissionService.validateUserRole("VNT_DETALLE_FACTURA_BTN_ANULAR");
  }

  btnRebajaEquipo(): boolean {
    return this.validatorPermissionService.validateUserRole("VNT_DETALLE_FACTURA_BTN_REBAJA");
  }

  btnCambiaImei(): boolean {
    return this.validatorPermissionService.validateUserRole("VNT_DETALLE_FACTURA_BTN_CAMBIA_IMEI");
  }

  toggleDetalleFactura(facturaId: number) {
    // Cambia el estado de visibilidad de los detalles de la factura
    this.facturaVisibility[facturaId] = !this.facturaVisibility[facturaId];
  }
 // Método para manejar la edición de un código
 onEdit(detalle: DetalleFacturaList) {
  // Guardar el valor original antes de editarlo
  detalle.EquipoActual = detalle.idEquipo;
  console.log("Equipo Capturado",detalle.EquipoActual);
  detalle.editMode = true;
}

DetalleFacturaCambiaImeiOnSave(detalle: DetalleFacturaList) {
  this.isLoading = true; // Indica que el proceso está cargando
  detalle.EquipoNuevo = `${detalle.idEquipo}`;

  // Verificar disponibilidad del equipo
  this.catalogosService.buscarEquipoDisponible(detalle.EquipoNuevo, this.loginService.getUserIdSucursal)
    .pipe(takeUntil(this.destroy$)) // Para limpiar los recursos correctamente al destruir el componente
    .subscribe({
      next: (response) => {
        if (response.disponible === 'S') {
          // El equipo está disponible, proceder a la actualización
          this.mantenimientoService.EditaDetalleFactura(
            detalle.EquipoActual,
            detalle.EquipoNuevo,
            detalle.numeroFactura,
            this.loginService.getUserIdSucursal,
            this.loginService.getUserName()
          ).subscribe({
            next: (respuesta) => {
              //this.isLoading = false; // Finalizar la carga
              const mensaje = respuesta.mensaje; // Captura el mensaje del backend
             console.log(respuesta);
              this.toast.info(mensaje); // Muestra un mensaje de éxito
            },
            error: (err) => {
              this.isLoading = false; // Finalizar la carga en caso de error
              this.toast.error('Error al editar la factura. Intente nuevamente.'); // Mostrar mensaje de error
            }
          });
        } else {
          // Si el equipo no está disponible, muestra el mensaje de error
           // this.loading.showLoading();

          this.toast.error(`El equipo con IMEI ${detalle.EquipoNuevo} no está disponible: ${response.mensaje}`);
        }
      },
      error: (error) => {
        // Manejar errores en la verificación de disponibilidad
        this.isLoading = false; // Finalizar la carga
        this.toast.error('Hubo un problema al verificar la disponibilidad del equipo.');
      }
    });
}

// Método para cancelar la edición y restaurar el valor original
onCancel(detalle: DetalleFacturaList) {
  // Restaurar el valor original si el usuario cancela la edición
  detalle.idEquipo = detalle.EquipoActual;
  detalle.editMode = false;
}


  getIdFactura(numerofactura: number,index: number){
    this.selectedRowIndex = index; // Guarda el índice de la fila seleccionada
    this.index= index;
    //this.onSelectFactura();
    if(numerofactura > 0){this.onFacturaButton.emit(true);}
    this.numerofactura.emit(numerofactura);

  }
  isMobileScreen(): boolean {
  return window.innerWidth < 600;
}
  obtenerVendedor() {
    this.vendedorService.getVendedorLista()
      .subscribe((vendedor) => {
        this.vendedores = vendedor;
      });
  }
  anulaFactura(numeroFactura: number){
    this.rDialogService.openDialog(
      "Aviso",
      "¿Desea Anular esta factura?",
      () => {
        this.toast.info("no se anula la factura");
      },
      () => {

          numeroFactura = +(`${numeroFactura}`);
        // aqui va la logica para anular la factura
        this.isLoading = true; // Iniciar carga
    const sub = this.mantenimientoService.postAnlaFactura(numeroFactura,this.loginService.getUserIdSucursal,this.loginService.getUserName())
    .subscribe(blob =>{
       this.isLoading = false; // Terminar carga
       this.toast.info(`Se anuló la factura #${numeroFactura}`);
       setTimeout(() => {
        window.location.reload(); // Recarga la página después de 2 segundos
      }, 2000);
      // console.log("factura seleccionada",numeroFactura);
    },err=>{

      this.toast.error('Error al Anular la factura');
    });
    this.subs.push(sub);


      },
      "Si", // Etiqueta del botón para Anular la factura
      "No, Fue un error" // fue un error
    );

  }

  rebajarEquipo(detalle: DetalleFacturaList) {
    this.rDialogService.openDialog(
      'Confirmación',
      '¿Está seguro que desea rebajar este equipo de la factura?',
      () => {
        const model = {
          NumeroFactura: detalle.numeroFactura,
          imei: detalle.idEquipo,
          IDsucursal: this.loginService.getUserIdSucursal,
          Usuario: this.loginService.getUserName(),
        };
        this.isLoading = true;
        this.mantenimientoService.DetalleFacturaRebajaEquipo(model).subscribe({
          next: (resp) => {
            this.isLoading = false;
            this.toast.success(resp.mensaje || 'Equipo rebajado correctamente.');
            setTimeout(() => {
              window.location.reload(); // Recarga la página después de 2 segundos
            }, 2000);
          },
          error: (err) => {
            this.isLoading = false;
            this.toast.error('Error al rebajar el equipo.');
          }
        });
      },
      () => {
        // Cancelado, no hacer nada
      },
      'No',
      'Sí'
    );
  }

  // Configurar optimización de búsqueda
  private setupSearchOptimization(): void {
    this.searchSubscription = this.searchSubject
      .pipe(
        debounceTime(this.debounceTime), // Esperar 500ms después de que el usuario deje de escribir
        distinctUntilChanged(), // Solo proceder si el valor cambió
        takeUntil(this.destroy$)
      )
      .subscribe(searchTerm => {
        if (searchTerm.length >= this.minSearchLength || searchTerm.length === 0) {
          this.executeSearch(searchTerm);
        }
      });
  }

  // Método para manejar el input de búsqueda
  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.criterio = target.value.trim();

    // Enviar al subject para procesar con debounce
    this.searchSubject.next(this.criterio);
  }

  // Método para manejar Enter en el campo de búsqueda
  onSearchKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();

      // Cancelar cualquier búsqueda pendiente del debounce
      if (this.searchSubscription) {
        this.searchSubscription.unsubscribe();
        this.setupSearchOptimization(); // Reconfigurar
      }

      // Ejecutar búsqueda inmediatamente
      this.executeSearch(this.criterio);
    }
  }

  // Método para ejecutar la búsqueda
  private executeSearch(searchTerm: string): void {
    // Emitir evento al componente padre para realizar la búsqueda
    this.onBuscarFacturas.emit({
      criterio: searchTerm,
      pageIndex: 1 // Resetear a la primera página
    });
  }

  // Método para limpiar búsqueda
  clearSearch(): void {
    this.criterio = '';
    this.executeSearch('');
  }

  // Método para búsqueda manual (botón)
  searchManually(): void {
    this.executeSearch(this.criterio);
  }

  /**
   * Emite el evento para compartir la factura al componente padre
   */
  compartirFacturaMobile(numeroFactura: number): void {
    // Buscar la factura completa en el array usando el número de factura
    const facturaParaCompartir = this.facturas.find(f => f.numeroFactura === numeroFactura);

    // Si se encuentra la factura, emitirla
    if (facturaParaCompartir) {
        this.onCompartirFactura.emit(facturaParaCompartir);
    } else {
        // Opcional: manejar el caso en que no se encuentre la factura
        this.toast.error(`No se encontró la factura #${numeroFactura} para compartir.`);
    }
  }

  /**
   * Maneja el cambio de página y emite al componente padre
   */
  onPageChange(newPage: number): void {
    this.pageChanged.emit(newPage);
  }


  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();

    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }

    // Limpiar otras suscripciones
    this.subs.forEach(sub => sub.unsubscribe());
  }

}
