import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin, Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ToastrService } from 'ngx-toastr';

import { AsumeITBIS, Garantia, TipoComprobante, TipoFactura, TipoPago } from 'src/app/core/interfaces/catalogo.interface';
import { VendedorLista } from 'src/app/core/interfaces/vendedor.interface';
import { DetalleFacturaList, FacturaFilter, FacturaRegistro } from 'src/app/core/interfaces/mantenimiento';
import { AccesorioLista } from '../../../../core/interfaces/catalogo.interface';

import { ClientesService } from '../../../../core/services/clientes.service';
import { VendedorService } from '../../../../core/services/vendedor.service';
import { CatalogosService } from 'src/app/core/services/catalogos.service';
import { MantenimientoService } from '../../../../core/services/mantenimiento.service';
import { LoadingService } from '../../../../shared/components/r-loading/loading.service';
import { CotizacionService } from '../../../../core/services/cotizacion.service';
import { LoginService } from '../../../../auth/login.service';
import { RDialogService } from 'src/app/shared/components/r-dialog/r-dialog.service';
import { ValidatorPermissionService } from '../../../../core/services/validator-permission.service';
import { Cliente, ClienteConsultaCriterio } from '../../../../core/interfaces/cliente.interface';
import { CotizacionAmount } from 'src/app/core/interfaces/cotizacion.interface';
import { CreatorPDFFile } from 'src/app/helpers/helper';

@Component({
  selector: 'app-facturacion',
  templateUrl: './facturacion-registro.component.html',
  styleUrls: ['./facturacion-registro.component.css']
})
export class FacturacionRegistroComponent implements OnInit, OnDestroy {

  tipoFactura: string = '';
clienteSeleccionado: any = null;
reparacionesPendientes: any[] = [];
mostrarReparacionesPendientes: boolean = false;
reparacionSeleccionada: any = null;
modalVisible = false;
reparaciones: any[] = [];

  constructor(
    //private dialog: MatDialog,
    private toast: ToastrService,
    private fb: FormBuilder,
    private catalogosService: CatalogosService,
    private toastr: ToastrService,
    private clientesService: ClientesService,
    private vendedorService: VendedorService,
    private mantenimientoService: MantenimientoService,
    private loading: LoadingService,
    private cotizacionService: CotizacionService,
    private loginService: LoginService,
    private rDialogService: RDialogService,
    private validatorPermissionService: ValidatorPermissionService) { }

    CambiarFechaFactura(): boolean {
      return this.validatorPermissionService.validateUserRole("CAMBIAR_FECHA_FACTURA");
    }
    BotonProcesarFactura(): boolean {
      return this.validatorPermissionService.validateUserRole("btngeneraFactura");
    }
  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

////-----------metodos agregados para facturar reparaciones---------------------------------



// ...existing code...
// ...existing code...
buscarReparacionesPendientes(clienteId: number) {
  this.mantenimientoService.getReparacionesPendientes({ IdCliente: clienteId })
    .pipe(takeUntil(this.destroy$))
    .subscribe(
      (response: any) => {
        // Espera que la respuesta tenga la forma { message: string, data: any[] }
        const reparaciones = response?.data;

        if (Array.isArray(reparaciones) && reparaciones.length > 0) {
          const reparacion = reparaciones[0];

          // // Asignar la nota al control del formulario
          // const notaControl = this.form.get('nota');
          // if (notaControl) {
          //   notaControl.setValue(reparacion.detalle_Reparacion || 'Sin detalles');
          // }

          // Crear el objeto visual para el buffer
          const articuloVisual = {
            accesorio_Descripcion: `Reparación #${reparacion.idReparacion}`,
            precio_Detalle: reparacion.precio,
            precio_Por_Mayor: reparacion.precio,
            cantidad: 1,
            id: reparacion.idReparacion,
            codigo_Barra: 0,
            modelo: reparacion.modelo || '',
            codigo: '',
            idTipo: 4,
            disponible: reparacion.disponible || 1,
            mensaje: reparacion.detalle_Reparacion || '',
            descuento: 0
          };

          // Evitar duplicados en el buffer usando id
          const articuloExistente = this.accesoriosBuffer.find(a => a.id === reparacion.idReparacion);
          if (!articuloExistente) {
            this.accesoriosBuffer.unshift(articuloVisual); // Agrega al inicio del buffer
          } else {
            this.toastr.warning(`La reparación con ID ${reparacion.idReparacion} ya está en la lista.`);
          }

        } else {
          // Si no hay reparaciones, muestra mensaje informativo
          this.toastr.info('Este cliente no tiene reparaciones pendientes.');
        }
      },
      error => {
        // Solo muestra error si falla la petición, no por ausencia de reparaciones
        this.toastr.error('Error al buscar reparaciones pendientes.');
      }
    );
}
// ...existing
onModalClose(rep: any) {
  this.modalVisible = false;
  if (rep) {
    // Aquí puedes manejar la reparación seleccionada
    // Por ejemplo, agregar la reparación a la factura
    console.log('Reparación seleccionada:', rep);
  }
}
// ...existing code...



///----------------------------------------------------------------------------------------------

