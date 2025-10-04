import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IMyDrpOptions } from 'mydaterangepicker';
import { ToastrService } from 'ngx-toastr';
import { LoginService } from 'src/app/auth/login.service';
import { AbonoFacturaParam, AbonoFacturaResponse, ClientesConFacturasPendientesRetorn, FacturasPorClienteRetorn, Cliente } from 'src/app/core/interfaces/cliente.interface';
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
  NombreClienteSeleccionado: string = ''; // Variable para almacenar el id de la transferencia seleccionada
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
FechaInicio = '';//new Date(this.fechaHoy.getFullYear(), this.fechaHoy.getMonth(), 1);

  currentPage:     number = 1;
  totalRecord!:    number;
  line!:           number;
  lastLine!:       number;
  equipoQuantity:  number = 0;
  totalInventario: number = 0;

  filter: any = {
    pageIndex: 1,
    pageSize: 10,
    fechaInicio: '',//this.FechaInicio.toISOString().split('T')[0],
    fechaFinal: this.fechaHoy.toISOString().split('T')[0],
    NombreCliente: '',
    NumeroTelefono: '',
    Empresa:this.loginService.getUserEmpresa,
    IdEmpresa:this.loginService.getUserIdEmpresa,
    IdSucursal:this.loginService.getUserIdSucursal,
  };



  form: FormGroup = this.fb.group({
    rangeDate: [''],
    criterio:['']
  });

   filterParam: AbonoFacturaParam = {
    Id_Cliente:0,
    NumeroFactura:0,
    MontoAbono: 0,
    IdSucursal:+this.loginService.getUserIdSucursal,
    Usuario: this.loginService.getUserName()
  };
  totalMontoPendiente: number =0;
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

  /**
   * Detecta si la pantalla es móvil (ancho <= 600px)
   */
  isMobileScreen(): boolean {
    return window.innerWidth <= 600;
  }

  // Función para determinar si la factura está vencida
  isFacturaVencida(fechaLimite: string): boolean {
    const fechaLimiteFactura = new Date(fechaLimite);
    const fechaHoy = new Date();

    // Comparar fechas: si la fecha de vencimiento es menor a la fecha actual, es una factura vencida
    return fechaLimiteFactura < fechaHoy;
  }
  isClienteSelect(clienteId: number): boolean {
    this.idClienteSeleccionado == clienteId;
    return true;
  }
  procesarAbono(detalle: any): void {
    if (this.filterParam.MontoAbono === 0) {

      this.filterParam.MontoAbono = detalle.montoAbono;
      this.filterParam.NumeroFactura = detalle.numeroFactura;

    }

    // Asegúrate de que la propiedad Usuario esté correctamente asignada
    const filterParam: AbonoFacturaParam = {
      Id_Cliente: this.idClienteSeleccionado,
      NumeroFactura: this.filterParam.NumeroFactura,
      MontoAbono: this.filterParam.MontoAbono,
      IdSucursal: +this.loginService.getUserIdSucursal,
      Usuario: this.loginService.getUserName(),  // Aquí asignamos Usuario correctamente
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
          this.idClienteSeleccionado = 0;
          this.FacturasPorClientes = [];

          // Limpiar filterParam después de procesar el abono
          this.resetFilterParam(); // Llamamos a la función que limpia el filterParam
           // Recargar la página para actualizar los datos
        window.location.reload();
        },
        error: (err) => {
          this.isLoading = false;  // Terminar carga en caso de error
          console.error('Error Procesando el Abono:', err);
        },
      });
    } else {
      console.error('No se ha ingresado un monto para el abono.');
    }
  }
  procesarAbonoGeneral(Abono: any): void {
    if (this.filterParam.MontoAbono === 0) {

      this.filterParam.MontoAbono = Abono.montoAbonoGeneral;
      this.filterParam.Id_Cliente = Abono.id_Cliente;

    }

    // Asegúrate de que la propiedad Usuario esté correctamente asignada
    const filterParam: AbonoFacturaParam = {
      Id_Cliente: this.filterParam.Id_Cliente,
      NumeroFactura: 0,
      MontoAbono: this.filterParam.MontoAbono,
      IdSucursal: +this.loginService.getUserIdSucursal,
      Usuario: this.loginService.getUserName(),  // Aquí asignamos Usuario correctamente
    };
    const monto = this.filterParam.MontoAbono;

    if (monto > Abono.montoPendiente) {
      this.toastr.info('El abono no puede ser mayor al monto pendiente.');
      return;
    }

    if (monto) {
      this.ClienteService.postAbonoGeneral(filterParam).subscribe({
        next: (response) => {
          this.isLoading = false;  // Terminar carga

          const mensaje = response.mensaje;  // Accediendo correctamente a 'mensaje'
          this.toastr.info(mensaje);
          this.idClienteSeleccionado = 0;
          this.FacturasPorClientes = [];

          // Limpiar filterParam después de procesar el abono
          this.resetFilterParam(); // Llamamos a la función que limpia el filterParam
           // Recargar la página para actualizar los datos
           setTimeout(() => {
            window.location.reload(); // Recarga la página después de 2 segundos
            }, 2000);
        },
        error: (err) => {
          this.isLoading = false;  // Terminar carga en caso de error
          console.error('Error Procesando el Abono:', err);
        },
      });
    } else {
      console.error('No se ha ingresado un monto para el abono.');
    }
  }

  // Función para reiniciar el filterParam
  resetFilterParam(): void {
    this.filterParam = {
      MontoAbono: 0,
      NumeroFactura: 0,
      Usuario: '', // Reestablecemos la propiedad Usuario si es necesario
      Id_Cliente: 0,
      IdSucursal: 0
      // Puedes reiniciar las demás propiedades según sea necesario
    };
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
      `Esta acción saldará la factura #${detalle.numeroFactura}. ¿Está seguro de proceder con esta acción?`,
      () => {
        this.toastr.info("No se procesa la acción."); // Acción para el botón "No"
      },
      () => {
        // Configuramos los parámetros del abono
        this.filterParam.MontoAbono = detalle.montoPendiente;
        this.filterParam.NumeroFactura = detalle.numeroFactura;

        const filterParam: AbonoFacturaParam = {
          Id_Cliente: this.idClienteSeleccionado,
          NumeroFactura: detalle.numeroFactura,
          MontoAbono: detalle.montoPendiente,
          IdSucursal: +this.loginService.getUserIdSucursal, // Asegúrate de llamar al método con paréntesis
          Usuario: this.loginService.getUserName()
        };

        // Procesamos el abono
        this.procesarAbono(filterParam);
      },
      "Sí", // Etiqueta del botón para confirmar la acción
      "No, fue un error" // Etiqueta del botón para cancelar
    );
}

  SaldarCuentaTotal(Saldar: any): void {
    this.rDialogService.openDialog(
      "Aviso",
      `Esta acción saldará todas las facturas del cliente: ${Saldar.cliente}. ¿Está seguro de proceder con esta acción?`,
      () => {
        this.toastr.info("No se procesa la acción.");
      },
      () => {
        this.filterParam.MontoAbono = Saldar.montoPendiente;
        this.filterParam.Id_Cliente = Saldar.id_Cliente;

        const filterParam: AbonoFacturaParam = {
      Id_Cliente:this.idClienteSeleccionado,
      NumeroFactura:0,
      MontoAbono: Saldar.montoPendiente,
      IdSucursal:+this.loginService.getUserIdSucursal,
      Usuario: this.loginService.getUserName()
    };
this.procesarAbonoGeneral(filterParam);
      },
      "Si", // Etiqueta del botón para Anular la factura
      "No, Fue un error" // fue un error
    );
  }
  pageChanged(index: number) {

    this.idClienteSeleccionado = 0;
    this.FacturasPorClientes = [];
    this.currentPage = index;
    this.filter.pageIndex = index;

    this.ClienteService.getClientesConFacturasPendientes('','','').subscribe(
      (data) => {
        if (data.length) {
        }
        this.CLientesPorCobrar = data;
      },
      (error) => {
        console.error("Error al obtener equipos disponibles:", error);
      }
    );




    //this.obtenerClientes();
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

    this.ClienteService.getClientesConFacturasPendientes('','','').subscribe(
      (data) => {
        if (data.length) {
        }
        this.CLientesPorCobrar = data;
      },
      (error) => {
        console.error("Error al obtener equipos disponibles:", error);
      }
    );


    // Rehacer la consulta para actualizar los datos
    //this.obtenerClientes();
    this.isLoading = false;
  }

 printReportTransferencia(): void {

}

