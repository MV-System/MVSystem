import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LoginService } from 'src/app/auth/login.service';
import { MarcaEquipo, ModeloEquipo } from 'src/app/core/interfaces/catalogo.interface';
import { Cliente } from 'src/app/core/interfaces/cliente.interface';
import { DefaultFilter, RegistroReparaciones } from 'src/app/core/interfaces/equipo.interface';
import { CatalogosService } from 'src/app/core/services/catalogos.service';
import { ClientesService } from 'src/app/core/services/clientes.service';
import { EquipoService } from 'src/app/core/services/equipo.service';
import { MantenimientoService } from 'src/app/core/services/mantenimiento.service';
import { RDialogService } from 'src/app/shared/components/r-dialog/r-dialog.service';
import { LoadingService } from 'src/app/shared/components/r-loading/loading.service';

/**
 * Componente para la gestión de reparaciones de equipos
 * Permite registrar nuevas reparaciones, asociar clientes, y generar reportes
 * Incluye funcionalidades para:
 * - Registro de reparaciones con detalles técnicos
 * - Gestión de clientes (selección y creación)
 * - Control de costos y precios
 * - Impresión de recibos
 * - Validaciones de formulario
 */
@Component({
  selector: 'app-reparaciones',
  templateUrl: './reparaciones.component.html',
  styleUrls: ['./reparaciones.component.css']
})
export class ReparacionesComponent implements OnInit {
  /** Indica si se está imprimiendo un reporte */
   printing: boolean = false;
  /** Indica si hay una operación en curso */
  isLoading = false;
  /** Indica si se está generando un reporte */
   generarReporteLoading: boolean = false;
  /** Controla la visibilidad del modal de registro de cliente */
  showModal: boolean = false;

    formEquipoReparado: FormGroup = this.fb.group({
    criterio: [''],
    rangeDate: [''],
  })

