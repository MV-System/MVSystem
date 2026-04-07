

import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControlOptions } from '@angular/forms';
import { forkJoin, Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ToastrService } from 'ngx-toastr';

import {  AsumeITBIS, Garantia, TipoComprobante, TipoFactura, TipoPago } from 'src/app/core/interfaces/catalogo.interface';
import { VendedorLista } from 'src/app/core/interfaces/vendedor.interface';
import { DetalleFacturaList, FacturaFilter, FacturaRegistro } from 'src/app/core/interfaces/mantenimiento';
import { AccesorioLista } from '../../../../core/interfaces/catalogo.interface';

import { ClientesService } from '../../../../core/services/clientes.service';
import { VendedorService } from '../../../../core/services/vendedor.service';
import { CatalogosService } from 'src/app/core/services/catalogos.service';
import { MantenimientoService } from '../../../../core/services/mantenimiento.service';
import { PreFacturasService, PreFactura, PreDetalleFactura } from '../../../../core/services/prefacturas.service';
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

  /**
   * Valida que ningún equipo se facture por debajo de su costo
   * Si encuentra alguno, muestra error y retorna false
   */
  validarPrecioVsCosto(): boolean {
    for (let i = 0; i < this.articulos().length; i++) {
      const articulo = this.articulos().at(i).value;
      // Solo aplica a equipos (idTipo == 1)
      if (articulo.idTipo === 1) {
        // Buscar costo_Equipo en el objeto articulo (puede venir de accesorio/articulo)
        let costo = 0;
        if (articulo.articulo && articulo.articulo.costo_Equipo !== undefined) {
          costo = Number(articulo.articulo.costo_Equipo);
        } else if (articulo.costo_Equipo !== undefined) {
          costo = Number(articulo.costo_Equipo);
        }
        const precioVenta = Number(articulo.precio);
        if (precioVenta < costo) {
          this.toastr.error(`El equipo (línea ${i+1}) no puede venderse por debajo de su costo. Costo: $${costo}, Precio: $${precioVenta}`);
          return false;
        }
      }
    }
    return true;
  }


  tipoFactura: string = '';
clienteSeleccionado: any = null;
reparacionesPendientes: any[] = [];
mostrarReparacionesPendientes: boolean = false;
reparacionSeleccionada: any = null;
modalVisible = false;
reparaciones: any[] = [];
  EstadoFactura: string | "A" = "A";

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
  private validatorPermissionService: ValidatorPermissionService,
  private preFacturasService: PreFacturasService) { }
  onPreFacturar() {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isLoading = true;


    // Construir el objeto PreFactura con todos los campos requeridos
    const preFactura: PreFactura = {
      numero_PreFactura: 0,
      iD_Cliente: this.customer?.id_Cliente || 0,
      nombres: this.customer?.nombres || '',
      apellidos: this.customer?.apellidos || '',
  numero_Telefono: this.customer?.numero_de_telefono || '',
      iD_Tipo_Factura: Number(this.form.get('tipoFactura')?.value),
      tipo_Factura: this.form.get('tipoFactura')?.value || '',
      iD_Vendedor: Number(this.form.get('vendedor')?.value),
      vendedor_Nombres: this.form.get('vendedor')?.value || '',
      iD_Tipo_Pagos: Number(this.form.get('tipoPago')?.value),
      tipo_Pago: this.form.get('tipoPago')?.value || '',
      iD_Sucursal: Number(this.loginService.getUserIdSucursal),
      sucursal: '',
      subTotal: this.subTotal,
      descuento: this.descuento,
      itbis: this.itbis,
      abono: this.abono,
      tiempo_Credito: this.form.get('fechaLimitePago')?.value,
      total: this.total,
      cantidad_Articulos: this.articulos().length,
      nota: this.form.get('nota')?.value,
      estado: 'P',
      usuario: this.loginService.getUserName(),
      fecha_Registro: this.form.get('fechaFacturacion')?.value,
      fecha_Procesamiento: null,
      usuario_Procesamiento: null,
      nfcTipoNumero: this.form.get('comprobante')?.value,
      nfcfiscal: '',
      ncF_NUMERO: '',
      rnc: this.form.get('RNC')?.value,
      literal: 'X',
      cotizacion_Numero: 0,
      detalleFacturaList: []
    };

    this.preFacturasService.crearPreFactura(preFactura).subscribe({
      next: (resp) => {


        // Guardar detalles
        const detalles: PreDetalleFactura[] = this.articulos().controls.map(control => {
          return {
            Numero_PreFactura: resp.Numero_PreFactura || resp.numero_PreFactura || 0,
            ID_Equipo: control.get('idEquipo')?.value,
            Descripcion: control.get('descripcion')?.value,
            ID_Tipo: control.get('idTipo')?.value,
            ID_Garantia: control.get('idGarantia')?.value,
            cantidad: control.get('cantidad')?.value,
            precio: control.get('precio')?.value,
            SubTotal: control.get('subTotal')?.value,
            Descuento: control.get('descuento')?.value,
            Itbis: control.get('itbis')?.value || 0,
            Total: control.get('total')?.value,
            Estado: 'P',
            Usuario: this.loginService.getUserName(),
            Fecha_registro: this.form.get('fechaFacturacion')?.value,
            Costo_Equipo: 0
          };
        });
        // Guardar cada detalle
        let detallesGuardados = 0;
        detalles.forEach(detalle => {
          this.preFacturasService.agregarDetallePreFactura(detalle).subscribe({
            next: () => {
              detallesGuardados++;
              if (detallesGuardados === detalles.length) {
                // Todos los detalles de artículos fueron guardados
                // Ahora guardar detalles de pago si es MIXTO
                const idTipoPago = Number(this.form.get('tipoPago')?.value);
                const numeroPreFactura = resp.Numero_PreFactura || resp.numero_PreFactura || 0;



                if (idTipoPago === 6 && this.detallesPagosActuales && this.detallesPagosActuales.length > 0) {
                  // Guardar detalles de pago mixto

                  this.preFacturasService.guardarDetallesPagoPreFactura(numeroPreFactura, this.detallesPagosActuales).subscribe({
                    next: () => {

                      this.isLoading = false;
                      this.toastr.success('Pre-factura y pagos mixtos guardados correctamente');
                      this.onClean();
                    },
                    error: (err) => {
                      console.error('❌ PREFACTURA PAGO MIXTO: Error al guardar detalles de pago', err);
                      this.isLoading = false;
                      this.toastr.warning('Pre-factura guardada, pero hubo error al guardar detalles de pago');
                      this.onClean();
                    }
                  });
                } else {

                  this.isLoading = false;
                  this.toastr.success('Pre-factura guardada correctamente');
                  this.onClean();
                }
              }
            },
            error: () => {
              this.isLoading = false;
              this.toastr.error('Error al guardar detalle de pre-factura');
            }
          });
        });
      },
      error: () => {
        this.isLoading = false;
        this.toastr.error('Error al guardar la pre-factura');
      }
    });
  }

    CambiarFechaFactura(): boolean {
      return this.validatorPermissionService.validateUserRole("CAMBIAR_FECHA_FACTURA");
    }
    BotonProcesarFactura(): boolean {
      return this.validatorPermissionService.validateUserRole("btngeneraFactura");
    }
     BotonPreFacturar(): boolean {
      return this.validatorPermissionService.validateUserRole("BotonPreFacturar");
    }

  /**
   * Detecta si la pantalla es móvil (ancho <= 768px)
   */
  isMobileScreen(): boolean {
    return window.innerWidth <= 768;
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
            costo_Equipo: reparacion.costo_Equipo,
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
  }
}
// ...existing code...



