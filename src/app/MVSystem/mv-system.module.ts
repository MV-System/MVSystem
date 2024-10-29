
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MvSystemRoutingModule } from './mv-system-routing.module';
import { HomeComponent } from './pages/home/home.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { SidebarComponent } from './pages/home/sidebar/sidebar.component';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from './pages/home/header/header.component';
import { FooterComponent } from './pages/home/footer/footer.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { MyDateRangePickerModule } from 'mydaterangepicker';
import { DashboardModule } from './pages/dashboard/dashboard/dashboard.module';


@NgModule({
  declarations: [
    HomeComponent,
    HeaderComponent,
    SidebarComponent,
    FooterComponent
  ],
  imports: [
    MyDateRangePickerModule,
    NgxChartsModule,
    CommonModule,
    MvSystemRoutingModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    RouterModule,
    DashboardModule
  ],
  exports: [
    HomeComponent,
    HeaderComponent,
    SidebarComponent,
    FooterComponent
  ]
})
export class MvSystemModule { }
