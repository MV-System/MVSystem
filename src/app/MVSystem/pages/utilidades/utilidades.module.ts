import { UtilidadesRoutingModule } from './utilidades-routing.module';
import { UtilidadesComponent } from './utilidades-consulta/utilidades.component';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { MyDateRangePickerModule } from 'mydaterangepicker';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';


@NgModule({
  declarations: [
    UtilidadesComponent
  ],
  imports: [
    UtilidadesRoutingModule,
    CommonModule,
    NgxChartsModule,
    MyDateRangePickerModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
  ], schemas:[CUSTOM_ELEMENTS_SCHEMA]
})
export class UtilidadesModule { }
