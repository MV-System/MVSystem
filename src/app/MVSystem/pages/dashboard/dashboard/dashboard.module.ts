import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from '../dashboard.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { MyDateRangePickerModule } from 'mydaterangepicker';
import { DashboardRoutingModule } from '../dashboard-routing.module';



@NgModule({
  declarations: [
    DashboardComponent
  ],
  imports: [
    DashboardRoutingModule,
    NgxChartsModule,
    MyDateRangePickerModule,
    CommonModule

  ], schemas:[CUSTOM_ELEMENTS_SCHEMA]
})
export class DashboardModule { }
