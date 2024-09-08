import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModelosRoutingModule } from './modelos-routing.module';
import { ModelosRegistrosComponent } from './modelos-registro/modelos-registros.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';




@NgModule({
  declarations: [
    ModelosRegistrosComponent
  ],
  imports: [
    CommonModule,
    ModelosRoutingModule,
    ReactiveFormsModule,
    NgSelectModule,
    FormsModule
  ]
})
export class ModelosModule { }
// verificar si esta actualizando la rama correctamente
