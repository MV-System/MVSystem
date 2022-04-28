import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { MvSystemModule } from '../MVSystem/mv-system.module';



@NgModule({
  declarations: [
    HeaderComponent
  ],
  imports: [
    CommonModule,
    MvSystemModule
  ],
  exports:[
    HeaderComponent
  ]
})
export class SharedModule { }
