import { Component, OnInit, OnChanges, SimpleChanges, Input } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { EquipoRecepcionConsulta } from '../../../interfaces/equipo.interface';
import { EquipoService } from '../../../services/equipo.service';

@Component({
  selector: 'app-equipo-consulta-recibido',
  templateUrl: './equipo-consulta-recibido.component.html',
  styleUrls: ['./equipo-consulta-recibido.component.css']
})
export class EquipoConsultaRecibidoComponent implements OnInit, OnChanges {
  @Input() clearFilter: any;
  equiposRecibidos: EquipoRecepcionConsulta[] = [];
  index : number = 0;
  ultimaLinea : number = 0;
  totalRegistros : number = 0;

  filtro = {
    pageIndex: 1,
    pageSize: 10
  }

  constructor(private fb:FormBuilder,
              private equipoService: EquipoService) { }

  ngOnInit(): void {
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    //Add '${implements OnChanges}' to the class.
    const change = changes["clearFilter"];
    if (change && change.previousValue != change.currentValue) {
      this.resetForm();
    }

  }

  formEquiposRecibidos: FormGroup = this.fb.group({
    criterio: ['']
  })

  obtenerEquiposRecibidos(){
    this.equipoService.getEquiposRecibidos(this.formEquiposRecibidos.get('criterio')?.value, this.filtro).subscribe( res => {
      this.equiposRecibidos = res;
      if(this.equiposRecibidos.length){
        this.index = res[0].line
        this.ultimaLinea = res[0].lastLine
        this.totalRegistros = res[0].totalRecord
      }
    })
  }

  resetForm(){
    this.formEquiposRecibidos.reset({
      criterio: ''
    })
  }

  pageChanged(index: number) {
    console.log("next page",index);
    this.filtro.pageIndex = index;
    this.obtenerEquiposRecibidos();
  }
}
