import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarcasRoutingModule } from './marcas-routing.module';
import { MarcasRegistroComponent } from './marcas-registro/marcas-registro.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxChartsModule } from '@swimlane/ngx-charts';



@NgModule({
  declarations: [
    MarcasRegistroComponent
  ],
  imports: [
    CommonModule,
    MarcasRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    NgxPaginationModule,
    NgxChartsModule,
  ]
})
export class MarcasModule { }