  filtro: DefaultFilter = {
    pageIndex: 1,
    pageSize: 10,
    fechaInicio : '',
    fechaFinal : ''
  }

// Obtener la fecha actual
 fechaHoy = new Date();
  listaMarca: MarcaEquipo[] = [];
  listaModelo: ModeloEquipo[] = [];
  subs: Subscription[] = [];
  destroy$: Subject<any> = new Subject<any>();
  customer!: Cliente;
  customers: Cliente[] = []
  btnDisabled: boolean = true;
  IdReparacion : number = 0;
  /**
   * Formulario principal para el registro de reparaciones
   * Incluye campos para:
   * - Información del equipo (IMEI)
   * - Datos del cliente
   * - Costos y precios
   * - Detalles técnicos de la reparación
   * - Información de marca y modelo
   */
  formRegistroReparaciones: FormGroup = this.fb.group({
    IMEI: ["",],
    cliente: [null, Validators.required], // Control para el ng-select de cliente
    Costo: [, [Validators.required]],
    Detalle_Reparacion: ["",[Validators.required]],
    Observaciones: ["",],
    Usuario: [this.loginService.getUserName(),],
    ID_Cliente:[],
    Precio:  [, [Validators.required]],
    Fecha_Entrega: [this.fechaHoy],
    telefono:'',
    ID_Modelo:[],
    marca:[],
    modelo:[],


  })
  constructor(
    private loading: LoadingService,
     private equipoService: EquipoService,
    private rDialogService: RDialogService,
    private catalogosService: CatalogosService,
    private clientesService: ClientesService,
    private mantenimientoService: MantenimientoService,
    private toastr: ToastrService,
    private loginService: LoginService,
    private fb: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.obtenerMarcasLista();
    this.obtenerClientes();
  }
  obtenerMarcasLista() {
    this.catalogosService.getMarcasLista().subscribe((marca) => {
      this.listaMarca = marca;
    });
  }
  obtenerClientes() {
    this.clientesService.getClientesPorNombreTelefono('')
      .pipe(takeUntil(this.destroy$))
      .subscribe(clientes => {
        this.customers = clientes
      })
  }
  modeloRegistroReparacion() {
    const model: RegistroReparaciones = {
     IMEI: this.formRegistroReparaciones.get('IMEI')?.value,
     ID_Cliente: this.customer.id_Cliente || 0,
     Detalle_Reparacion: String(this.formRegistroReparaciones.get('Detalle_Reparacion')?.value),
     Observaciones: String(this.formRegistroReparaciones.get('Observaciones')?.value),
     Costo: Number(this.formRegistroReparaciones.get('Costo')?.value),
     Precio: Number(this.formRegistroReparaciones.get('Precio')?.value),
     Fecha_Entrega: String(this.formRegistroReparaciones.get('Fecha_Entrega')?.value),
     ID_Modelo: Number(this.formRegistroReparaciones.get('modelo')?.value),
     Usuario: this.loginService.getUserName(),
     mensajeSalida:'',
     idReparacion: 0
   }
      return model;
 }
  /**
   * Maneja la adición de un nuevo cliente
   * Actualiza el formulario con los datos del cliente
   * y actualiza la lista de clientes disponibles
   * @param customer Cliente a agregar
   */
  onAddCustomer(customer: Cliente) {
    console.log('onAddCustomer llamado con:', customer);

    // Si customer es undefined o null, significa que se canceló
    if (!customer) {
      this.closeModal();
      return;
    }

    // Asignar el cliente
    this.customer = customer;
    this.clientesService.isOpeningForm$.next(false);

    // Agregar el nuevo cliente al inicio de la lista de 'customers'
    this.customers = [customer, ...this.customers];

    // Actualizar el formulario con el nuevo cliente seleccionado
    this.formRegistroReparaciones.patchValue({
      cliente: customer, // Asignar el objeto completo al ng-select
      ID_Cliente: customer.id_Cliente || 0
    });

    // Cerrar el modal
    this.showModal = false;
    console.log('Modal cerrado, showModal:', this.showModal);

    // Mostrar mensaje de éxito
    this.toastr.success('Cliente agregado correctamente');
  }
  /**
   * Valida que el precio no sea menor que el costo
   * Muestra un mensaje de error si la validación falla
   */
  validarCamposFormCostoDetalle() {

  if (
    this.formRegistroReparaciones.get('Precio')?.value <
    this.formRegistroReparaciones.get('Costo')?.value && this.formRegistroReparaciones.get('Costo')?.value !== null) {
    this.formRegistroReparaciones.setErrors({ error: '' })
    this.toastr.error(
      'El monto del Precio no puede ser menor que el Costo',
      '',
      { closeButton: true, progressBar: true }
    );
    return;
  }
}
msgValidacionesCamposFormNumericos() {
  let camposNumerico: string[] = [
    'Costo',
    'Precio',
  ];
  camposNumerico.forEach((campo) => {
    if (
      this.formRegistroReparaciones.get(campo)?.value < 0 ||
      this.formRegistroReparaciones.get(campo)?.value == 0
    ) {
      this.formRegistroReparaciones.setErrors({ error: '' })
      this.toastr.error('Los valores de los campos deben ser mayor a 0', '', {
        closeButton: true,
        progressBar: true,
      });
      return;
    }
  });
}
btnDisable() {
  return this.formRegistroReparaciones.valid ? this.btnDisabled = false : this.btnDisabled = true;
}
 validacionesRegistro() {
  this.validarCamposFormCostoDetalle();
  this.msgValidacionesCamposFormNumericos();

}
  // Ahora la selección de cliente se maneja con onClienteChange(cliente: Cliente)
  onClienteChange(cliente: Cliente) {
    this.customer = cliente;
    this.formRegistroReparaciones.patchValue({
      ID_Cliente: cliente.id_Cliente || 0
    });
  }
selectoresMarcaModeloValidator() {

  this.formRegistroReparaciones.get('modelo')?.setValue('');
  if (this.formRegistroReparaciones.get('marca')?.value) {
    this.formRegistroReparaciones.controls.modelo.enable();

    this.obtenerModeloLista();
  }
  else {
    this.formRegistroReparaciones.controls.modelo.disable();

  }
}
obtenerModeloLista() {

  let idMarca = this.formRegistroReparaciones.get('marca')?.value;
  this.catalogosService.getModeloByMarcaLista(idMarca).subscribe((modelo) => {
    this.listaModelo = modelo;
  });
}
onAdd() {
    // Indicar que el formulario está siendo abierto
    this.clientesService.isOpeningForm$.next(true);
    // Mostrar el modal usando la propiedad showModal
    this.showModal = true;
  }

