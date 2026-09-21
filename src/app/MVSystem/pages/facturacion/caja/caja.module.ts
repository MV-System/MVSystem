import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CajaListaComponent } from './caja-lista.component';
import { CajaRoutingModule } from './caja-routing.module';

import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { SharedModule } from '../../../../shared/shared.module';

@NgModule({
  declarations: [CajaListaComponent],
  imports: [CommonModule, CajaRoutingModule, FormsModule, NgxPaginationModule, SharedModule]
})
export class CajaModule { }
