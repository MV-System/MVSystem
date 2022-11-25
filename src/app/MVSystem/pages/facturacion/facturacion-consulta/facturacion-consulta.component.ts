import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IMyDrpOptions } from 'mydaterangepicker';
import { Pagination } from 'src/app/MVSystem/interfaces/pagination.interfaces';
import { MantenimientoService } from '../../../services/mantenimiento.service';
import { FacturaFilter, FacturaConsulta, DetalleFacturaList } from '../../../interfaces/mantenimiento';
import { CatalogosService } from 'src/app/MVSystem/services/catalogos.service';
import { Almacen } from 'src/app/MVSystem/interfaces/catalogo.interface';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { CreatorPDFFile } from '../../../helpers/helper';

@Component({
  selector: 'app-facturacion-consulta',
  templateUrl: './facturacion-consulta.component.html',
  styleUrls: ['./facturacion-consulta.component.css']
})
export class FacturacionConsultaComponent implements OnInit, OnDestroy {
  detalleFactura: DetalleFacturaList[]=[];

  constructor(private fb: FormBuilder,
    private mantenimientoService: MantenimientoService,
    private catalogosService: CatalogosService,
    private toast: ToastrService) { }
   
  ngOnDestroy(): void {
    this.subs.forEach(sub => sub.unsubscribe())
  }
  ngOnInit(): void {
    this.getFacturas();
    this.getAlmacenes();
  }
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
  facturasCantidad:number = 0;
  rangeDatePlaceholder: Date =new Date()
  onFacturaButton: boolean = false;
  printing: boolean = false;

  paginate:Pagination={
    pageIndex: 1,
    pageSize: 10,
    fechaInicio: '',
    fechaFinal: ''
  }
  form: FormGroup = this.fb.group({
    almacen: [1,],
    criterio: ['',],
    factura:['',],
    rangeDate: ['']
  });



  modelFacturaFilter(){
    const {criterio,almacen,vendedor} = this.form.value;
    const model:FacturaFilter = {
      almacen: Number(almacen),
      criterio: criterio,
      fechaInicio: this.paginate.fechaInicio,
      fechaFinal: this.paginate.fechaFinal,
      pageIndex: this.paginate.pageIndex,
      pageSize: this.paginate.pageSize
    }
    return model;
  }
  getFacturas(){
    const sub = this.mantenimientoService.getFacturas(this.modelFacturaFilter())
  .subscribe(facturas=>{
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
  }
  getDetalleFactura(numeroFactura: number){
    this.numerofactura =numeroFactura;
    const { almacen } = this.form.value;
    const sub = this.mantenimientoService.getDetalleFactura(numeroFactura,Number(almacen))
    .subscribe(detalle => {
      this.detalleFactura = detalle;
    })
    this.subs.push(sub);

  }
  printReportFactura(){
    const sub = this.mantenimientoService.postFacturaConsultaReport(this.modelFacturaFilter())
    .subscribe(blob =>{
      CreatorPDFFile(blob);
    });
    this.subs.push(sub);
  }
  printFactura(){
    this.printing = !this.printing;
    const sub = this.mantenimientoService.postFacturaReport(this.modelFacturaFilter(),this.numerofactura)
    .subscribe(blob =>{
      CreatorPDFFile(blob);
      this.printing = !this.printing;
    },err=>{
      this.printing = !this.printing;
      this.toast.error('Error al imprimir factura');

    });
    this.subs.push(sub);
  }
  onChangeTipoBusqueda(tipo: number){
    this.tipoBusqueda = tipo;
    this.getFacturas();
  }
  pageChanged(index: number) {
    this.currentPage = index;
    this.paginate.pageIndex= this.pageIndex = index;
    this.getFacturas()
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
  myDateRangePickerOptions: IMyDrpOptions = {
    dateFormat: 'dd.mm.yyyy',
  };
  getAlmacenes() {
    const sub = this.catalogosService.getSucursales().subscribe((almacen) => {
      this.almacenes = almacen;
    });
    this.subs.push(sub);
  }

}
