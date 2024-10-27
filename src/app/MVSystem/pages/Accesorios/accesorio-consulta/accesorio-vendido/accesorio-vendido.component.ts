import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IMyDrpOptions } from 'mydaterangepicker';
import { Subscription } from 'rxjs';
import { LoginService } from 'src/app/auth/login.service';
import { AccesorioVendido } from 'src/app/core/interfaces/accesorio.interface';
import { Almacen } from 'src/app/core/interfaces/catalogo.interface';
import { AccesoriosService } from 'src/app/core/services/accesorios.service';
import { CatalogosService } from 'src/app/core/services/catalogos.service';
import { ValidatorPermissionService } from 'src/app/core/services/validator-permission.service';

@Component({
  selector: 'app-accesorio-vendido',
  templateUrl: './accesorio-vendido.component.html',
  styleUrls: ['./accesorio-vendido.component.css']
})
export class AccesorioVendidoComponent implements OnInit, OnDestroy {

  constructor(
    private loginService: LoginService,
    private validatorPermissionService:ValidatorPermissionService,
    private accesoriosService:AccesoriosService,
    private catalogosService: CatalogosService,
    private fb: FormBuilder) { }

  ngOnInit(): void {
    this.getAccesoriosVendidos();
    this.getSucursales();
    this.SelectSucursal();
  }
  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
  subs!: Subscription;
  accesorios: AccesorioVendido[]=[];
  almacenes!: Almacen[];
  //sucursales!: sucursa[];
  isPrint: boolean = false;
  totalFacturado:  number = 0;
  totalGanancia:   number = 0;
  totalItbis:      number = 0;
  accesorioQuantity:  number = 0;
  totalInventario: number = 0;
  currentPage:     number = 1;
  totalRecord!:    number;
  line!:           number;
  lastLine!:       number;
  rangeDatePlaceholder: Date =new Date()

   // Obtener la fecha actual
 fechaHoy = new Date();
 // Crear una nueva fecha para el primer día del mes actual
FechaInicio = new Date(this.fechaHoy.getFullYear(), this.fechaHoy.getMonth(), 1);

  filter: any = {
    pageIndex: 1,
    pageSize: 10,
    fechaInicio: this.FechaInicio.toISOString().split('T')[0],
    fechaFinal:this.fechaHoy.toISOString().split('T')[0]
  };
  form: FormGroup = this.fb.group({
    almacen: [this.loginService.getUserIdSucursal,],
    filter: [''],
    rangeDate: [''],
  });

  SelectSucursal(): boolean {
    return this.validatorPermissionService.validateUserRole("CB_SUCURSAL");
  }

  getAccesoriosVendidos(){
    let almacen =Number(this.form.get('almacen')?.value);
    let filter =this.form.get('filter')?.value;

   this.subs=this.accesoriosService.getAccesoriosVendidos(this.filter,filter,almacen)
      .subscribe(accesorios =>{
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
  myDateRangePickerOptions: IMyDrpOptions = {
    dateFormat: 'dd.mm.yyyy',
  };
  getSucursales() {
    this.catalogosService.getSucursales().subscribe((almacen) => {
      this.almacenes = almacen;
    });
  }
}
