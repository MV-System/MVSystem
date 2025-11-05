import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardComponent } from '../dashboard.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { MyDateRangePickerModule } from 'mydaterangepicker';
import { DashboardRoutingModule } from '../dashboard-routing.module';
import { TopModelosWidgetComponent } from '../widgets/top-modelos-widget/top-modelos-widget.component';
import { AnomaliasWidgetComponent } from '../widgets/anomalias-widget/anomalias-widget.component';
import { VendedoresWidgetComponent } from '../widgets/vendedores-widget/vendedores-widget.component';
import { TopEquiposLentosWidgetComponent } from '../widgets/top-equipos-lentos-widget/top-equipos-lentos-widget.component';



@NgModule({
  declarations: [
    DashboardComponent,
    TopModelosWidgetComponent,
    AnomaliasWidgetComponent,
    VendedoresWidgetComponent,
    TopEquiposLentosWidgetComponent
  ],
  imports: [
    DashboardRoutingModule,
    NgxChartsModule,
    MyDateRangePickerModule,
    CommonModule,
    FormsModule

  ], schemas:[CUSTOM_ELEMENTS_SCHEMA]
})
export class DashboardModule { }
