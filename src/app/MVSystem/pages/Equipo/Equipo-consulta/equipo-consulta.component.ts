import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { stringify } from 'querystring';
import { Almacen, ModeloEquipo, Suplidor } from 'src/app/core/interfaces/catalogo.interface';
import { EquipoDisponible, EquipoDisponibleParam } from 'src/app/core/interfaces/equipo.interface';
import { CatalogosService } from 'src/app/core/services/catalogos.service';
import { EquipoService } from 'src/app/core/services/equipo.service';
import { Equipo } from '../../../../core/interfaces/equipo.interface';

@Component({
  selector: 'app-equipo-consulta',
  templateUrl: './equipo-consulta.component.html',
  styleUrls: ['./equipo-consulta.component.css']
})
export class EquipoConsultaComponent implements OnInit {

  constructor(
    private fb: FormBuilder,
    private catalogosService: CatalogosService,
    private equiposService: EquipoService,
  ) { }
  almacenes:   Almacen[] = [];
  Suplidores:   Suplidor[] = [];
  Modelos: ModeloEquipo[]=[];
  Equipos: EquipoDisponible[]=[];

  ngOnInit( ): void {
    this.obtenerAlmacenes()
    this. obtenerSuplidor()
    this.obtenerModelos()
  }

  filter !:Event;
  equipoTipotab: number = 1;
  disponible: number = 1;
  vendido:    number = 2;
  recibido: number = 3;

  onCheckboxEquipoChange(tab: number){
    this.equipoTipotab = tab;
  }

  clearFilters(event: Event){
    this.filter = event;
  }
  obtenerAlmacenes() {
    this.catalogosService.getAlmaceLista().subscribe((almacen) => {
      this.almacenes = almacen;
    });
  }
  obtenerSuplidor() {
    this.catalogosService.getSuplidorLista().subscribe((suplidor) => {
      this.Suplidores = suplidor;
    });
  }
  obtenerModelos() {
    this.catalogosService.getModeloLista().subscribe((modelo) => {
      this.Modelos = modelo;
    });
  }
  formRegistro: FormGroup = this.fb.group({
    almacen:[2, Validators.required], // Número del almacén
    suplidor: [2, Validators.required],    // Nombre del suplidor
    imei: [,Validators.max(30)],       // Número de IMEI del equipo
    modelo: [2, Validators.required],        // Modelo del equipo
    pageIndex: 1,             // Índice de la página para la paginación
    pageSize: 10,             // Tamaño de la página (número de resultados)
    fechaInicio: [,],// Fecha de inicio del filtro
    fechaFinal: [,],// Fecha final del filtro
  });
  modeloRegistroAccesorio() {
    // const EquipoModel: EquipoDisponibleParam = {
    //   almacen: this.formRegistro.get('almacen')?.value,
    //   suplidor:Number(  this.formRegistro.get('cantidad')?.value),
    //   imei: String(this.formRegistro.get('costo')?.value),
    //   modelo:Number( this.formRegistro.get('alDetalle')?.value),
    //   pageIndex:Number(  this.formRegistro.get('alPorMayor')?.value),
    //   pageSize: this.formRegistro.get('IMEI')?.value,
    // };
    // return EquipoModel;
  }
  getEquipoDisponible() {
    // Crear el objeto EquipoDisponible con los valores correctos
  const EquipoModel: EquipoDisponibleParam = {
    almacen: this.formRegistro.get('almacen')?.value,
    suplidor: Number(this.formRegistro.get('cantidad')?.value),
    imei: String(this.formRegistro.get('costo')?.value),
    modelo: Number(this.formRegistro.get('alDetalle')?.value),
    pageIndex: Number(this.formRegistro.get('alPorMayor')?.value),
    pageSize: this.formRegistro.get('IMEI')?.value,
    fechaInicio: '',
    fechaFinal: ''
  };
    //return EquipoModel;
    this.equiposService.getEquipoDisponible(EquipoModel).subscribe(
      (equipoDisponibleData) => {
        // Aquí manejas la respuesta del servidor
        console.log(equipoDisponibleData);
        // Puedes asignar el resultado a una variable local o procesarlo
      },
      (error) => {
        // Manejando el error
        console.error('Error al obtener el equipo disponible', error);
      }
    );
  }
}
