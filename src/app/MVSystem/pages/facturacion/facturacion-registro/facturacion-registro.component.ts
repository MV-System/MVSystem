import { Component, OnInit, OnDestroy } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { forkJoin, Subject, Observable } from 'rxjs';

import { ToastrService } from 'ngx-toastr';

import { AsumeITBIS, Garantia, TipoComprobante, TipoFactura, TipoPago } from 'src/app/core/interfaces/catalogo.interface';
import { VendedorLista } from 'src/app/core/interfaces/vendedor.interface';
import { DetalleFacturaList, FacturaRegistro } from 'src/app/core/interfaces/mantenimiento';
import { AccesorioLista } from '../../../../core/interfaces/catalogo.interface';

import { ClientesService } from '../../../../core/services/clientes.service';
import { VendedorService } from '../../../../core/services/vendedor.service';
import { CatalogosService } from 'src/app/core/services/catalogos.service';
import { MantenimientoService } from '../../../../core/services/mantenimiento.service';
import { Cliente } from '../../../../core/interfaces/cliente.interface';
import { takeUntil } from 'rxjs/operators';
import { CreatorPDFFile } from 'src/app/helpers/helper';
import { LoadingService } from '../../../../shared/components/r-loading/loading.service';
import { CotizacionService } from '../../../../core/services/cotizacion.service';
import { CotizacionAmount } from 'src/app/core/interfaces/cotizacion.interface';

@Component({
  selector: 'app-facturacion',
  templateUrl: './facturacion-registro.component.html',
  styleUrls: ['./facturacion-registro.component.css']
})
export class FacturacionRegistroComponent implements OnInit,OnDestroy {
  isNcfRequire: any;


  constructor(
    private fb: FormBuilder,
    private catalogosService: CatalogosService,
    private toastr: ToastrService,
    private clientesService: ClientesService,
    private vendedorService: VendedorService,
    private mantenimientoService: MantenimientoService,
    private loading:LoadingService,
    private cotizacionService:CotizacionService) { }
    

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  ngOnInit(): void {
    this.btnDisableTelefono();
    this.loadCatalogos();
    this.obtenerItbis();
    this.obtenerClientes();
    this.loadFacturaNumero();
   
  }
  facturaNumber$!: Observable<number>;
  destroy$: Subject<any> = new Subject<any>();

  customer!: Cliente;
  cotizaciones!:CotizacionAmount[];
  detalleFacturaRegistroLista: DetalleFacturaList[] = [];
  customers: Cliente[] = []
  facturaTipos: TipoFactura[] = [];
  vendedores: VendedorLista[] = []
  pagoTipos: TipoPago[] = [];
  garantias: Garantia[] = [];
  asumeItbis: AsumeITBIS = null!;
  accesorios: AccesorioLista[] = [];
  comprobanteTipos: TipoComprobante[] = [];
  btnDisabledTelefono: boolean = true;
  btnDisabledArticulo: boolean = true;
  isOpenModal: boolean = false;
  isFactura: boolean = true;
  isCredit: boolean = false;
  isLoading: boolean = false;

  subTotal: number = 0;
  descuento: number = 0;
  total: number = 0;
  itbis: number = 0;
  abono: number = 0;


  form: FormGroup = this.fb.group({
    idCliente: [''],
    nombre: [''],
    apellido: [''],
    telefono: ['',Validators.required],
    vendedor: [,Validators.required],
    almacen: [,],
    tipoFactura: [1,],
    tipoPago: [1,],
    fechaFacturacion: this.currentDate(),
    comprobante: [0,],
    fechaLimitePago: this.currentDate(),
    garantia: [8,],
    nota: ['',],
    empresa: [,],
    codigo: [,],
    RNC: ['',],
    subTotal: [,],
    subTotalArticulo: [,],
    totalArticulo: [,],
    numConfirmacion:[,],
    // articulos: this.fb.array([]),
    articulos: this.fb.array([this.fb.group({
      cantidad: [1],
      descripcion: [''],
      descuento: [0],
      fechaRegistro: [new Date().toDateString()],
      idEquipo: [0],
      idGarantia: [0],
      idTipo: [0],
      numeroFactura: [0],
      precio: [0],
      subTotal: [0],
      total: [0],
      articulo: [''],
      precioDetalle: [0],
      precioMayor: [0],
    })]),
    aplicarItbis: [false,],
  });

