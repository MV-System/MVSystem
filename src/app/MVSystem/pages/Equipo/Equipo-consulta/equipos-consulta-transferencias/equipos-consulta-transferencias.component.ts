import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IMyDrpOptions } from 'mydaterangepicker';
import { LoginService } from 'src/app/auth/login.service';
import { EquipoAlmacenTransferirArrayRetorno, EquipoTransferencia, EquipoTransferenciaReporte } from 'src/app/core/interfaces/equipo.interface';
import { CatalogosService } from 'src/app/core/services/catalogos.service';
import { EquipoService } from 'src/app/core/services/equipo.service';
import { LoadingService } from 'src/app/shared/components/r-loading/loading.service';

@Component({
  selector: 'app-equipos-consulta-transferencias',
  templateUrl: './equipos-consulta-transferencias.component.html',
  styleUrls: ['./equipos-consulta-transferencias.component.css']
})
export class EquiposConsultaTransferenciasComponent implements OnInit {

   // Aquí seguimos teniendo la propiedad facturaVisibility
   facturaVisibility: { [key: number]: boolean } = {};

  constructor(
    private loading: LoadingService,
    private catalogosService: CatalogosService,
    private equiposService: EquipoService,
    private fb: FormBuilder,
    private loginService: LoginService,
  ) { }
  myDateRangePickerOptions: IMyDrpOptions = {
    dateFormat: 'dd.mm.yyyy',
  };
  form: FormGroup = this.fb.group({
    almacen: [''],
    suplidor: [''],
    imei: [''],
    modelo: [''],
    rangeDate: [''],
    totalEquipos: [0,],
    totalInventario: [0,],
    almacenSalida:[],
    almacenEntrada:[],
  });
   // Obtener la fecha actual
 fechaHoy = new Date();
 // Crear una nueva fecha para el primer día del mes actual
FechaInicio = new Date(this.fechaHoy.getFullYear(), this.fechaHoy.getMonth(), 1);
listEquiposToTransfer: EquipoTransferencia[] = [];
cantidadEquipoATransferir: number = 0;
  rangeDatePlaceholder: Date = new Date();
  equiposTransferencias: EquipoAlmacenTransferirArrayRetorno[] = [];
  equiposDetalles: EquipoAlmacenTransferirArrayRetorno[] = [];
  currentPage:     number = 1;
  totalRecord!:    number;
  line!:           number;
  lastLine!:       number;
  equipoQuantity:  number = 0;
  totalInventario: number = 0;
  idTransferencia: number = 0;
  idTransferenciaSeleccionada: number | null = null; // Variable para almacenar el id de la transferencia seleccionada

