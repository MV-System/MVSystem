import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SuplidorRegistroComponent } from './suplidor-registro/suplidor-registro.component';

const routes: Routes = [
  {
    path: '',
    // component: ClientesRegistroComponent,
    children:[
      {
        path: 'suplidor-registro',
        component: SuplidorRegistroComponent,
      }
     
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProveedoresRoutingModule { }
