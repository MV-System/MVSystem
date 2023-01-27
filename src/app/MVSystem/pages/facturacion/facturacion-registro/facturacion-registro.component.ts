import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { forkJoin, Subject, Observable } from 'rxjs';

import { ToastrService } from 'ngx-toastr';

import { AsumeITBIS, Garantia, TipoComprobante, TipoFactura, TipoPago } from 'src/app/core/interfaces/catalogo.interface';
import { VendedorLista } from 'src/app/core/interfaces/vendedor.interface';
import { DetalleFacturaList, FacturaRegistro } from 'src/app/core/interfaces/mantenimiento';
import { AccesorioLista } from '../../../../core/interfaces/catalogo.interface';
import { ClienteConsultaCriterio } from 'src/app/core/interfaces/cliente.interface';

import { ClientesService } from '../../../../core/services/clientes.service';
import { VendedorService } from '../../../../core/services/vendedor.service';
import { CatalogosService } from 'src/app/core/services/catalogos.service';
import { MantenimientoService } from '../../../../core/services/mantenimiento.service';
import { Cliente } from '../../../../core/interfaces/cliente.interface';
import { takeUntil } from 'rxjs/operators';
import { CreatorPDFFile } from 'src/app/helpers/helper';
import { LoadingService } from '../../../../shared/components/r-loading/loading.service';

@Component({
  selector: 'app-facturacion',
  templateUrl: './facturacion-registro.component.html',
  styleUrls: ['./facturacion-registro.component.css']
})
export class FacturacionRegistroComponent implements OnInit,OnDestroy {

  constructor(
    private fb: FormBuilder,
    private catalogosService: CatalogosService,
    private toastr: ToastrService,
    private clientesService: ClientesService,
    private vendedorService: VendedorService,
    private mantenimientoService: MantenimientoService,
    private loading:LoadingService) { }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  ngOnInit(): void {
    this.btnDisableTelefono();
    this.loadCatalogos();
    this.deshabilitadorInputs();
    this.obtenerItbis();
    this.agregarArticulo();
    this.obtenerClientes();
    this.loadFacturaNumero();
   
  }
  facturaNumber$!: Observable<number>;

  destroy$: Subject<any> = new Subject<any>();
  get articulos(): FormArray {
    return this.form.controls["articulos"] as FormArray;
  }
  customerAdded!: Cliente;
  customer!: Cliente;
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
  clienteReadOnly: boolean = true
  isOpenModal: boolean = false;

  subTotal: number = 0;
  descuento: number = 0;
  total: number = 0;
  itbis: number = 0;
  abono: number = 0;


  form: FormGroup = this.fb.group({
    idCliente: [''],
    nombre: [''],
    apellido: [''],
    telefono: ['', Validators.required],
    vendedor: [,],
    almacen: [,],
    tipoFactura: [1,],
    tipoPago: [1,],
    fechaFacturacion: this.currentDate(),
    comprobante: [0,],
    fechaLimitePago: [,],
    garantia: [8,],
    nota: ['',],
    empresa: [,],
    codigo: [,],
    RNC: ['',],
    subTotal: [,],
    subTotalArticulo: [,],
    totalArticulo: [,],
    articulos: this.fb.array([]),
    aplicarItbis: [false,],
  });


