import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { EquipoService } from '../../../services/equipo.service';
import { EquipoDisponible } from '../../../interfaces/equipo.interface';
import { CatalogosService } from 'src/app/MVSystem/services/catalogos.service';
import { Almacen, ModeloEquipo } from 'src/app/MVSystem/interfaces/catalogo.interface';
import { Pagination } from 'src/app/MVSystem/interfaces/pagination.interfaces';
import { VendedorService } from 'src/app/MVSystem/services/vendedor.service';
import { VendedorLista } from 'src/app/MVSystem/interfaces/vendedor.interface';
import { IMyDrpOptions } from 'mydaterangepicker';

@Component({
  selector: 'app-equipo-consulta',
  templateUrl: './equipo-consulta.component.html',
  styleUrls: ['./equipo-consulta.component.css']
})
export class EquipoConsultaComponent implements OnInit ,AfterViewInit{
  equipoTipo: boolean = false;

  constructor(private fb: FormBuilder,
              private equipoService:EquipoService,
              private catalogosService: CatalogosService,
              private vendedorService: VendedorService,
    ) { }
    ngAfterViewInit(){
      this.obtenerEquiposDisponibles();

    }
    ngDestroy():void{
      
    }
  ngOnInit(): void {
    this.obtenerAlmacenLista();
    this.obtenerModeloLista();
    this.obtenerVendedor();
    // this.form.controls.almacen.disable();

  }
  showDatePicker : boolean = false;
  currentPage:  number = 1;
  totalRecord!: number;
  line!:        number;
  lastLine!:    number;
  almacenListado: Almacen[] = [];
  modeloListado:  ModeloEquipo[] = [];
  listaVendedor:  VendedorLista[] = []

  // pagination: Pagination ={
  //   page: 1,
  //   pageSize: 10
  // }
   filter: any ={
    almacen:0,
    modelo:'',
    imei:'',
    suplidor:'',
    pageIndex: 1,
    pageSize: 10,
    fechaInicio:'',
    fechaFinal:''
  }
  equiposDisponibles: EquipoDisponible[]= [];

  form: FormGroup = this.fb.group({
    almacen:['',],
    suplidor:['',],
    imei:['',],
    modelo:['',],
    rangeDate:['']
  })
  myDateRangePickerOptions: IMyDrpOptions = {
    dateFormat: 'dd.mm.yyyy',
  };
  onDateRangeChanged(event: any){
    
    if(event.beginDate.year === 0){
      this.filter.fechaInicio = ""
      this.filter.fechaFinal = ""
    }else{
      // 06/05/2022
      this.filter.fechaInicio = `${event.beginDate.month}/${event.beginDate.day}/${event.beginDate.year}`
      this.filter.fechaFinal = `${event.endDate.month}/${event.endDate.day}/${event.endDate.year}`
      console.log(this.filter);
      
    }
  
  
    this.obtenerEquiposDisponibles();
  
  }
  setDateRange(): void {

  let date = new Date();
  this.form.patchValue({rangoFecha: {
    beginDate: {
          day: date.getDate(),
          month: date.getMonth() + 1,
          year: date.getFullYear()
      },
      endDate: {
        day: date.getDate(),
        month: date.getMonth() + 1,
        year: date.getFullYear()
      }
  }});
  
}

  getValueFilterForm(){
    let almacenValue =this.form.get('almacen')?.value;
    let suplidorValue =this.form.get('suplidor')?.value;
    let modeloValue =this.form.get('modelo')?.value;
    this.filter.almacen = almacenValue == null ? '':almacenValue;
    
    this.filter.suplidor = suplidorValue == null ? '':suplidorValue
    this.filter.modelo = modeloValue == null ? '':modeloValue
    this.filter.imei = this.form.get('imei')?.value;
  }

  obtenerEquiposDisponibles(){
    
    this.getValueFilterForm();
    console.log(this.filter);
    
    this.equipoService.getEquipoDisponible(this.filter)
        .subscribe(equipo => {
          if (equipo.length) {
            
            this.totalRecord = equipo[0].totalRecord;
            this.line = equipo[0].line;
            this.lastLine = equipo[0].lastLine;
            
          }
          this.equiposDisponibles = equipo


        })
  }
  onCheckboxDisponibleChange(event: Event){
    this.equipoTipo = !this.equipoTipo;

    if ((<HTMLInputElement>event.target).checked == true) {
      this.obtenerEquiposDisponibles();
    }
  }
  onCheckboxVendidosChange(event: Event){
  this.equipoTipo = !this.equipoTipo;
    
    if ((<HTMLInputElement>event.target).checked == true) {
    }
  }

  // onCheckboxChange(event: any ) {
  //   if(event.target.checked == false) {
  //       this.form.controls.almacen.disable();
  //       this.form.get('almacen')?.setValue("");
  //   }
  //   else{
  //       this.form.controls.almacen.enable();
  //     }
  // }
  validarCampos(nombreCampo: string) {
    return this.form.get(nombreCampo)?.invalid &&
      this.form.get(nombreCampo)?.touched
  }

  pageChanged(index: number){
    this.currentPage = index;
    this.filter.pageIndex = index;
    this.obtenerEquiposDisponibles()
    console.log(index);
    
  }
  obtenerAlmacenLista() {
    this.catalogosService.getAlmaceLista().subscribe((almacen) => {
      this.almacenListado = almacen;
    });
  }
  obtenerModeloLista() {
    this.catalogosService.getModeloLista().subscribe((modelo) => {
      this.modeloListado = modelo;
      // console.log(modelo);
      
    });
  }
  obtenerVendedor() {
    this.vendedorService.getVendedorLista()
      .subscribe((vendedor) => {
        this.listaVendedor = vendedor;
      })
  }
}