  onFacturaButton: boolean = false;
  isLoading: boolean = false; // Variable para controlar el estado de carga
  filter: any = {
    pageIndex: 1,
    pageSize: 10,
    fechaInicio:this.FechaInicio.toISOString().split('T')[0],
    fechaFinal: this.fechaHoy.toISOString().split('T')[0],
    almacenSalida:0,//this.form.value,//this.form.controls.almacensalida.value,
    almacenEntrada:0,//this.form.value,// this.form.controls.almacendestino.value,
    Empresa:this.loginService.getUserEmpresa,
    IdEmpresa:this.loginService.getUserIdEmpresa,
    //IdSucursal:this.loginService.getUserIdSucursal,
  };
  ngOnInit(): void {
this.obtenerAlmacen();
    this.obtenerTransferencias();


  }
  pageChanged(index: number) {
    this.idTransferenciaSeleccionada = null;
    this.equiposDetalles = []; // Limpiar los detalles cuando se deselecciona
    this.currentPage = index;
    this.filter.pageIndex = index;

    this.obtenerTransferencias();
  }
  onDateRangeChanged(event: any) {
    console.log("this.filter.pageIndex entrando",this.filter.pageIndex);
    this.filter.pageIndex = 1;
    this.idTransferenciaSeleccionada = null;
    this.equiposDetalles = []; // Limpiar los detalles cuando se deselecciona

    if (event.beginDate.year !== 0) {
      const startDate = new Date(event.beginDate.year, event.beginDate.month - 1, event.beginDate.day);
      const endDate = new Date(event.endDate.year, event.endDate.month - 1, event.endDate.day);
      this.filter.fechaInicio = startDate.toISOString().split('T')[0]; // Fecha en formato yyyy-mm-dd
      this.filter.fechaFinal = endDate.toISOString().split('T')[0];
    } else {
      this.filter.fechaInicio = '';
      this.filter.fechaFinal = '';
    }

    this.obtenerTransferencias();
  }
  // Este método se llama cuando cambia el número de elementos por página
  onPageSizeChange() {

    this.idTransferenciaSeleccionada = null;
    this.equiposDetalles = []; // Limpiar los detalles cuando se deselecciona
    this.isLoading = true;
   // Si se selecciona "Todos", mostramos todos los registros
   if (this.filter.pageSize === this.totalRecord) {
     this.filter.pageIndex = 1;  // Restablecer a la primera página
   }
   this.obtenerTransferencias();  // Rehacer la consulta para actualizar los datos
   this.isLoading = false;
 }
 obtenerTransferencias() {
  this.idTransferenciaSeleccionada = null;
  this.equiposDetalles = []; // Limpiar los detalles cuando se deselecciona
  this.loading.showLoading();
  const almacenSalida = this.form.get('almacenSalida')?.value || 0;
  const almacenEntrada = this.form.get('almacenEntrada')?.value || 0;
  const fechaInicio = this.filter.fechaInicio;
  const fechaFinal = this.filter.fechaFinal;

  this.equiposService.GetTransferenciaEquipos(almacenSalida, almacenEntrada, fechaInicio, fechaFinal).subscribe(
    (Trans) => {
      this.isLoading = false;
      if (Trans.length) {
        // this.totalRecord = Trans[0].totalRecord;
        // this.line = Trans[0].line;
        // this.lastLine = Trans[0].lastLine;
      }
      this.equiposTransferencias = Trans;

    },
    (error) => {
      this.isLoading = false;
      console.error("Error al obtener equipos disponibles:", error);
      // Mostrar una notificación de error
      this.showErrorNotification("Error al cargar las transferencias.");
    }
  );
  this.loading.hideLoading();
}
obtenerDetalleTransferencias(Idtransferencia: number) {
  this.isLoading = true; // Activamos el estado de carga antes de hacer la solicitud

  this.equiposService.GetDetalleTransferenciaEquipos(Idtransferencia).subscribe(
    (Trans) => {
      this.isLoading = false; // Desactivamos el estado de carga
      this.equiposDetalles = Trans; // Asignamos los detalles obtenidos
    },
    (error) => {
      console.error("Error al obtener los detalles de la transferencia:", error);
      this.showErrorNotification("Error al cargar los detalles de la transferencia.");
    }
  );

}
 // Esta función se llama al hacer click en una fila de la tabla
 seleccionarFila(equipo: EquipoAlmacenTransferirArrayRetorno) {
  if (this.idTransferenciaSeleccionada === equipo.idTransferencia)
    {
    // Si ya está seleccionada, la deseleccionamos
    this.idTransferenciaSeleccionada = null;
    this.equiposDetalles = []; // Limpiar los detalles cuando se deselecciona
    }else {
    // Si no está seleccionada, la seleccionamos
    this.idTransferenciaSeleccionada = equipo.idTransferencia;
    this.isLoading = true;
    this.obtenerDetalleTransferencias(this.idTransferenciaSeleccionada);
    this.isLoading = false;

  }
  this.onFacturaButton = true; // Activar el botón Reimprimir Factura si alguna transferencia está seleccionada
}
printReportTransferencia(): void {
  this.isLoading = true;
  if (this.idTransferenciaSeleccionada === null) {
    // Si no hay ninguna transferencia seleccionada, no hacemos nada
    console.error("No se ha seleccionado ninguna transferencia.");
    return;
  }

  const model: EquipoTransferenciaReporte = {
    idTransferencia: this.idTransferenciaSeleccionada,
    equipoTransferencias: this.listEquiposToTransfer,
    fechaTransferencia: new Date().toDateString(),
    usuario: this.loginService.getUserName(),
    Empresa:this.loginService.getUserEmpresa,
    IdEmpresa:this.loginService.getUserIdEmpresa,
    IdSucursal:this.loginService.getUserIdSucursal,
    total: this.cantidadEquipoATransferir
  };


  this.equiposService.postEquipoTransferencia(model).subscribe({

    next: (blobResp) => {
      this.isLoading = false;
      this.getBlobForCreateIFramePDF(blobResp);
  },

  error: () => {
    console.error("Error al generar el reporte.");
  }
  });

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
showErrorNotification(message: string) {
}
  obtenerAlmacen() {

    this.isLoading = true;
    this.catalogosService.getAlmaceLista().subscribe((almacen) => {
      this.filter.almacenSalida = almacen;
      this.filter.almacenEntrada = almacen;
    });
    this.isLoading = false;
  }

}
