import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IMyDrpOptions } from 'mydaterangepicker';
import { Pagination } from 'src/app/core/interfaces/pagination.interfaces';
import { MantenimientoService } from '../../../../core/services/mantenimiento.service';
import { FacturaFilter, FacturaConsulta, DetalleFacturaList } from '../../../../core/interfaces/mantenimiento';
import { CatalogosService } from 'src/app/core/services/catalogos.service';
import { VendedorService } from 'src/app/core/services/vendedor.service';
import { Almacen } from 'src/app/core/interfaces/catalogo.interface';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { CreatorPDFFile } from '../../../../helpers/helper';
import { ValidatorPermissionService } from 'src/app/core/services/validator-permission.service';
import { LoginService } from 'src/app/auth/login.service';
import { RDialogService } from 'src/app/shared/components/r-dialog/r-dialog.service';
import { LoadingService } from 'src/app/shared/components/r-loading/loading.service';

@Component({
  selector: 'app-facturacion-consulta',
  templateUrl: './facturacion-consulta.component.html',
  styleUrls: ['./facturacion-consulta.component.css']
})
export class FacturacionConsultaComponent implements OnInit, OnDestroy {
  detalleFactura: DetalleFacturaList[]=[];
  vendedores: any[] = [];

  constructor(private fb: FormBuilder,
    private loading: LoadingService,
    private mantenimientoService: MantenimientoService,
    private catalogosService: CatalogosService,
    private vendedorService: VendedorService,
    private toast: ToastrService,
    private loginService: LoginService,
  private validatorPermissionService:ValidatorPermissionService,
  private rDialogService: RDialogService,) { }

   // Método que se llama cuando cambia el tamaño de la página

   onPageSizeChange(newPageSize: number) {
    this.paginate.pageSize = newPageSize;
    // Llamar a la función que maneja la paginación y carga de datos
    this.getFacturas();
  }

    SelectSucursal(): boolean {
      return this.validatorPermissionService.validateUserRole("CB_SUCURSAL");
    }
    CheckComprobante(): boolean {
      return this.validatorPermissionService.validateUserRole("ComprobanteCheck");
    }
  ngOnDestroy(): void {
    this.subs.forEach(sub => sub.unsubscribe())
  }
  ngOnInit(): void {
    this.getFacturas();
    this.getAlmacenes();
    this.getVendedores();
  }

  getVendedores() {
    this.vendedorService.getVendedorLista().subscribe((vendedores: any[]) => {
      this.vendedores = vendedores;
    });
  }

  ComprobanteCheck: number=1;
  isLoading: boolean = false; // Variable para controlar el estado de carga
  subs: Subscription[] = [];
  title: string = "Consulta Facturas";
  breadcrumbItem: string = "Consulta Facturas"
  breadcrumb: string = "Consulta"
  facturas: FacturaConsulta[]=[];
  almacenes!: Almacen[];
  tipoBusqueda:    number = 3;
  totalFacturado!: number;
  currentPage:     number = 1;
  pageIndex:       number = 1;
  pageSize:        number = 10;
  totalRecord!:    number;
  line!:           number;
  lastLine!:       number;
  numerofactura!:  number;
  IdAlmacen!:  number;
  iD_Vendedor!:  number;
  facturasCantidad:number = 0;
  rangeDatePlaceholder: Date =new Date()
  onFacturaButton: boolean = false;
  printing: boolean = false;
  myDateRangePickerOptions: IMyDrpOptions = {
    dateFormat: 'dd.mm.yyyy',
  };


// Obtener la fecha actual
 fechaHoy = new Date();
  // Crear una nueva fecha para el primer día del mes actual
  FechaInicio = new Date(this.fechaHoy.getFullYear(), this.fechaHoy.getMonth(), 1);

