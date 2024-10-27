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

  view: [number, number] = [700, 400];
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
  rangeDatePlaceholder: Date =new Date()
  colorScheme = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']
  };
  myDateRangePickerOptions: IMyDrpOptions = {
    dateFormat: 'dd.mm.yyyy',
  };
  single = [
    { "name": "Equipos", "value": this.data.costo_Equipos },
       { "name": "Accesorios", "value": this.data.ganancia_Accesorios },
       { "name": "Desbloqueos", "value": this.data.ganancia_Desbloqueos },
       { "name": "Reparaciones", "value": this.data.ganancia_Reparaciones }
  ];

  constructor(
    private UtilidadesServices: UtilidadesService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private loginService: LoginService,
  ) { }

  ngOnInit(): void {
    this.GetUtilidades(); // Llama a la función para obtener datos

  }
  onDateRangeChanged(event: any) {
    if (event.beginDate.year === 0) {
      this.filter.FI = '2024-01-01';
      this.filter.FF = '2024-12-01';
    } else {
      this.filter.FI = `${event.beginDate.month}/${event.beginDate.day}/${event.beginDate.year}`;
      this.filter.FF = `${event.endDate.month}/${event.endDate.day}/${event.endDate.year}`;
    }
    this.GetUtilidades();
  }
  GetUtilidades() {
    this.UtilidadesServices
      .GetUtilidades(this.filter)
      .subscribe(
        (equipos: Utilidades) => {

          if (equipos) {
            this.data = equipos; // Asigna el primer objeto a data
            console.log("this.data",this.data);
            console.log("this.data.Ganancia_Equipos",this.data.ganancia_Equipos);
            // Actualiza el arreglo 'single' después de obtener los datos
            this.updateSingleData();
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

  private updateSingleData() {
    this.single = [
      { "name": "Equipos", "value": this.data.ganancia_Equipos },
      { "name": "Accesorios", "value": this.data.ganancia_Accesorios },
      { "name": "Desbloqueos", "value": this.data.ganancia_Desbloqueos },
      { "name": "Reparaciones", "value": this.data.ganancia_Reparaciones }
    ];
  }
  UtilidadesForm: FormGroup = this.fb.group({ });

  filter: utilidadesFiltros = {
    FI: '2024-01-01',
    FF: '2024-12-01',
    sucursal: this.loginService.getUserIdSucursal, // Asegúrate de que esto retorne el valor correcto
  };

  onSelect(data: any): void { }

  onActivate(data: any): void { }

  onDeactivate(data: any): void { }
}
