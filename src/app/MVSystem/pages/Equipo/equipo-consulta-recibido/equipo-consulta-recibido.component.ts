import { Component, OnInit, OnChanges, SimpleChanges, Input } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { EquipoRecepcionConsulta, DefaultFilter } from '../../../interfaces/equipo.interface';
import { EquipoService } from '../../../services/equipo.service';
import { IMyDrpOptions } from 'mydaterangepicker';
import { ToastrService } from 'ngx-toastr';

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
  rangeDatePlaceholder: Date = new Date();
  generarReporteLoading: boolean = false;
  
  myDateRangePickerOptions: IMyDrpOptions = {
    dateFormat: 'dd.mm.yyyy',
  };

  filtro: DefaultFilter = {
    pageIndex: 1,
    pageSize: 10,
    fechaInicio : '',
    fechaFinal : ''
  }

  
  constructor(private fb:FormBuilder,
              private equipoService: EquipoService,
              private toastr : ToastrService) { }

  ngOnInit(): void {
    this.obtenerEquiposRecibidos();
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
    criterio: [''],
    rangeDate: [''],
  })

  onDateRangeChanged(event: any) {
    if (event.beginDate.year === 0) {
      this.filtro.fechaInicio = '';
      this.filtro.fechaFinal = '';
    } else {
      this.filtro.fechaInicio = `${event.beginDate.month}/${event.beginDate.day}/${event.beginDate.year}`;
      this.filtro.fechaFinal = `${event.endDate.month}/${event.endDate.day}/${event.endDate.year}`;
    }
    this.obtenerEquiposRecibidos();
  }


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


  obtenerReporte(){
    this.generarReporteLoading = true;
    this.equipoService.getEquiposRecibidosReporte(this.formEquiposRecibidos.get('criterio')?.value, this.filtro).subscribe( blob => {
        this.generarReporteLoading = false;
        var newBlob = new Blob([blob], { type: 'application/pdf' });
        const blobUrl = URL.createObjectURL(newBlob);
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = blobUrl;
        document.body.appendChild(iframe);
        iframe.contentWindow?.print();

    }, (err) => {
      this.toastr.error('Error','No se pudo generar el reporte');
    });
  }

  resetForm(){
    this.formEquiposRecibidos.reset({
      criterio: ''
    })
  }

  pageChanged(index: number) {
    this.filtro.pageIndex = index;
    this.obtenerEquiposRecibidos();
  }
}