///----------------------------------------------------------------------------------------------

  ngOnInit(): void {
    this.loadFacturaNumero();
    this.loadCatalogos();
    this.obtenerItbis();
    this.obtenerClientes();

    // Sincronizar tipoPago con tipoPagoSeleccionado
    this.form.get('tipoPago')?.valueChanges.subscribe((value: any) => {
      this.tipoPagoSeleccionado = parseInt(value, 10);
    });

    // Establecer el valor inicial
    const tipoPagoInicial = this.form.get('tipoPago')?.value;
    if (tipoPagoInicial) {
      this.tipoPagoSeleccionado = parseInt(tipoPagoInicial, 10);
    }
  }
  FacturaCreada: FacturaRegistro = null!;
  subs: Subscription[] = [];
  destroy$: Subject<any> = new Subject<any>();
  printing: boolean = false;
  customer?: Cliente;
  cotizaciones!: CotizacionAmount[];
  detalleFacturaRegistroLista: DetalleFacturaList[] = [];
  customers: Cliente[] = []
  facturaTipos: TipoFactura[] = [];
  vendedores: VendedorLista[] = []
  pagoTipos: TipoPago[] = [];
  garantias: Garantia[] = [];
  asumeItbis: AsumeITBIS = null!;
   asumeITBIS: AsumeITBIS = null!;
  asumeITBISValue: boolean = false; // Control para el checkbox
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
  showModal: boolean = false; // Para controlar el modal de cliente

  subTotal: number = 0;
  descuento: number = 0;
  total: number = 0;
  itbis: number = 0;
  abono: number = 0;
  bufferSize: number = 5000;
  numberOfItemsFromEndBeforeFetchingMore: number = 10;

  // Propiedades para Pago Mixto
  detallesPagosActuales: any[] = [];
  tipoPagoSeleccionado: number = 0;

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
    comprobante: [null,],  // Se asigna dinámicamente por visible_Venta
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
      cantidad: [1, [Validators.required, Validators.min(1), Validators.pattern(/^\d+$/)]],
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
      itbis: [0],
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

  /**
   * Verifica si un artículo en el índice dado debe estar bloqueado (readonly)
   * Un artículo está bloqueado si ya tiene un artículo seleccionado
   */
  isArticuloReadonly(index: number): boolean {
    const articulo = this.articulos().controls[index]?.value;
    return articulo && articulo.articulo && articulo.articulo !== '';
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

  onSearchAccesorio(event: any, index: number) {
    const searchTerm = event.term?.toLowerCase() || '';

    if (!searchTerm) {
      // Si está vacío, mostrar lista normal
      return;
    }

    // Reordenar: primero coincidencias por código de barra, luego por descripción
    this.accesoriosBuffer.sort((a, b) => {
      const aCodigoMatch = a.codigo_Barra?.toString().toLowerCase().includes(searchTerm) ? 0 : 1;
      const bCodigoMatch = b.codigo_Barra?.toString().toLowerCase().includes(searchTerm) ? 0 : 1;
      const aDescMatch = a.accesorio_Descripcion?.toLowerCase().includes(searchTerm) ? 0 : 1;
      const bDescMatch = b.accesorio_Descripcion?.toLowerCase().includes(searchTerm) ? 0 : 1;

      // Prioridad: 1) Código de barra, 2) Descripción
      return (aCodigoMatch - bCodigoMatch) || (aDescMatch - bDescMatch);
    });

    // Si hay coincidencia EXACTA en código de barra, seleccionar automáticamente
    const accesorioCoincidente = this.accesoriosBuffer.find(a =>
      a.codigo_Barra?.toString().toLowerCase() === searchTerm
    );

    if (accesorioCoincidente) {
      const currentFormGroup: FormGroup = this.articulos().controls[index] as FormGroup;
      currentFormGroup.get('articulo')?.setValue(accesorioCoincidente);

      // Disparar el cambio para llenar los datos del accesorio
      setTimeout(() => {
        this.obtenerDetalleFactura(index);
      }, 100);
    }
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
    let subTotal = this.calcularSubTotalArticulo(newPrecio, cantidad);

    // Si la tienda asume ITBIS, extraer ITBIS del subTotal
    if (this.asumeItbis && this.asumeItbis.asumeITBIS == 'S') {
      const itbisRate = this.asumeItbis.itbiS_Valor * 100;
      subTotal = subTotal / (itbisRate / 100 + 1);
      subTotal = Number(subTotal.toFixed(2));
    }

    // Actualizamos el subtotal en el formulario
    currentFormGroup.get('subTotal')?.setValue(subTotal);

    // Recalcular el total (Subtotal - Descuento)
    const descuento = currentFormGroup.get('descuento')?.value || 0;
    const total = subTotal - descuento;

    // Actualizamos el total en el formulario
    currentFormGroup.get('total')?.setValue(total);
  } else {
    // Si el precio no ha sido modificado, no hacemos nada

  }
    // Actualizamos los valores generales si es necesario
    this.refreshGeneralValues();

    // Validar precio vs costo al cambiar precio o descuento
    const currentArticulo = currentFormGroup.getRawValue();
    if (currentArticulo.idTipo === 1) {
      let costo = 0;
      if (currentArticulo.articulo && currentArticulo.articulo.costo_Equipo !== undefined) {
        costo = Number(currentArticulo.articulo.costo_Equipo);
      } else if (currentArticulo.costo_Equipo !== undefined) {
        costo = Number(currentArticulo.costo_Equipo);
      }
      const precioVenta = Number(currentArticulo.precio) - Number(currentArticulo.descuento || 0);
      if (precioVenta < costo) {
        this.toastr.error(`El precio final del equipo ($${precioVenta}) no puede ser menor al costo ($${costo}). El descuento será revertido.`);
        currentFormGroup.get('descuento')?.setValue(0);
        // Recalcular total
        const cantidad = currentFormGroup.get('cantidad')?.value;
        const subTotal = this.calcularSubTotalArticulo(currentArticulo.precio, cantidad);
        currentFormGroup.get('subTotal')?.setValue(subTotal);
        currentFormGroup.get('total')?.setValue(subTotal);
        this.refreshGeneralValues();
      }
    }
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
      let subTotal = this.calcularSubTotalArticulo(currentArticulo.precio, currentArticulo.cantidad);

      // Si la tienda asume ITBIS, extraer ITBIS del subTotal
      if (this.asumeItbis && this.asumeItbis.asumeITBIS == 'S') {
        const itbisRate = this.asumeItbis.itbiS_Valor * 100;
        subTotal = subTotal / (itbisRate / 100 + 1);
        subTotal = Number(subTotal.toFixed(2));
      }

      currentArticulo.subTotal = subTotal;
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

    // Validación: el abono no puede ser mayor al total de la factura
    if (abono > this.total) {
      this.toastr.error('El abono no puede ser mayor al total de la factura');
      this.form.get('abono')?.setValue(0);
      this.abono = 0;
      return;
    }

    if (abono < 0) {
      this.toastr.error('El abono no puede ser negativo');
      this.form.get('abono')?.setValue(0);
      this.abono = 0;
      return;
    }

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
        garantia: 7,
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
        this.customer.numero_de_telefono = 0;
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
        this.asumeItbis = itbis;
        // Establecer el valor del checkbox basado en el valor de BD
        // 'S' = true (tienda asume), otro valor = false (cliente paga)
        this.asumeITBISValue = itbis.asumeITBIS === 'S';
      })
  }

   onAddCustomer1(customer: Cliente) {
    this.customer = customer;
    this.clientesService.isOpeningForm$.next(false);

  }
  onAdd1() {
    this.clientesService.isOpeningForm$.next(true);
    this.form.get('telefono')?.reset()
  }

  /**
   * Maneja la adición de un nuevo cliente desde el modal
   * Actualiza el formulario con los datos del cliente
   * y actualiza la lista de clientes disponibles
   * @param customer Cliente a agregar
   */
  onAddCustomer(customer: Cliente) {

    // Si customer es undefined o null, significa que se canceló
    if (!customer) {
      this.closeModal();
      return;
    }

    // Asignar el cliente
    this.customer = customer;
    this.clientesService.isOpeningForm$.next(false);

    // Agregar el nuevo cliente al inicio de la lista de 'customers'
    this.customers = [customer, ...this.customers];

    // Actualizar el formulario con el teléfono del nuevo cliente
    this.form.patchValue({
      telefono: customer.numero_de_telefono,
      idCliente: customer.id_Cliente || 0
    });

    // Cerrar el modal
    this.showModal = false;

    // Mostrar mensaje de éxito
    this.toastr.success('Cliente agregado correctamente');
  }

  /**
   * Abre el modal para agregar un nuevo cliente
   */
  onAdd() {
    // Indicar que el formulario está siendo abierto
    this.clientesService.isOpeningForm$.next(true);
    // Mostrar el modal
    this.showModal = true;
  }

  /**
   * Cierra el modal de registro de cliente
   */
  closeModal() {
    this.showModal = false;
    this.clientesService.isOpeningForm$.next(false);
  }
  onSubmit() {
    // ⛔ BLOQUEO INMEDIATO: Si ya está procesando, no permitir otro envío
    if (this.isLoading) {
      console.warn('⚠️ BLOQUEO: El formulario ya está siendo procesado');
      return;
    }

    if (this.form.valid) {
      // Validar que ningún equipo se facture por debajo de su costo
      if (!this.validarPrecioVsCosto()) {
        return;
      }

      if (this.isFactura) {
        this.generateFactura();
      } else {
        this.generateCotizacion();
      }
    } else {
      this.form.markAllAsTouched();
    }
  }