  get articulos(): FormArray {
    return this.form.controls["articulos"] as FormArray;
  }
  agregarAbono(){

  }
  onToggle(e:boolean){
    if(e == true){
      this.isFactura = !this.isFactura;
    }
    else{
      this.isFactura = !this.isFactura;

    }
    
  }
  onClean(){
    this.form.reset({
      aplicarItbis:false,
      comprobante:0,
      fechaFacturacion: this.currentDate(),
      tipoFactura: 1,
      tipoPago: 1,
      garantia:8,
      vendedor:'',
      nombre:'',
      apellido:'',
      fechaLimitePago: this.currentDate(),
      articulos: this.fb.array([this.fb.group({
        cantidad: [1],
        descripcion: [''],
        descuento: [0],
        fechaRegistro: [new Date().toDateString()],
        idEquipo: [0],
        idGarantia: [0],
        idTipo: [0],
        numeroFactura: [0],
        precio: [0],
        subTotal: [0],
        total: [0],
        articulo: [''],
        precioDetalle: [0],
        precioMayor: [0],
      })]),

    });
    if(this.customer){
    this.customer.nombres ='';
    this.customer.apellidos ='';
    this.customer.numero_Telefono =0;
    }
    this.cleanAmounts();
  }
  cleanAmounts(){
    this.abono = 
    this.subTotal = 
    this.descuento = 
    this.total = 
    this.itbis = 0
  }

   currentDate() {
    let date = new Date();
    let currrentDate = String(date.getFullYear()).padStart(2, '0') + '-' +
      String(date.getMonth() + 1).padStart(2, '0') + '-' +
      String(date.getDate()).padStart(2, '0');
    return currrentDate;
  }
  isFechaLimitePago() {
    const {tipoPago ,fechaLimitePago}=this.form.value;
    if (tipoPago== 2)  fechaLimitePago?.enable()
    
    fechaLimitePago?.disable()
  }
  obtenerItbis() {
    this.catalogosService.getAsumeITBIS()
      .pipe(takeUntil(this.destroy$))
      .subscribe(itbis => {
        this.asumeItbis = itbis;
      })
  }
  onAddCustomer(customer: Cliente){
    this.customer = customer;
    this.clientesService.isOpeningForm$.next(false);

  }
  onAdd(){
    this.clientesService.isOpeningForm$.next(true);
    this.form.get('telefono')?.reset()
  }
  
  onSubmit(){
    const toast = this.toastr
    .success('title', 'body', { closeButton: true });
toast.onTap.subscribe((action) => console.log(action));
    if(this.form.valid){

    if(this.isFactura){
      this.generateFactura()
    }
    else{
      this.generateCotizacion()
    }
  }
  else{
    console.log('markAllAsTouched')
    this.form.markAllAsTouched()
  }

  }
  calcularPrecioSegunTipofactura(precioDetalle: number, precioMayor: number) {
    return Number((this.form.get('tipoFactura')?.value == 1 ? precioDetalle : 0) ||
      (this.form.get('tipoFactura')?.value == 2 ? precioMayor : 0))
  }

  addArticuloImei = (imei: string) => {
    return new Promise((resolve) => {
      this.catalogosService.buscarEquipoDisponible(imei, '2')
      .pipe(takeUntil(this.destroy$))
      .subscribe(equipos => {
        if (equipos && equipos.precioDetalle > 0) {
          const equipo = equipos

          const articulo: AccesorioLista = {
            accesorio_Descripcion: `${equipo.marca}`,
            cantidad: 1,
            id: equipo.imei,
            codigo_Barra: 0,
            modelo: equipo.modelo,
            precio_Detalle: equipo.precioDetalle,
            precio_Por_Mayor: equipo.precioPorMayor,
            codigo: null!,
            idTipo: 1,
          }

          this.accesorios.push(articulo)
          resolve(articulo.id + '/' +
            articulo.accesorio_Descripcion + '/' +
            articulo.modelo + '/' +
            articulo.precio_Detalle + '/' +
            articulo.precio_Por_Mayor + '/' +
            articulo.cantidad + '/' +
            articulo.idTipo)
        }
        else {
          this.toastr.error(`El imei ${imei} no es válido o ya se vendió`)
        }

      })
    })
  }

