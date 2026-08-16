import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
    this.getEquipoDisponible()
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

    almacen:[Validators.required], // Número del almacén
    suplidor: [Validators.required],    // Nombre del suplidor
    imei: [Validators.max(30)],       // Número de IMEI del equipo
    modelo: [Validators.required],        // Modelo del equipo
    pageIndex: 1,             // Índice de la página para la paginación
    pageSize: 10,             // Tamaño de la página (número de resultados)
    fechaInicio:'',// Fecha de inicio del filtro
    fechaFinal: '',// Fecha final del filtro
  });

  getEquipoDisponible() {
    // Crear el objeto EquipoDisponible con los valores correctos
  const EquipoModel: EquipoDisponibleParam = {
    almacen:2,// Number(this.formRegistro.get('almacen')?.value),
    suplidor:'',//(this.formRegistro.get('suplidor')?.value),
    imei: '',//(this.formRegistro.get('search')?.value),
    modelo:'',// (this.formRegistro.get('modelo')?.value),
    grupo:'',// (this.formRegistro.get('grupo')?.value),
    pageIndex: 1,
    pageSize: 10,
    fechaInicio: '',
    fechaFinal: ''
  };
  this.equiposService.getEquipoDisponible(EquipoModel).subscribe(
    (equipoDisponibleData) => {
        this.Equipos = equipoDisponibleData;
    },
    (error) => {
        console.error("Error al obtener equipos disponibles:", error);
    }
    );
  }
}
