import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IMyDrpOptions } from 'mydaterangepicker';
import { forkJoin, Subscription } from 'rxjs';

import {
  Almacen,
  ModeloEquipo,
  Suplidor,
} from 'src/app/core/interfaces/catalogo.interface';
import { EquipoDisponible } from 'src/app/core/interfaces/equipo.interface';
import { VendedorLista } from 'src/app/core/interfaces/vendedor.interface';
import { CatalogosService } from 'src/app/core/services/catalogos.service';
import { EquipoService } from 'src/app/core/services/equipo.service';
import { ToastrService } from 'ngx-toastr';
import { CreatorPDFFile } from 'src/app/helpers/helper';
import { LoginService } from 'src/app/auth/login.service';

@Component({
  selector: 'app-equipo-disponible',
  templateUrl: './equipo-disponible.component.html',
  styleUrls: ['./equipo-disponible.component.css'],
})
export class EquipoDisponibleComponent implements OnInit, OnDestroy, OnChanges {
  constructor(
    private fb: FormBuilder,
    private equipoService: EquipoService,
    private catalogosService: CatalogosService,
    private toast: ToastrService,
    private loginService: LoginService,
  ) { }

  ngOnInit(): void {
    this.obtenerEquiposDisponibles();
    this.loadCatalogos();

  }
  ngOnChanges(changes: SimpleChanges): void {
    const change = changes["clearFilter"];
    if (change && change.previousValue != change.currentValue) {
      this.clearFilters();
    }

  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
  @Input() clearFilter: any;
  subscription!: Subscription;
  printing: boolean = false;
  rangeDatePlaceholder: Date = new Date();
  equipoQuantity:  number = 0;
  totalInventario: number = 0;
  currentPage:     number = 1;
  totalRecord!:    number;
  line!:           number;
  lastLine!:       number;
  almacenListado: Almacen[] = [];
  modeloListado:  ModeloEquipo[] = [];
  listaVendedor:  VendedorLista[] = [];
  listaSuplidor:  Suplidor[] = [];
  equiposDisponibles: EquipoDisponible[] = [];
  isLoading: boolean = false; // Variable para controlar el estado de carga


  filter: any = {
    almacen: 0,
    modelo: '',
    imei: '',
    suplidor: '',
    pageIndex: 1,
    pageSize: 10,
    fechaInicio: '',
    fechaFinal: '',
    Empresa:this.loginService.getUserEmpresa,
    IdEmpresa:this.loginService.getUserIdEmpresa,
    IdSucursal:this.loginService.getUserIdSucursal,
  };
  myDateRangePickerOptions: IMyDrpOptions = {
    dateFormat: 'dd.mm.yyyy',
  };
  form: FormGroup = this.fb.group({
    almacen: [''],
    suplidor: [''],
    imei: [''],
    modelo: [''],
    rangeDate: [''],
    totalEquipos: [0,],
    totalInventario: [0,]
  });
  clearFilters() {
    this.form.reset();
    this.filter.imei = '';
    this.filter.fechaInicio = '';
    this.filter.fechaFinal = '';
    this.obtenerEquiposDisponibles()
  }
  obtenerTotalEquipos(cantidadEquipo: number) {
    this.equipoQuantity = cantidadEquipo;
  }
  obtenerTotalInventario(totalInventario: number) {
    this.totalInventario = totalInventario;
  }
  onFilterPropHasValue(){
    if(
    this.filter.imei !=="" ||
    this.filter.fechaInicio !="" ||
    this.filter.fechaFinal !==""||
    this.filter.almacen  !==""||
    this.filter.modelo !==""||
    this.filter.suplidor !==""){

      this.filter.pageIndex = 1;
    }

  }
  obtenerEquiposDisponibles() {
    this.isLoading = true; // Iniciar carga
    this.getValueFilterForm();
    this.onFilterPropHasValue();

    this.subscription = this.equipoService
      .getEquipoDisponible(this.filter)
      .subscribe((equipo) => {

        let record = equipo.length == 0 ? 0 : equipo[0].totalRecord;
        let totalInventario = equipo.length == 0 ? 0 : equipo[0].totalInventario;
        this.obtenerTotalEquipos(record);
        this.obtenerTotalInventario(totalInventario);
        this.isLoading = false; // Terminar carga
        if (equipo.length) {
          this.totalRecord = equipo[0].totalRecord;
          this.line = equipo[0].line;
          this.lastLine = equipo[0].lastLine;
        }
        this.equiposDisponibles = equipo;

      });
  }
  printReportEquipoDisponibles() {
    this.isLoading = true; // Iniciar carga
    this.equipoService.postEquipoDisponible(this.filter)
      .subscribe((blobResp) => {
        this.printing = !this.printing;
        this.isLoading = false; // Terminar carga
        CreatorPDFFile(blobResp);
      }, (err) => {
        this.printing = !this.printing;
      this.toast.error('Error','Error al imprimir reporte');
    });
    this.printing = !this.printing;
  }

  getValueFilterForm() {
    let almacenValue = this.form.get('almacen')?.value;
    let suplidorValue =this.form.get('suplidor')?.value;
    let modeloValue = this.form.get('modelo')?.value;
    let imei = this.form.get('imei')?.value;

    this.filter.almacen = almacenValue == null ? 0 : almacenValue;
    this.filter.suplidor = suplidorValue == null ? '' : suplidorValue;
    this.filter.modelo = modeloValue == null ? '' : modeloValue;
    this.filter.imei = imei == null ? '' : imei;

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
  onDateRangeChanged(event: any) {
    if (event.beginDate.year === 0) {
      this.filter.fechaInicio = '';
      this.filter.fechaFinal = '';
    } else {
      this.filter.fechaInicio = `${event.beginDate.month}/${event.beginDate.day}/${event.beginDate.year}`;
      this.filter.fechaFinal = `${event.endDate.month}/${event.endDate.day}/${event.endDate.year}`;
    }

    this.obtenerEquiposDisponibles();
  }
  pageChanged(index: number) {
    this.currentPage = index;
    this.filter.pageIndex = index;
    this.obtenerEquiposDisponibles();
  }

  loadCatalogos(){
    forkJoin([
      this.catalogosService.getAlmaceLista(),
      this.catalogosService.getModeloLista(),
      this.catalogosService.getSuplidorLista(),
    ]).subscribe(resp =>{
      this.almacenListado = resp[0];
      this.modeloListado = resp[1];
      this.listaSuplidor = resp[2];


    })
  }
}
