import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IMyDrpOptions } from 'mydaterangepicker';
import { LoginService } from 'src/app/auth/login.service';
import { EquipoAlmacenTransferirArrayRetorno } from 'src/app/core/interfaces/equipo.interface';
import { CatalogosService } from 'src/app/core/services/catalogos.service';
import { EquipoService } from 'src/app/core/services/equipo.service';

@Component({
  selector: 'app-equipos-consulta-transferencias',
  templateUrl: './equipos-consulta-transferencias.component.html',
  styleUrls: ['./equipos-consulta-transferencias.component.css']
})
export class EquiposConsultaTransferenciasComponent implements OnInit {

  constructor(
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

  rangeDatePlaceholder: Date = new Date();
  equiposTransferencias: EquipoAlmacenTransferirArrayRetorno[] = [];
  currentPage:     number = 1;
  totalRecord!:    number;
  line!:           number;
  lastLine!:       number;
  equipoQuantity:  number = 0;
  totalInventario: number = 0;

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
    console.log("index",index);
    this.currentPage = index;
    this.filter.pageIndex = index;
    console.log("PageIndex",this.filter.PageIndex);

    this.obtenerTransferencias();
  }
  onDateRangeChanged(event: any) {
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
   // Si se selecciona "Todos", mostramos todos los registros
   if (this.filter.pageSize === this.totalRecord) {
     this.filter.pageIndex = 1;  // Restablecer a la primera página
   }
   this.obtenerTransferencias();  // Rehacer la consulta para actualizar los datos
 }
 obtenerTransferencias() {
  this.isLoading = true;
  const almacenSalida = this.form.get('almacenSalida')?.value || 0;
  const almacenEntrada = this.form.get('almacenEntrada')?.value || 0;
  const fechaInicio = this.filter.fechaInicio;
  const fechaFinal = this.filter.fechaFinal;

  this.equiposService.GetTransferenciaEquipos(almacenSalida, almacenEntrada, fechaInicio, fechaFinal).subscribe(
    (Trans) => {
      this.isLoading = false;
      this.equiposTransferencias = Trans;
      console.log("Transferencias", this.equiposTransferencias);
    },
    (error) => {
      this.isLoading = false;
      console.error("Error al obtener equipos disponibles:", error);
      // Mostrar una notificación de error
      this.showErrorNotification("Error al cargar las transferencias.");
    }
  );
}

showErrorNotification(message: string) {
  // Usa tu servicio de notificación aquí, por ejemplo:
  //this.notificationService.showError(message);
}
  obtenerAlmacen() {

   //this.loading.showLoading();
    this.catalogosService.getAlmaceLista().subscribe((almacen) => {
      this.filter.almacenSalida = almacen;
      this.filter.almacenEntrada = almacen;
    });
    //this.loading.hideLoading();
  }

}
