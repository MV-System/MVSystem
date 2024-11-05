import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { VendedorLista } from 'src/app/core/interfaces/vendedor.interface';
import { VendedorService } from 'src/app/core/services/vendedor.service';
import { FacturaConsulta, DetalleFacturaList } from '../../../../../core/interfaces/mantenimiento';
import { ToastrService } from 'ngx-toastr';
import { RDialogService } from 'src/app/shared/components/r-dialog/r-dialog.service';
import { MantenimientoService } from 'src/app/core/services/mantenimiento.service';
import { Subscription } from 'rxjs';
import { LoginService } from 'src/app/auth/login.service';
import { ValidatorPermissionService } from 'src/app/core/services/validator-permission.service';

@Component({
  selector: 'app-facturacion-lista',
  templateUrl: './facturacion-lista.component.html',
  styleUrls: ['./facturacion-lista.component.css']
})
export class FacturacionListaComponent implements OnInit {
  // Aquí seguimos teniendo la propiedad facturaVisibility
  facturaVisibility: { [key: number]: boolean } = {};

  // La función para manejar ambos clics
  handleClick(facturaId: number, index: number) {
    // Primero, llama a la función que obtiene la factura
    this.getIdFactura(facturaId, index);

    // Luego, alterna la visibilidad de los detalles
    this.toggleDetalleFactura(facturaId);

    // Cambia el índice de la fila seleccionada para aplicar el color de fondo
    if (this.selectedRowIndex === index) {
      this.selectedRowIndex = null; // Si la misma fila se vuelve a hacer clic, la deselecciona
    } else {
      this.selectedRowIndex = index; // Selecciona la fila al hacer clic
    }
  }
  index!: number;
  numeroFactura!: number;
  isLoading: boolean = false; // Variable para controlar el estado de carga
  subs: Subscription[] = [];
  constructor(
    private validatorPermissionService: ValidatorPermissionService,
    private loginService: LoginService,
    private mantenimientoService: MantenimientoService,
    private rDialogService: RDialogService,
    private toast: ToastrService,
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
  @Input() detalleFactura: DetalleFacturaList[]=[];
  @Output() onFacturaButton =new EventEmitter<boolean>();
  @Output() numerofactura =new EventEmitter<number>();
  vendedores: VendedorLista[] = []

  selectedRowIndex: number | null = null;

  btnAnulaFactura(): boolean {
    return this.validatorPermissionService.validateUserRole("VNT_DETALLE_FACTURA_BTN_ANULAR");
  }

  toggleDetalleFactura(facturaId: number) {
    // Cambia el estado de visibilidad de los detalles de la factura
    this.facturaVisibility[facturaId] = !this.facturaVisibility[facturaId];
  }

  getIdFactura(numerofactura: number,index: number){
    this.selectedRowIndex = index; // Guarda el índice de la fila seleccionada
    this.index= index;
    this.onSelectFactura();
    if(numerofactura > 0){this.onFacturaButton.emit(true);}
    this.numerofactura.emit(numerofactura);

  }
  onSelectFactura(){
    $('table tbody').on('click', 'tr.put', (e)=> {
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
  anulaFactura(numeroFactura: number){
    this.rDialogService.openDialog(
      "Aviso",
      "¿Desea Anular esta factura?",
      () => {
        this.toast.info("no se anula la factura");
      },
      () => {

          numeroFactura = +(`${numeroFactura}`);
        // aqui va la logica para anular la factura
        this.isLoading = true; // Iniciar carga
    const sub = this.mantenimientoService.postAnlaFactura(numeroFactura,this.loginService.getUserIdSucursal,this.loginService.getUserName())
    .subscribe(blob =>{
       this.isLoading = false; // Terminar carga
       this.toast.info(`Se anuló la factura #${numeroFactura}`);
       setTimeout(() => {
        window.location.reload(); // Recarga la página después de 2 segundos
      }, 2000);
      // console.log("factura seleccionada",numeroFactura);
    },err=>{

      this.toast.error('Error al Anular la factura');
    });
    this.subs.push(sub);


      },
      "Si", // Etiqueta del botón para Anular la factura
      "No, Fue un error" // fue un error
    );

  }
  onShowVendedorFactura(vendedorId: number){

  }
}
