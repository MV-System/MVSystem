import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FooterComponent } from './footer.component';
import { MyDateRangePickerModule } from 'mydaterangepicker';
import { NgxChartsModule } from '@swimlane/ngx-charts';



@NgModule({
  declarations: [
    //FooterComponent
  ],
  imports: [

    CommonModule
  ], schemas:[NO_ERRORS_SCHEMA]
})
export class FooterModule { }