  ngOnInit(): void {
    this.loadFacturaNumero();
    this.loadCatalogos();
    this.obtenerItbis();
    this.obtenerClientes();
  }
  FacturaCreada: FacturaRegistro = null!;
  subs: Subscription[] = [];
  destroy$: Subject<any> = new Subject<any>();
  printing: boolean = false;
  customer!: Cliente;
  cotizaciones!: CotizacionAmount[];
  detalleFacturaRegistroLista: DetalleFacturaList[] = [];
  customers: Cliente[] = []
  facturaTipos: TipoFactura[] = [];
  vendedores: VendedorLista[] = []
  pagoTipos: TipoPago[] = [];
  garantias: Garantia[] = [];
  asumeITBIS: AsumeITBIS = null!;
  accesorios: AccesorioLista[] = [];
  accesoriosBuffer: AccesorioLista[] = [];
  comprobanteTipos: TipoComprobante[] = [];
  btnDisabledTelefono: boolean = true;
  btnDisabledArticulo: boolean = true;
  isOpenModal: boolean = false;
  isFactura: boolean = true;
  isCredit: boolean = false;
  isLoading: boolean = false;
  submitted: boolean = false;
  isNcfRequire!: boolean;
  facturaNumber!: number;
  facturaNumberReporte!: number;

  subTotal: number = 0;
  descuento: number = 0;
  total: number = 0;
  itbis: number = 0;
  abono: number = 0;
  bufferSize: number = 5000;
  numberOfItemsFromEndBeforeFetchingMore: number = 10;

  Imei: string = '';


  form: FormGroup = this.fb.group({
    idCliente: [''],
    nombre: [''],
    apellido: [''],
    telefono: ['', Validators.required],
    vendedor: [, Validators.required],
    almacen: [,],
    tipoFactura: [1,],
    tipoPago: [1,],
    fechaFacturacion: this.currentDateTime(),
    comprobante: [0,],
    fechaLimitePago: this.currentDateTime(),
    garantia: [8,],
    nota: ['',],
    empresa: ['',],
    // codigo: [,],
    RNC: ['',],
    subTotal: [,],
    numConfirmacion: [,],
    abono: [0],
    aplicarItbis: [false,],
    usuario: this.loginService.getUserName(),
    btnAddArticulo:'',
     articulo: [null],
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
      editMode: false // Agregar la propiedad editMode aquí
    })]),
  });

  isValidFechaFacturacion(): boolean {
    return this.validatorPermissionService.validateUserRole("CAMBIAR_FECHA_FACTURA");
  }
  articulos(): FormArray {
    return this.form.controls["articulos"] as FormArray;
  }

  onScrollToEnd() {
    this.fetchMore();
  }
  onScroll(e: { start: number, end: number }) {

    let end = e.end;
    if (this.isLoading || this.accesorios.length <= this.accesoriosBuffer.length) {
      return;
    }
    if (end + this.numberOfItemsFromEndBeforeFetchingMore >= this.accesoriosBuffer.length) {
      this.fetchMore();
    }
  }
  private fetchMore() {

    const len = this.accesoriosBuffer.length;
    const more = this.accesorios.slice(len, this.bufferSize + len);
    // using timeout here to simulate backend API delay
    setTimeout(() => {
      this.accesoriosBuffer = this.accesoriosBuffer.concat(more);
    }, 200)
  }

  onPrecioChange(index: number): void {
    // Accedemos al FormGroup del artículo seleccionado
    const currentFormGroup = this.articulos().controls[index] as FormGroup;
// Accedemos al valor del precio usando 'get'
  const newPrecio = currentFormGroup.get('precio')?.value;
    // Actualizamos el precio manualmente
    currentFormGroup.get('precio')?.setValue(newPrecio);

    // Verificar si el valor del precio ha sido modificado
  const precioOriginal = currentFormGroup.get('articulo')?.value?.precio_Detalle || 0; // Precio original del artículo seleccionado

  // Si el precio ha sido modificado, lo dejamos tal cual, sino lo mantenemos como estaba
  if (newPrecio !== precioOriginal) {
    // Recalcular el subtotal con el nuevo precio
    const cantidad = currentFormGroup.get('cantidad')?.value;
    const subTotal = this.calcularSubTotalArticulo(newPrecio, cantidad);

    // Actualizamos el subtotal en el formulario
    currentFormGroup.get('subTotal')?.setValue(subTotal);

    // Recalcular el total (Subtotal - Descuento)
    const descuento = currentFormGroup.get('descuento')?.value || 0;
    const total = subTotal - descuento;

    // Actualizamos el total en el formulario
    currentFormGroup.get('total')?.setValue(total);
  } else {
    // Si el precio no ha sido modificado, no hacemos nada
    console.log("El precio no ha sido modificado, se mantiene el valor original");
  }
    // Actualizamos los valores generales si es necesario
    this.refreshGeneralValues();
}

