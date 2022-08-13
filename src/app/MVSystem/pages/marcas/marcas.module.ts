import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarcasRoutingModule } from './marcas-routing.module';
import { MarcasRegistroComponent } from './marcas-registro/marcas-registro.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    MarcasRegistroComponent
  ],
  imports: [
    CommonModule,
    MarcasRoutingModule,
    ReactiveFormsModule,
    FormsModule
  ]
})
export class MarcasModule { }
