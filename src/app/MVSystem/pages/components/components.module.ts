import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ComponentsRoutingModule } from './components-routing.module';
import { AccesoriosComponent } from './accesorios/accesorios.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxMaskModule } from 'ngx-mask';


@NgModule({
  declarations: [
    AccesoriosComponent,
  ],
  imports: [
    CommonModule,
    ComponentsRoutingModule,
    ReactiveFormsModule,
    NgxMaskModule.forRoot(),

  ]
})
export class ComponentsModule { }