  obtenerDetalleFactura(index: number) {

    
    const currentFormGroup: FormGroup = this.articulos.controls[index] as FormGroup
    
    currentFormGroup.controls["cantidad"].enable()

    const currentArticulo = currentFormGroup.getRawValue()
    
    let articulo = currentArticulo.articulo;
    console.log(articulo);

    if (!currentArticulo || !articulo)
      return


      currentArticulo.idTipo = 2;
      currentArticulo.idGarantia = 1;
      currentArticulo.idEquipo = articulo.id;
      currentArticulo.descripcion = articulo.accesorio_Descripcion + '  ' + articulo.modelo;
      currentArticulo.precioDetalle = articulo.precio_Detalle;
      currentArticulo.precioMayor = articulo.precio_Por_Mayor;

    for (let articuloAddIndex in this.articulos.controls) {
      if (articuloAddIndex == index.toString())
        continue

      let currentArticuloList = this.articulos.controls[articuloAddIndex].value
      console.log({currentArticuloList:currentArticuloList});
      console.log({currentArticuloidEquipo:currentArticulo.idEquipo});
      console.log({currentArticuloListidEquipo:currentArticuloList.idEquipo});
      
      if (currentArticulo.idEquipo == currentArticuloList.idEquipo) {
        this.borrarArticulo(index)
        this.toastr.error("Este articulo ya fue registrado")
      }
    }

    currentArticulo.precio = this.calcularPrecioSegunTipofactura(currentArticulo.precioDetalle, currentArticulo.precioMayor);

    currentArticulo.subTotal = this.calcularSubTotalArticulo(currentArticulo.precio, currentArticulo.cantidad);

    this.articulos.controls[index].setValue(currentArticulo)
    this.obtenerCantidadArticulo(currentArticulo);
    this.obtenerCantidadArticuloStock(index)

    this.refreshGeneralValues();


    //Tiene que estar al final. EnmaJim note
    if (currentArticulo.idTipo == 1)
      currentFormGroup.controls["cantidad"].disable()
  }

  calcularSubTotalArticulo(precio: number, cantidad: number) {
    const subTotal = precio * cantidad;
    return subTotal
  }

  onChangeTipoPago() {

    if (this.form.get('tipoPago')?.value == "2") {
      this.isCredit = true;
    }else{

      this.isCredit = false;
    }

  }
  hasNumberConfirmation(): boolean{
    return Number(this.form.controls.tipoPago.value) !== 1 && 
    Number(this.form.controls.tipoPago.value) !== 2;
  }

  agregarArticulo() {
  const isItemEmpty: boolean = this.articulos.controls.some(({value})=> value.articulo == "");
  if(!isItemEmpty){
    const articulo = this.fb.group({
      cantidad: [1],
      descripcion: [''],
      descuento: [0],
      fechaRegistro: [new Date().toDateString()],
      idEquipo: [0],
      idGarantia: [0],
      idTipo: [0],
      numeroFactura: [0],
      precio: [0],
      subTotal: [0],
      total: [0],
      articulo: [''],
      precioDetalle: [0],
      precioMayor: [0],
    });

    this.articulos.insert(0, articulo);
  }
    // setTimeout(() => {
    //   document.querySelector('#articulo')?.querySelector('input')?.focus()
    // }, 200);
  }


  
  obtenerCantidadArticulo(currentArticulo: any) {
    let cantidadStockAccesorio = currentArticulo.articulo.cantidad;
    let cantidadElegida = currentArticulo.cantidad

    this.calculoTotal(currentArticulo.subTotal, currentArticulo.descuento);
    return Number(cantidadElegida) > cantidadStockAccesorio ? this.toastr.info(`Inventario insuficiente, cantidad disponible:  ${cantidadStockAccesorio}`) : Number(cantidadElegida)
  }

  calculoTotal(subTotal: number, descuento: number) {
    const total = subTotal - descuento;
    return total
  }

