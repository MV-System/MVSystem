import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClientesRegistroComponent } from './Clientes/Clientes-registro/clientes-registro.component';
import { SuplidorRegistroComponent } from './Suplidores/suplidor-registro/suplidor-registro.component';

const routes: Routes = [
  {
    path: '',
    // component: ClientesRegistroComponent,
    children:[
      {
        path: 'clientes-registro',
        component: ClientesRegistroComponent,
      },
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
export class CellControlRoutingModule { }