   currentDate() {
    let date = new Date();
    let output = String(date.getFullYear()).padStart(2, '0') + '-' +
      String(date.getMonth() + 1).padStart(2, '0') + '-' +
      String(date.getDate()).padStart(2, '0');

    // this.form.get('fechaFacturacion')?.setValue(output);
    // this.form.get('fechaLimitePago')?.setValue(output);
    return output;
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
  console.log(customer);
  this.clientesService.isOpeningForm$.next(false);

  }
  onAdd(){
    this.clientesService.isOpeningForm$.next(true);
    this.form.get('telefono')?.reset()
  }
  onSubmit(){

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

    if (!currentArticulo || !articulo)
      return


    currentArticulo.idTipo = articulo.split('/')[6];
    currentArticulo.idGarantia = 1;
    currentArticulo.idEquipo = articulo.split('/')[0];
    currentArticulo.descripcion = articulo.split('/')[1] + '  ' + articulo.split('/')[2];
    currentArticulo.precioDetalle = articulo.split('/')[3];
    currentArticulo.precioMayor = articulo.split('/')[4];

    for (let articuloAddIndex in this.articulos.controls) {
      if (articuloAddIndex == index.toString())
        continue

      let currentArticuloList = this.articulos.controls[articuloAddIndex].value
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

  onFechaLimitepago() {

    if (this.form.get('tipoPago')?.value == 2) {
      this.form.get('fechaLimitePago')?.enable()
    }
    else {
      this.form.get('fechaLimitePago')?.disable()
    }

  }


  agregarArticulo() {
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

    setTimeout(() => {
      document.querySelector('#articulo')?.querySelector('input')?.focus()
    }, 200);
  }


  //TODO
  obtenerCantidadArticulo(currentArticulo: any) {
    let cantidadStockAccesorio = currentArticulo.articulo.split('/')[5];
    let cantidadElegida = currentArticulo.cantidad

    this.calculoTotal(currentArticulo.subTotal, currentArticulo.descuento);
    return Number(cantidadElegida) > cantidadStockAccesorio ? this.toastr.info(`Inventario insuficiente, cantidad disponible:  ${cantidadStockAccesorio}`) : Number(cantidadElegida)
  }

  // obtenerDescuentoArticulo(currentArticulo: any): number {

  //   return this.calculoTotal(currentArticulo) - currentArticulo.descuento
  // }

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
      // detalleFacturaList: this.articulos,
      detalleFacturaList: [],
    }

    if (!this.clienteReadOnly) {
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
    }

    return model;
  }

  deshabilitadorInputs() {
    // this.form.get('comprobante')?.disable();
    this.form.get('RNC')?.disable();
    this.form.get('empresa')?.disable();
    // this.form.get('garantia')?.disable();
    this.form.get('fechaLimitePago')?.disable()

  }

  //  loadingSpinner(){
  //    return this.loadingButtonBuscar == true ?
  //       this.loadingButtonBuscar == true
  //       : this.loadingButtonBuscar == false;
  //  }
  obtenerClientesPorNombreTelefono() {
    const { telefono } = this.form.value;

    if (telefono !== '' && telefono !== null) {

      this.clientesService.getClientesPorNombreTelefono(telefono)
      .pipe(takeUntil(this.destroy$))
        .subscribe(customer => {
          console.log(customer);
          this.customer = customer[0];
          if (this.clienteReadOnly) {
            this.customer = customer[0];
          }
          else {
            this.toastr.warning('No existe este número');
          }
        });
    }
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
  onCheckboxChangeFactura(nfcTipoNumero: string) {

    if (this.form.get(nfcTipoNumero)?.value !== '0') {

      // if(!event.target.checked ) {
      // this.form.get('comprobante')?.disable();
      this.form.get('RNC')?.enable();
      this.form.get('empresa')?.enable();

    }
    else {
      this.deshabilitadorInputs();
      // this.form.get('comprobante')?.enable();
      // this.form.get('RNC')?.disable();
      // this.form.get('empresa')?.disable();
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

  // btnDisableArticulo() {
  //   return (this.formArticulo.get('cantidadElegida')?.value > 0) ?
  //     this.btnDisabledTelefono = false :
  //     this.btnDisabledTelefono = true;
  // }

   private loadCatalogos(){
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


    let cantidadStockAccesorio = currentArticulo.articulo.split('/')[5];
    let cantidadElegida = currentArticulo.cantidad;

    const total = this.calculoTotal(subTotal, currentArticulo.descuento);
    this.articulos.controls[index].patchValue({
      total,
      subTotal,
    })

    this.refreshGeneralValues();
    return Number(cantidadElegida) > cantidadStockAccesorio ? this.toastr.info(`Inventario insuficiente, cantidad disponible:  ${cantidadStockAccesorio}`) : Number(cantidadElegida)
  }


  imprimir() {
    const factura = this.modeloRegistroFacturacion()

    // this.registroFactura
    for (let control of this.articulos.controls) {
      factura.detalleFacturaList.push({
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
      })
    }
    console.log(factura);
    
    this.loading.showLoading('Procesando factura...');
    this.mantenimientoService.postFactura(factura)
    .pipe(takeUntil(this.destroy$))
      .subscribe((blobResponse) => {
        this.form.reset({
          tipoFactura: 1,
          tipoPago: 1,
          comprobante: 0,
          garantia: 8,
          aplicarItbis: false,
        })

        this.articulos.clear()
        // this.obtenerFechaDiaActual()
        this.agregarArticulo()

        CreatorPDFFile(blobResponse);
        this.loading.hideLoading();

      },error=>{
        this.loading.hideLoading();
        this.toastr.error(error)
      })
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

  changeNumeroTelefono() {
    //this.form.value['telefono']
  }
}
