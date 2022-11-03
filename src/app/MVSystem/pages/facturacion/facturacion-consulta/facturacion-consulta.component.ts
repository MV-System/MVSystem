import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { IMyDrpOptions } from 'mydaterangepicker';
import { Pagination } from 'src/app/MVSystem/interfaces/pagination.interfaces';
import { MantenimientoService } from '../../../services/mantenimiento.service';
import { FacturaFilter, FacturaConsulta, DetalleFacturaList } from '../../../interfaces/mantenimiento';
import { CatalogosService } from 'src/app/MVSystem/services/catalogos.service';
import { Almacen } from 'src/app/MVSystem/interfaces/catalogo.interface';
import { CreatorPDFFile } from '../../../../shared/helper';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-facturacion-consulta',
  templateUrl: './facturacion-consulta.component.html',
  styleUrls: ['./facturacion-consulta.component.css']
})
export class FacturacionConsultaComponent implements OnInit {
  detalleFactura: DetalleFacturaList[]=[];

  constructor(private fb: FormBuilder,
    private mantenimientoService: MantenimientoService,
    private catalogosService: CatalogosService,
    private toast: ToastrService) { }
   

  ngOnInit(): void {
    this.getFacturas();
    this.getAlmacenes();
  }
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


  tiposBusqueda =[
    {name:"Todos",Id:3},
    {name:"Al por Mayor",Id:2},
    {name:"Al Detalle",Id:1},
    {name:"Nombre Cliente",Id:4}, 
    {name:"NO. Factura",Id:5},
    {name:"Reparaciones",Id:6},
    {name:"Desbloqueos",Id:7},
    {name:"Comprobantes",Id:8},
    {name:"Anuladas",Id:9},
    {name:"Telefono",Id:10},
  ]
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
      tipoBusqueda: this.tipoBusqueda,
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
  this.mantenimientoService.getFacturas(this.modelFacturaFilter())
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
  }
  getDetalleFactura(numeroFactura: number){
    this.numerofactura =numeroFactura;
    const { almacen } = this.form.value;
    this.mantenimientoService.getDetalleFactura(numeroFactura,almacen)
    .subscribe(detalle => {
      this.detalleFactura = detalle;
    })
  }
  printReportFactura(){
    this.mantenimientoService.postFacturaConsultaReport(this.modelFacturaFilter())
    .subscribe(blob =>{
      CreatorPDFFile(blob);
    })
  }
  printFactura(){
    this.printing = !this.printing;
    this.mantenimientoService.postFacturaReport(this.modelFacturaFilter(),this.numerofactura)
    .subscribe(blob =>{
      CreatorPDFFile(blob);
      this.printing = !this.printing;
    },err=>{
      this.printing = !this.printing;
      this.toast.error('Error al imprimir factura');

    })
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
    this.catalogosService.getSucursales().subscribe((almacen) => {
      this.almacenes = almacen;
    });
  }

}
