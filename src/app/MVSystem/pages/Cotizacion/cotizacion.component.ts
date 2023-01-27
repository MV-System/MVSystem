import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { CreatorPDFFile } from '../../../helpers/helper';
import { Garantia, TipoComprobante, TipoFactura, TipoPago } from '../../../core/interfaces/catalogo.interface';
import { ClienteConsultaCriterio, Cliente } from '../../../core/interfaces/cliente.interface';
import { DetalleFacturaList, FacturaFilter } from '../../../core/interfaces/mantenimiento';
import { VendedorLista } from '../../../core/interfaces/vendedor.interface';
import { CatalogosService } from '../../../core/services/catalogos.service';
import { ClientesService } from '../../../core/services/clientes.service';
import { MantenimientoService } from '../../../core/services/mantenimiento.service';
import { VendedorService } from '../../../core/services/vendedor.service';

@Component({
  selector: 'app-cotizacion',
  templateUrl: './cotizacion.component.html',
  styleUrls: ['./cotizacion.component.css']
})
export class CotizacionComponent implements OnInit,OnDestroy {
  
  constructor(
    private fb: FormBuilder,
    private catalogosService: CatalogosService,
    private toastr: ToastrService,
    private clientesService: ClientesService,
    private vendedorService: VendedorService,
    private mantenimientoService: MantenimientoService,
    private toast: ToastrService) { }
  ngOnDestroy(): void {
      this.sub.unsubscribe()
  }
  ngOnInit(): void {
    this.getClientes();
    this.getGarantia();
    this.getTipoComprobante();
    this.getTipoFactura();
    this.getTipoPago();
    this.getVendedor();
    this.getDateCurrentDay();
    this.agregarArticulo();
  }
  sub!:Subscription;
  itbis: number = 0;
  aplicarItbis!: boolean;
  onArticuloValue: boolean = false;
  printing: boolean = false;
  comprobanteTipos: TipoComprobante[] = [];
  clientes: Cliente[] = []
  facturaTipos: TipoFactura[] = [];
  vendedores: VendedorLista[] = []
  pagoTipos: TipoPago[] = [];
  garantias: Garantia[] = [];
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
    comprobante: [0,],
    fechaLimitePago: [,],
    garantia: [8,],
    nota: ['',],
    empresa: [,],
    codigo: [,],
    rnc: ['',],
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
    return this.form.get('nombre')?.value;
  }
  get apellidoCliente() {
    return this.form.get('apellido')?.value;
  }

  searchCliente() {
    if (this.form.get('telefono')?.value.length === 10)
      this.getClientesPorNombreTelefono()
  }
  getClientesPorNombreTelefono() {
    this.form.controls.nombre.setValue('');
    this.form.controls.apellido.setValue('');
    this.form.controls.idCliente.setValue('');
    const { telefono } = this.form.value;

    if (telefono !== '' && telefono) {
      this.sub = this.clientesService.getClientesPorNombreTelefono(telefono)
        .subscribe(cliente => {

          if (cliente.length > 0) {
            cliente.forEach(({ nombres, apellidos, numero_Telefono, id_Cliente }) => {
              this.form.controls.nombre.setValue(nombres);
              this.form.controls.apellido.setValue(apellidos);
              this.form.controls.idCliente.setValue(id_Cliente);
            });
          }
          else {
            this.toastr.warning('No existe este número');
          }
        });
    }
  }
  getClientes() {
    this.sub = this.clientesService.getClientesPorNombreTelefono('').subscribe(clientes => {
      this.clientes = clientes
    })
  }

  imprimir() {
console.log(this.form.value);

    this.sub = this.mantenimientoService.postCotizacionReport(this.form.value)
    .subscribe(blob =>{
      CreatorPDFFile(blob);
    },err=>{
      this.printing = !this.printing;
      this.toast.error('Error al imprimir cotización');
    });
  }
  validarCampos(nombreCampo: string) {
    return this.form.get(nombreCampo)?.invalid &&
      this.form.get(nombreCampo)?.touched
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
      document.querySelector('#articulo')?.querySelector('input')?.focus()
    }, 200);

  }
  onApplyItbis(){
    const {aplicarItbis} = this.form.value;
    return this.aplicarItbis = aplicarItbis
  }
  
  onCheckboxChangeFactura() {
    if (this.form.get('comprobante')?.value !== '0') {
      this.form.get('rnc')?.enable();
      this.form.get('empresa')?.enable();
    }
    else {
      this.form.get('rnc')?.disable();
      this.form.get('empresa')?.disable();
    }
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
  getTipoComprobante() {
    this.form.get('rnc')?.disable();
    this.form.get('empresa')?.disable();
    this.sub = this.catalogosService.getTipoComprobanteLista()
      .subscribe(comprobanteTipos => {
        this.comprobanteTipos = comprobanteTipos;
      });
  }
  getVendedor() {
    this.sub = this.vendedorService.getVendedorLista()
      .subscribe((vendedor) => {
        this.vendedores = vendedor;
      })
  }
}
