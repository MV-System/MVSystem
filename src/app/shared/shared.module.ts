import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { MvSystemModule } from '../MVSystem/mv-system.module';
import { FooterComponent } from './footer/footer.component';
import { LoadingComponent } from './components/loading/loading.component';
import { RLoadingComponent } from './components/r-loading/r-loading.component';



@NgModule({
  declarations: [
    HeaderComponent,
    FooterComponent,
    LoadingComponent,
    RLoadingComponent
  ],
  imports: [
    CommonModule
  ],
  exports:[
    HeaderComponent,
    FooterComponent,
    LoadingComponent,
    RLoadingComponent
  ]
})
export class SharedModule { }