  /**
   * Cierra el modal de registro de cliente
   */
  closeModal() {
    this.showModal = false;
    this.clientesService.isOpeningForm$.next(false);
  }
validarCampos(nombreCampo: string) {
  return (
    this.formRegistroReparaciones.get(nombreCampo)?.invalid &&
    this.formRegistroReparaciones.get(nombreCampo)?.touched
  );
}
registroReparacion() {
  const model: RegistroReparaciones = this.modeloRegistroReparacion();
  this.validacionesRegistro();
  if (this.formRegistroReparaciones.valid) {
     this.loading.showLoading();
    this.mantenimientoService.postReparacion(model)
      .subscribe((Reparacion) => {
        Reparacion.forEach((Respuesta) => {
          this.toastr.info(Respuesta.mensajeSalida);
          this.IdReparacion = Respuesta.idReparacion;
        });
        this.loading.hideLoading();
        this.rDialogService.openDialog("Aviso", 'Desea imprimir el Recibo?',
          () => {
             this.printing = true;
            this.obtenerReporte(this.IdReparacion);
            this.toastr.success("Reparación registrada correctamente");
            this.formRegistroReparaciones.reset({});
          },
          () => {
            this.formRegistroReparaciones.reset({});
          },
          "No",
          "Si"
        );
      }, error => {
        this.toastr.error('Error al registrar la reparación');
      });
  } else {
    this.formRegistroReparaciones.markAllAsTouched();
    const registroElement = document.getElementById('registro');
    if (registroElement) {
      registroElement.scrollIntoView({ behavior: 'smooth' });
    }
    this.toastr.error('Hay datos en el formulario incompletos', '', { closeButton: true, progressBar: true });
  }
}

private getBlobForCreateIFramePDF(blobResp: Blob): void {
    const blob = new Blob([blobResp], { type: 'application/pdf' });
    const blobUrl = URL.createObjectURL(blob);
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = blobUrl;
    document.body.appendChild(iframe);
    iframe.contentWindow?.print();
  }

  /**
   * Genera y muestra el reporte de reparación en PDF
   * Crea un iframe temporal para mostrar el PDF y permite su impresión
   * @param id_reparacion ID de la reparación para generar el reporte
   */
  obtenerReporte(id_reparacion: number) {
    this.loading.showLoading();
  this.equipoService.getEquipoReparadoReporte(
    id_reparacion,
    this.loginService.getUserIdEmpresa,
    this.loginService.getUserIdSucursal
  ).subscribe(blob => {
    const newBlob = new Blob([blob], { type: 'application/pdf' });
    const blobUrl = URL.createObjectURL(newBlob);

    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = blobUrl;

    // Espera a que el PDF se cargue en el iframe antes de quitar el loading
    iframe.onload = () => {
     // this.generarReporteLoading = false; // Oculta el loading solo cuando el PDF está listo
    this.loading.hideLoading();
     iframe.contentWindow?.print();
    };

    document.body.appendChild(iframe);
     this.isLoading = false; // Terminar carga
  }, (err) => {
   // this.generarReporteLoading = false;
    this.toastr.error('Error', 'No se pudo generar el reporte');
  });
}
getClienteTelefono(cliente: any): number | string {
    if (!cliente) return '[Teléfono]';
    return cliente.numero_Telefono || cliente.numero_de_telefono || cliente.Numero_de_telefono || 0;
  }
}
