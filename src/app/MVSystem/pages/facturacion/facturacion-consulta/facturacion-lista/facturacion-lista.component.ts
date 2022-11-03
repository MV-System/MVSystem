import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { VendedorLista } from 'src/app/MVSystem/interfaces/vendedor.interface';
import { VendedorService } from 'src/app/MVSystem/services/vendedor.service';
import { FacturaConsulta } from '../../../../interfaces/mantenimiento';

@Component({
  selector: 'app-facturacion-lista',
  templateUrl: './facturacion-lista.component.html',
  styleUrls: ['./facturacion-lista.component.css']
})
export class FacturacionListaComponent implements OnInit {

  constructor(
    private vendedorService: VendedorService) { }
  ngOnInit(): void {
  }
  @Input() pageSize!:    number;
  @Input() pageIndex!:   number;
  @Input() totalRecord!: number;
  @Input() currentPage:  number = 1;
  @Input() line!:  number;
  @Input() lastLine!:  number;
  @Input() facturas: FacturaConsulta[]=[];
  @Output() onFacturaButton =new EventEmitter<boolean>();
  @Output() numerofactura =new EventEmitter<number>();
  vendedores: VendedorLista[] = []

  getIdFactura(numerofactura: number){
    this.onSelectFactura();
    if(numerofactura > 0){this.onFacturaButton.emit(true);}
    this.numerofactura.emit(numerofactura);

  }
  onSelectFactura(){
    $('table tbody').on('click', 'tr', (e)=> {
        if ($(e.currentTarget).hasClass('selected')) {
            $(e.currentTarget).removeClass('selected');
            $(e.currentTarget).addClass('selected');
        } else {
            $('tr.selected').removeClass('selected');
            $(e.currentTarget).addClass('selected');
        }
    });
  }
  obtenerVendedor() {
    this.vendedorService.getVendedorLista()
      .subscribe((vendedor) => {
        this.vendedores = vendedor;
      });
  }
  onShowVendedorFactura(vendedorId: number){

  }
}
