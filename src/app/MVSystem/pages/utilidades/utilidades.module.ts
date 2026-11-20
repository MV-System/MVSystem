import { UtilidadesRoutingModule } from './utilidades-routing.module';
import { UtilidadesComponent } from './utilidades-consulta/utilidades.component';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MyDateRangePickerModule } from 'mydaterangepicker';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgApexchartsModule } from 'ng-apexcharts';


@NgModule({
  declarations: [
    UtilidadesComponent
  ],
  imports: [
    UtilidadesRoutingModule,
    CommonModule,
    MyDateRangePickerModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    NgApexchartsModule,
  ], schemas:[CUSTOM_ELEMENTS_SCHEMA]
})
export class UtilidadesModule { }