calcularSubTotalArticulo(precio: number, cantidad: number) {
  const subTotal = precio * cantidad;
  return subTotal
}
  private updatePriceArticulos(){
    debugger;
    this.articulos().controls.forEach((v,index)=>{
      const currentFormGroup: FormGroup = this.articulos().controls[index] as FormGroup
      const currentArticulo = currentFormGroup.getRawValue()
      currentArticulo.precio = this.calcularPrecioSegunTipofactura(currentArticulo.precioDetalle, currentArticulo.precioMayor);
      currentArticulo.subTotal = this.calcularSubTotalArticulo(currentArticulo.precio, currentArticulo.cantidad);
      this.articulos().controls[index].setValue(currentArticulo)
      this.obtenerCantidadArticulo(currentArticulo);
      this.obtenerCantidadArticuloStock(index)

      this.refreshGeneralValues();
    })
  }
  onChangeTipoFactura(e: Event) {

    const alDetalle = 1;
    const alPorMayor = 2;
    const Reparacion = 4;
    let idTipoFactura = +(<HTMLInputElement>e.target).value;
    let hasValue = this.articulos().controls[0].status;
    let tipoFactura =
      this.facturaTipos.find(x =>
        x.iD_Tipo_Factura === +idTipoFactura)
        ?.descripcion_Factura_Tipo?.toLowerCase();
    if (hasValue === 'VALID') {
      if (idTipoFactura === alPorMayor || idTipoFactura === alDetalle)
        this.rDialogService.openDialog("¡Atención!", `Si cambia el tipo de factura a ${tipoFactura}, los precios pueden verse afectados.`,
          () => {
            this.form.get('tipoFactura')?.setValue(idTipoFactura);
            this.updatePriceArticulos();
          },
          () => {
            this.form.get('tipoFactura')?.setValue(
              idTipoFactura == alDetalle ? alDetalle :
                alPorMayor == alPorMayor ? alDetalle :
                  idTipoFactura);
              this.updatePriceArticulos();
          },
          "Cancelar",
          "Continuar"
        )
        // Si el tipo de factura es igual a 4 (Reparación), mostramos un mensaje específico

    }
    else if (idTipoFactura === Reparacion) {
      // Si hay cliente seleccionado, busca reparaciones pendientes
    if (this.customer?.id_Cliente) {
      this.buscarReparacionesPendientes(this.customer.id_Cliente);
    } else {
      this.toast.info("Seleccione un cliente para buscar reparaciones pendientes.");
    }
    }
  }
  onSelectCotizacion(cotizacion: CotizacionAmount) {
    this.abono = cotizacion.abono;
    this.descuento = cotizacion.descuento;
    this.itbis = cotizacion.itbis;
    this.subTotal = cotizacion.subTotal;
    this.total = cotizacion.total;
    this.loadDetalleCotizacion(cotizacion.numero_Factura);
  }
  agregarAbono() {
    const { abono } = this.form.value;
    this.abono = abono;
    this.refreshGeneralValues();
  }
  onToggle(e: boolean) {
    if (e == true) {
      this.isFactura = !this.isFactura;
    }
    else {
      this.isFactura = !this.isFactura;
    }
  }
  onClean() {
    //  setTimeout(() => {
    //   window.location.reload(); // Recarga la página después de 2 segundos
    //   }, 3000);
    if(this.form.dirty)
      this.form.patchValue({
        aplicarItbis: false,
        comprobante: 0,
        fechaFacturacion: this.currentDateTime(),
        tipoFactura: 1,
        tipoPago: 1,
        garantia: 8,
        nota: '',
        nombre: '',
        apellido: '',
        RNC: '',
        empresa: '',
        telefono: '',
        fechaLimitePago: this.currentDateTime(),
      });
////-----------------------------------------------------------------------------------------------------
      this.articulos().clear();
      this.agregarArticulo()
      if (this.customer) {
        this.customer.nombres = '';
        this.customer.apellidos = '';
        this.customer.numero_Telefono = 0;
      }
      this.cleanAmounts();
      this.isCredit = false;
      this.isNcfRequire = false;
      this.isLoading = false;
//  setTimeout(() => {
//       window.location.reload(); // Recarga la página después de 2 segundos
//       }, 2000);
  }
  cleanAmounts() {
    this.abono =0
      this.subTotal =0
      this.descuento =0
      this.total =0
      this.itbis = 0
  }
  currentDateTime(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Meses en base 0
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
}
  currentDate() {
    let date = new Date();
    let currrentDate = String(date.getFullYear()).padStart(2, '0') + '-' +
      String(date.getMonth() + 1).padStart(2, '0') + '-' +
      String(date.getDate()).padStart(2, '0'); +' ' +
     String(date.getHours()).padStart(2, '0');+':'+
    String(date.getMinutes()).padStart(2, '0');
    return currrentDate;
  }
  isFechaLimitePago() {
    const { tipoPago, fechaLimitePago } = this.form.value;
    if (tipoPago == 2) fechaLimitePago?.enable()
    fechaLimitePago?.disable()
  }
  obtenerItbis() {
    this.catalogosService.getAsumeITBIS()
      .pipe(takeUntil(this.destroy$))
      .subscribe(itbis => {
        this.asumeITBIS = itbis;
      })
  }
  onAddCustomer(customer: Cliente) {
    this.customer = customer;
    this.clientesService.isOpeningForm$.next(false);
    if (customer) {
      // Agregar el nuevo cliente a la lista de 'customers'
      this.customers = [customer, ...this.customers];
     this.form.get('telefono')?.setValue(this.customer.numero_Telefono);

      this.obtenerClientesPorNombreTelefono(this.customer.numero_Telefono);
      // Mostrar mensaje de éxito
    } else {
      // Si el campo 'telefono' está vacío, mostramos una advertencia
      this.toastr.warning('Por favor ingrese un número de teléfono.');
    }

  }
  onSubmit() {
    if (this.form.valid) {
      if (this.isFactura) {
        this.generateFactura()
      }
      else {
        this.generateCotizacion()
      }
    }
    else {
      this.form.markAllAsTouched()
    }
  }
