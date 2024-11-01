import { Component, Input, OnDestroy, OnInit, SimpleChanges, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IMyDrpOptions } from 'mydaterangepicker';
import { Subscription } from 'rxjs';
import {
  Almacen,
  ModeloEquipo,
} from 'src/app/core/interfaces/catalogo.interface';
import { EquipoVendido } from 'src/app/core/interfaces/equipo.interface';
import { VendedorLista } from 'src/app/core/interfaces/vendedor.interface';
import { CatalogosService } from 'src/app/core/services/catalogos.service';
import { EquipoService } from 'src/app/core/services/equipo.service';
import { VendedorService } from 'src/app/core/services/vendedor.service';
import { Suplidor } from '../../../../../core/interfaces/catalogo.interface';
import { ToastrService } from 'ngx-toastr';
import { CreatorPDFFile } from 'src/app/helpers/helper';
import { LoginService } from 'src/app/auth/login.service';

@Component({
  selector: 'app-equipo-consulta-vendido',
  templateUrl: './equipo-consulta-vendido.component.html',
  styleUrls: ['./equipo-consulta-vendido.component.css'],
})
export class EquipoConsultaVendidoComponent implements OnInit, OnDestroy,OnChanges {

  constructor(
    private fb: FormBuilder,
    private equipoService: EquipoService,
    private catalogosService: CatalogosService,
    private vendedorService: VendedorService,
    private toast: ToastrService,
    private loginService: LoginService,
  ) {}
  @Input() clearFilter:any;

