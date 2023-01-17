
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { MvSystemRoutingModule } from './mv-system-routing.module';

import { HomeComponent } from './pages/home/home.component';

import { NgxPaginationModule } from 'ngx-pagination';


@NgModule({
  declarations: [
    HomeComponent
  ],
  imports: [
    CommonModule,
    MvSystemRoutingModule,
    ReactiveFormsModule,
    NgxPaginationModule
  ],
  exports: [
    HomeComponent
  ]
})
export class MvSystemModule { }
