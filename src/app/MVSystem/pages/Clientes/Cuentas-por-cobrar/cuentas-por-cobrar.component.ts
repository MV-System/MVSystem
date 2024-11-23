import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IMyDrpOptions } from 'mydaterangepicker';
import { ToastrService } from 'ngx-toastr';
import { LoginService } from 'src/app/auth/login.service';
import { AbonoFacturaParam, AbonoFacturaResponse, ClientesConFacturasPendientesRetorn, FacturasPorClienteRetorn } from 'src/app/core/interfaces/cliente.interface';
import { ClientesService } from 'src/app/core/services/clientes.service';
import { RDialogService } from 'src/app/shared/components/r-dialog/r-dialog.service';
import { LoadingService } from 'src/app/shared/components/r-loading/loading.service';

@Component({
  selector: 'app-cuentas-por-cobrar',
  templateUrl: './cuentas-por-cobrar.component.html',
  styleUrls: ['./cuentas-por-cobrar.component.css']
})
export class CuentasPorCobrarComponent implements OnInit {
  idClienteSeleccionado: number = 0; // Variable para almacenar el id de la transferencia seleccionada
  CLientesPorCobrar: ClientesConFacturasPendientesRetorn[] = [];
  FacturasPorClientes: FacturasPorClienteRetorn[] = [];
  isLoading: boolean = false; // Variable para controlar el estado de carga
  editMode: boolean =  false;// Agregar la propiedad editMode aquí
  myDateRangePickerOptions: IMyDrpOptions = {
    dateFormat: 'dd.mm.yyyy',
  };
  AbonoValorRetorno: AbonoFacturaResponse[] = [];
   // Obtener la fecha actual
 fechaHoy = new Date();
 // Crear una nueva fecha para el primer día del mes actual
FechaInicio = new Date(this.fechaHoy.getFullYear(), this.fechaHoy.getMonth(), 1);

  currentPage:     number = 1;
  totalRecord!:    number;
  line!:           number;
  lastLine!:       number;
  equipoQuantity:  number = 0;
  totalInventario: number = 0;

  filter: any = {
    pageIndex: 1,
    pageSize: 10,
    fechaInicio:this.FechaInicio.toISOString().split('T')[0],
    fechaFinal: this.fechaHoy.toISOString().split('T')[0],
    NombreCliente: '',
    NumeroTelefono: '',
    Empresa:this.loginService.getUserEmpresa,
    IdEmpresa:this.loginService.getUserIdEmpresa,
    IdSucursal:this.loginService.getUserIdSucursal,
  };



  form: FormGroup = this.fb.group({
    rangeDate: [''],
  });

   filterParam: AbonoFacturaParam = {
    Id_Cliente:0,
    NumeroFactura:0,
    MontoAbono: 0,
    IdSucursal:+this.loginService.getUserIdSucursal,
    Usuario: this.loginService.getUserName()
  };
  constructor(
    private loading: LoadingService,
    private fb: FormBuilder,
    private loginService: LoginService,
    private ClienteService: ClientesService,
    private toastr: ToastrService,
    private rDialogService: RDialogService,

  ) { }

  ngOnInit(): void {
    this.obtenerClientes()
  }
  procesarAbono(detalle: any): void {
    if(this.filterParam.MontoAbono ===0)
    {
this.filterParam.MontoAbono = detalle.montoAbono;
this.filterParam.NumeroFactura = detalle.numeroFactura;
    }
   const filterParam: AbonoFacturaParam = {
      Id_Cliente:this.idClienteSeleccionado,
      NumeroFactura:this.filterParam.NumeroFactura,
      MontoAbono:this.filterParam.MontoAbono,
      IdSucursal:+this.loginService.getUserIdSucursal,
      Usuario: this.loginService.getUserName()
    };

    const monto = this.filterParam.MontoAbono;

    if (monto > detalle.montoPendiente) {
     this.toastr.info('El abono no puede ser mayor al monto pendiente.');
      return;
    }

    if (monto) {
     this.ClienteService.postAbonoFactura(filterParam).subscribe({
      next: (response) => {
        this.isLoading = false;  // Terminar carga

        const mensaje = response.mensaje;  // Accediendo correctamente a 'mensaje'
        this.toastr.info(mensaje);
      },
      error: (err) => {
        this.isLoading = false;  // Terminar carga en caso de error
        console.error('Error Procesando el Abono:', err);
      }
    });

      // Aquí puedes añadir la lógica para procesar el abono, enviar datos al backend, etc.
    } else {
      console.error('No se ha ingresado un monto para el abono.');
    }
    // setTimeout(() => {
    //   window.location.reload(); // Recarga la página después de 2 segundos
    //   }, 2000);
  }
  toggleDetalleInput(detalle: any, event: Event): void {
    // Evitar que la acción del clic afecte la selección de filas
    event.stopPropagation();

    // Alternar la propiedad `showInput` para mostrar/ocultar el input
    detalle.showInput = !detalle.showInput;
  }

