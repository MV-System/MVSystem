import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { Accesorio } from 'src/app/MVSystem/interfaces/accesorio.interface';
import { AccesoriosService } from 'src/app/MVSystem/services/accesorios.service';

@Component({
  selector: 'app-accesorio-vendido',
  templateUrl: './accesorio-vendido.component.html',
  styleUrls: ['./accesorio-vendido.component.css']
})
export class AccesorioVendidoComponent implements OnInit, OnDestroy {

  constructor(private accesoriosService:AccesoriosService,
    private fb: FormBuilder,
    private toast: ToastrService) { }

  ngOnInit(): void {
    this.getAccesoriosVendidos();
  }
  ngOnDestroy(): void {
    // this.subscription.unsubscribe();
  }
  subscription!: Subscription;
  accesorios: Accesorio[]=[];

  totalFacturado:  number = 0;
  totalGanancia:   number = 0;
  totalItbis:      number = 0;
  accesorioQuantity:  number = 0;
  totalInventario: number = 0;
  currentPage:     number = 1;
  totalRecord!:    number;
  line!:           number;
  lastLine!:       number;

  filter: any = {
    pageIndex: 1,
    pageSize: 10,
    fechaInicio: '',
    fechaFinal: ''
  };
  form: FormGroup = this.fb.group({
    almacen: [''],
    suplidor: [''],
    vendedor: [''],
    modelo: [''],
    rangeDate: [''],
    rangeDateFactura: [''],
    telefono:[''],
    imei:['',],
  });
  getAccesoriosVendidos(){
    let almacen =Number(this.form.get('almacen')?.value);
    let accesorio =this.form.get('accesorio')?.value;
      this.accesoriosService.getAccesoriosVendidos(this.filter,accesorio,almacen)
      .subscribe(accesorios =>{
        console.log(accesorios);
        let record = accesorios.length == 0?0:accesorios[0].totalRecord;
        let totalInventario = accesorios.length == 0?0:accesorios[0].totalInventario;
        let totalFacturado = accesorios.length == 0?0:accesorios[0].totalFacturado;
        let totalGanancia = accesorios.length == 0?0:accesorios[0].totalGanancia;
        let totalItbis = accesorios.length == 0?0:accesorios[0].totalItbis;
        this.obtenerTotalAccesorios(record);
        this.obtenerTotalInventario(totalInventario);
        this.obtenerTotalFacturado(totalFacturado);
        this.obtenerTotalGanancia(totalGanancia);
        this.obtenerTotalItbis(totalItbis);
        if (accesorios.length) {
          this.totalRecord = accesorios[0].totalRecord;
          this.line = accesorios[0].line;
          this.lastLine = accesorios[0].lastLine;
        }
        this.accesorios = accesorios;

      })
  }
  
  obtenerTotalAccesorios(cantidadAccesorio: number){
    this.accesorioQuantity = cantidadAccesorio;
  }
  obtenerTotalFacturado(totalFacturado: number){
    this.totalFacturado =totalFacturado;
  }
  obtenerTotalGanancia(totalGanancia: number){
    this.totalGanancia =totalGanancia;
  }
  obtenerTotalItbis(totalItbis: number){
    this.totalItbis =totalItbis;
  }
  obtenerTotalInventario(totalInventario: number){
    this.totalInventario =totalInventario;
  }
  pageChanged(index: number) {
    this.currentPage = index;
    this.filter.pageIndex = index;
    this.getAccesoriosVendidos();
  }
  onDateRangeChanged(event: any) {
    if (event.beginDate.year === 0) {
      this.filter.fechaInicio = '';
      this.filter.fechaFinal = '';
    } else {
      this.filter.fechaInicio = `${event.beginDate.month}/${event.beginDate.day}/${event.beginDate.year}`;
      this.filter.fechaFinal = `${event.endDate.month}/${event.endDate.day}/${event.endDate.year}`;
    }
    this.getAccesoriosVendidos();
  }
}
