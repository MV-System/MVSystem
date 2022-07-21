import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModelosRoutingModule } from './modelos-routing.module';
import { ModelosRegistrosComponent } from './modelos-registro/modelos-registros.component';



@NgModule({
  declarations: [
    ModelosRegistrosComponent
  ],
  imports: [
    CommonModule,
    ModelosRoutingModule
  ]
})
export class ModelosModule { }