calcularPrecioSegunTipofactura(precioDetalle: number, precioMayor: number) {

  const tipoFactura = this.form.get('tipoFactura')?.value;
  const precio = Number((tipoFactura == 1 ? precioDetalle : 0) ||
    (tipoFactura == 2 ? precioMayor : 0 || tipoFactura == 4 ? precioDetalle : 0));
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
              costo_Equipo: equipo.costo_Equipo, // corregido: usar minúscula
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
            // Verificar duplicados SOLO en los artículos del formulario actual
            const articuloDuplicadoEnFormulario = this.articulos().controls.some((control: AbstractControl) => {
              const articuoValue = control.value;
              return articuoValue.articulo &&
                     typeof articuoValue.articulo === 'object' &&
                     articuoValue.articulo.id === articulo.id;
            });

            if (!articuloDuplicadoEnFormulario) {
              this.accesoriosBuffer.push(articulo);  // Agregar al final de la lista
              resolve(articulo);  // Resuelve la promesa con el artículo creado
            } else {
              this.toastr.warning(`El artículo con IMEI ${imei} ya está en la lista de esta factura.`);
              resolve(null);  // Resolver con null para evitar seleccionar nada
            }

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

const precioModificadoManualmente = currentArticulo.precio !== 0;
if (precioModificadoManualmente) {
   currentArticulo.precioDetalle = currentArticulo.precio;
  currentArticulo.precioMayor = currentArticulo.precio;
  currentArticulo.precio =currentArticulo.precio;
}
else
{
  currentArticulo.precioDetalle = articulo.precio_Detalle ?? articulo.precioDetalle ?? 0;
  currentArticulo.precioMayor = articulo.precio_Por_Mayor ?? articulo.precioMayor ?? 0;
  currentArticulo.precio = this.calcularPrecioSegunTipofactura(currentArticulo.precioDetalle, currentArticulo.precioMayor);
}


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

  const modoItbis = this.asumeItbis?.asumeITBIS === 'S' ? 'TIENDA ASUME' : 'EMPRESA SUMA';
  console.log(`\n🟢 [ESCENARIO] obtenerDetalleFactura [Artículo ${index}]`);
  console.log(`   📌 Modo ITBIS: ${modoItbis}`);
  console.log(`   📝 Descripción: ${currentArticulo.descripcion}`);
  console.log(`   💰 precio=${currentArticulo.precio}, cantidad=${currentArticulo.cantidad}, descuento=${currentArticulo.descuento || 0}`);
  console.log(`   📊 INICIAL: subTotal=${currentArticulo.subTotal}, total=${currentArticulo.total}`);

  // PRIMERO: Validar si se aplica ITBIS
  if (this.form.get('aplicarItbis')?.value === true) {
    // SEGUNDO: Si la tienda asume ITBIS, el precio incluye ITBIS, entonces extraer ITBIS del total (DESPUÉS del descuento)
    if (this.asumeItbis && this.asumeItbis.asumeITBIS == 'S') {
      const itbisRate = this.asumeItbis.itbiS_Valor * 100;
      // El total YA tiene el descuento aplicado
      const precioFinalConItbis = currentArticulo.total;
      // SubTotal sin ITBIS = total / (1 + (itbis%/100))
      const subTotalSinItbis = precioFinalConItbis / (itbisRate / 100 + 1);
      currentArticulo.subTotal = Number(subTotalSinItbis.toFixed(2));
      // MANTENER currentArticulo.total con el precio original (con ITBIS)
      // ITBIS del artículo = precio final - subTotal (para exactitud, sin errores de redondeo)
      currentArticulo.itbis = Number((precioFinalConItbis - currentArticulo.subTotal).toFixed(2));
      console.log(`   ✅ CALCULADO: subTotal=${currentArticulo.subTotal}, total=${currentArticulo.total}, itbis=${currentArticulo.itbis}`);
      console.log(`   🔍 Verificar: ${currentArticulo.subTotal} + ${currentArticulo.itbis} = ${currentArticulo.subTotal + currentArticulo.itbis} (debe ser ${precioFinalConItbis})`);
    } else {
      // Cuando la empresa suma ITBIS, se calcula más adelante en refreshGeneralValues
      currentArticulo.itbis = 0;  // Se asignará en refreshGeneralValues
      console.log(`   ⏳ PENDIENTE: itbis=0 (se calcula en refreshGeneralValues)`);
    }
  } else {
    // NO APLICA ITBIS (comprobante NO REQUERIDO)
    currentArticulo.itbis = 0;
    console.log(`   ⚠️ ITBIS NO APLICADO (comprobante NO REQUERIDO)`);
  }

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

  // Validar precio vs costo al agregar equipo
  if (currentArticulo.idTipo === 1) {
    // Buscar costo_Equipo
    let costo = 0;
    if (currentArticulo.articulo && currentArticulo.articulo.costo_Equipo !== undefined) {
      costo = Number(currentArticulo.articulo.costo_Equipo);
    } else if (currentArticulo.costo_Equipo !== undefined) {
      costo = Number(currentArticulo.costo_Equipo);
    }
    const precioVenta = Number(currentArticulo.precio) - Number(currentArticulo.descuento || 0);
    if (precioVenta < costo) {
      this.toastr.error(`El precio de venta ($${precioVenta}) no puede ser menor al costo ($${costo}). El descuento será puesto en cero.`);
      currentArticulo.descuento = 0;
      currentArticulo.total = currentArticulo.subTotal;
      currentFormGroup.setValue(currentArticulo);
      this.refreshGeneralValues();
    }
  }
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
        cantidad: [1, [Validators.required, Validators.min(1), Validators.pattern(/^\d+$/)]],
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
        itbis: [0],
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
      idCliente: this.customer?.id_Cliente || 0,
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
      detallesPagos: this.detallesPagosActuales
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
      itbis: control.get('itbis')?.value || 0,
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
            itbis: [articulo.itbis || 0],
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

    // Acumular totales de artículos
    for (let a = 0; a < this.articulos().length; a++) {
      const articulo = this.articulos().controls[a].value;
      this.descuento += articulo.descuento || 0;
      this.subTotal += articulo.subTotal || 0;
      this.itbis += articulo.itbis || 0;
      this.total += articulo.total || 0;
    }

    if (this.form.get('aplicarItbis')?.value === true) {
      // CALCULA EL ITBIS
      const itbisRate = this.asumeItbis.itbiS_Valor * 100;

      // si la factura lleva itbis pero ya el precio tiene incluido el itbis (TIENDA ASUME)
      if (this.asumeItbis.asumeITBIS == 'S') {
        // El total YA incluye ITBIS, extraer
        this.itbis = Number(((this.total / (itbisRate / 100 + 1)) * (itbisRate / 100)).toFixed(2));
        const totalSinItbis = this.total - this.itbis;
        this.total = Number(this.total.toFixed(2));
        this.subTotal = Number((totalSinItbis).toFixed(2));

        // Distribuir ITBIS proporcionalmente a cada artículo
        if (totalSinItbis > 0) {
          for (let a = 0; a < this.articulos().length; a++) {
            const control = this.articulos().controls[a] as FormGroup;
            const articuloTotal = control.get('total')?.value || 0;
            const itbisArticulo = (articuloTotal / this.total) * this.itbis;
            const itbisRedondeado = Number(itbisArticulo.toFixed(2));
            control.patchValue({
              itbis: itbisRedondeado
            });
          }
        }
      }
      // si la factura lleva itbis pero la empresa se lo suma al precio (EMPRESA SUMA)
      else {
        // El ITBIS YA fue calculado en cada artículo (obtenerCantidadArticuloStock)
        // Solo validar que los totales sean consistentes
        this.itbis = Number(this.itbis.toFixed(2));
        this.subTotal = Number(this.subTotal.toFixed(2));
        this.total = Number(this.total.toFixed(2));
      }
    }
    else {
      // ITBIS NO APLICADO
      this.subTotal = Number(this.total.toFixed(2));
      this.itbis = 0;

      // Limpiar ITBIS de todos los artículos
      for (let a = 0; a < this.articulos().length; a++) {
        const control = this.articulos().controls[a] as FormGroup;
        control.patchValue({
          itbis: 0
        });
      }
    }
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
    const typesNotRequireNCF = ['0', '32']  // 32 = Consumidor Final (cambió de 2 a 32)

    // Mostrar/ocultar RNC según tipo de comprobante
    if (!typesNotRequireNCF.includes(comprobante)) {
      this.isNcfRequire = true;
    }
    else {
      this.isNcfRequire = false;
    }

    // Si comprobante es 0 (NO REQUERIDO), desactivar aplicarItbis
    // Si es diferente de 0, activar aplicarItbis
    const aplicarItbis = comprobante !== '0' && comprobante !== 0;
    this.form.get('aplicarItbis')?.setValue(aplicarItbis);

    // Recalcular todos los valores de los artículos existentes
    this.refreshGeneralValues();
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

        // Buscar comprobante con visible_Venta = true y establecerlo como default
        const comprobanteDefault = this.comprobanteTipos.find(comp => comp.visible_Venta === true);
        if (comprobanteDefault) {
          this.form.get('comprobante')?.setValue(comprobanteDefault.nfcTipoNumero);
          // Disparar el cambio de comprobante para actualizar aplicarItbis correctamente
          this.onCheckboxChangeComprobante();
        }

        this.loading.hideLoading();

      })
  }
  obtenerCantidadArticuloStock(index: number) {
    const currentArticulo = this.articulos().controls[index].value
    let subTotal = this.calcularSubTotalArticulo(currentArticulo.precio, currentArticulo.cantidad);
    const modoItbis = this.asumeItbis?.asumeITBIS === 'S' ? 'TIENDA ASUME' : 'EMPRESA SUMA';

    console.log(`\n🟡 [RECÁLCULO] obtenerCantidadArticuloStock [Artículo ${index}]`);
    console.log(`   📌 Modo ITBIS: ${modoItbis}`);
    console.log(`   📝 Descripción: ${currentArticulo.descripcion}`);
    console.log(`   💰 precio=${currentArticulo.precio}, cantidad=${currentArticulo.cantidad}, descuento=${currentArticulo.descuento || 0}`);
    console.log(`   📊 INICIAL: subTotal crudo=${subTotal}`);

    // Aplicar descuento primero para obtener el precio final
    const descuento = currentArticulo.descuento || 0;
    let totalConDescuento = subTotal - descuento;

    // PRIMERO: Validar si se aplica ITBIS
    let itbisArticulo = currentArticulo.itbis || 0;
    if (this.form.get('aplicarItbis')?.value === true) {
      // SEGUNDO: Si la tienda asume ITBIS, extraer ITBIS del total CON descuento aplicado
      if (this.asumeItbis && this.asumeItbis.asumeITBIS == 'S') {
        const itbisRate = this.asumeItbis.itbiS_Valor * 100;
        const precioFinalConItbis = totalConDescuento;
        subTotal = precioFinalConItbis / (itbisRate / 100 + 1);
        subTotal = Number(subTotal.toFixed(2));
        // Calcular ITBIS como la diferencia (para exactitud)
        itbisArticulo = Number((precioFinalConItbis - subTotal).toFixed(2));
        totalConDescuento = subTotal; // Ahora totalConDescuento es el subTotal sin ITBIS
        console.log(`   ✅ CALCULADO: subTotal=${subTotal}, itbis=${itbisArticulo}`);
        console.log(`   🔍 Verificar: ${subTotal} + ${itbisArticulo} = ${subTotal + itbisArticulo} (debe ser ${precioFinalConItbis})`);
      } else {
        // EMPRESA SUMA: Calcular ITBIS del artículo localmente
        subTotal = totalConDescuento;
        const itbisRate = this.asumeItbis.itbiS_Valor * 100;
        itbisArticulo = Number(((subTotal * itbisRate) / 100).toFixed(2));
        console.log(`   ✅ CALCULADO: subTotal=${subTotal}, itbis=${itbisArticulo}`);
        console.log(`   🔍 Verificar: ${subTotal} + ${itbisArticulo} = ${subTotal + itbisArticulo} (total con ITBIS)`);
      }
    } else {
      // NO APLICA ITBIS (comprobante NO REQUERIDO)
      subTotal = totalConDescuento;
      itbisArticulo = 0;
      console.log(`   ⚠️ ITBIS NO APLICADO (comprobante NO REQUERIDO)`);
    }

    if (!currentArticulo.articulo) {
      this.articulos().controls[index].patchValue({
        descuento: 0,
        cantidad: 1,
      })
      return
    }

    let cantidadStockAccesorio = currentArticulo.articulo.cantidad;
    let cantidadElegida = currentArticulo.cantidad;

    // Validar si la cantidad elegida es mayor al stock disponible
    if (Number(cantidadElegida) > cantidadStockAccesorio) {
      this.toastr.info(`Inventario insuficiente, cantidad disponible:  ${cantidadStockAccesorio}`);
      // Limpiar el campo de cantidad para que el usuario ingrese una cantidad válida
      this.articulos().controls[index].patchValue({
        cantidad: 1,
        subTotal: 0,
        total: 0
      });
      this.refreshGeneralValues();
      return;
    }

    const total = this.form.get('aplicarItbis')?.value === true
      ? subTotal + itbisArticulo  // Si aplica ITBIS (TIENDA ASUME o EMPRESA SUMA)
      : subTotal;                 // Sin ITBIS

    console.log(`   📤 ACTUALIZANDO FormGroup: subTotal=${subTotal}, total=${total}, itbis=${itbisArticulo}`);

    this.articulos().controls[index].patchValue({
      total,
      subTotal,
      itbis: itbisArticulo
    });

    console.log(`   ✔️ FormGroup actualizado correctamente\n`);
    this.refreshGeneralValues();
  }

  onAcceptPrint(data: FacturaRegistro) {
    this.isLoading = !this.isLoading;
    this.submitted = true;

    // Usar el endpoint correcto según el tipo de pago
    const request$ = data.idTipoPago === 6
      ? this.mantenimientoService.postFacturaPagoMixto(data)
      : this.mantenimientoService.postFactura(data);

    request$
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
      EstadoFactura:this.EstadoFactura,
      IdVendedor:0,
      Usuario:this.loginService.getUserName(),
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
    this.isLoading = true;
    const data = this.loadDataToPrint()
    this.FacturaCreada = data;

    // Usar el endpoint correcto según el tipo de pago
    const request$ = data.idTipoPago === 6
      ? this.mantenimientoService.postFacturaPagoMixto(data)
      : this.mantenimientoService.postFactura(data);

    request$
          .pipe(takeUntil(this.destroy$))
          .subscribe(resp => {
            this.facturaNumberReporte = resp.factura?.numeroFactura || resp.numeroFactura
            this.agregarArticulo();
            this.toastr.success('Factura generada con exito!');
            this.loadFacturaNumero();
            // Recargar el buffer de accesorios para limpiar reparaciones facturadas
            this.accesoriosBuffer = [];
            this.loadCatalogos();

            // Verificar si es dispositivo móvil para cambiar el comportamiento
            if (this.isMobileScreen()) {
              // En móvil, preguntar si desea enviar la factura
              this.rDialogService.openDialog("Aviso", '¿Desea enviar la factura?',
                () => {
                  // Si acepta enviar, usar el método compartir
                  this.compartirFactura(this.facturaNumberReporte);
                  this.onClean();
                },
                () => {
                  // Si no desea enviar, solo limpiar
                  this.onClean();
                },
                "No",
                "Sí"
              )
            } else {
              // En desktop, mantener el comportamiento original de impresión
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

          }, error => {
            this.isLoading = false;
            this.toastr.error(error)
          })

  }
  loadDataToPrint() {
    const factura = this.modeloRegistroFacturacion()
    for (let control of this.articulos().controls) {
      factura.detalleFacturaList.push(this.modeloArticulos(control))
    }
    return factura;
  }
  generateCotizacion() {
    this.isLoading = true;
    const data = this.loadDataToPrint()
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
        this.isLoading = false;
        this.onClean();

      },error=>{
        this.isLoading = false;
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

  /**
   * Helper method to get client phone number from different API response formats
   */
  getClienteTelefono(cliente?: Cliente): number {
    return  cliente?.numero_de_telefono || 0;
  }

  /**
   * Comparte la factura usando la API nativa de compartir del navegador
   * Genera un PDF y permite compartir por WhatsApp, Email, etc.
   */
  compartirFactura(numeroFactura: number) {
    // Validar numeroFactura
    if (!numeroFactura || numeroFactura <= 0) {
      this.toastr.error('Número de factura inválido');
      return;
    }

    // Verificar si el navegador soporta la Web Share API
    if (!navigator.share) {
      this.toastr.warning('Tu navegador no soporta la función de compartir. Por favor, usa un navegador moderno en tu dispositivo móvil.');
      return;
    }

    // Mostrar loading
    this.loading.showLoading();

    // Generar el PDF usando el mismo endpoint que la impresión normal
    const sub = this.mantenimientoService.postFacturaReport(this.modelFacturaFilter(), numeroFactura)
      .subscribe({
        next: async (blob) => {
          try {
            // Convertir el Blob a File (necesario para navigator.share)
            const fileName = `Factura_${numeroFactura}.pdf`;
            const file = new File([blob], fileName, { type: 'application/pdf' });

            // Intentar compartir el archivo
            try {
              await navigator.share({
                title: `Factura #${numeroFactura}`,
                text: `Factura #${numeroFactura} - MVSystem`,
                files: [file]
              } as any); // usar 'as any' para evitar error de tipos en TS

              this.toastr.success('Factura compartida exitosamente');
            } catch (shareError: any) {
              // Si falla el share con archivos, intentar solo descargar
              if (shareError.name === 'NotAllowedError' || shareError.message?.includes('files')) {
                this.toastr.warning('No se puede compartir el archivo. Se descargará en su lugar.');
                CreatorPDFFile(blob);
              } else if (shareError.name !== 'AbortError') {
                // Cualquier otro error que no sea cancelación del usuario
                console.error('Error al compartir:', shareError);
                this.toastr.warning('Error al compartir. Descargando archivo...');
                CreatorPDFFile(blob);
              }
            }
          } catch (error: any) {
            console.error('Error al procesar archivo:', error);
            this.toastr.error('Error al preparar la factura para compartir');
          } finally {
            this.loading.hideLoading();
          }
        },
        error: (err) => {
          console.error('Error al generar PDF:', err);
          this.toastr.error('Error al generar la factura para compartir');
          this.loading.hideLoading();
        }
      });

    this.subs.push(sub);
  }

  // ==================== MÉTODOS PARA PAGO MIXTO ====================

  /**
   * Recibe los cambios de detalles de pagos desde el componente hijo
   */
  onPagosMixtoChange(pagos: any[]) {
    this.detallesPagosActuales = pagos;
  }

  /**
   * Maneja el cambio de tipo de pago
   */
  onTipoPagoChange(idTipo: any) {
    this.tipoPagoSeleccionado = parseInt(idTipo, 10);
    this.form.patchValue({ tipoPago: this.tipoPagoSeleccionado });
    // Actualizar si es crédito
    this.onChangeTipoPago();
  }

  /**
   * Maneja el cambio del checkbox de AsumeITBIS
   * Actualiza inmediatamente en BD y recalcula los totales
   */
  onAsumeITBISChange() {
    // Valor a guardar: 'S' si está marcado, 'N' si no
    const asumeValue = this.asumeITBISValue ? 'S' : 'N';

    // Obtener usuario del loginService
    const usuario = this.loginService.getUserName() || 'Sistema';

    // Llamar al servicio para actualizar en BD
    this.catalogosService.updateAsumeITBIS(asumeValue, usuario)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (response: any) => {
          if (response.success) {
            // Actualizar la propiedad local
            this.asumeItbis.asumeITBIS = asumeValue;

            // IMPORTANTE: Recalcular TODOS los artículos con el nuevo modo ITBIS
            // porque los valores previos fueron calculados con la fórmula anterior
            console.log(`\n🟣 [CAMBIO MODO] onAsumeITBISChange: Nuevo modo = ${asumeValue === 'S' ? 'TIENDA ASUME' : 'EMPRESA SUMA'}`);
            console.log(`   📤 Recalculando ${this.articulos().length} artículos...`);

            for (let i = 0; i < this.articulos().length; i++) {
              const articulo = this.articulos().controls[i].value;
              const itbisRate = this.asumeItbis.itbiS_Valor * 100;

              if (asumeValue === 'S') {
                // Cambio a TIENDA ASUME ITBIS
                // El precio del artículo debe incluir ITBIS ahora
                const precioConItbis = articulo.precio;
                const descuento = articulo.descuento || 0;
                const totalConDescuento = (precioConItbis * articulo.cantidad) - descuento;

                const subTotalSinItbis = totalConDescuento / (itbisRate / 100 + 1);
                const subTotalRedondeado = Number(subTotalSinItbis.toFixed(2));
                const itbisArticulo = Number((totalConDescuento - subTotalRedondeado).toFixed(2));
                // En TIENDA ASUME, el total del artículo incluye ITBIS
                const totalArticulo = totalConDescuento;

                this.articulos().controls[i].patchValue({
                  subTotal: subTotalRedondeado,
                  total: totalArticulo,
                  itbis: 0
                });

                console.log(`   [${i}] ${articulo.descripcion}: TIENDA ASUME - subTotal=${subTotalRedondeado}, itbis=${itbisArticulo}`);
              } else {
                // Cambio a EMPRESA SUMA ITBIS
                // Calcular ITBIS del artículo y sumarlo al total
                const subTotal = (articulo.precio * articulo.cantidad) - (articulo.descuento || 0);
                const itbisArticulo = Number(((subTotal * itbisRate) / 100).toFixed(2));
                this.articulos().controls[i].patchValue({
                  subTotal: subTotal,
                  total: Number((subTotal + itbisArticulo).toFixed(2)),
                  itbis: itbisArticulo
                });

                console.log(`   [${i}] ${articulo.descripcion}: EMPRESA SUMA - subTotal=${subTotal}, itbis=${itbisArticulo}, total=${subTotal + itbisArticulo}`);
              }
            }

            // Recalcular los totales con el nuevo valor
            this.refreshGeneralValues();

            this.toastr.success('Se actualizó correctamente si la tienda asume el ITBIS');
          } else {
            this.toastr.error(response.message || 'Error al actualizar');
            // Revertir el checkbox
            this.asumeITBISValue = !this.asumeITBISValue;
          }
        },
        error => {
          this.toastr.error('Error al actualizar: ' + error);
          // Revertir el checkbox
          this.asumeITBISValue = !this.asumeITBISValue;
        }
      );
  }
}
