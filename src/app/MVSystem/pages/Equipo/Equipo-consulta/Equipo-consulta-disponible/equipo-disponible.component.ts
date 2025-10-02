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
import { LoadingService } from 'src/app/shared/components/r-loading/loading.service';
import { ValidatorPermissionService } from 'src/app/core/services/validator-permission.service';

@Component({
  selector: 'app-equipo-disponible',
  templateUrl: './equipo-disponible.component.html',
  styleUrls: ['./equipo-disponible.component.css'],
})
export class EquipoDisponibleComponent implements OnInit, OnDestroy, OnChanges {
  constructor(
    private loading: LoadingService,
    private fb: FormBuilder,
    private equipoService: EquipoService,
    private catalogosService: CatalogosService,
    private toast: ToastrService,
    private loginService: LoginService,
    private validatorPermissionService:ValidatorPermissionService,
  ) { }



  SelectSucursal(): boolean {
    return this.validatorPermissionService.validateUserRole("CB_SUCURSAL");
  }

  // Este método se llama cuando cambia el número de elementos por página
  onPageSizeChange() {
     console.log("total registros",this.totalRecord);
   //  debugger;
    // Si se selecciona "Todos", mostramos todos los registros
    if (this.filter.pageSize === this.totalRecord) {
      this.filter.pageIndex = 1;  // Restablecer a la primera página
    } else {
      this.filter.pageIndex = 1;  // Siempre resetear a página 1 cuando cambia el tamaño
    }
    this.currentPage = 1;
    this.obtenerEquiposDisponibles(false);  // Rehacer la consulta para actualizar los datos (sin resetear página porque ya lo hicimos)
  }

  ngOnInit(): void {
    //this.loading.showLoading();
    this.obtenerEquiposDisponibles();
    this.loadCatalogos();
//this.loading.hideLoading();
  }
  ngOnChanges(changes: SimpleChanges): void {
    const change = changes["clearFilter"];
    if (change && change.previousValue != change.currentValue) {
      this.clearFilters();
    }

  }
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
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
   // this.loading.showLoading();
    this.form.reset();
    this.filter.imei = '';
    this.filter.fechaInicio = '';
    this.filter.fechaFinal = '';
    this.obtenerEquiposDisponibles()
    //this.loading.hideLoading();
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

onEnterKey(event: Event) {
  const keyboardEvent = event as KeyboardEvent;
  keyboardEvent.preventDefault();
  this.obtenerEquiposDisponibles();
}

obtenerEquiposDisponibles(resetPage: boolean = true) {
  this.loading.showLoading();
  this.isLoading = true;

  this.getValueFilterForm();

  // Solo resetear a página 1 si se especifica (al cambiar filtros)
  if (resetPage) {
    this.onFilterPropHasValue();
  }

  if (this.subscription) {
    this.subscription.unsubscribe();
  }



  this.subscription = this.equipoService
    .getEquipoDisponible(this.filter)
    .subscribe((equipo) => {
      const [primerRegistro] = equipo;
      const record = primerRegistro?.totalRecord || 0;
      const totalInventario = primerRegistro?.totalInventario || 0;

      this.obtenerTotalEquipos(record);
      this.obtenerTotalInventario(totalInventario);
      this.loading.hideLoading();
      this.isLoading = false;

      if (primerRegistro) {
        this.totalRecord = primerRegistro.totalRecord;
        this.line = primerRegistro.line;
        this.lastLine = primerRegistro.lastLine;
      }

      this.equiposDisponibles = equipo;
    });
}
  printReportEquipoDisponibles() {
    this.loading.showLoading();
    this.printing = true;
    
    this.equipoService.postEquipoDisponible(this.filter)
      .subscribe((blobResp) => {
        CreatorPDFFile(blobResp);
        this.loading.hideLoading();
        this.printing = false;
      }, (err) => {
        this.toast.error('Error al imprimir reporte', 'Error');
        this.loading.hideLoading();
        this.printing = false;
    });
  }

  getValueFilterForm() {

    let almacenValue;
    if(this.form.get('almacen')?.value !="")
  {
     almacenValue =this.form.get('almacen')?.value;
  }
  else
  {
     almacenValue =this.loginService.getUserIdSucursal; //this.form.get('almacen')?.value;
  }
  //let  almacenValue =this.form.get('almacen')?.value;
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
    this.obtenerEquiposDisponibles(false); // false = no resetear página
  }

  loadCatalogos(){
    this.loading.showLoading();
    forkJoin([
      this.catalogosService.getSucursales(),
      //this.catalogosService.getAlmaceLista(),
      this.catalogosService.getModeloLista(),
      this.catalogosService.getSuplidorLista(),
    ]).subscribe(resp =>{
      this.almacenListado = resp[0];
      this.modeloListado = resp[1];
      this.listaSuplidor = resp[2];


    })
    this.loading.hideLoading();
  }
}
