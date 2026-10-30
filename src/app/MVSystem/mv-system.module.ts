
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MvSystemRoutingModule } from './mv-system-routing.module';
import { HomeComponent } from './pages/home/home.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { SidebarComponent } from './pages/home/sidebar/sidebar.component';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from './pages/home/header/header.component';
import { FooterComponent } from './pages/home/footer/footer.component';
import { NovedadesComponent } from './pages/home/novedades/novedades.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { MyDateRangePickerModule } from 'mydaterangepicker';
import { DashboardModule } from './pages/dashboard/dashboard/dashboard.module';


@NgModule({
  declarations: [
    HomeComponent,
    HeaderComponent,
    SidebarComponent,
    FooterComponent,
    NovedadesComponent
  ],
  imports: [
    MyDateRangePickerModule,
    NgxChartsModule,
    CommonModule,
    MvSystemRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    NgxPaginationModule,
    RouterModule,
    DashboardModule
  ],
  exports: [
    HomeComponent,
    HeaderComponent,
    SidebarComponent,
    FooterComponent,
    NovedadesComponent
  ]
})
export class MvSystemModule { }
