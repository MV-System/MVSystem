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
import { AccesorioLista, AsumeITBIS } from 'src/app/core/interfaces/catalogo.interface';
import { CatalogosService } from 'src/app/core/services/catalogos.service';

@Component({
  selector: 'app-cotizacion-list',
  templateUrl: './cotizacion-list.component.html',
  styleUrls: ['./cotizacion-list.component.css'],
})
export class CotizacionListComponent implements OnInit, OnChanges {
  constructor(
    private catalogosService: CatalogosService,
    private toastr: ToastrService,
    private fb: FormBuilder
  ) {}

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
        .subscribe((equipos) => {
          if (equipos && equipos.precioDetalle > 0) {
            const equipo = equipos;

            const articulo: AccesorioLista = {
              accesorio_Descripcion: equipo.marca,
              cantidad: 1,
              id: equipo.imei,
              codigo_Barra: 0,
              modelo: equipo.modelo,
              precio_Detalle: equipo.precioDetalle,
              precio_Por_Mayor: equipo.precioPorMayor,
              codigo: null!,
              idTipo: 1,
              disponible: equipo.Disponible,
              mensaje: equipo.mensaje,
            };

            this.accesorios.push(articulo);
            resolve(
              articulo.id + '/' +
                articulo.accesorio_Descripcion + '/' +
                articulo.modelo + '/' +
                articulo.precio_Detalle + '/' +
                articulo.precio_Por_Mayor + '/' +
                articulo.cantidad + '/' +
                articulo.idTipo
            );
          } else {
            this.toastr.error(`El imei ${imei} no es válido o ya se vendió`);
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
  validateDescuento(desc: number, precio: number,index:number) {
    if (desc >= precio) {
      this.form.setErrors({ error: '' });
      this.toastr.error('El descuento no puede se mayor al precio', '', {
        closeButton: true,
        progressBar: true,
      });
      this.deleteArticulo(index);
      return this.isDescuentoValid;
    }
    else{

      return !this.isDescuentoValid;
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
      if (currentArticulo.idEquipo == currentArticuloList.idEquipo) {
        this.deleteArticulo(index);
        this.toastr.error('Este articulo ya fue registrado');
      }
    }
  }
  obtenerDetalleFactura(index: number) {

    const currentArticulo = this.getCurrentFormGroup(index);
    console.log(currentArticulo);

    let articulo = currentArticulo.articulo;

    this.onClearArticuloDropdown(articulo,index);
    this.onDetectValueArticulo(articulo);
    if (!currentArticulo || !articulo) return;

    currentArticulo.idTipo = 2;
    currentArticulo.idGarantia = 1;
    currentArticulo.idEquipo = articulo.id;
    currentArticulo.descripcion =
      articulo.accesorio_Descripcion + '  ' + articulo.modelo;
    currentArticulo.precioDetalle = articulo.precio_Detalle;
    currentArticulo.precioMayor = articulo.precio_Por_Mayor;
    // currentArticulo.itbis = this.itbis;

    this.validateSameArticulo(this.articulos,index,currentArticulo);

      currentArticulo.precio = this.calcularPrecioSegunTipofactura(
      currentArticulo.precioDetalle,
      currentArticulo.precioMayor
    );

      currentArticulo.subTotal = this.calcularSubTotalArticulo(
      currentArticulo.precio,
      currentArticulo.cantidad
    );

    let isValidDesc = this.validateDescuento(
      currentArticulo.descuento,
      currentArticulo.precio,
      index
    );


    if (isValidDesc == true) {
      console.log(isValidDesc);

      this.articulos.controls[index].setValue(currentArticulo);

      this.obtenerCantidadArticuloStock(index);

      this.onApplyItbis();
    }

    //Tiene que estar al final. EnmaJim note
    // if (currentArticulo.idTipo == 1)
    //   currentFormGroup.controls["cantidad"].disable()
  }
  calcularPrecioSegunTipofactura(precioDetalle: number, precioMayor: number) {
    return Number(
      (this.tipoFactura == 1 ? precioDetalle : 0) ||
        (this.tipoFactura == 2 ? precioMayor : 0)
    );
  }

  obtenerCantidadArticuloStock(index: number) {
    const currentArticulo = this.articulos.controls[index].value;
    const subTotal = this.calcularSubTotalArticulo(
      currentArticulo.precio,
      currentArticulo.cantidad
    );

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
  onApplyItbis() {
    this.subTotal = this.descuento = this.total = this.itbis = 0;
    for (let a = 0; a < this.articulos.length; a++) {
      const articulo = this.articulos.controls[a].value;
      this.subTotal += articulo.subTotal;
      this.descuento += articulo.descuento;
      this.total += articulo.total;
    }
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
      document.querySelector('#articulo')?.querySelector('input')?.focus();
    }, 200);

  }
  getAccesorios() {
    this.catalogosService.getAccesorioLista().subscribe((accesorios) => {
      this.accesorios = accesorios;
    });
  }
}