calcularPrecioSegunTipofactura(precioDetalle: number, precioMayor: number) {

  const tipoFactura = this.form.get('tipoFactura')?.value;
  const precio = Number((tipoFactura == 1 ? precioDetalle : 0) ||
    (tipoFactura == 2 ? precioMayor : 0 || tipoFactura == 4 ? precioDetalle : 0));
  console.log(
    '[ng-option] Descripción:',
    this.accesoriosBuffer.find(a => a.precio_Detalle === precioDetalle && a.precio_Por_Mayor === precioMayor)?.accesorio_Descripcion,
    '| Precio:',
    precio,
    '| tipoFactura:',
    tipoFactura
  );
  return precio;
}
  addArticuloImei = (imei: string) => {
    return new Promise((resolve) => {
      this.catalogosService.buscarEquipoDisponible(imei, this.loginService.getUserIdSucursal)
        .pipe(takeUntil(this.destroy$))
        .subscribe(equipos => {
          // Verificar si el equipo está disponible
          if (equipos.disponible === 'S') {
            const equipo = equipos;

            // Crear el artículo con la información del equipo
            const articulo: AccesorioLista = {
              accesorio_Descripcion: `${equipo.modelo}`,
              cantidad: 1,
              id: equipo.imei,
              codigo_Barra: 0,
              modelo: equipo.modelo,
              precio_Detalle: equipo.precioDetalle,
              precio_Por_Mayor: equipo.precioPorMayor,
              codigo: null!, // Esto podría ser modificado para tener un código real si es necesario
              idTipo: 1,
              disponible: equipo.disponible,
              mensaje: equipo.mensaje,
            };

            // Actualizar el campo 'articulo' en el formulario
            const articuloControl = this.form.get('articulo');
            if (articuloControl) {
              articuloControl.setValue(imei);  // Asegura que el IMEI se mantenga en el input
            }
            // Agregar el artículo a la lista de accesorios, evitando duplicados
const articuloExistente = this.accesoriosBuffer.find(a => a.id === articulo.id);

if (!articuloExistente) {
  this.accesoriosBuffer.push(articulo);  // Agregar al final de la lista
} else {
  this.toastr.warning(`El artículo con IMEI ${imei} ya está en la lista.`);
}

            resolve(articulo);  // Resuelve la promesa con el artículo creado

          } else {
            // Si el equipo no está disponible, mostrar un mensaje de error
            this.toastr.error(`El Equipo ${imei}: ${equipos.mensaje}`);
          }
        }, error => {
          // Manejar errores de la llamada HTTP
          this.toastr.error('Error al buscar el equipo.');
        });
    });
  }
  obtenerDetalleFactura(index: number) {
  const currentFormGroup: FormGroup = this.articulos().controls[index] as FormGroup;
  currentFormGroup.controls["cantidad"].enable();
  const currentArticulo = currentFormGroup.getRawValue();
  const articulo = currentArticulo.articulo;
  if (!currentArticulo || !articulo) return;
  // Asignar tipo
  currentArticulo.idTipo = articulo.idTipo ?? 2;
  // Asignar campos comunes
  currentArticulo.idGarantia = 1;
  currentArticulo.idEquipo = articulo.id ?? articulo.idEquipo ?? 0;
  currentArticulo.precioDetalle = articulo.precio_Detalle ?? articulo.precioDetalle ?? 0;
  currentArticulo.precioMayor = articulo.precio_Por_Mayor ?? articulo.precioMayor ?? 0;
  currentArticulo.precio = this.calcularPrecioSegunTipofactura(currentArticulo.precioDetalle, currentArticulo.precioMayor);

  // Asignar descripción según tipo
  if (articulo.idTipo === 4) { // Reparación
    const notaControl = this.form.get('nota');
    if (notaControl) {
      notaControl.setValue(articulo.mensaje || 'Sin detalles');
    }
    currentArticulo.idGarantia = 1;
    currentArticulo.descripcion = articulo.accesorio_Descripcion ?? `Reparación #${articulo.id}`;
    currentArticulo.precio = articulo.precio_Detalle ?? 0;
  } else { // Accesorio/Equipo
    currentArticulo.descripcion = articulo.accesorio_Descripcion ?? '';
    currentArticulo.precio = this.calcularPrecioSegunTipofactura(currentArticulo.precioDetalle, currentArticulo.precioMayor);
  }

  currentArticulo.subTotal = this.calcularSubTotalArticulo(currentArticulo.precio, currentArticulo.cantidad);

  currentArticulo.total = currentArticulo.subTotal - (currentArticulo.descuento || 0);

  // Validar duplicados
  for (let articuloAddIndex in this.articulos().controls) {
    if (articuloAddIndex == index.toString()) continue;
    let currentArticuloList = this.articulos().controls[articuloAddIndex].value;
    if (currentArticulo.idEquipo == currentArticuloList.idEquipo) {
      this.borrarArticulo(index);
      this.toastr.error("Este articulo ya fue registrado");
      return;
    }
  }
  // Actualizar el FormGroup
  currentFormGroup.setValue(currentArticulo);
  this.obtenerCantidadArticulo(currentArticulo);
  this.obtenerCantidadArticuloStock(index);
  this.refreshGeneralValues();

  // Deshabilitar cantidad si es equipo
  if (currentArticulo.idTipo == 1) currentFormGroup.controls["cantidad"].disable();
}
  onChangeTipoPago() {

    if (this.form.get('tipoPago')?.value == "2") {
      this.isCredit = true;

    } else {

      this.isCredit = false;
    }

  }
  hasNumberConfirmation(): boolean {
    return Number(this.form.controls.tipoPago.value) !== 1 &&
      Number(this.form.controls.tipoPago.value) !== 2;
  }
  agregarArticulo() {
    const isItemEmpty: boolean = this.articulos().controls.some(({ value }) => value.articulo == "");
    if (!isItemEmpty) {
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

      this.articulos().insert(0, articulo);
    }
    setTimeout(() => {
      document.querySelector('#articulo')?.querySelector('input')?.focus()
    }, 200);
  }
  obtenerCantidadArticulo(currentArticulo: any) {
    let cantidadStockAccesorio = currentArticulo.articulo.cantidad;
    let cantidadElegida = currentArticulo.cantidad

    this.calculoTotal(currentArticulo.subTotal, currentArticulo.descuento);
    return Number(cantidadElegida) > cantidadStockAccesorio ? this.toastr.info(`Inventario insuficiente, cantidad disponible:  <b>${cantidadStockAccesorio}</b>`) : Number(cantidadElegida)
  }
  calculoTotal(subTotal: number, descuento: number) {
    if (descuento > subTotal) {
      this.toastr.warning('El descuento no puede ser mayor al subtotal!');
      this.form.get('descuento')?.patchValue(0);
      return 0
    }
    else {
      return subTotal - descuento
    }
  }

  modeloRegistroFacturacion(): FacturaRegistro {
///------------------------------------------------------------------------------------------------------------------////
    const model: FacturaRegistro = {
      numeroFactura: this.facturaNumber,
      idCliente: this.customer.id_Cliente,
      idVendedor: Number(this.form.get('vendedor')?.value),
      idAlmacen: Number(this.loginService.getUserIdSucursal),
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
      cantidadArticulos: this.articulos().length,
      detalleFacturaList: [],
      usuario: this.loginService.getUserName() || "",
      empresa: this.loginService.getUserEmpresa,
      IdEmpresa:this.loginService.getUserIdEmpresa,
      IdSucursal:this.loginService.getUserIdSucursal,

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
      usuario: this.loginService.getUserName(),
    }

    return model;
  }
  modeloArticulos(control: AbstractControl) {
    const model = {
      cantidad: Number(control.get('cantidad')?.value),
      descripcion: control.get('descripcion')?.value,
      numeroFactura: this.facturaNumber,
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
      Usuario: this.loginService.getUserName(),
      editMode:false,
      EquipoActual: '',
      EquipoNuevo: '',
    }
    return model;
  }
  obtenerClientesPorNombreTelefono(tel?: number) {
  // ID de "Reparaciones". Cambia este valor si el ID es diferente.
  const idReparacion = 4;

  // Si se proporciona el teléfono como argumento, úsalo; si no, toma el del formulario.
  const telefono = tel ?? this.form.value.telefono;

  this.clientesService.getClientesPorNombreTelefono(telefono)
    .pipe(takeUntil(this.destroy$))
    .subscribe(
      customer => {
        // Asigna el primer cliente encontrado.
        this.customer = customer[0];

        // Busca el tipo de factura por ID.
        const tipoReparaciones = this.facturaTipos.find(
          t => t.iD_Tipo_Factura === idReparacion
        );

        // Obtiene el valor del tipo de factura seleccionado en el formulario.
        const tipoFacturaForm = Number(this.form.get('tipoFactura')?.value);

        // Si el tipo de factura es "Reparaciones" y hay un cliente seleccionado, busca reparaciones pendientes.
        if (
          tipoReparaciones?.iD_Tipo_Factura &&
          tipoFacturaForm === idReparacion &&
          this.customer?.id_Cliente
        ) {
          this.buscarReparacionesPendientes(this.customer.id_Cliente);
        }
      },
      error => {
        // Muestra un mensaje de error si ocurre algún problema.
        this.toastr.error(error);
      }
    );
}
  loadDetalleCotizacion(numeroRegistro: number) {

    this.cotizacionService.getDetalleCotizacionConsulta(numeroRegistro, Number(this.loginService.getUserIdSucursal))
      .pipe(takeUntil(this.destroy$))
      .subscribe(articulos => {
        articulos.forEach((articulo, index) => {
          const data = this.fb.group({
            cantidad: [articulo.cantidad],
            descripcion: [articulo.descripcion],
            descuento: [articulo.descuento],
            fechaRegistro: [new Date().toDateString()],
            idEquipo: [articulo.iD_Equipo],
            idGarantia: [0],
            idTipo: [articulo.iD_Tipo],
            numeroFactura: [articulo.numero_Factura],
            precio: [articulo.precio],
            subTotal: [articulo.subTotal],
            total: [articulo.total],
            articulo: [''],
            precioDetalle: [0],
            precioMayor: [0],
          });
          this.articulos().insert(index - 1, data);
          this.articulos().controls[index].get('articulo')?.patchValue(`${articulo.descripcion.toUpperCase()} | $${articulo.precio}`)

        })

      })
  }
  refreshGeneralValues() {
    this.subTotal = this.descuento = this.total = this.itbis = 0;

    for (let a = 0; a < this.articulos().length; a++) {
      const articulo = this.articulos().controls[a].value;
      this.descuento += articulo.descuento || 0;
      this.total += articulo.total || 0;
    }

    if (this.form.get('aplicarItbis')?.value == 'true') {
      const itbis = this.asumeITBIS.itbiS_Valor * 100;
      if (this.asumeITBIS.asumeITBIS == 'S') {
        this.itbis = Number(((this.total / (itbis / 100 + 1)) * (itbis / 100)).toFixed(2));
        this.total = Number(this.total.toFixed(2));
      } else {
        this.itbis = Number(((this.total * itbis) / 100).toFixed(2));
        this.total = Number((this.total + this.itbis).toFixed(2));
      }
    }
    // El subtotal es igual a total - descuento - itbis
    this.subTotal = Number((this.total - this.descuento - this.itbis).toFixed(2));
  }
  borrarArticulo(index: number) {

    this.articulos().removeAt(index)

    if (this.articulos().length === 0)

      this.agregarArticulo()

    this.refreshGeneralValues();
    if(this.total==0){
      this.form.get('tipoFactura')?.enable();  // Deshabilita el FormControl 'tipoFactura'
      this.form.get('tipoPago')?.enable();
    }
  }
  onCheckboxChange(event: any, campo: any) {
    if (event.target.checked == false) {
      this.form.get(campo)?.disable();
    }
    else {
      this.form.get(campo)?.enable();
      // Deshabilita el FormControl 'tipoPago'
    }
  }
  onCheckboxChangeComprobante() {
    const { comprobante } = this.form.value;
    const typesNotRequireNCF = ['0', '2']
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
  validarCamposArticulo(detalleFactura: AbstractControl, nombreCampo: string) {
    const campo = detalleFactura.get(nombreCampo)
    return campo?.invalid && campo?.touched
  }
  private loadCatalogos() {
    this.loading.showLoading();
    forkJoin([
      this.catalogosService.getGarantiaLista(),
      this.catalogosService.getTipoFacturaLista(),
      this.catalogosService.getTipoComprobanteLista(),
      this.vendedorService.getVendedorLista(),
      this.catalogosService.getTipoPagoLista(),
      this.catalogosService.getAccesorioLista(+this.loginService.getUserIdSucursal)
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(resp => {
        this.garantias = resp[0];
        this.facturaTipos = resp[1];
        this.comprobanteTipos = resp[2];
        this.vendedores = resp[3];
        this.pagoTipos = resp[4];
        this.accesorios = resp[5];

        this.loading.hideLoading();

      })
  }
  obtenerCantidadArticuloStock(index: number) {
    const currentArticulo = this.articulos().controls[index].value
    const subTotal = this.calcularSubTotalArticulo(currentArticulo.precio, currentArticulo.cantidad);

    if (!currentArticulo.articulo) {
      this.articulos().controls[index].patchValue({
        descuento: 0,
        cantidad: 1,
      })
      return
    }

    let cantidadStockAccesorio = currentArticulo.articulo.cantidad;
    let cantidadElegida = currentArticulo.cantidad;

    const total = this.calculoTotal(subTotal, currentArticulo.descuento);
    this.articulos().controls[index].patchValue({
      total,
      subTotal,
    })

    this.refreshGeneralValues();
    return Number(cantidadElegida) > cantidadStockAccesorio ? this.toastr.info(`Inventario insuficiente, cantidad disponible:  ${cantidadStockAccesorio}`) : Number(cantidadElegida)
  }

  onAcceptPrint(data: FacturaRegistro) {
    this.isLoading = !this.isLoading;
    this.submitted = true;
    this.mantenimientoService.postFactura(data)
      .pipe(takeUntil(this.destroy$))
      .subscribe((blobResponse) => {

        //CreatorPDFFile(blobResponse);
        this.onClean();
        this.agregarArticulo();
        this.toastr.success('Factura generada con exito!');
        this.loadFacturaNumero();
      }, error => {
        this.isLoading = !this.isLoading;
        this.toastr.error(error)
      })
  }

  modelFacturaFilter(){
    const {criterio,almacen} = this.form.value;
    const model:FacturaFilter = {
      almacen: +this.loginService.getUserIdSucursal,
      criterio: '',
      fechaInicio:'',// this.paginate.fechaInicio,
      fechaFinal:'',// this.paginate.fechaFinal,
      pageIndex:1,// this.paginate.pageIndex,
      pageSize:10,// this.paginate.pageSize,
      empresa: this.loginService.getUserEmpresa,
      IdEmpresa:this.loginService.getUserIdEmpresa,
      IdSucursal:this.loginService.getUserIdSucursal,
      ComprobanteCheck:1,
      IdVendedor:0
    }
    return model;
  }
  printFacturaNormal() {
  this.loading.showLoading();
  const sub = this.mantenimientoService.postFacturaReport(this.modelFacturaFilter(), this.facturaNumberReporte)
    .subscribe(blob => {
      const newBlob = new Blob([blob], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(newBlob);

      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = blobUrl;

      iframe.onload = () => {
        this.loading.hideLoading(); // Oculta el loading justo cuando el PDF está listo
        iframe.contentWindow?.print();
      };

      document.body.appendChild(iframe);
    }, err => {
      this.loading.hideLoading();
      this.toast.error('Error al imprimir factura');
    });
  this.subs.push(sub);
}

printFacturaMini() {
  this.loading.showLoading();
  const sub = this.mantenimientoService.postFacturaMiniReport(this.modelFacturaFilter(), this.facturaNumberReporte)
    .subscribe(blob => {
      const newBlob = new Blob([blob], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(newBlob);

      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = blobUrl;

      iframe.onload = () => {
        this.loading.hideLoading(); // Oculta el loading cuando el PDF esté listo
        iframe.contentWindow?.print();
        // Ya no se elimina el iframe ni se revoca el blob automáticamente
      };

      document.body.appendChild(iframe);
    }, err => {
      this.loading.hideLoading();
      this.toast.error('Error al imprimir factura');
    });
  this.subs.push(sub);
}
  generateFactura() {
    const data = this.loadDataToPrint()
    this.FacturaCreada = data;

    this.mantenimientoService.postFactura(data)
          .pipe(takeUntil(this.destroy$))
          .subscribe(resp => {
       this.facturaNumberReporte = resp.numeroFactura
            this.agregarArticulo();
            this.toastr.success('Factura generada con exito!');
            this.loadFacturaNumero();
            // Recargar el buffer de accesorios para limpiar reparaciones facturadas
            this.accesoriosBuffer = [];
            this.loadCatalogos();

          }, error => {
           // this.isLoading = !this.isLoading;
            this.toastr.error(error)
          })
    this.rDialogService.openDialog("Aviso", 'Desea imprimir la factura?',
      () => {

        this.rDialogService.openDialog("Aviso", 'Desea imprimir la factura mini o normal?',

          () => {
            this.printFacturaNormal(); this.onClean()
          },
          () => {this.printFacturaMini(); this.onClean()},
          "Mini",
          "Normal"
        )

      },
      () => {
        this.onClean();
       },
      "No",
      "Si"
    )

  }
  loadDataToPrint() {
    const factura = this.modeloRegistroFacturacion()
    for (let control of this.articulos().controls) {
      factura.detalleFacturaList.push(this.modeloArticulos(control))
    }
    return factura;
  }
  generateCotizacion() {

    const data = this.loadDataToPrint()
    this.loading.showLoading('Procesando cotización...');
    this.mantenimientoService.postCotizacionReport(data)
    .pipe(takeUntil(this.destroy$))
      .subscribe((blobResponse) => {
        this.form.reset({
          tipoFactura: 1,
          tipoPago: 1,
          comprobante: 0,
          garantia: 8,
          aplicarItbis: false,
        })

        this.articulos().clear()
        this.agregarArticulo()

        CreatorPDFFile(blobResponse);

      },error=>{
        this.toastr.error(error)
      })
  }
  loadFacturaNumero() {
    this.mantenimientoService.getFacturaNumero()
      .pipe(takeUntil(this.destroy$))
      .subscribe(numeroFactura => this.facturaNumber = numeroFactura)
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

  onAdd() {
    // Indicar que el formulario está siendo abierto
    this.clientesService.isOpeningForm$.next(true);
  }

}
