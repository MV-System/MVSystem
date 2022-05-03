import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccesoriosComponent } from './accesorios/accesorios.component';

const routes: Routes = [
  {
    path:'accesorios',
    component: AccesoriosComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ComponentsRoutingModule { }