  ngOnInit(): void {
    this.obtenerEquiposVendidos();
    this.obtenerAlmacenLista();
    this.obtenerModeloLista();
    this.obtenerVendedor();
    this.obtenerSuplidor();
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
  ngOnChanges(changes: SimpleChanges): void {
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    //Add '${implements OnChanges}' to the class.
    const change =  changes["clearFilter"];

    if(change && change.previousValue != change.currentValue){

      this.clearFilters();
    }

  }
  isLoading: boolean = false; // Variable para controlar el estado de carga
  subscription!: Subscription;
  isPrint: boolean = false;
  totalFacturado:  number = 0;
  totalGanancia:   number = 0;
  totalItbis:      number = 0;
  equipoQuantity:  number = 0;
  totalInventario: number = 0;
  currentPage:     number = 1;
  totalRecord!:    number;
  line!:           number;
  lastLine!:       number;
  almacenListado:  Almacen[] = [];
  modeloListado:   ModeloEquipo[] = [];
  listaVendedor:   VendedorLista[] = [];
  listaSuplidor:   Suplidor[] = [];
  equiposVendidos: EquipoVendido[] = [];
  rangeDatePlaceholder: Date =new Date()
 // Obtener la fecha actual
 fechaHoy = new Date();
 // Crear una nueva fecha para el primer día del mes actual
FechaInicio = new Date(this.fechaHoy.getFullYear(), this.fechaHoy.getMonth(), 1);

  filter: any = {
    almacen: '',
    modelo: '',
    suplidor: '',
    vendedor: '',
    telefono:'',
    imei:'',
    pageIndex: 1,
    pageSize: 10,
    fechaInicio: '',
    fechaFinal: '',
    fechaInicioFactura: this.FechaInicio.toISOString().split('T')[0],
    fechaFinalFactura: this.fechaHoy.toISOString().split('T')[0],
    Empresa:this.loginService.getUserEmpresa,
    IdEmpresa:this.loginService.getUserIdEmpresa,
    IdSucursal:this.loginService.getUserIdSucursal,
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
  myDateRangePickerOptions: IMyDrpOptions = {
    dateFormat: 'dd.mm.yyyy',
  };



  clearFilters(){
    this.form.reset();
    this.filter.fechaInicio = '';
    this.filter.fechaFinal = '';
    this.filter.fechaInicioFactura ='';
    this.filter.fechaFinalFactura ='';
    this.obtenerEquiposVendidos()
  }
  onDateRangeChanged(event: any) {
    if (event.beginDate.year === 0) {
      this.filter.fechaInicio = '';
      this.filter.fechaFinal = '';
    } else {
      this.filter.fechaInicio = `${event.beginDate.month}/${event.beginDate.day}/${event.beginDate.year}`;
      this.filter.fechaFinal = `${event.endDate.month}/${event.endDate.day}/${event.endDate.year}`;
    }
    this.obtenerEquiposVendidos();
  }
  onDateRangeFacturaChanged(event: any) {
    if (event.beginDate.year === 0) {
      this.filter.fechaInicioFactura = '';
      this.filter.fechaFinalFactura = '';
    } else {
      this.filter.fechaInicioFactura = `${event.beginDate.month}/${event.beginDate.day}/${event.beginDate.year}`;
      this.filter.fechaFinalFactura = `${event.endDate.month}/${event.endDate.day}/${event.endDate.year}`;
    }
    this.obtenerEquiposVendidos();
  }
  pageChanged(index: number) {
    this.currentPage = index;
    this.filter.pageIndex = index;
    console.log("Index",index);
    this.obtenerEquiposVendidos();
  }
  getValueFilterForm() {
  const nullOrEmpty =(data: null)=>{return data== null ? '':data}
    const {
      almacen,
      suplidor,
      vendedor,
      modelo,
      fechaRegistro,
      telefono,
      imei
    } = this.form.value;
    this.filter.fechaRegistro = nullOrEmpty(fechaRegistro);
    this.filter.almacen = nullOrEmpty(almacen);
    this.filter.vendedor = nullOrEmpty(vendedor);
    this.filter.suplidor = nullOrEmpty(suplidor);
    this.filter.modelo = nullOrEmpty(modelo);
    this.filter.telefono = nullOrEmpty(telefono);
    this.filter.imei = nullOrEmpty(imei);
  }
  onSearchByTelefono(){
    let telefonoFormValue = this.form.controls.telefono.value;
    if(telefonoFormValue.length == 10){
      this.obtenerEquiposVendidos();
    }
    else if(telefonoFormValue.length <= 0){
      this.obtenerEquiposVendidos();
    }
  }
  obtenerTotalEquipos(cantidadEquipo: number){
    // this.equipoQuantity = interval(10).pipe(take(cantidadEquipo + 1));
    this.equipoQuantity = cantidadEquipo;
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
  onFilterPropHasValue(){
    if(
    this.filter.imei !=="" ||
    this.filter.almacen  !==""||
    this.filter.modelo !==""||
    this.filter.suplidor !=="" ||
    this.filter.vendedor !=="" ||
    this.filter.telefono !=="" ||
    this.filter.fechaInicio !="" ||
    this.filter.fechaFinal !==""||
    this.filter.fechaInicioFactura !==""||
    this.filter.fechaFinalFactura !==""
    ){

      this.filter.pageIndex = 1;
    }

  }

  obtenerEquiposVendidos() {
    this.isLoading = true; // Iniciar carga
    this.getValueFilterForm();
    this.onFilterPropHasValue();
    this.subscription = this.equipoService
      .getEquipoVendido(this.filter)
      .subscribe((equipo) => {
        console.log("Filtros",this.filter);
        let record = equipo.length == 0?0:equipo[0].totalRecord;
        let totalInventario = equipo.length == 0?0:equipo[0].totalInventario;
        let totalFacturado = equipo.length == 0?0:equipo[0].totalFacturado;
        let totalGanancia = equipo.length == 0?0:equipo[0].totalGanancia;
        let totalItbis = equipo.length == 0?0:equipo[0].totalItbis;
        this.obtenerTotalEquipos(record);
        this.obtenerTotalInventario(totalInventario);
        this.obtenerTotalFacturado(totalFacturado);
        this.obtenerTotalGanancia(totalGanancia);
        this.obtenerTotalItbis(totalItbis);
        this.isLoading = false; // Terminar carga
        if (equipo.length) {
          this.totalRecord = equipo[0].totalRecord;
          this.line = equipo[0].line;
          this.lastLine = equipo[0].lastLine;
        }
        this.equiposVendidos = equipo;

      });
  }
  printReportEquipoVendido(){
    this.isLoading = true; // Iniciar carga
    this.equipoService.postEquipoVendido(this.filter)
    .subscribe((blobResp)=>{
      this.isPrint = !this.isPrint;
      this.isLoading = false; // Terminar carga
      CreatorPDFFile(blobResp);
    },(err)=>{
      this.isPrint = !this.isPrint;
      this.toast.error('Error','Error al imprimir reporte');
    })
    this.isPrint = !this.isPrint;

  }
  obtenerAlmacenLista() {
    this.catalogosService.getAlmaceLista().subscribe((almacen) => {
      this.almacenListado = almacen;
    });
  }
  obtenerModeloLista() {
    this.catalogosService.getModeloLista().subscribe((modelo) => {
      this.modeloListado = modelo;
    });
  }
  obtenerVendedor() {
    this.vendedorService.getVendedorLista().subscribe((vendedor) => {
      this.listaVendedor = vendedor;
    });
  }
  obtenerSuplidor() {
    this.catalogosService.getSuplidorLista().subscribe((suplidor) => {
      this.listaSuplidor = suplidor;
    });
  }

}
