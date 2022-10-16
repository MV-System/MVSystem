import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-equipo-consulta',
  templateUrl: './equipo-consulta.component.html',
  styleUrls: ['./equipo-consulta.component.css']
})
export class EquipoConsultaComponent implements OnInit {

  constructor() { }
  ngOnInit(): void {}
  filter !:Event;
  equipoTipo: number = 1;
  disponible: number = 1;
  vendido:    number = 2;
  recibido: number = 3;

  onCheckboxEquipoChange(event: Event){
    this.equipoTipo = Number((<HTMLInputElement>event.target).value);
  }

  clearFilters(event: Event){
    this.filter = event;
  }
}
