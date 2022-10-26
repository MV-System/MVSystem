import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IMyDrpOptions } from 'mydaterangepicker';
import { Pagination } from 'src/app/MVSystem/interfaces/pagination.interfaces';

@Component({
  selector: 'app-facturacion-consulta',
  templateUrl: './facturacion-consulta.component.html',
  styleUrls: ['./facturacion-consulta.component.css']
})
export class FacturacionConsultaComponent implements OnInit {

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
  }
  title: string = "Consulta Facturas";
  breadcrumbItem: string = "Consulta Facturas"
  breadcrumb: string = "Consulta"
  facturas: any[]=[];
  totalFacturado:  number = 0;
  currentPage:     number = 1;
  pageIndex:       number = 1;
  pageSize:        number = 10;
  totalRecord!:    number;
  line!:           number;
  lastLine!:       number;
  facturasQuantity:number = 0;
  rangeDatePlaceholder: Date =new Date()

  paginate:Pagination={
    pageIndex: 1,
    pageSize: 10,
    fechaInicio: '',
    fechaFinal: ''
  }
  form: FormGroup = this.fb.group({
    almacen: [2,],
    factura:['',],
    rangeDate: [''],
  });
  filter: any = {
    pageIndex: 1,
    pageSize: 10,
    fechaInicio: '',
    fechaFinal: ''
  };


  getFacturas(){

  }
  printReportFactura(){

  }
  pageChanged(index: number) {
    this.currentPage = index;
    this.paginate.pageIndex= this.pageIndex = index;
    this.getFacturas()
  }
  onDateRangeChanged(event: any) {
    if (event.beginDate.year === 0) {
      this.filter.fechaInicio = '';
      this.filter.fechaFinal = '';
    } else {
      this.filter.fechaInicio = `${event.beginDate.month}/${event.beginDate.day}/${event.beginDate.year}`;
      this.filter.fechaFinal = `${event.endDate.month}/${event.endDate.day}/${event.endDate.year}`;
    }
    this.getFacturas();
  }
  myDateRangePickerOptions: IMyDrpOptions = {
    dateFormat: 'dd.mm.yyyy',
  };
}