  SaldarFactura(detalle: any): void {



    this.rDialogService.openDialog(
      "Aviso",
      "¿Esta seguro de saldar esta factura?",
      () => {
        this.toastr.info("no se procesa la Accion");
      },
      () => {

this.filterParam.MontoAbono = detalle.montoPendiente;
this.filterParam.NumeroFactura = detalle.numeroFactura;
    const filterParam: AbonoFacturaParam = {
      Id_Cliente:this.idClienteSeleccionado,
      NumeroFactura:detalle.numeroFactura,
      MontoAbono: detalle.montoPendiente,
      IdSucursal:+this.loginService.getUserIdSucursal,
      Usuario: this.loginService.getUserName()
    };
this.procesarAbono(filterParam);


      },
      "Si", // Etiqueta del botón para Anular la factura
      "No, Fue un error" // fue un error
    );





  }
  pageChanged(index: number) {
    this.idClienteSeleccionado = 0;
    //this.equiposDetalles = []; // Limpiar los detalles cuando se deselecciona
    this.currentPage = index;
    this.filter.pageIndex = index;

    this.obtenerClientes();
  }
  seleccionarFila(cliente: ClientesConFacturasPendientesRetorn): void {
    if (this.idClienteSeleccionado === cliente.id_Cliente) {
      this.idClienteSeleccionado = 0;
      this.FacturasPorClientes = [];
    } else {
      this.obtenerFacturasPorCLiente(cliente.id_Cliente);

    }
  }
  onEdit(detalle: FacturasPorClienteRetorn) {
    // Guardar el valor original antes de editarlo
    detalle.montoPendiente = detalle.montoPendiente;
    console.log("Equipo Capturado",detalle.montoPendiente);
    detalle.editMode = true;
  }
  obtenerFacturasPorCLiente(idClienteSeleccionado: number) {
    this.isLoading = true; // Activamos el estado de carga antes de hacer la solicitud
this.idClienteSeleccionado = idClienteSeleccionado;
    this.ClienteService.getFacturasPendientesPorCliente(idClienteSeleccionado).subscribe(
      (Trans) => {
        this.isLoading = false; // Desactivamos el estado de carga
        this.FacturasPorClientes = Trans; // Asignamos los detalles obtenidos
      },
      (error) => {
        console.error("Error al obtener los detalles de la transferencia:", error);
        //this.showErrorNotification("Error al cargar los detalles de la transferencia.");
      }
    );

  }
  onPageSizeChange() {
    this.idClienteSeleccionado = 0;
    this.isLoading = true;

    // Si se selecciona "Todos", mostramos todos los registros
    if (this.filter.pageSize === this.totalRecord) {
      this.filter.pageIndex = 1;  // Restablecer a la primera página
    }

    // Reiniciar la paginación al cambiar el tamaño de página
    this.currentPage = 1;
    this.filter.pageIndex = 1;

    // Rehacer la consulta para actualizar los datos
    this.obtenerClientes();
    this.isLoading = false;
  }

 printReportTransferencia(): void {
  // this.isLoading = true;
  // if (this.idTransferenciaSeleccionada === null) {
  //   // Si no hay ninguna transferencia seleccionada, no hacemos nada
  //   console.error("No se ha seleccionado ninguna transferencia.");
  //   return;
  // }

  // const model: EquipoTransferenciaReporte = {
  //   idTransferencia: this.idTransferenciaSeleccionada,
  //   equipoTransferencias: this.listEquiposToTransfer,
  //   fechaTransferencia: new Date().toDateString(),
  //   usuario: this.loginService.getUserName(),
  //   Empresa:this.loginService.getUserEmpresa,
  //   IdEmpresa:this.loginService.getUserIdEmpresa,
  //   IdSucursal:this.loginService.getUserIdSucursal,
  //   total: this.cantidadEquipoATransferir
  // };


  // this.equiposService.postEquipoTransferencia(model).subscribe({

  //   next: (blobResp) => {
  //     this.isLoading = false;
  //     this.getBlobForCreateIFramePDF(blobResp);
  // },

  // error: () => {
  //   console.error("Error al generar el reporte.");
  // }
  // });

}

onDateRangeChanged(event: any) {
  console.log("this.filter.pageIndex entrando",this.filter.pageIndex);
  this.filter.pageIndex = 1;
  //this.idTransferenciaSeleccionada = null;
  //this.equiposDetalles = []; // Limpiar los detalles cuando se deselecciona

  if (event.beginDate.year !== 0) {
    const startDate = new Date(event.beginDate.year, event.beginDate.month - 1, event.beginDate.day);
    const endDate = new Date(event.endDate.year, event.endDate.month - 1, event.endDate.day);
    this.filter.fechaInicio = startDate.toISOString().split('T')[0]; // Fecha en formato yyyy-mm-dd
    this.filter.fechaFinal = endDate.toISOString().split('T')[0];
  } else {
    this.filter.fechaInicio = '';
    this.filter.fechaFinal = '';
  }

  this.obtenerClientes();
}

  obtenerClientes() {
    this.idClienteSeleccionado = 0;
    this.CLientesPorCobrar = []; // Limpiar los detalles cuando se deselecciona
    this.loading.showLoading();
    const fechaInicio = this.filter.fechaInicio;
    const fechaFinal = this.filter.fechaFinal;
    const criterio = this.form.get('Search')?.value || '';


    this.ClienteService.getClientesConFacturasPendientes('','',criterio,criterio).subscribe(
      (data) => {
        if (data.length) {
          // this.totalRecord = Trans[0].totalRecord;
          // this.line = Trans[0].line;
          // this.lastLine = Trans[0].lastLine;
        }
        this.CLientesPorCobrar = data;

      },
      (error) => {
        //this.isLoading = false;
        console.error("Error al obtener equipos disponibles:", error);
        // Mostrar una notificación de error
        //this.showErrorNotification("Error al cargar las transferencias.");
      }
    );
    this.loading.hideLoading();
  }

}
