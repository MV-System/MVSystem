import { Component, Input, OnInit } from '@angular/core';
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
  @Input() currentPage:  number=1;
  @Input() line!:  number;
  @Input() lastLine!:  number;
  @Input() facturas: FacturaConsulta[]=[];

  vendedores: VendedorLista[] = []
  isOpenModal:    boolean = false;
  onDetailButton: boolean = true;
  title ="Detalle de Factura";
  onCancel() {
    this.isOpenModal = !this.isOpenModal;
  }

  getIdFactura(id: number){

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
