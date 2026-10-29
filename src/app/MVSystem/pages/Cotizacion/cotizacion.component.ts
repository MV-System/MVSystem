import { Component, OnInit, Output, EventEmitter, OnDestroy, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Subscription, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CreatorPDFFile } from '../../../helpers/helper';
import { Garantia, TipoFactura, TipoPago } from '../../../core/interfaces/catalogo.interface';
import { ClienteConsultaCriterio, Cliente } from '../../../core/interfaces/cliente.interface';
import { DetalleFacturaList, FacturaFilter } from '../../../core/interfaces/mantenimiento';
import { VendedorLista } from '../../../core/interfaces/vendedor.interface';
import { CatalogosService } from '../../../core/services/catalogos.service';
import { ClientesService } from '../../../core/services/clientes.service';
import { MantenimientoService } from '../../../core/services/mantenimiento.service';
import { VendedorService } from '../../../core/services/vendedor.service';
import { UserTrackingService } from '../../../core/services/user-tracking.service';
import { LoginService } from '../../../auth/login.service';
import { CotizacionListComponent } from './cotizacion-list/cotizacion-list.component';

@Component({
  selector: 'app-cotizacion',
  templateUrl: './cotizacion.component.html',
  styleUrls: ['./cotizacion.component.css']
})
export class CotizacionComponent implements OnInit,OnDestroy {

  @ViewChild(CotizacionListComponent) cotizacionList!: CotizacionListComponent;

  constructor(
    private fb: FormBuilder,
    private catalogosService: CatalogosService,
    private toastr: ToastrService,
    private clientesService: ClientesService,
    private vendedorService: VendedorService,
    private mantenimientoService: MantenimientoService,
    private toast: ToastrService,
    private tracking: UserTrackingService,
    private loginService: LoginService) { }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  ngOnInit(): void {
    this.getClientes();
    this.getGarantia();
    this.getTipoFactura();
    this.getTipoPago();
    this.getVendedor();
    this.getDateCurrentDay();
    this.agregarArticulo();

    // 📊 Tracking: Registro de acceso al módulo
    this.tracking.trackPageView('MNU_CONS_COTIZACION', 'PageView').subscribe();
  }

  private destroy$ = new Subject<void>();
  sub!:Subscription;
  itbis: number = 0;
  aplicarItbis!: boolean;
  onArticuloValue: boolean = false;
  printing: boolean = false;
  clientes: Cliente[] = []
  clienteSeleccionado: Cliente | undefined;
  facturaTipos: TipoFactura[] = [];
  vendedores: VendedorLista[] = []
  pagoTipos: TipoPago[] = [];
  garantias: Garantia[] = [];
  // ID de la garantía "No Aplica"; se actualiza al cargar el catálogo
  private garantiaNoAplicaId = 7;
  form: FormGroup = this.fb.group({
    idCliente: [''],
    nombre: [''],
    apellido: [''],
    telefono: ['', Validators.required],
    vendedor: [,],
    almacen: [,],
    tipoFactura: [1,],
    tipoPago: [1,],
    fechaFacturacion: ['',],
    fechaLimitePago: [,],
    garantia: [7,],
    nota: ['',],
    codigo: [,],
    itbis: ['',],
    cantidad:[,],
    articulo:[,],
    articulos: this.fb.array([]),
    aplicarItbis: [false,],
  });

  get tipoFactura() {
    return this.form.get('tipoFactura')?.value;
  }
  get articulos(): FormArray {
    return this.form.controls["articulos"] as FormArray;
  }
  get nombreCliente() {
    return this.clienteSeleccionado?.nombres || '';
  }
  get apellidoCliente() {
    return this.clienteSeleccionado?.apellidos || '';
  }

  searchCliente() {
    if (this.form.get('telefono')?.value.length === 10)
      this.obtenerClientesPorNombreTelefono()
  }

