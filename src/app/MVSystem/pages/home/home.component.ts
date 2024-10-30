import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import * as ApexCharts from 'apexcharts'
import { IMyDrpOptions } from 'mydaterangepicker';
import { ToastrService } from 'ngx-toastr';
import { LoginService } from 'src/app/auth/login.service';
import { Utilidades, utilidadesFiltros } from 'src/app/core/interfaces/utilidades.interface';
import { UtilidadesService } from 'src/app/core/services/utilidades.service';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

// Options
view: [number, number] = [900, 200];
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
  { "name": "Accesorios", "value": this.data.venta_Accesorios },
  { "name": "Desbloqueos", "value": this.data.venta_Desbloqueos },
  { "name": "Reparaciones", "value": this.data.venta_Reparaciones }
];
singleVentasSemana = [
  { "name": "Equipos", "value": this.data.venta_Equipos },
  { "name": "Accesorios", "value": this.data.venta_Accesorios },
  { "name": "Desbloqueos", "value": this.data.venta_Desbloqueos },
  { "name": "Reparaciones", "value": this.data.venta_Reparaciones }
];
singleVentasMes = [
  { "name": "Equipos", "value": this.data.venta_Equipos },
  { "name": "Accesorios", "value": this.data.venta_Accesorios },
  { "name": "Desbloqueos", "value": this.data.venta_Desbloqueos },
  { "name": "Reparaciones", "value": this.data.venta_Reparaciones }
];

// Declaración de fechas
fechaHoy: Date = new Date();
FechaInicioSemana: Date = new Date();
FechaInicioMes: Date = new Date();

UtilidadesForm: FormGroup = this.fb.group({});

constructor(
  private UtilidadesServices: UtilidadesService,
  private fb: FormBuilder,
  private toastr: ToastrService,
  private loginService: LoginService,
) {}

ngOnInit(): void {
}



  // chart() {
  //   document.addEventListener("DOMContentLoaded", () => {
  //     new ApexCharts(document.querySelector("#reportsChart"), {
  //       series: [{
  //         name: 'Sales',
  //         data: [31, 40, 28, 51, 42, 82, 56],
  //       }, {
  //         name: 'Revenue',
  //         data: [11, 32, 45, 32, 34, 52, 41]
  //       }, {
  //         name: 'Customers',
  //         data: [15, 11, 32, 18, 9, 24, 11]
  //       }],
  //       chart: {
  //         height: 350,
  //         type: 'area',
  //         toolbar: {
  //           show: false
  //         },
  //       },
  //       markers: {
  //         size: 4
  //       },
  //       colors: ['#4154f1', '#2eca6a', '#ff771d'],
  //       fill: {
  //         type: "gradient",
  //         gradient: {
  //           shadeIntensity: 1,
  //           opacityFrom: 0.3,
  //           opacityTo: 0.4,
  //           stops: [0, 90, 100]
  //         }
  //       },
  //       dataLabels: {
  //         enabled: false
  //       },
  //       stroke: {
  //         curve: 'smooth',
  //         width: 2
  //       },
  //       xaxis: {
  //         type: 'datetime',
  //         categories: ["2018-09-19T00:00:00.000Z", "2018-09-19T01:30:00.000Z", "2018-09-19T02:30:00.000Z", "2018-09-19T03:30:00.000Z", "2018-09-19T04:30:00.000Z", "2018-09-19T05:30:00.000Z", "2018-09-19T06:30:00.000Z"]
  //       },
  //       tooltip: {
  //         x: {
  //           format: 'dd/MM/yy HH:mm'
  //         },
  //       }
  //     }).render();
  //   });
  // }
//  chartPie(){
//   document.addEventListener("DOMContentLoaded", () => {
//     new ApexCharts(document.querySelector("#pieChart"), {
//       series: [44, 55, 13, 43, 22],
//       chart: {
//         height: 350,
//         type: 'pie',
//         toolbar: {
//           show: true
//         }
//       },
//       labels: ['Team A', 'Team B', 'Team C', 'Team D', 'Team E']
//     }).render();
//   });
//  }
}
