import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IMyDrpOptions } from 'mydaterangepicker';
import { Pagination } from 'src/app/core/interfaces/pagination.interfaces';
import { MantenimientoService } from '../../../../core/services/mantenimiento.service';
import { FacturaFilter, FacturaConsulta, DetalleFacturaList } from '../../../../core/interfaces/mantenimiento';
import { CatalogosService } from 'src/app/core/services/catalogos.service';
import { Almacen } from 'src/app/core/interfaces/catalogo.interface';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { CreatorPDFFile } from '../../../../helpers/helper';
import { ValidatorPermissionService } from 'src/app/core/services/validator-permission.service';
import { LoginService } from 'src/app/auth/login.service';
import { RDialogService } from 'src/app/shared/components/r-dialog/r-dialog.service';
import { LoadingService } from 'src/app/shared/components/r-loading/loading.service';
import { VendedorService } from 'src/app/core/services/vendedor.service';
import { VendedorLista } from 'src/app/core/interfaces/vendedor.interface';

@Component({
  selector: 'app-facturacion-consulta',
  templateUrl: './facturacion-consulta.component.html',
  styleUrls: ['./facturacion-consulta.component.css']
})
export class FacturacionConsultaComponent implements OnInit, OnDestroy {
  detalleFactura: DetalleFacturaList[]=[];

  constructor(private fb: FormBuilder,
    private loading: LoadingService,
    private mantenimientoService: MantenimientoService,
    private catalogosService: CatalogosService,
    private toast: ToastrService,
    private loginService: LoginService,
  private validatorPermissionService:ValidatorPermissionService,
  private rDialogService: RDialogService,
  private vendedorService: VendedorService) { }

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
  ComprobanteCheck: number=1;
  isLoading: boolean = false; // Variable para controlar el estado de carga
  subs: Subscription[] = [];
  title: string = "Consulta Facturas";
  breadcrumbItem: string = "Consulta Facturas"
  breadcrumb: string = "Consulta"
  facturas: FacturaConsulta[]=[];
  todasLasFacturas: FacturaConsulta[]=[]; // Array para almacenar todas las facturas sin filtrar
  almacenes!: Almacen[];
  listaVendedores: VendedorLista[] = [];
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

  paginate:Pagination={


    pageIndex: 1,
    pageSize: 10,
    fechaInicio: this.FechaInicio.toISOString().split('T')[0],
    fechaFinal: this.fechaHoy.toISOString().split('T')[0]
  }
  form: FormGroup = this.fb.group({
    almacen: [this.loginService.getUserIdSucursal,],
    criterio: ['',],
    factura:['',],
    rangeDate: [''],
    vendedor: ['']
  });
  modelFacturaFilter(){
    const {criterio,almacen} = this.form.value;
    const model:FacturaFilter = {
      almacen: Number(almacen),
      criterio: criterio,
      vendedor: '', // No enviamos el vendedor al API
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
    //this.isLoading = true; // Iniciar carga
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
      
      // Almacenar todas las facturas sin filtrar
      this.todasLasFacturas = facturas;
      
      // Aplicar filtro por vendedor del lado del cliente
      this.aplicarFiltroVendedor();
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
    //this.isLoading = false; // Terminar carga
  }
  printReportFacturaConsulta(){
    this.loading.showLoading();
    //this.isLoading = true; // Iniciar carga
    const sub = this.mantenimientoService.postFacturaConsultaReport(this.modelFacturaFilter())
    .subscribe(blob =>{
      CreatorPDFFile(blob);
      //this.isLoading = false; // Terminar carga
    },err=>{
      this.printing = !this.printing;
      this.toast.error('Error al imprimir factura');
    });
    this.subs.push(sub);
    this.loading.hideLoading();
  }
  printFactura(){
     this.loading.showLoading();
   // this.isLoading = true; // Iniciar carga
    const sub = this.mantenimientoService.postFacturaReport(this.modelFacturaFilter(),this.numerofactura)
    .subscribe(blob =>{
      CreatorPDFFile(blob);
       this.loading.hideLoading();
     // this.isLoading = false; // Terminar carga
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
  
  getVendedores() {
    const sub = this.vendedorService.getVendedorLista().subscribe((vendedores) => {
      this.listaVendedores = vendedores;
    });
    this.subs.push(sub);
  }
  
  onCheckboxComprobanteChange(event: Event) {
    const target = event.target as HTMLInputElement;
    
    // Si el checkbox está marcado, activar filtro de comprobantes
    if (target.checked) {
      this.ComprobanteCheck = 2;
    } else {
      // Si el checkbox está desmarcado, volver al valor por defecto
      this.ComprobanteCheck = 1;
    }
    
    this.getFacturas();
  }

  aplicarFiltroVendedor() {
    const vendedorSeleccionado = this.form.get('vendedor')?.value;
    
    if (!vendedorSeleccionado || vendedorSeleccionado.trim() === '') {
      // Si no hay vendedor seleccionado, mostrar todas las facturas
      this.facturas = [...this.todasLasFacturas];
    } else {
      // Filtrar por vendedor seleccionado
      this.facturas = this.todasLasFacturas.filter(factura => 
        factura.vendedor === vendedorSeleccionado
      );
    }
    
    // Recalcular los totales basados en las facturas filtradas
    this.calcularTotalesFiltrados();
  }

  calcularTotalesFiltrados() {
    if (this.facturas.length === 0) {
      this.facturasCantidad = 0;
      this.totalFacturado = 0;
    } else {
      this.facturasCantidad = this.facturas.length;
      this.totalFacturado = this.facturas.reduce((total, factura) => total + factura.total, 0);
    }
  }

  onVendedorChange() {
    // Solo aplicar filtro del lado del cliente, sin llamar al API
    this.aplicarFiltroVendedor();
  }

  onCriterioChange() {
    // Llamar al API con el nuevo criterio pero mantener el filtro de vendedor
    this.getFacturas();
  }

}
