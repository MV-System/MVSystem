import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IMyDrpOptions } from 'mydaterangepicker';
import { Almacen, ModeloEquipo } from 'src/app/MVSystem/interfaces/catalogo.interface';
import { EquipoVendido } from 'src/app/MVSystem/interfaces/equipo.interface';
import { VendedorLista } from 'src/app/MVSystem/interfaces/vendedor.interface';
import { CatalogosService } from 'src/app/MVSystem/services/catalogos.service';
import { EquipoService } from 'src/app/MVSystem/services/equipo.service';
import { VendedorService } from 'src/app/MVSystem/services/vendedor.service';

@Component({
  selector: 'app-equipo-consulta-vendido',
  templateUrl: './equipo-consulta-vendido.component.html',
  styleUrls: ['./equipo-consulta-vendido.component.css']
})
export class EquipoConsultaVendidoComponent implements OnInit {

  constructor(private fb: FormBuilder,
    private equipoService:EquipoService,
    private catalogosService: CatalogosService,
    private vendedorService: VendedorService,
) { }
@Input() active: boolean= false;
  ngOnInit(): void {
    if (this.active =!this.active) {
      
      this.obtenerEquiposVendidos();
      this.obtenerAlmacenLista();
      this.obtenerModeloLista();
      this.obtenerVendedor();
    }
  }

  currentPage:  number = 1;
  totalRecord!: number;
  line!:        number;
  lastLine!:    number;
  almacenListado: Almacen[] = [];
  modeloListado:  ModeloEquipo[] = [];
  listaVendedor:  VendedorLista[] = [];
  equiposVendidos: EquipoVendido[]= [];

  filter: any ={
    almacen:0,
    modelo:'',
    suplidor:'',
    fechaRegistro:'',
    pageIndex: 1,
    pageSize: 10,
    fechaInicio:'',
    fechaFinal:''
  }
  form: FormGroup = this.fb.group({
    almacen:['',],
    suplidor:['',],
    fechaRegistro:['',],
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
      this.filter.fechaInicio = `${event.beginDate.month}/${event.beginDate.day}/${event.beginDate.year}`
      this.filter.fechaFinal = `${event.endDate.month}/${event.endDate.day}/${event.endDate.year}`
      console.log(this.filter);
      
    }
    this.obtenerEquiposVendidos();
  
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
pageChanged(index: number){
  this.currentPage = index;
  this.filter.pageIndex = index;
  this.obtenerEquiposVendidos()
  console.log(index);
  
}
getValueFilterForm(){
  let almacenValue =this.form.get('almacen')?.value;
  let suplidorValue =this.form.get('suplidor')?.value;
  let modeloValue =this.form.get('modelo')?.value;
  this.filter.almacen = almacenValue == null ? '':almacenValue;
  
  this.filter.suplidor = suplidorValue == null ? '':suplidorValue
  this.filter.modelo = modeloValue == null ? '':modeloValue
}
  obtenerEquiposVendidos(){
    
    this.getValueFilterForm();
    this.equipoService.getEquipoVendido(this.filter)
        .subscribe(equipo => {
          if (equipo.length) {
            
            this.totalRecord = equipo[0].totalRecord;
            this.line = equipo[0].line;
            this.lastLine = equipo[0].lastLine;
            
          }
          this.equiposVendidos = equipo


        })
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
