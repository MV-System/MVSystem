import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Almacen } from 'src/app/MVSystem/interfaces/catalogo.interface';
import { CatalogosService } from 'src/app/MVSystem/services/catalogos.service';
import { AccesoriosService } from '../../../services/accesorios.service';
import { Pagination } from '../../../interfaces/pagination.interfaces';
import { AccesorioAll } from 'src/app/MVSystem/interfaces/accesorio.interface';

@Component({
  selector: 'app-accesorio-consulta',
  templateUrl: './accesorio-consulta.component.html',
  styleUrls: ['./accesorio-consulta.component.css']
})
export class AccesorioConsultaComponent implements OnInit {

  constructor(
    private catalogosService: CatalogosService,
    private accesoriosService:AccesoriosService,
    private fb: FormBuilder) { }

  ngOnInit(): void {
    this.getAllAccesorios();
  }
  totalInventario: number = 0;
  almacenes: Almacen[] = [];
  accesorios: AccesorioAll[]=[];

  form: FormGroup = this.fb.group({
    almacen: [0,],
    accesorio:[,],
    totalAccesorio: [0,],
    totalInventario: [0,]
  });
  paginate:Pagination={
    pageIndex: 1,
    pageSize: 10
  }
  getAllAccesorios(){
    let accesorio = this.form.get('accesorio')?.value;
    let almacen = this.form.get('almacen')?.value;
    this.accesoriosService.getAllAccesorios(this.paginate,accesorio,almacen)
    .subscribe(accesorios=>{
      this.accesorios= accesorios;
      console.log(accesorios);
      
    })
  }
  obtenerAlmacenLista() {
    this.catalogosService.getAlmaceLista().subscribe((almacen) => {
      this.almacenes = almacen;
    });
  }

}