  modeloRegistroFacturacion(): FacturaRegistro {
    
    const model: FacturaRegistro = {
      numeroFactura: 0,
      idCliente: this.customer.id_Cliente,
      idVendedor: Number(this.form.get('vendedor')?.value),
      idAlmacen: 1,//Number(this.form.get('almacen')?.value),
      idTipoFactura: Number(this.form.get('tipoFactura')?.value),
      idTipoPago: Number(this.form.get('tipoPago')?.value),
      fechaRegistro: this.form.get('fechaFacturacion')?.value,
      ncfTipoNumero: Number(this.form.get('comprobante')?.value),
      RNC: this.form.get('RNC')?.value,
      fechaLimitePago: this.form.get('fechaLimitePago')?.value,
      garantia: this.form.get('garantia')?.value,
      nota: this.form.get('nota')?.value,
      descripcion: "",
      itbis: this.itbis,
      subTotal: this.subTotal,
      total: this.total,
      abono: this.abono,
      descuento: this.descuento,
      cantidadArticulos: this.articulos.length,
      detalleFacturaList: [],
    }

    model.Cliente = {
      apellidos: this.form.get('apellido')?.value,
      nombres: this.form.get('nombre')?.value,
      iD_Tipo_Cliente: 1,
      limite_Credito: 0,
      numero_Telefono: this.form.get('telefono')?.value,
      iD_Tipo_Telefono: 1,
      extencion: 0,
      direccion_Detalle: '',
      email_Detalle: '',
      usuario: this.form.get('vendedor')?.value,
    }
    console.log(this.customer.id_Cliente);
    
    return model;
  }
  modeloArticulos(control: AbstractControl){
    const model ={
        cantidad: Number(control.get('cantidad')?.value),
        descripcion: control.get('descripcion')?.value,
        numeroFactura: 0,
        idEquipo: control.get('idEquipo')?.value,
        idTipo: control.get('idTipo')?.value,
        idGarantia: control.get('idGarantia')?.value,
        subTotal: control.get('subTotal')?.value,
        precio: control.get('precio')?.value,
        descuento: control.get('descuento')?.value,
        idVendedor: control.get('')?.value,
        idTipoFactura: control.get('')?.value,
        itbis: 0,
        total: control.get('total')?.value,
        fechaRegistro: this.form.get('fechaFacturacion')?.value,
        Usuario: 'f',
      }
      return model;
  }


  obtenerClientesPorNombreTelefono() {
    const { telefono } = this.form.value;
      this.clientesService.getClientesPorNombreTelefono(telefono)
      .pipe(takeUntil(this.destroy$))
        .subscribe(async customer => {
          
         await this.loadCotizacionCliente(telefono);
          this.customer = customer[0];
        },error =>{
          this.toastr.error(error);
        });
  }
  loadCotizacionCliente(telefono: string):Promise<boolean>{
    return new Promise((resolve,reject)=>{
      this.cotizacionService.getCotizacionFacturaConsulta(telefono)
      .subscribe(cotizaciones =>{
        if(cotizaciones.length){
          resolve(true)
          this.cotizaciones = cotizaciones;
          this.cotizacionService.isOpeningForm$.next(true);
          //#TODO  abrir modal con la lsita de cotizaciones
          //#TODO despues de selccionar una buscar el detalle y asignar los datos en la pantalla
          // this.loadDetalleCotizacion()
        }
        resolve(false)
      })
    })
  }
  loadDetalleCotizacion(numeroRegistro:number){
    this.cotizacionService.getDetalleCotizacionConsulta(numeroRegistro,1).subscribe(resp=>{
      console.log(resp);
      
    })
  }
  refreshGeneralValues() {
    console.log(this.form.get('aplicarItbis')?.value);
    
    this.abono = this.subTotal = this.descuento = this.total = this.itbis = 0

    for (let a = 0; a < this.articulos.length; a++) {
      const articulo = this.articulos.controls[a].value

      this.subTotal += articulo.subTotal
      this.descuento += articulo.descuento
      this.total += articulo.total

      // abono +=articulo.abono
    }

    if (this.form.get('aplicarItbis')?.value) {
      const itbis = this.asumeItbis.itbiS_Valor * 100

      if (this.asumeItbis.asumeITBIS == 'S') {
        const amountNew = this.total / (itbis / 100 + 1);

        this.itbis = this.total - amountNew;
        this.total = amountNew;
      }
      else {
        this.itbis = (this.total * itbis) / 100;
        this.total = this.total + this.itbis;
      }

      this.itbis = Number(this.itbis.toFixed(2))
      this.total = Number(this.total.toFixed(2))
    }
  }

  borrarArticulo(index: number) {
    this.articulos.removeAt(index)

    if (this.articulos.length === 0)
      this.agregarArticulo()

    this.refreshGeneralValues();
  }

  onCheckboxChange(event: any, campo: any) {
    if (event.target.checked == false) {
      this.form.get(campo)?.disable();
    }
    else {
      this.form.get(campo)?.enable();
    }
  }
  onCheckboxChangeComprobante() {
    const { comprobante } = this.form.value;
    const typesNotRequireNCF = ['0','2']
    if (!typesNotRequireNCF.includes(comprobante)) {
      this.isNcfRequire = true;
    }
    else {
      this.isNcfRequire = false;
    }


  }

