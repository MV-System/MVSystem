import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IMyDrpOptions } from 'mydaterangepicker';
import { ToastrService } from 'ngx-toastr';
import { LoginService } from 'src/app/auth/login.service';
import { Utilidades, utilidadesFiltros } from 'src/app/core/interfaces/utilidades.interface';
import { UtilidadesService } from 'src/app/core/services/utilidades.service';
import { ValidatorPermissionService } from 'src/app/core/services/validator-permission.service';
import { LoadingService } from 'src/app/shared/components/r-loading/loading.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

// Options
view: [number, number] = [600, 180];
gradient: boolean = true;
showLegend: boolean = true;
showLabels: boolean = true;
isDoughnut: boolean = false;
data: Utilidades = {
  costo_Equipos: 0,
  venta_Equipos: 0,
  ganancia_Equipos: 0,
  costo_Accesorios: 0,
  venta_Accesorios: 0,
  ganancia_Accesorios: 0,
  costo_Reparaciones: 0,
  venta_Reparaciones: 0,
  ganancia_Reparaciones: 0,
  costo_Desbloqueos: 0,
  venta_Desbloqueos: 0,
  ganancia_Desbloqueos: 0,
  valida: 0
}; // Inicializa data

rangeDatePlaceholder: Date = new Date();

colorScheme = { domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']};
Ordinal= { domain: ['#E44D25', '#5AA454', '#A10A28', '#C7B42C', '#AAAAAA'] };
CoolBlues= { domain: ['#0072B1', '#0062A1', '#005394', '#004078'] };
Vibrant= { domain: ['#FF5733', '#33FF57', '#5733FF', '#FFC300'] };
Flat= { domain: ['#F39C12', '#E67E22', '#D35400', '#C0392B', '#8E44AD'] };
Neon= { domain: ['#00FF00', '#FF00FF', '#00FFFF', '#FFFF00'] }

myDateRangePickerOptions: IMyDrpOptions = {
  dateFormat: 'dd.mm.yyyy',
};
singleVentasDia = [
  { "name": "Equipos", "value": this.data.venta_Equipos },
  { "name": "Acc.", "value": this.data.venta_Accesorios },
  { "name": "Desblq.", "value": this.data.venta_Desbloqueos },
  { "name": "Reps.", "value": this.data.venta_Reparaciones }
];
singleVentasSemana = [
  { "name": "Equipos", "value": this.data.venta_Equipos },
  { "name": "Acc.", "value": this.data.venta_Accesorios },
  { "name": "Desblq.", "value": this.data.venta_Desbloqueos },
  { "name": "Reps.", "value": this.data.venta_Reparaciones }
];
singleVentasMes = [
  { "name": "Equipos", "value": this.data.venta_Equipos },
  { "name": "Acc.", "value": this.data.venta_Accesorios },
  { "name": "Desblq.", "value": this.data.venta_Desbloqueos },
  { "name": "Reps.", "value": this.data.venta_Reparaciones }
];

// Declaración de fechas
fechaHoy: Date = new Date();
FechaInicioSemana: Date = new Date();
FechaInicioMes: Date = new Date();

//UtilidadesForm: FormGroup = this.fb.group({});

constructor(
  private validatorPermissionService:ValidatorPermissionService,
  private loading: LoadingService,
  private UtilidadesServices: UtilidadesService,
  private fb: FormBuilder,
  private toastr: ToastrService,
) {}
// Calcular las fechas de inicio de la semana y del mes actual
private calcularFechas() {
const diaActual = this.fechaHoy.getDay();
const diasDesdeLunes = diaActual === 0 ? 6 : diaActual - 1;

// Calcular el lunes de la semana actual
this.FechaInicioSemana = new Date(this.fechaHoy);
this.FechaInicioSemana.setDate(this.fechaHoy.getDate() - diasDesdeLunes);

// Primer día del mes actual
this.FechaInicioMes = new Date(this.fechaHoy.getFullYear(), this.fechaHoy.getMonth(), 1);
}

VerFormConsultaUtilidades(): boolean {
  return this.validatorPermissionService.validateUserRole("verUtilidadesToolStripMenuItem");
}
// setResponsiveView() {
//   const width = Math.min(window.innerWidth - 80, 900); // 80px de margen, máximo 900px
//   this.view = [width, 180];
// }
setResponsiveView() {
  if (window.innerWidth < 600) {
    this.view = [300, 200]; // Más pequeño para móvil
  } else {
    this.view = [600, 180]; // Tamaño normal para escritorio
  }
}
ngOnInit(): void {
   this.setResponsiveView();
  // Calcular el inicio de la semana y el mes actual
  this.calcularFechas();

  // Inicializar el filtro con las fechas calculadas
  const fechaHoy = new Date();
fechaHoy.setHours(fechaHoy.getHours() - 4); // Restar 4 horas

// Calcular el inicio de la semana (lunes)
const diaActual = fechaHoy.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
const diferencia = diaActual === 0 ? -6 : 1 - diaActual; // Si hoy es domingo, retrocede 6 días
const fechaInicioSemana = new Date(fechaHoy);
fechaInicioSemana.setDate(fechaHoy.getDate() + diferencia);
fechaInicioSemana.setHours(fechaInicioSemana.getHours() - 4); // Restar 4 horas


const filterDia: utilidadesFiltros = {
    FI: fechaHoy.toISOString().split('T')[0],
    FF: fechaHoy.toISOString().split('T')[0],
    sucursal:4// this.loginService.getUserIdSucursal, // Asegúrate de que esto retorne el valor correcto
};

const filterSemana: utilidadesFiltros = {
    FI: fechaInicioSemana.toISOString().split('T')[0],
    FF: fechaHoy.toISOString().split('T')[0],
    sucursal: 4//this.loginService.getUserIdSucursal, // Asegúrate de que esto retorne el valor correcto
};
  const filterMes: utilidadesFiltros = {
    FI: this.FechaInicioMes.toISOString().split('T')[0],
    FF: this.fechaHoy.toISOString().split('T')[0],
    sucursal: 4//this.loginService.getUserIdSucursal, // Asegúrate de que esto retorne el valor correcto

  };
  //this.loading.showLoading();
  // Cargar utilidades
  this.GetUtilidadesDia(filterDia);
  this.GetUtilidadesSemana(filterSemana);
  this.GetUtilidadesMes(filterMes);
  //this.loading.hideLoading();
}
GetUtilidadesDia(filterDia: utilidadesFiltros) {
  //this.loading.showLoading();
  this.UtilidadesServices
    .GetUtilidades(filterDia)
    .subscribe(
      (equipos: Utilidades) => {
        if (equipos) {
          this.data = equipos; // Asigna el primer objeto a data
          this.singleVentasDia = [
            { "name": "Equipos", "value": this.data.venta_Equipos },
  { "name": "Acc.", "value": this.data.venta_Accesorios },
  { "name": "Desblq.", "value": this.data.venta_Desbloqueos },
  { "name": "Reps.", "value": this.data.venta_Reparaciones }
          ];
          //this.loading.hideLoading(); // Terminar carga
        } else {
          this.toastr.warning('No se encontraron utilidades.');
        }
      },
      (error) => {
        console.error('Error al obtener utilidades:', error);
        this.toastr.error('Error al cargar datos de utilidades');
      }
    );
}
GetUtilidadesSemana(filterSemana: utilidadesFiltros) {
  //this.loading.showLoading();
  this.UtilidadesServices
    .GetUtilidades(filterSemana)
    .subscribe(
      (equipos: Utilidades) => {
        if (equipos) {
          this.data = equipos; // Asigna el primer objeto a data
          this.singleVentasSemana = [
            { "name": "Equipos", "value": this.data.venta_Equipos },
  { "name": "Acc.", "value": this.data.venta_Accesorios },
  { "name": "Desblq.", "value": this.data.venta_Desbloqueos },
  { "name": "Reps.", "value": this.data.venta_Reparaciones }
          ];
         // this.loading.hideLoading(); // Terminar carga
        } else {
          this.toastr.warning('No se encontraron utilidades.');
        }
      },
      (error) => {
        console.error('Error al obtener utilidades:', error);
        this.toastr.error('Error al cargar datos de utilidades');
      }
    );
    //this.loading.hideLoading();
}

GetUtilidadesMes(filterMes: utilidadesFiltros) {
  this.loading.showLoading();
  this.UtilidadesServices
    .GetUtilidades(filterMes)
    .subscribe(
      (equipos: Utilidades) => {
        if (equipos) {
          this.data = equipos; // Asigna el primer objeto a data
          this.singleVentasMes = [
          { "name": "Equipos", "value": this.data.venta_Equipos },
  { "name": "Acc.", "value": this.data.venta_Accesorios },
  { "name": "Desblq.", "value": this.data.venta_Desbloqueos },
  { "name": "Reps.", "value": this.data.venta_Reparaciones }
          ];
          this.loading.hideLoading();  
        } else {
          this.toastr.warning('No se encontraron utilidades.');
        }
      },
      (error) => {
        console.error('Error al obtener utilidades:', error);
        this.toastr.error('Error al cargar datos de utilidades');
      }
    );
}

onSelect(data: any): void {}
onActivate(data: any): void {}
onDeactivate(data: any): void {}
}
