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
}
