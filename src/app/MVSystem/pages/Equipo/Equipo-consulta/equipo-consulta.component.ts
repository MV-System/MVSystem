import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { EquipoService } from '../../../services/equipo.service';
import { EquipoDisponible } from '../../../interfaces/equipo.interface';
import { CatalogosService } from 'src/app/MVSystem/services/catalogos.service';
import { Almacen, ModeloEquipo } from 'src/app/MVSystem/interfaces/catalogo.interface';

@Component({
  selector: 'app-equipo-consulta',
  templateUrl: './equipo-consulta.component.html',
  styleUrls: ['./equipo-consulta.component.css']
})
export class EquipoConsultaComponent implements OnInit {

  constructor(private fb: FormBuilder,
              private equipoService:EquipoService,
              private catalogosService: CatalogosService,
    ) { }

  ngOnInit(): void {
    this.obtenerEquiposDisponibles();
    this.obtenerAlmacenLista();
    this.obtenerModeloLista();
  }
  almacenListado: Almacen[] = [];
  modeloListado: ModeloEquipo[] = [];

  page: number = 1;
  listaEquipos: EquipoDisponible[]= [];

  formBusqueda: FormGroup = this.fb.group({
    criterio:['',],
    almacen:[,],
    modelo:[,]
  })



  obtenerEquiposDisponibles(){
    this.equipoService.getEquipoDisponible()
        .subscribe(equipo => {
      this.listaEquipos = equipo

        })
  }
  equiposDisponiblesAlmacen(almacen: number ){

    this.listaEquipos = this.listaEquipos.filter(x=>x.idAlmacen == 13);

  }
  pageChanged(index: number){
    this.page = index
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
    });
  }
}
