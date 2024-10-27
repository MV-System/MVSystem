import { UtilidadesRoutingModule } from './utilidades-routing.module';
import { UtilidadesComponent } from './utilidades-consulta/utilidades.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { MyDateRangePickerModule } from 'mydaterangepicker';




@NgModule({
  declarations: [
    UtilidadesComponent
  ],
  imports: [
    UtilidadesRoutingModule,
    CommonModule,
    NgxChartsModule,
    MyDateRangePickerModule,
  ]
})
export class UtilidadesModule { }
