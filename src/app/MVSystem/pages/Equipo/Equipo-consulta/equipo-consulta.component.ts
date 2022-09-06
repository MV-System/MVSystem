import { Component, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-equipo-consulta',
  templateUrl: './equipo-consulta.component.html',
  styleUrls: ['./equipo-consulta.component.css']
})
export class EquipoConsultaComponent implements OnInit {
  filter :any;

  constructor() { }

  ngOnInit(): void {}
  equipoTipo: number =1;

  onCheckboxEquipoChange(event: Event){
    this.equipoTipo = Number((<HTMLInputElement>event.target).value);
  }

  clearFilters(e: any){
    this.filter = e
  }
}
