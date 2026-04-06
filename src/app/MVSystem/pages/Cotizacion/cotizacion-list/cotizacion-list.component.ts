import {
  Component,
  Input,
  OnInit,
  SimpleChange,
  OnChanges,
  Output,
  EventEmitter,
} from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AccesorioLista, AsumeITBIS } from 'src/app/core/interfaces/catalogo.interface';
import { CatalogosService } from 'src/app/core/services/catalogos.service';
import { LoginService } from 'src/app/auth/login.service';

@Component({
  selector: 'app-cotizacion-list',
  templateUrl: './cotizacion-list.component.html',
  styleUrls: ['./cotizacion-list.component.css'],
})
export class CotizacionListComponent implements OnInit, OnChanges {
  constructor(
    private catalogosService: CatalogosService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private loginService: LoginService
  ) {}

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.getAccesorios();
    this.obtenerItbis();
  }
  ngOnChanges(changes: { [property: string]: SimpleChange }) {
    let change: SimpleChange = changes['aplicarItbis'];
    if (change) {
      this.onApplyItbis();
    }
  }
  @Input() articulos!: FormArray;
  @Input() aplicarItbis!: boolean;
  @Input() tipoFactura!: number;
  @Input() form!: FormGroup;
  @Input() itbis: number = 0;
  @Output() onArticuloValue: EventEmitter<boolean> = new EventEmitter();
  private subs!: Subscription;
  accesorios: AccesorioLista[] = [];
  accesoriosBuffer: AccesorioLista[] = [];
  bufferSize: number = 5000;
  numberOfItemsFromEndBeforeFetchingMore: number = 200;
  isLoading: boolean = false;
  subTotal: number = 0;
  descuento: number = 0;
  total: number = 0;
  asumeItbis: AsumeITBIS = null!;
  isDescuentoValid: boolean = false;

  obtenerItbis() {
    this.catalogosService.getAsumeITBIS().subscribe((itbis) => {
      this.asumeItbis = itbis;
    });
  }
  addArticuloByImei = (imei: string) => {
    return new Promise((resolve) => {
      this.catalogosService
        .buscarEquipoDisponible(imei, '2')
        .pipe(takeUntil(this.destroy$))
        .subscribe((equipos) => {
          if (equipos && equipos.precioDetalle > 0) {
            const equipo = equipos;

            const articulo: AccesorioLista = {
              accesorio_Descripcion: equipo.marca,
              cantidad: 1,
              id: equipo.imei,  // Mantener IMEI como ID único en el dropdown
              codigo_Barra: 0,
              modelo: equipo.modelo,
              precio_Detalle: equipo.precioDetalle,
              precio_Por_Mayor: equipo.precioPorMayor,
              costo_Equipo: equipo.costo_Equipo,
              codigo: null!,
              idTipo: 1,
              disponible: equipo.disponible,
              mensaje: equipo.mensaje,
              // Agregar el ID entero si existe, sino usar un valor por defecto
              idEquipo: equipo.idEquipo || 0,
            };

            // Agregar el artículo a la lista de accesorios
            this.accesorios.push(articulo);
            this.accesoriosBuffer.push(articulo);  // Agregar al buffer
            resolve(articulo);
          } else {
            this.toastr.error(`El imei ${imei} no es válido o ya se vendió`);
            resolve(null);
          }
        });
    });
  };
  deleteArticulo(index: number) {
    this.articulos.removeAt(index);

    if (this.articulos.length === 0) this.agregarArticulo();

    this.onApplyItbis();
    this.onArticuloValue.emit(false);
  }
  validarCamposArticulo(detalleFactura: AbstractControl, nombreCampo: string) {
    const campo = detalleFactura.get(nombreCampo);
    return campo?.invalid && campo?.touched;
  }
  validarFields(field: string) {
    return this.form.get(field)?.invalid && this.form.get(field)?.touched;
  }
  onDetectValueArticulo(articuloDesc: string) {
    const { articulo } = this.form.value;
    if (articuloDesc != null) {
      this.onArticuloValue.emit(true);
      // this.isValidNgSelect(articulo);
    } else {
      this.onArticuloValue.emit(false);

    }

  }

  getCurrentFormGroup(index: number) {
    const currentFormGroup: FormGroup = this.articulos.controls[
      index
    ] as FormGroup;
    currentFormGroup.controls['cantidad'].enable();

    return currentFormGroup.getRawValue();
  }
  validateDescuento(desc: number, precio: number, index: number) {
    // No validar descuento si es 0 (valor por defecto)
    if (desc === 0) {
      this.isDescuentoValid = false;
      return true;
    }

    if (desc >= precio) {
      this.form.setErrors({ error: '' });
      this.toastr.error('El descuento no puede ser mayor al precio', '', {
        closeButton: true,
        progressBar: true,
      });
      this.deleteArticulo(index);
      return this.isDescuentoValid;
    } else {
      this.isDescuentoValid = false;
      return true;
    }
  }
  onClearArticuloDropdown(currentArticulo:string,index: number){
    if (currentArticulo== null) {
      this.articulos.removeAt(index);
      this.agregarArticulo();
      this.onApplyItbis();

    }
  }
  validateSameArticulo(articulos: FormArray,index:number,currentArticulo:any){
    for (let articuloAddIndex in articulos.controls) {
      if (articuloAddIndex == index.toString()) continue;

      let currentArticuloList = articulos.controls[articuloAddIndex].value;
      // Comparar por el ID único (IMEI o código de accesorio), no por idEquipo
      // Solo validar si ambos tienen ID válido (no vacío/undefined)
      if (currentArticulo.id && currentArticuloList.id && currentArticulo.id == currentArticuloList.id) {
        this.deleteArticulo(index);
        this.toastr.error('Este articulo ya fue registrado');
      }
    }
  }
  obtenerDetalleFactura(index: number) {

    const currentArticulo = this.getCurrentFormGroup(index);
    let articulo = currentArticulo.articulo;
    this.onClearArticuloDropdown(articulo,index);
    this.onDetectValueArticulo(articulo);
    if (!currentArticulo || !articulo) return;
    currentArticulo.idTipo = 2;
    currentArticulo.idGarantia = 1;
    // Si tiene idEquipo (entero), usarlo; si no, usar 0
    currentArticulo.idEquipo = articulo.idEquipo || 0;
    currentArticulo.descripcion =
      articulo.accesorio_Descripcion + '  ' + articulo.modelo;
    currentArticulo.precioDetalle = articulo.precio_Detalle;
    currentArticulo.precioMayor = articulo.precio_Por_Mayor;

    this.validateSameArticulo(this.articulos,index,currentArticulo);

      currentArticulo.precio = this.calcularPrecioSegunTipofactura(
      currentArticulo.precioDetalle,
      currentArticulo.precioMayor
    );

      currentArticulo.subTotal = this.calcularSubTotalArticulo(
      currentArticulo.precio,
      currentArticulo.cantidad
    );

    // Si la tienda asume ITBIS, el precio incluye ITBIS, entonces extraer ITBIS del subTotal
    if (this.asumeItbis && this.asumeItbis.asumeITBIS == 'S') {
      const itbisRate = this.asumeItbis.itbiS_Valor * 100;
      // SubTotal sin ITBIS = subTotal / (1 + (itbis%/100))
      const subTotalSinItbis = currentArticulo.subTotal / (itbisRate / 100 + 1);
      currentArticulo.subTotal = Number(subTotalSinItbis.toFixed(2));
      // ITBIS del artículo
      const itbisArticulo = (currentArticulo.subTotal * itbisRate) / 100;
      currentArticulo.itbis = Number(itbisArticulo.toFixed(2));
    } else if (this.aplicarItbis) {
      // Cuando la empresa suma ITBIS, se calcula más adelante en onApplyItbis
      currentArticulo.itbis = 0;  // Se asignará en onApplyItbis
    }

    let isValidDesc = this.validateDescuento(
      currentArticulo.descuento,
      currentArticulo.precio,
      index
    );


    if (isValidDesc == true) {

      this.articulos.controls[index].patchValue(currentArticulo);

      this.obtenerCantidadArticuloStock(index);

      this.onApplyItbis();
    }

  }
  calcularPrecioSegunTipofactura(precioDetalle: number, precioMayor: number) {
    return Number(
      (this.tipoFactura == 1 ? precioDetalle : 0) ||
        (this.tipoFactura == 2 ? precioMayor : 0)
    );
  }

  obtenerCantidadArticuloStock(index: number) {
    const currentArticulo = this.articulos.controls[index].value;
    let subTotal = this.calcularSubTotalArticulo(
      currentArticulo.precio,
      currentArticulo.cantidad
    );

    // Si la tienda asume ITBIS, extraer ITBIS del subTotal
    if (this.asumeItbis && this.asumeItbis.asumeITBIS == 'S') {
      const itbisRate = this.asumeItbis.itbiS_Valor * 100;
      subTotal = subTotal / (itbisRate / 100 + 1);
      subTotal = Number(subTotal.toFixed(2));
    }

    if (!currentArticulo.articulo) {
      this.articulos.controls[index].patchValue({
        descuento: 0,
        cantidad: 1,
      });
      return;
    }
    let cantidadStockAccesorio = currentArticulo.articulo.cantidad;
    let cantidadElegida = currentArticulo.cantidad;
    const total = this.calculoTotal(subTotal, currentArticulo.descuento);
    this.articulos.controls[index].patchValue({
      total,
      subTotal,
    });
    this.onApplyItbis();
    return Number(cantidadElegida) > cantidadStockAccesorio ?
           this.toastr.info(`Inventario insuficiente, cantidad disponible: ${cantidadStockAccesorio}`) :
           Number(cantidadElegida);
  }
  calcularSubTotalArticulo(precio: number, cantidad: number) {
    const subTotal = precio * cantidad;
    return subTotal;
  }
  calculoTotal(subTotal: number, descuento: number) {
    const total = subTotal - descuento;
    return total;
  }
  limpiarTotales() {
    this.subTotal = 0;
    this.descuento = 0;
    this.total = 0;
    this.itbis = 0;
  }

  onApplyItbis() {
    this.subTotal = this.descuento = this.total = this.itbis = 0;
    for (let a = 0; a < this.articulos.length; a++) {
      const articulo = this.articulos.controls[a].value;
      this.subTotal += articulo.subTotal;
      this.descuento += articulo.descuento;
      this.total += articulo.total;
    }

    // 🆕 Guardar el total ANTES de modificarlo para la distribución del ITBIS
    let totalOriginalParaDistribucion = this.total;

    if (this.aplicarItbis) {
      const itbis = this.asumeItbis.itbiS_Valor * 100;

      if (this.asumeItbis.asumeITBIS == 'S') {
        const amountNew = this.total / (itbis / 100 + 1);

        this.itbis = this.total - amountNew;
        this.total = amountNew;
      } else {
        this.itbis = (this.total * itbis) / 100;
        this.total = this.total + this.itbis;
      }

      this.itbis = Number(this.itbis.toFixed(2));
      this.total = Number(this.total.toFixed(2));

      // 🆕 Distribuir ITBIS proporcionalmente a cada artículo
      if (totalOriginalParaDistribucion > 0) {
        for (let a = 0; a < this.articulos.length; a++) {
          const control = this.articulos.controls[a] as FormGroup;
          const articuloTotal = control.get('total')?.value || 0;

          // Cuando la tienda asume ITBIS, los totales de artículos YA incluyen ITBIS
          // Debemos extraer el ITBIS de cada artículo
          if (this.asumeItbis.asumeITBIS == 'S') {
            const itbisRate = this.asumeItbis.itbiS_Valor * 100;
            // Extraer ITBIS del artículo: itbis = (total / (1 + (itbis/100))) * (itbis/100)
            const itbisArticulo = Number(((articuloTotal / (itbisRate / 100 + 1)) * (itbisRate / 100)).toFixed(2));
            control.patchValue({
              itbis: itbisArticulo
            });
          } else {
            // Cuando la empresa suma ITBIS, se distribuye proporcionalmente
            // ITBIS del artículo = (total del artículo / total ORIGINAL) × ITBIS total
            const itbisArticulo = (articuloTotal / totalOriginalParaDistribucion) * this.itbis;
            control.patchValue({
              itbis: Number(itbisArticulo.toFixed(2))
            });
          }
        }
      }
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
      itbis: [0],
      articulo: [''],
      precioDetalle: [0],
      precioMayor: [0],
    });

    this.articulos.insert(0, articulo);

    setTimeout(() => {
      document.querySelector('#articulo')?.querySelector('input')?.focus();
    }, 200);

  }
  getAccesorios() {
    this.isLoading = true;
    this.catalogosService.getAccesorioLista(+this.loginService.getUserIdSucursal)
      .pipe(takeUntil(this.destroy$))
      .subscribe((accesorios) => {
        this.accesorios = accesorios;
        // Cargar primeros items al buffer
        this.accesoriosBuffer = accesorios.slice(0, this.bufferSize);
        this.isLoading = false;
      }, error => {
        this.toastr.error('Error al cargar accesorios');
        this.isLoading = false;
      });
  }

  onSearchAccesorio(event: any, index: number) {
    const searchTerm = event.term?.toLowerCase() || '';

    if (!searchTerm) {
      // Si está vacío, mostrar lista normal
      return;
    }

    // Primero intenta buscar un equipo disponible por IMEI
    // (formato IMEI es generalmente de 15 dígitos)
    if (searchTerm.length >= 10 && /^\d+$/.test(searchTerm)) {
      this.catalogosService.buscarEquipoDisponible(searchTerm, '2').subscribe(
        (equipo: any) => {
          if (equipo && equipo.precioDetalle > 0) {
            // Verificar si el equipo ya existe en la lista
            let articulo = this.accesoriosBuffer.find(a => a.id === equipo.imei);

            if (!articulo) {
              // Si no existe, crear y agregar
              articulo = {
                accesorio_Descripcion: equipo.marca,
                cantidad: 1,
                id: equipo.imei,
                codigo_Barra: 0,
                modelo: equipo.modelo,
                precio_Detalle: equipo.precioDetalle,
                precio_Por_Mayor: equipo.precioPorMayor,
                costo_Equipo: equipo.costo_Equipo,
                codigo: null!,
                idTipo: 1,
                disponible: equipo.disponible,
                mensaje: equipo.mensaje,
              };

              this.accesorios.push(articulo);
              this.accesoriosBuffer.push(articulo);
            }

            // Seleccionar automáticamente usando la referencia exacta del buffer
            const currentFormGroup: FormGroup = this.articulos.controls[index] as FormGroup;
            currentFormGroup.get('articulo')?.setValue(articulo);

            // Disparar el cambio para llenar los datos del equipo
            setTimeout(() => {
              this.obtenerDetalleFactura(index);
            }, 100);

            return;
          } else {
            this.toastr.error(`El equipo ${searchTerm} no tiene precio o no está disponible`);
          }
        },
        (error) => {
          // Si no encuentra equipo, continuar con búsqueda de accesorios
          this.buscarEnAccesorios(searchTerm, index);
        }
      );
    } else {
      // Buscar en accesorios directamente
      this.buscarEnAccesorios(searchTerm, index);
    }
  }

  private buscarEnAccesorios(searchTerm: string, index: number) {
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
      const currentFormGroup: FormGroup = this.articulos.controls[index] as FormGroup;
      currentFormGroup.get('articulo')?.setValue(accesorioCoincidente);

      // Disparar el cambio para llenar los datos del accesorio
      setTimeout(() => {
        this.obtenerDetalleFactura(index);
      }, 100);
    }
  }

  /**
   * Valida que el precio de venta no sea menor al costo del artículo
   * @returns true si todos los precios son válidos, false si alguno es menor al costo
   */
  validarPrecioVsCosto(): boolean {
    for (let i = 0; i < this.articulos.length; i++) {
      const articulo = this.articulos.at(i).value;

      // Solo valida accesorios/artículos (idTipo == 2)
      if (articulo.idTipo === 2 || articulo.idTipo === 1) {
        let costo = 0;

        // Buscar costo en el objeto articulo
        if (articulo.articulo && articulo.articulo.costo_Equipo !== undefined) {
          costo = Number(articulo.articulo.costo_Equipo);
        } else if (articulo.costo_Equipo !== undefined) {
          costo = Number(articulo.costo_Equipo);
        }

        const precioVenta = Number(articulo.precio);

        // Validar que el precio no sea menor al costo
        if (precioVenta > 0 && costo > 0 && precioVenta < costo) {
          this.toastr.error(
            `Artículo en línea ${i+1}: El precio de venta (${precioVenta}) no puede ser menor al costo (${costo})`
          );
          return false;
        }
      }
    }
    return true;
  }

  /**
   * Valida que la cantidad solicitada no exceda la cantidad disponible
   * @returns true si todas las cantidades son válidas, false si alguna excede disponible
   */
  validarCantidadDisponible(): boolean {
    for (let i = 0; i < this.articulos.length; i++) {
      const articulo = this.articulos.at(i).value;

      if (!articulo.articulo) continue;

      const cantidadDisponible = Number(articulo.articulo.cantidad || 0);
      const cantidadSolicitada = Number(articulo.cantidad || 0);

      // Si la cantidad solicitada es mayor que la disponible
      if (cantidadSolicitada > cantidadDisponible && cantidadDisponible > 0) {
        this.toastr.warning(
          `Artículo en línea ${i+1}: Solo hay ${cantidadDisponible} disponibles. Usted solicitó ${cantidadSolicitada}`
        );
      }
    }
    return true;
  }

  /**
   * Valida todos los campos requeridos de los artículos
   * @returns true si todos los campos son válidos, false si falta alguno
   */
  validarCamposRequeridos(): boolean {
    for (let i = 0; i < this.articulos.length; i++) {
      const articulo = this.articulos.at(i).value;

      // Validar campo artículo
      if (!articulo.articulo || !articulo.articulo.id) {
        this.toastr.error(`Línea ${i+1}: Debe seleccionar un artículo`);
        return false;
      }

      // Validar cantidad
      if (!articulo.cantidad || articulo.cantidad <= 0) {
        this.toastr.error(`Línea ${i+1}: La cantidad debe ser mayor a 0`);
        return false;
      }

      // Validar precio
      if (!articulo.precio || articulo.precio <= 0) {
        this.toastr.error(`Línea ${i+1}: El precio debe ser mayor a 0`);
        return false;
      }
    }
    return true;
  }
}
