import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CatalogosService } from 'src/app/MVSystem/services/catalogos.service';
import { ToastrService } from 'ngx-toastr';
import { Garantia, TipoComprobante, TipoFactura, TipoPago } from 'src/app/MVSystem/interfaces/catalogo.interface';
import { ClientesService } from '../../../services/clientes.service';
import { VendedorService } from '../../../services/vendedor.service';
import { VendedorLista } from 'src/app/MVSystem/interfaces/vendedor.interface';
import { DetalleFacturaList, FacturaRegistro } from 'src/app/MVSystem/interfaces/mantenimiento';
import { ModeloEquipo, AccesorioLista, Codigo } from '../../../interfaces/catalogo.interface';
import { AccesorioFactura, Accesorio } from '../../../interfaces/mantenimiento';
import { MantenimientoService } from '../../../services/mantenimiento.service';
import { elementAt } from 'rxjs/operators';

@Component({
  selector: 'app-facturacion',
  templateUrl: './facturacion-registro.component.html',
  styleUrls: ['./facturacion-registro.component.css']
})
export class FacturacionRegistroComponent implements OnInit {

  get articulos(): FormArray {
    return this.formRegistro.controls["articulos"] as FormArray;
  }

  // detalleFacturaRegistro: DetalleFacturaList[] = [];
  detalleFacturaRegistroLista: DetalleFacturaList[] = [];
  listaTipoFactura: TipoFactura[] = [];
  listaVendedor: VendedorLista[] = []
  listaPagoFactura: TipoPago[] = [];
  listaGarantia: Garantia[] = [];
  listaAccesorio: AccesorioLista[] = [];
  listaTipoComprobante: TipoComprobante[] = [];
  loadingButtonBuscar: boolean = false;
  btnDisabledTelefono: boolean = true;
  btnDisabledArticulo: boolean = true;

  subTotal: number = 0;
  descuento: number = 0;
  total: number = 0;
  itbis: number = 0;
  abono: number = 0;

  constructor(
    private fb: FormBuilder,
    private catalogosService: CatalogosService,
    private toastr: ToastrService,
    private clientesService: ClientesService,
    private vendedorService: VendedorService,
    private mantenimientoService: MantenimientoService) { }

  ngOnInit(): void {
    this.btnDisableTelefono();
    // this.btnDisableArticulo();
    this.obtenerTipoFactura();
    this.obtenerTipoPago();
    this.obtenerTipoComprobante();
    this.obtenerVendedor();
    this.obtenetAccesorios();
    this.deshabilitadorInputs();
    this.obtenerFechaDiaActual();
    this.obtenerGarantia();
    this.agregarArticulo();
  }

  formRegistro: FormGroup = this.fb.group({
    idCliente: [''],
    nombre: [''],
    apellido: [''],
    telefono: [, Validators.required],
    vendedor: [,],
    almacen: [,],
    tipoFactura: [1,],
    tipoPago: [1,],
    fechaFacturacion: ['',],
    comprobante: [0,],
    fechaLimitePago: [,],
    garantia: [8,],
    nota: ['',],
    // persona:[1,],
    empresa: [,],
    codigo: [,],
    // monto:[,],
    RNC: ['',],

    cantidadElegidaLista: [,],
    articuloLista: [,],
    descuentoLista: [,],

    subTotal: [,],
    subTotalArticulo: [,],
    precioArticulo: [,],
    totalArticulo: [,],
    articulos: this.fb.array([]),
    aplicarItbis: [false,],
  });


  criterioBusqueda: any = {
    criterio: '',
  }

  // registroFactura() {
  //   // this.obtenerDetalleFactura();
  //   if (this.formRegistro.invalid) {

  //     this.formRegistro.markAllAsTouched();
  //   }
  //   else {

  //     const modelo = this.modeloRegistroFacturacion();
  //     // this.mantenimientoService.postFactura(modelo)
  //     //                         .subscribe(factura =>{
  //     //                           console.log(factura);

  //     //                         })
  //   }
  // }
  calcularPrecioSegunTipofactura(precioDetalle: number, precioMayor: number) {
    return Number((this.formRegistro.get('tipoFactura')?.value == 1 ? precioDetalle : 0) ||
      (this.formRegistro.get('tipoFactura')?.value == 2 ? precioMayor : 0))
  }