  // Utiliza el mismo formato que el filtro (YYYY/M/D)
  paginate: Pagination = {
    pageIndex: 1,
    pageSize: 10,
    fechaInicio: `${this.FechaInicio.getFullYear()}/${this.FechaInicio.getMonth() + 1}/${this.FechaInicio.getDate()}`,
    fechaFinal: `${this.fechaHoy.getFullYear()}/${this.fechaHoy.getMonth() + 1}/${this.fechaHoy.getDate()}`
  }
  form: FormGroup = this.fb.group({
    almacen: [this.loginService.getUserIdSucursal,],
    criterio: ['',],
    factura:['',],
    rangeDate: [''],
    iD_Vendedor: ['']
  });
  modelFacturaFilter(){
    const {criterio,almacen,iD_Vendedor} = this.form.value;
    const model:FacturaFilter = {
      almacen: Number(almacen),
      criterio: criterio,
      IdVendedor: Number(iD_Vendedor),
      fechaInicio: this.paginate.fechaInicio,
      fechaFinal: this.paginate.fechaFinal,
      pageIndex: this.paginate.pageIndex,
      pageSize: this.paginate.pageSize,
      empresa: this.loginService.getUserEmpresa,
      IdEmpresa:this.loginService.getUserIdEmpresa,
      IdSucursal:this.loginService.getUserIdSucursal,
      ComprobanteCheck: this.ComprobanteCheck,
    }
    return model;
  }
  getFacturas(){
    this.loading.showLoading();
    const sub = this.mantenimientoService.getFacturas(this.modelFacturaFilter())
  .subscribe(facturas=>{
   // this.isLoading = false; // Terminar carga
      let cantidad = facturas.length == 0 ? 0 : facturas[0].totalRecord;
      this.totalFacturado = facturas.length == 0 ? 0 : facturas[0].totalFacturado;
      this.facturasCantidad = cantidad;
      if (facturas.length) {
        this.totalRecord = facturas[0].totalRecord;
        this.line = facturas[0].line;
        this.lastLine = facturas[0].lastLine;
      }
      this.facturas = facturas;
    });
    this.subs.push(sub);
this.loading.hideLoading();
  }
  getDetalleFactura(numeroFactura: number){
    //this.isLoading = true; // Iniciar carga
    this.numerofactura =numeroFactura;
    const { almacen } = this.form.value;

    const sub = this.mantenimientoService.getDetalleFactura(numeroFactura,Number(almacen))
    .subscribe(detalle => {
      this.detalleFactura = detalle;
    })
    this.subs.push(sub);
  }
  printReportFacturaConsulta(){
    this.loading.showLoading();
    //this.isLoading = true; // Iniciar carga
    const sub = this.mantenimientoService.postFacturaConsultaReport(this.modelFacturaFilter())
    .subscribe(blob =>{
      CreatorPDFFile(blob);
    },err=>{
      this.printing = !this.printing;
      this.toast.error('Error al imprimir factura');
    });
    this.subs.push(sub);
    this.loading.hideLoading();
  }
  printFactura(){
     this.loading.showLoading();
    const sub = this.mantenimientoService.postFacturaReport(this.modelFacturaFilter(),this.numerofactura)
    .subscribe(blob =>{
      CreatorPDFFile(blob);
       this.loading.hideLoading();
    },err=>{

      this.toast.error('Error al imprimir factura');
    });
    this.subs.push(sub);

  }
  ReimprimeFactura() {
    this.rDialogService.openDialog(
      "Aviso",
      "¿Desea imprimir la factura mini o normal?",
      // Si selecciona "Normal", ejecuta printFactura
      () => {
        this.printFactura();
      },
      // Si selecciona "Mini", ejecuta printFacturaMini
      () => {
        this.printFacturaMini();
      },
      "Mini", // Etiqueta del botón para la opción Mini
      "Normal" // Etiqueta del botón para la opción Normal
    );

  }

  printFacturaMini(){
     this.loading.showLoading();
    this.printing = !this.printing;
    const sub = this.mantenimientoService.postFacturaMiniReport(this.modelFacturaFilter(),this.numerofactura)
    .subscribe(blob =>{
      CreatorPDFFile(blob);
   this.loading.hideLoading();
  },err=>{
      this.toast.error('Error al imprimir factura');
    });
    this.subs.push(sub);
  }
  pageChanged(index: number) {
  this.pageIndex = index;
  this.paginate.pageIndex = this.pageIndex;
  this.getFacturas();  // Llamar nuevamente para obtener las facturas con la nueva página
}
  onDateRangeChanged(event: any) {
    if (event.beginDate.year === 0) {
      this.paginate.fechaInicio = '';
      this.paginate.fechaFinal = '';
    } else {
      this.paginate.fechaInicio = `${event.beginDate.year}/${event.beginDate.month}/${event.beginDate.day}`;
      this.paginate.fechaFinal = `${event.endDate.year}/${event.endDate.month}/${event.endDate.day}`;
    }
    this.getFacturas();
  }

  getAlmacenes() {
    const sub = this.catalogosService.getSucursales().subscribe((almacen) => {
      this.almacenes = almacen;
    });
    this.subs.push(sub);
  }
  onCheckboxComprobanteChange(event: Event) {

   this.ComprobanteCheck = 2;
    this.getFacturas();
  }

  facturasFiltradas(): FacturaConsulta[] {
    const vendedorSeleccionadoId = this.form.get('iD_Vendedor')?.value;
    if (!vendedorSeleccionadoId) {
      return this.facturas;
    }
    // Buscar el nombre del vendedor según el ID seleccionado
    const vendedorObj = this.vendedores.find(v => String(v.iD_Vendedor) === String(vendedorSeleccionadoId));
    if (!vendedorObj) {
      return this.facturas;
    }
    const nombreVendedor = vendedorObj.nombres || vendedorObj.nombre;
    // Filtrar por el nombre del vendedor
    return this.facturas.filter(f => f.vendedor === nombreVendedor);
  }

  /**
   * Calcula el total facturado en el cliente sumando los montos de todas las facturas filtradas
   */
  getTotalFacturadoCliente(): number {
    return this.totalFacturado  || 0;

    //return this.facturasFiltradas().reduce((acc, factura) => acc + (factura.total || 0), 0);
  }

  /**
   * Devuelve la cantidad de facturas filtradas en el cliente
   */
  getCantidadFacturasCliente(): number {
     return this.totalRecord || 0;

  }

}
