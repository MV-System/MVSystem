import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-facturacion-lista',
  templateUrl: './facturacion-lista.component.html',
  styleUrls: ['./facturacion-lista.component.css']
})
export class FacturacionListaComponent implements OnInit {

  constructor() { }
  ngOnInit(): void {
  }
  @Input() pageSize!:    number;
  @Input() pageIndex!:   number;
  @Input() totalRecord!: number;
  @Input() currentPage:  number=1;
  @Input() line!:  number;
  @Input() lastLine!:  number;
  @Input() facturas: any[]=[];
  isOpenModal:    boolean = false;
  onDetailButton: boolean = true;
  title ="Detalle de Factura";
  onCancel() {
    this.isOpenModal = !this.isOpenModal;
  }

  getIdFactura(id: number){

  }
}
