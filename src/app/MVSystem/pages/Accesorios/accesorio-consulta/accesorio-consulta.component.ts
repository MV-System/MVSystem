import { Component, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Almacen } from 'src/app/MVSystem/interfaces/catalogo.interface';
import { CatalogosService } from 'src/app/MVSystem/services/catalogos.service';
import { AccesoriosService } from '../../../services/accesorios.service';
import { Pagination } from '../../../interfaces/pagination.interfaces';
import { Accesorio } from 'src/app/MVSystem/interfaces/accesorio.interface';
import { Router } from '@angular/router';

@Component({
  selector: 'app-accesorio-consulta',
  templateUrl: './accesorio-consulta.component.html',
  styleUrls: ['./accesorio-consulta.component.css']
})
export class AccesorioConsultaComponent implements OnInit {


  constructor(
    private catalogosService: CatalogosService,
    private accesoriosService:AccesoriosService,
    private fb: FormBuilder,
    private router: Router) { }

  ngOnInit(): void {
    this.getAccesorios();
    this.obtenerAlmacenes();
    
  }
  almacenes:   Almacen[] = [];
  accesorios:  Accesorio[]=[];
  accesorio!:  Accesorio[];
  currentPage:     number = 1;
  totalInventario: number = 0;
  totalRecord!:    number;
  line!:           number;
  lastLine!:       number;
  pageIndex:       number = 1;
  pageSize:        number = 10;
  accesorioTipo:   number = 1;
  disponible:      number = 1;
  vendido:         number = 2;
  form: FormGroup = this.fb.group({
    almacen: [0,],
    accesorio:['',],
    totalAccesorio: [0,],
    totalInventario: [0,]
  });
 
  paginate:Pagination={
    pageIndex: 1,
    pageSize: 10
  }
  filter: any = {
    almacen: '',
    criterio:'',
 
  };


  pageChanged(index: number) {
    this.currentPage = index;
   this.paginate.pageIndex= this.pageIndex = index;
    this.getAccesorios()
  }
  getAccesorios(){
    let accesorio = this.form.get('accesorio')?.value;
    let almacen = this.form.get('almacen')?.value;
    
    this.accesoriosService.getAccesorios(this.paginate,accesorio,almacen)
    .subscribe(accesorios=>{
      if (accesorios.length) {
        this.totalRecord = accesorios[0].totalRecord;
        this.line = accesorios[0].line;
        this.lastLine = accesorios[0].lastLine;
      }
      this.accesorios= accesorios;
      // accesorios.forEach(({totalInventario}) => {
        this.totalInventario = accesorios[0].totalInventario;
      // });      
    })
  }
  getAccesorioByI(id: number){
    id = 12	
    this.accesorio = this.accesorios.filter(accesorio=> 12 == accesorio.id)
    console.log(this.accesorios.filter(accesorio=> 12 == accesorio.id));
    
  }
  obtenerAlmacenes() {
    this.catalogosService.getAlmaceLista().subscribe((almacen) => {
      this.almacenes = almacen;
    });
  }
  onCheckboxAccesorioChange(event: Event){
    this.accesorioTipo = Number((<HTMLInputElement>event.target).value);
  }
}