  addArticuloImei = (imei: string) => {
    return new Promise((resolve) => {
      this.catalogosService.buscarEquipoDisponible(imei, '2').subscribe(equipos => {
        if (equipos && equipos[0].precioDetalle > 0) {
          debugger
          const equipo = equipos[0]

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

          this.listaAccesorio.push(articulo)
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
    debugger
    const currentArticulo = this.articulos.controls[index].value
    let articulo = currentArticulo.articulo;

    if (!currentArticulo || !articulo)
      return

    currentArticulo.idTipo = articulo.split('/')[6];
    currentArticulo.idGarantia = 1;
    currentArticulo.idEquipo = articulo.split('/')[0];
    currentArticulo.descripcion = articulo.split('/')[1] + '  ' + articulo.split('/')[2];
    currentArticulo.precioDetalle = articulo.split('/')[3];
    currentArticulo.precioMayor = articulo.split('/')[4];

    currentArticulo.precio = this.calcularPrecioSegunTipofactura(currentArticulo.precioDetalle, currentArticulo.precioMayor);

    currentArticulo.subTotal = this.calcularSubTotalArticulo(currentArticulo.precio, currentArticulo.cantidad);

    this.articulos.controls[index].setValue(currentArticulo)
    this.obtenerCantidadArticulo(currentArticulo);
    this.obtenerCantidadArticuloStock(index)

    this.refreshGeneralValues();
    // let modelAccesorio: DetalleFacturaList = {
    //   numeroFactura: 0,
    //   idEquipo: Number(idEquipo),
    //   descripcion: descripcion,
    //   idTipo: 1,
    //   idGarantia: this.formRegistro.get('garantia')?.value,
    //   subTotal: subTotal,
    //   cantidad: this.obtenerCantidadArticulo() ?
    //     this.formRegistroArticulo.get('cantidadElegida')?.value || 0 :
    //     Number(this.formRegistroArticulo.get('cantidadElegida')?.value),
    //   precio: this.calculoPrecio,
    //   descuento: Number(this.formRegistroArticulo.get('descuento')?.value),
    //   total: this.totalArticulo,
    //   fechaRegistro: this.obtenerFechaDiaActual(),
    // }
    // this.calculoTotal();

    // return modelAccesorio;

  }

  calcularSubTotalArticulo(precio: number, cantidad: number) {
    const subTotal = precio * cantidad;
    return subTotal
  }

  desactivarActivarFechaLimitepago() {

    if (this.formRegistro.get('tipoPago')?.value == 2) {
      this.formRegistro.get('fechaLimitePago')?.enable()
    }
    else {
      this.formRegistro.get('fechaLimitePago')?.disable()
    }

  }

  obtenerFechaDiaActual() {
    let date = new Date();
    let output = String(date.getFullYear()).padStart(2, '0') + '-' +
      String(date.getMonth() + 1).padStart(2, '0') + '-' +
      String(date.getDate()).padStart(2, '0');
    // console.log(output);
    // console.log(date);


    this.formRegistro.get('fechaFacturacion')?.setValue(output);
    this.formRegistro.get('fechaLimitePago')?.setValue(output);
    return output;
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
      idCliente: Number(this.formRegistro.get('idCliente')?.value),
      idVendedor: Number(this.formRegistro.get('vendedor')?.value),
      idAlmacen: 1,//Number(this.formRegistro.get('almacen')?.value),
      idTipoFactura: Number(this.formRegistro.get('tipoFactura')?.value),
      idTipoPago: Number(this.formRegistro.get('tipoPago')?.value),
      fechaRegistro: this.formRegistro.get('fechaFacturacion')?.value,
      ncfTipoNumero: Number(this.formRegistro.get('comprobante')?.value),
      RNC: this.formRegistro.get('RNC')?.value,
      fechaLimitePago: this.formRegistro.get('fechaLimitePago')?.value,
      garantia: this.formRegistro.get('garantia')?.value,
      nota: this.formRegistro.get('nota')?.value,
      descripcion: "",
      itbis: 0,
      subTotal: 0,
      total: 0,
      abono: 0,
      descuento: 0,
      cantidadArticulos: this.articulos.length,
      // detalleFacturaList: this.articulos,
      detalleFacturaList: [],
    }

    return model;
  }

  deshabilitadorInputs() {
    // this.formRegistro.get('comprobante')?.disable();
    this.formRegistro.get('RNC')?.disable();
    this.formRegistro.get('empresa')?.disable();
    // this.formRegistro.get('garantia')?.disable();
    this.formRegistro.get('fechaLimitePago')?.disable()

  }

  //  loadingSpinner(){
  //    return this.loadingButtonBuscar == true ? 
  //       this.loadingButtonBuscar == true 
  //       : this.loadingButtonBuscar == false;
  //  }
  obtenerClientesPorNombreTelefono() {
    this.formRegistro.controls.nombre.setValue('');
    this.formRegistro.controls.apellido.setValue('');
    this.formRegistro.controls.idCliente.setValue('');


    this.criterioBusqueda.criterio = this.formRegistro.controls.telefono.value;
    if (this.criterioBusqueda.criterio !== '' && this.criterioBusqueda.criterio !== null) {

      this.loadingButtonBuscar = true;

      this.clientesService.getClientesPorNombreTelefono(this.criterioBusqueda.criterio)
        .subscribe(cliente => {

          if (cliente.length == 0) {
            this.loadingButtonBuscar = false;
            this.toastr.warning('No existe este número');
          }

          cliente.forEach(({ nombres, apellidos, numero_Telefono, id_Cliente }) => {
            this.loadingButtonBuscar = false;

            this.formRegistro.controls.nombre.setValue(nombres);
            this.formRegistro.controls.apellido.setValue(apellidos);
            this.formRegistro.controls.idCliente.setValue(id_Cliente);

          });

        });
    }
  }

  refreshGeneralValues() {
    this.abono = this.subTotal = this.descuento = this.total = this.itbis = 0

    for (let a = 0; a < this.articulos.length; a++) {
      const articulo = this.articulos.controls[a].value

      this.subTotal += articulo.subTotal
      this.descuento += articulo.descuento
      this.total += articulo.total

      // abono +=articulo.abono
    }

    if (this.formRegistro.get('aplicarItbis')?.value) {
      this.itbis = this.total * .18;
      this.subTotal -= this.itbis;
    }
  }

  borrarArticulo(index: number) {
    this.articulos.removeAt(index)
    this.refreshGeneralValues();
  }

  onCheckboxChange(event: any, campo: any) {
    if (event.target.checked == false) {
      this.formRegistro.get(campo)?.disable();
    }
    else {
      this.formRegistro.get(campo)?.enable();
    }
  }
  onCheckboxChangeFactura(nfcTipoNumero: string) {

    if (this.formRegistro.get(nfcTipoNumero)?.value !== '0') {

      // if(!event.target.checked ) {
      // this.formRegistro.get('comprobante')?.disable();
      this.formRegistro.get('RNC')?.enable();
      this.formRegistro.get('empresa')?.enable();

    }
    else {
      this.deshabilitadorInputs();
      // this.formRegistro.get('comprobante')?.enable();
      // this.formRegistro.get('RNC')?.disable();
      // this.formRegistro.get('empresa')?.disable();
    }


  }
  /**
   * If the form control is invalid and has been touched, return true. Otherwise, return false.
   * @param {string} nombreCampo - string
   * @returns a boolean value.
   */
  validarCampos(nombreCampo: string) {
    return this.formRegistro.get(nombreCampo)?.invalid &&
      this.formRegistro.get(nombreCampo)?.touched
  }

  validarCamposArticulo(detalleFactura: any, nombreCampo: string) {
    const campo = detalleFactura.get(nombreCampo)
    return campo.invalid && campo.touched
  }

  btnDisableTelefono() {
    return (this.formRegistro.get('telefono')?.value > 9) ?
      this.btnDisabledTelefono = false :
      this.btnDisabledTelefono = true;
  }

  // btnDisableArticulo() {
  //   return (this.formRegistroArticulo.get('cantidadElegida')?.value > 0) ?
  //     this.btnDisabledTelefono = false :
  //     this.btnDisabledTelefono = true;
  // }
  //catalogos
  obtenerGarantia() {
    this.catalogosService.getGarantiaLista()
      .subscribe(garantia => {
        this.listaGarantia = garantia;
      })
  }
  obtenerTipoFactura() {
    this.catalogosService.getTipoFacturaLista()
      .subscribe(TipoFactura => {
        this.listaTipoFactura = TipoFactura;
      });
  }
  obtenerTipoPago() {
    this.catalogosService.getTipoPagoLista()
      .subscribe(TipoPago => {
        this.listaPagoFactura = TipoPago;
      });

  }
  obtenerTipoComprobante() {
    this.catalogosService.getTipoComprobanteLista()
      .subscribe(TipoComprobante => {
        this.listaTipoComprobante = TipoComprobante;
      });
  }
  obtenerVendedor() {
    this.vendedorService.getVendedorLista()
      .subscribe((vendedor) => {
        this.listaVendedor = vendedor;
      })
  }

  obtenerCantidadArticuloStock(index: number) {
    const currentArticulo = this.articulos.controls[index].value
    const subTotal = this.calcularSubTotalArticulo(currentArticulo.precio, currentArticulo.cantidad);

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

  obtenetAccesorios() {
    this.catalogosService.getAccesorioLista()
      .subscribe(accesorio => {
        this.listaAccesorio = accesorio;
      })
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
        fechaRegistro: this.formRegistro.get('fechaFacturacion')?.value,
        Usuario: 'f',
      })
    }

    this.mantenimientoService.postFactura(factura)
      .subscribe(facturaResponse => {
        console.log(facturaResponse);
      })
  }
}
