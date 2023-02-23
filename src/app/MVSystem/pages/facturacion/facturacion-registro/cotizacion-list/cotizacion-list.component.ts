import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { CotizacionAmount } from 'src/app/core/interfaces/cotizacion.interface';
import { CotizacionService } from '../../../../../core/services/cotizacion.service';

@Component({
  selector: 'app-cotizacion-list',
  templateUrl: './cotizacion-list.component.html',
  styleUrls: ['./cotizacion-list.component.css']
})
export class CotizacionListComponent implements OnInit {

  constructor(private cotizacionService:CotizacionService) { }
  
  ngOnInit(): void {
    this.cotizacionService.isOpeningForm$
    .subscribe(resp =>{
      this.isOpenModal = resp;
    })
  }
  @Input() cotizaciones!:CotizacionAmount[];
  @Output() cotizacionSelected = new EventEmitter<CotizacionAmount>()
  isOpenModal: boolean = false;

  onSelect(cotizacion:CotizacionAmount){
    this.cotizacionSelected.emit(cotizacion);
    this.isOpenModal = false;
  }
}
