import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-equipo-consulta',
  templateUrl: './equipo-consulta.component.html',
  styleUrls: ['./equipo-consulta.component.css']
})
export class EquipoConsultaComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {}
  equipoTipo: number =1;

  onCheckboxEquipoChange(event: Event){
    this.equipoTipo = Number((<HTMLInputElement>event.target).value);
    if ((<HTMLInputElement>event.target).checked == true) {
    }
  }
}