onEnter(event: KeyboardEvent) {

  if (event.key === 'Enter') {  // Verifica si la tecla presionada es 'Enter'

    const criterio = this.form.get('criterio')?.value;
    this.filter.fechaInicio =''; // Fecha en formato yyyy-mm-dd
    this.filter.fechaFinal = '';


    this.obtenerClientes();  // Llama al método para obtener los clientes
  }
}
onEnterAbono(event: KeyboardEvent, detalle: any) {
  // Verificar si la tecla presionada es Enter
  if (event.key === 'Enter') {
    // Llamar a la misma función que el botón de "Procesar"
    this.procesarAbono(detalle);
  }
}
onEnterAbonoGeneral(event: KeyboardEvent, detalle: any) {
  // Verificar si la tecla presionada es Enter
  if (event.key === 'Enter') {
    // Llamar a la misma función que el botón de "Procesar"
    this.procesarAbonoGeneral(detalle);
  }
}
onDateRangeChanged(event: any) {
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
  this.loading.showLoading();  // Mostrar el cargando

  const fechaInicio = this.filter.fechaInicio;
  const fechaFinal = this.filter.fechaFinal;
  const criterio = this.form.get('criterio')?.value;

  // Validar el criterio, evitar enviar una búsqueda vacía
  // if (!criterio) {
  //   console.log("Criterio de búsqueda vacío");
  //   this.loading.hideLoading();  // Detener el cargando si no hay criterio
  //   return;  // No hacer la solicitud si no hay criterio
  // }

  // Llamar al servicio para obtener los clientes con facturas pendientes
  this.ClienteService.getClientesConFacturasPendientes(fechaInicio, fechaFinal, criterio).subscribe(
    (data) => {
      if (data.length) {
        this.CLientesPorCobrar = data;

        // Sumar los montos pendientes de todos los clientes, asegurándose de convertir `montoPendiente` a número
        const totalMontoPendiente = this.CLientesPorCobrar.reduce((total, cliente) => {
          // Convertir montoPendiente de string a number
          const monto = parseFloat(cliente.montoPendiente);
          return total + (isNaN(monto) ? 0 : monto); // Si `monto` no es un número, agregar 0
        }, 0);

        // Aquí puedes almacenar el total en una variable para mostrarlo en un label
        this.totalMontoPendiente = totalMontoPendiente;

        console.log("Total Monto Pendiente: ", this.totalMontoPendiente);  // Mostrar el total en consola (opcional)

      } else {
        console.log("No se encontraron clientes con facturas pendientes.");
        this.CLientesPorCobrar = [];  // Limpiar la lista si no se encuentran datos
        this.totalMontoPendiente = 0; // Si no hay clientes, el total es 0
      }

      this.loading.hideLoading();  // Detener el cargando después de recibir los datos
    },
    (error) => {
      console.error("Error al obtener clientes con facturas pendientes:", error);
      this.loading.hideLoading();  // Detener el cargando si ocurre un error
      // Mostrar una notificación de error
      this.showErrorNotification("Error al cargar los clientes con facturas pendientes.");
    }
  );
}
  showErrorNotification(message: string) {
    // Puedes usar una librería como ngx-toastr, o tu propio componente de notificación
    this.toastr.error(message, 'Error');
  }
}
