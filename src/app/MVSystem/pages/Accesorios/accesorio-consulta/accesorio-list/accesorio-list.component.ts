import { Component, Input, OnInit } from '@angular/core';
import { AccesorioAll } from '../../../../interfaces/accesorio.interface';

@Component({
  selector: 'app-accesorio-list',
  templateUrl: './accesorio-list.component.html',
  styleUrls: ['./accesorio-list.component.css']
})
export class AccesorioListComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }
  currentPage:     number = 1;
  totalRecord!:    number;

 @Input() accesorios: AccesorioAll[]=[];
  filter: any = {
    almacen: 0,
    modelo: '',
    imei: '',
    suplidor: '',
    pageIndex: 1,
    pageSize: 10,
    fechaInicio: '',
    fechaFinal: '',
  };


  pageChanged(index: number) {
    this.currentPage = index;
    this.filter.pageIndex = index;
  }
}
