import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { RLoadingComponent } from './components/r-loading/r-loading.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { RModalComponent } from './components/r-modal/r-modal.component';

@NgModule({
  declarations: [
    HeaderComponent,
    FooterComponent,
    RLoadingComponent,
    RModalComponent,
    SidebarComponent
  ],
  imports: [
    CommonModule
  ],
  exports:[
    HeaderComponent,
    FooterComponent,
    SidebarComponent,
    RLoadingComponent,
    RModalComponent
  ]
})
export class SharedModule { }
