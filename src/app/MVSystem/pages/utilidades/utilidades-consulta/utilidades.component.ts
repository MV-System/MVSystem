import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IMyDrpOptions } from 'mydaterangepicker';
import { ToastrService } from 'ngx-toastr';
import { LoginService } from 'src/app/auth/login.service';
import { Utilidades, utilidadesFiltros } from 'src/app/core/interfaces/utilidades.interface';
import { UtilidadesService } from 'src/app/core/services/utilidades.service';

@Component({
  selector: 'app-utilidades',
  templateUrl: './utilidades.component.html',
  styleUrls: ['./utilidades.component.css']
})
export class UtilidadesComponent implements OnInit {

  // options
  view: [number, number] = [900, 200];
  gradient: boolean = true;
  showLegend: boolean = true;
  showLabels: boolean = true;
  isDoughnut: boolean = false;
  data: Utilidades = {
    costo_Equipos: 0,
  venta_Equipos: 0,
  ganancia_Equipos:0,
  costo_Accesorios:0,
  venta_Accesorios:0,
  ganancia_Accesorios:0,
  costo_Reparaciones:0,
  venta_Reparaciones:0,
  ganancia_Reparaciones:0,
  costo_Desbloqueos:0,
  venta_Desbloqueos:0,
  ganancia_Desbloqueos:0,
  valida: 0
  }; // Inicializa data
  isLoading: boolean = false; // Variable para controlar el estado de carga

  rangeDatePlaceholder: Date =new Date()
  colorScheme1 = {
    domain: ['#5AA454', '#E44D25', '#CFC0BB', '#7aa3e5', '#a8385d', '#aae3f5']
  };
  colorScheme = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']
  };
  myDateRangePickerOptions: IMyDrpOptions = {
    dateFormat: 'dd.mm.yyyy',
  };
  singleVentas = [
    { "name": "Ventas Equipos", "value": this.data.venta_Equipos },
    { "name": "Ventas Accesorios", "value": this.data.venta_Accesorios },
    { "name": "Ventas Desbloqueos", "value": this.data.venta_Desbloqueos },
    { "name": "Ventas Reparaciones", "value": this.data.venta_Reparaciones }
  ];
  singleGanancias = [
    { "name": "Ganacia Equipos", "value": this.data.ganancia_Equipos },
    { "name": "Ganancia Accesorios", "value": this.data.ganancia_Accesorios },
    { "name": "Ganancia Desbloqueos", "value": this.data.ganancia_Desbloqueos },
    { "name": "Ganancia Reparaciones", "value": this.data.ganancia_Reparaciones }
  ];
  singleCostos = [
    { "name": "Costo Equipos", "value": this.data.costo_Equipos },
    { "name": "Costo Accesorios", "value": this.data.costo_Accesorios },
    { "name": "Costo Desbloqueos", "value": this.data.costo_Desbloqueos },
    { "name": "Costo Reparaciones", "value": this.data.costo_Reparaciones }
  ];

  constructor(
    private UtilidadesServices: UtilidadesService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private loginService: LoginService,
  ) { }

  // Obtener la fecha actual
 fechaHoy = new Date();
 // Crear una nueva fecha para el primer día del mes actual
FechaInicio = new Date(this.fechaHoy.getFullYear(), this.fechaHoy.getMonth(), 1);


  ngOnInit(): void {
    this.GetUtilidades(); // Llama a la función para obtener datos

  }
  onDateRangeChanged(event: any) {
    if (event.beginDate.year === 0) {
      this.filter.FI = this.FechaInicio.toISOString().split('T')[0],
      this.filter.FF = this.fechaHoy.toISOString().split('T')[0]
    } else {
      this.filter.FI = `${event.beginDate.month}/${event.beginDate.day}/${event.beginDate.year}`;
      this.filter.FF = `${event.endDate.month}/${event.endDate.day}/${event.endDate.year}`;
    }
    this.GetUtilidades();
  }
  GetUtilidades() {
    this.isLoading = true; // Iniciar carga
    this.UtilidadesServices
      .GetUtilidades(this.filter)
      .subscribe(
        (equipos: Utilidades) => {
          this.isLoading = false; // Terminar carga
          if (equipos) {
            this.data = equipos; // Asigna el primer objeto a data
            this.updateSingleData();
          } else {
            this.toastr.warning('No se encontraron utilidades.');
          }
        },
        (error) => {
          this.isLoading = false; // Terminar carga
          console.error('Error al obtener utilidades:', error);
          this.toastr.error('Error al cargar datos de utilidades');
        }
      );
  }

  private updateSingleData() {
   this.singleVentas = [
    { "name": "Ventas Equipos", "value": this.data.venta_Equipos },
    { "name": "Ventas Accesorios", "value": this.data.venta_Accesorios },
    { "name": "Ventas Desbloqueos", "value": this.data.venta_Desbloqueos },
    { "name": "Ventas Reparaciones", "value": this.data.venta_Reparaciones }
  ];
  this.singleGanancias = [
    { "name": "Ganacia Equipos", "value": this.data.ganancia_Equipos },
    { "name": "Ganancia Accesorios", "value": this.data.ganancia_Accesorios },
    { "name": "Ganancia Desbloqueos", "value": this.data.ganancia_Desbloqueos },
    { "name": "Ganancia Reparaciones", "value": this.data.ganancia_Reparaciones }
  ];
  this.singleCostos = [
    { "name": "Costo Equipos", "value": this.data.costo_Equipos },
    { "name": "Costo Accesorios", "value": this.data.costo_Accesorios },
    { "name": "Costo Desbloqueos", "value": this.data.costo_Desbloqueos },
    { "name": "Costo Reparaciones", "value": this.data.costo_Reparaciones }
  ];
  }
  UtilidadesForm: FormGroup = this.fb.group({ });

  filter: utilidadesFiltros = {
    FI: this.FechaInicio.toISOString().split('T')[0],
    FF: this.fechaHoy.toISOString().split('T')[0],
    sucursal: this.loginService.getUserIdSucursal, // Asegúrate de que esto retorne el valor correcto
  };

  onSelect(data: any): void { }

  onActivate(data: any): void { }

  onDeactivate(data: any): void { }
}