  obtenerClientesPorNombreTelefono(tel?: number) {
    const telefono = tel ?? this.form.value.telefono;

    this.clientesService.getClientesPorNombreTelefono(telefono)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        clientes => {
          if (clientes && clientes.length > 0) {
            this.clienteSeleccionado = clientes[0];
            this.form.controls.nombre.setValue(this.clienteSeleccionado.nombres);
            this.form.controls.apellido.setValue(this.clienteSeleccionado.apellidos);
            this.form.controls.idCliente.setValue(this.clienteSeleccionado.id_Cliente);
          } else {
            this.toastr.warning('No existe cliente con ese teléfono');
            this.clienteSeleccionado = undefined;
          }
        },
        error => {
          this.toastr.error('Error al buscar cliente');
        }
      );
  }

  getClienteTelefono(cliente?: Cliente): number {
    return cliente?.numero_de_telefono || 0;
  }
  getClientes() {
    this.sub = this.clientesService.getClientesPorNombreTelefono('').subscribe(clientes => {
      this.clientes = clientes
    })
  }

  imprimir() {
    console.log('=== INICIANDO GENERACIÓN DE COTIZACIÓN ===');

    // Validar que el formulario sea válido
    if (!this.form.valid) {
      console.warn('Formulario inválido');
      this.form.markAllAsTouched();
      this.toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    // Validar que haya al menos un artículo
    if (!this.articulos.length || this.articulos.length === 0) {
      console.warn('No hay artículos');
      this.toast.error('Debe agregar al menos un artículo a la cotización');
      return;
    }

    console.log(`Artículos: ${this.articulos.length}`);

    // Validar campos requeridos de los artículos
    if (!this.cotizacionList.validarCamposRequeridos()) {
      console.warn('Campos requeridos de artículos no válidos');
      return;
    }

    // Validar que el precio no sea menor al costo
    if (!this.cotizacionList.validarPrecioVsCosto()) {
      console.warn('Precio vs costo no válido');
      return;
    }

    // Validar cantidades disponibles
    this.cotizacionList.validarCantidadDisponible();

    // Activar estado de carga
    this.printing = true;

    // Preparar datos para enviar al backend
    const data = this.generarModeloCotizacion();
    console.log('Modelo generado:', JSON.stringify(data, null, 2));
    console.log('Campo empresa:', data.empresa);
    console.log('Campo idEmpresa:', data.idEmpresa);
    console.log('Campo idSucursal:', data.idSucursal);
    console.log('Enviando al backend...');

    // Si todas las validaciones pasaron, generar la cotización
    this.sub = this.mantenimientoService.postCotizacionReport(data)
      .subscribe(
        blob => {
          CreatorPDFFile(blob);
          this.printing = false;
          this.toast.success('Cotización generada exitosamente');

          // Limpiar formulario manteniendo vendedor y configurando garantía por defecto
          const vendedorActual = this.form.get('vendedor')?.value;
          this.form.reset();
          this.form.patchValue({
            vendedor: vendedorActual,
            garantia: this.garantiaNoAplicaId,
            tipoFactura: 1,
            tipoPago: 1,
            aplicarItbis: false,
          });
          this.getDateCurrentDay();

          // Limpiar artículos y totales
          this.articulos.clear();
          this.agregarArticulo();
          this.cotizacionList.limpiarTotales();

          // Limpiar selección de cliente
          this.clienteSeleccionado = undefined;
        },
        err => {
          this.printing = false;

          // Intentar leer el blob de error
          if (err.error && err.error instanceof Blob) {
            const reader = new FileReader();
            reader.onload = () => {
            };
            reader.readAsText(err.error);
          }

          this.toast.error('Error al generar la cotización: ' + (err.message || 'Error desconocido'));
        }
      );
  }

  generarModeloCotizacion(): any {
    const model: any = {
      numeroFactura: 0,
      idCliente: this.clienteSeleccionado?.id_Cliente || 0,
      nombre: this.clienteSeleccionado?.nombres || this.form.get('nombre')?.value || '',
      apellido: this.clienteSeleccionado?.apellidos || this.form.get('apellido')?.value || '',
      telefono: this.form.get('telefono')?.value || '',
      vendedor: this.form.get('vendedor')?.value || '',
      idVendedor: Number(this.form.get('vendedor')?.value) || 0,
      idAlmacen: 2,
      idTipoFactura: Number(this.form.get('tipoFactura')?.value) || 1,
      idTipoPago: Number(this.form.get('tipoPago')?.value) || 1,
      fechaFacturacion: this.form.get('fechaFacturacion')?.value,
      fechaRegistro: this.form.get('fechaFacturacion')?.value,
      // Las cotizaciones no llevan comprobante fiscal: 0 = no requerido
      ncfTipoNumero: 0,
      rnc: '',
      fechaLimitePago: this.form.get('fechaLimitePago')?.value,
      garantia: this.form.get('garantia')?.value || this.garantiaNoAplicaId,
      nota: this.form.get('nota')?.value || '',
      descripcion: "",
      itbis: this.cotizacionList.itbis,
      subTotal: this.cotizacionList.subTotal,
      total: this.cotizacionList.total,
      abono: 0,
      descuento: this.cotizacionList.descuento,
      cantidadArticulos: this.articulos.length,
      usuario: this.loginService.getUserName() || "",
      empresa: '',
      IdEmpresa: this.loginService.getUserIdEmpresa,
      IdSucursal: this.loginService.getUserIdSucursal,
      articulos: [],
    };

    // Agregar artículos con los nombres correctos esperados por la vista
    this.articulos.controls.forEach(control => {
      const articulo = control.value;
      model.articulos.push({
        cantidad: Number(articulo.cantidad),
        descripcion: articulo.descripcion,
        numeroFactura: 0,
        idEquipo: articulo.idEquipo || 0,
        idTipo: articulo.idTipo || 0,
        idGarantia: articulo.idGarantia || 0,
        subTotal: articulo.subTotal || 0,
        precio: articulo.precio || 0,
        descuento: articulo.descuento || 0,
        itbis: articulo.itbis || 0,
        total: articulo.total || 0,
        fechaRegistro: articulo.fechaRegistro || new Date().toDateString(),
        usuario: 'admin',
      });
    });

    return model;
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
      itbis: [0],
      articulo: [''],
      precioDetalle: [0],
      precioMayor: [0],
      precioManual: [false],
    });

    this.articulos.insert(0, articulo);

    setTimeout(() => {
      document.querySelector('#articulo')?.querySelector('input')?.focus()
    }, 200);

  }
  onApplyItbis(){
    const {aplicarItbis} = this.form.value;
    return this.aplicarItbis = aplicarItbis
  }

  desactivarActivarFechaLimitepago() {
    if (this.form.get('tipoPago')?.value == 2) {
      this.form.get('fechaLimitePago')?.enable()
    }
    else {
      this.form.get('fechaLimitePago')?.disable()
    }
  }

  getDateCurrentDay() {
    this.form.get('fechaLimitePago')?.disable();
    let date = new Date();
    let fullDate =
      String(date.getFullYear() ).padStart(2, '0') + '-' +
      String(date.getMonth() + 1).padStart(2, '0') + '-' +
      String(date.getDate()).padStart(2, '0');
    this.form.get('fechaFacturacion')?.setValue(fullDate);
    this.form.get('fechaLimitePago')?.setValue(fullDate);
  }

  getGarantia() {
   this.sub = this.catalogosService.getGarantiaLista()
      .subscribe(garantias => {
        this.garantias = garantias;
        // Garantía por defecto: "No Aplica" (se busca por descripción porque el ID cambia entre catálogos)
        const noAplica = garantias.find(g => (g.descripcion || '').trim().toLowerCase() === 'no aplica');
        if (noAplica) {
          this.garantiaNoAplicaId = noAplica.iD_Garantia;
          this.form.get('garantia')?.setValue(this.garantiaNoAplicaId);
        }
      })
  }
  getTipoFactura() {
    this.sub = this.catalogosService.getTipoFacturaLista()
      .subscribe(facturaTipos => {
        this.facturaTipos = facturaTipos;
      });
  }
  getTipoPago() {
    this.sub = this.catalogosService.getTipoPagoLista()
      .subscribe(pagoTipos => {
        this.pagoTipos = pagoTipos;
      });

  }
  getVendedor() {
    this.sub = this.vendedorService.getVendedorLista()
      .subscribe((vendedor) => {
        this.vendedores = vendedor;
        // Por defecto se selecciona el primer vendedor de la lista
        if (!this.form.get('vendedor')?.value && vendedor.length > 0) {
          this.form.get('vendedor')?.setValue(vendedor[0].iD_Vendedor);
        }
      })
  }

  validarCampos(field: string): boolean {
    const control = this.form.get(field);
    return control ? control.invalid && control.touched : false;
  }
}
