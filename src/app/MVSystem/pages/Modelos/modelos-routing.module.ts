import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModelosRegistrosComponent } from './modelos-registro/modelos-registros.component';
import { Routes } from '@angular/router';


const routes : Routes = [
  {
path : 'modelos-registro',
component:ModelosRegistrosComponent
  }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ]
})
export class ModelosRoutingModule { }
