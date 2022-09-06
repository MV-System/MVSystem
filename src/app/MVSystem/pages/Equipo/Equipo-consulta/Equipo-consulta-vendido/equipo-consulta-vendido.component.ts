import { Component, Input, OnDestroy, OnInit, SimpleChanges, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IMyDrpOptions } from 'mydaterangepicker';
import { interval, Observable, Subscription } from 'rxjs';
import {
  Almacen,
  ModeloEquipo,
} from 'src/app/MVSystem/interfaces/catalogo.interface';
import { EquipoVendido } from 'src/app/MVSystem/interfaces/equipo.interface';
import { VendedorLista } from 'src/app/MVSystem/interfaces/vendedor.interface';
import { CatalogosService } from 'src/app/MVSystem/services/catalogos.service';
import { EquipoService } from 'src/app/MVSystem/services/equipo.service';
import { VendedorService } from 'src/app/MVSystem/services/vendedor.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-equipo-consulta-vendido',
  templateUrl: './equipo-consulta-vendido.component.html',
  styleUrls: ['./equipo-consulta-vendido.component.css'],
})
export class EquipoConsultaVendidoComponent implements OnInit, OnDestroy,OnChanges {
  totalFacturado!: number;
  totalGanancia!: number;
  constructor(
    private fb: FormBuilder,
    private equipoService: EquipoService,
    private catalogosService: CatalogosService,
    private vendedorService: VendedorService
  ) {}
  ngOnInit(): void {
    this.obtenerEquiposVendidos();
    this.obtenerAlmacenLista();
    this.obtenerModeloLista();
    this.obtenerVendedor();
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
  @Input() active: boolean = false;
  @Input() clearFilter:any;

  equipoQuantity!:Observable<number>;
  totalInventario!: number;
  subscription!: Subscription;
  currentPage: number = 1;
  totalRecord!: number;
  line!: number;
  lastLine!: number;
  almacenListado: Almacen[] = [];
  modeloListado: ModeloEquipo[] = [];
  listaVendedor: VendedorLista[] = [];
  equiposVendidos: EquipoVendido[] = [];
  rangeDatePlaceholder:Date=new Date()

  filter: any = {
    almacen: 0,
    modelo: '',
    suplidor: '',
    fechaRegistro: '',
    pageIndex: 1,
    pageSize: 10,
    fechaInicio: '',
    fechaFinal: '',
  };
  form: FormGroup = this.fb.group({
    almacen: [''],
    suplidor: [''],
    fechaRegistro: [''],
    modelo: [''],
    rangeDate: [''],
  });
  myDateRangePickerOptions: IMyDrpOptions = {
    dateFormat: 'dd.mm.yyyy',
  };
  clearFilters(){
    this.form.reset();
    this.filter.fechaInicio = '';
    this.filter.fechaFinal = '';
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
  setDateRange(): void {
    let date = new Date();
    this.form.patchValue({
      rangoFecha: {
        beginDate: {
          day: date.getDate(),
          month: date.getMonth() + 1,
          year: date.getFullYear(),
        },
        endDate: {
          day: date.getDate(),
          month: date.getMonth() + 1,
          year: date.getFullYear(),
        },
      },
    });
  }
  pageChanged(index: number) {
    this.currentPage = index;
    this.filter.pageIndex = index;
    this.obtenerEquiposVendidos();
  }
  getValueFilterForm() {
    let almacenValue = this.form.get('almacen')?.value;
    let suplidorValue = this.form.get('suplidor')?.value;
    let modeloValue = this.form.get('modelo')?.value;
    this.filter.almacen = almacenValue == null ? '' : almacenValue;

    this.filter.suplidor = suplidorValue == null ? '' : suplidorValue;
    this.filter.modelo = modeloValue == null ? '' : modeloValue;
  }
  obtenerTotalEquipos(cantidadEquipo: number){
    this.equipoQuantity = interval(10).pipe(take(cantidadEquipo + 1));
  }
  obtenerTotalFacturado(totalFacturado: number){
    this.totalFacturado =totalFacturado;
  }
  obtenerTotalGanancia(totalGanancia: number){
    this.totalGanancia =totalGanancia;
  }
  obtenerTotalInventario(totalInventario: number){
    this.totalInventario =totalInventario;
  }
  obtenerEquiposVendidos() {
    this.getValueFilterForm();
    
    this.subscription = this.equipoService
      .getEquipoVendido(this.filter)
      .subscribe((equipo) => {
        
        let record = equipo.length == 0?0:equipo[0].totalRecord;
        let totalInventario = equipo.length == 0?0:equipo[0].totalInventario;
        let totalFacturado = equipo.length == 0?0:equipo[0].totalFacturado;
        let totalGanancia = equipo.length == 0?0:equipo[0].totalGanancia;
        this.obtenerTotalEquipos(record);
        this.obtenerTotalInventario(totalInventario);
        this.obtenerTotalFacturado(totalFacturado);
        this.obtenerTotalGanancia(totalGanancia);
        if (equipo.length) {
          this.totalRecord = equipo[0].totalRecord;
          this.line = equipo[0].line;
          this.lastLine = equipo[0].lastLine;
        }
        this.equiposVendidos = equipo;
      });
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
}
