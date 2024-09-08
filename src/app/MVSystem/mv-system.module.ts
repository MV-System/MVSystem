
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MvSystemRoutingModule } from './mv-system-routing.module';
import { HomeComponent } from './pages/home/home.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { SidebarComponent } from './pages/home/sidebar/sidebar.component';
import { FooterComponent } from './pages/home/footer/footer.component';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from './pages/home/header/header.component';


@NgModule({
  declarations: [
    HomeComponent,
    HeaderComponent,
    SidebarComponent,
    FooterComponent
  ],
  imports: [
    CommonModule,
    MvSystemRoutingModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    RouterModule
  ],
  exports: [
    HomeComponent,
    HeaderComponent,
    SidebarComponent,
    FooterComponent
  ]
})
export class MvSystemModule { }