  validarCampos(nombreCampo: string) {
    return this.form.get(nombreCampo)?.invalid &&
      this.form.get(nombreCampo)?.touched
  }

  validarCamposArticulo(detalleFactura: any, nombreCampo: string) {
    const campo = detalleFactura.get(nombreCampo)
    return campo.invalid && campo.touched
  }

  btnDisableTelefono() {
    return (this.form.get('telefono')?.value > 9) ?
      this.btnDisabledTelefono = false :
      this.btnDisabledTelefono = true;
  }

   private loadCatalogos(){
    this.loading.showLoading();
    forkJoin([
    this.catalogosService.getGarantiaLista(),
    this.catalogosService.getTipoFacturaLista(),
    this.catalogosService.getTipoComprobanteLista(),
    this.vendedorService.getVendedorLista(),
    this.catalogosService.getTipoPagoLista(),
    this.catalogosService.getAccesorioLista()
    ])
    .pipe(takeUntil(this.destroy$))
    .subscribe( resp => {
      this.garantias = resp[0];
      this.facturaTipos = resp[1];
      this.comprobanteTipos = resp[2];
      this.vendedores = resp[3];
      this.pagoTipos = resp[4];
      this.accesorios = resp[5];
      this.loading.hideLoading();

    } )
  }
  obtenerCantidadArticuloStock(index: number) {
    const currentArticulo = this.articulos.controls[index].value
    const subTotal = this.calcularSubTotalArticulo(currentArticulo.precio, currentArticulo.cantidad);

    if (!currentArticulo.articulo) {
      this.articulos.controls[index].patchValue({
        descuento: 0,
        cantidad: 1,
      })

      return
    }


    let cantidadStockAccesorio = currentArticulo.articulo.cantidad;
    let cantidadElegida = currentArticulo.cantidad;

    const total = this.calculoTotal(subTotal, currentArticulo.descuento);
    this.articulos.controls[index].patchValue({
      total,
      subTotal,
    })

    this.refreshGeneralValues();
    return Number(cantidadElegida) > cantidadStockAccesorio ? this.toastr.info(`Inventario insuficiente, cantidad disponible:  ${cantidadStockAccesorio}`) : Number(cantidadElegida)
  }


  generateFactura() {
    const data = this.loadDataToPrint()
    console.log(data);
    
    // this.loading.showLoading('Procesando factura...');
    this.isLoading = !this.isLoading;
    this.mantenimientoService.postFactura(data)
    .pipe(takeUntil(this.destroy$))
      .subscribe((blobResponse) => {
        this.onClean();

        this.articulos.clear();
        // this.obtenerFechaDiaActual()
        this.agregarArticulo()

        CreatorPDFFile(blobResponse);
        // this.loading.hideLoading();
        this.isLoading = !this.isLoading;

        this.toastr.success('Factura generada con exito!');
        this.loadFacturaNumero();
      },error=>{
        // this.loading.hideLoading();
        this.isLoading = !this.isLoading;

        this.toastr.error(error)
      })
  }
  loadDataToPrint(){
    const factura = this.modeloRegistroFacturacion()

    for (let control of this.articulos.controls) {
      factura.detalleFacturaList.push(this.modeloArticulos(control))
    }
    return factura;
  }
  generateCotizacion() {

    const data =this.loadDataToPrint()
    console.log(data);
    
    // this.loading.showLoading('Procesando cotización...');
    // this.mantenimientoService.postCotizacionReport(data)
    // .pipe(takeUntil(this.destroy$))
    //   .subscribe((blobResponse) => {
    //     this.form.reset({
    //       tipoFactura: 1,
    //       tipoPago: 1,
    //       comprobante: 0,
    //       garantia: 8,
    //       aplicarItbis: false,
    //     })

    //     this.articulos.clear()
    //     // this.obtenerFechaDiaActual()
    //     this.agregarArticulo()

    //     CreatorPDFFile(blobResponse);
    //     this.loading.hideLoading();

    //   },error=>{
    //     this.loading.hideLoading();
    //     this.toastr.error(error)
    //   })
  }
  loadFacturaNumero(){
    this.facturaNumber$ =this.mantenimientoService.getFacturaNumero()
  }
  BuscarCliente() {
    if (this.form.get('telefono')?.value.length === 10)
      this.obtenerClientesPorNombreTelefono()
  }

  obtenerClientes() {
    this.clientesService.getClientesPorNombreTelefono('')
    .pipe(takeUntil(this.destroy$))
    .subscribe(clientes => {
      this.customers = clientes
    })
  }

}
