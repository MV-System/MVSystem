import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
// import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-facturacion',
  templateUrl: './facturacion-registro.component.html',
  styleUrls: ['./facturacion-registro.component.css']
})
export class FacturacionRegistroComponent implements OnInit {
  detalleFacturaRegistro: DetalleFacturaList[]=[];
  listaTipoFactura: TipoFactura[]=[];
  listaVendedor: VendedorLista[]=[]
  listaPagoFactura: TipoPago[]=[];
  listaGarantia: Garantia[]=[];
  listaAccesorio: AccesorioLista[]=[];
  listaTipoComprobante: TipoComprobante[]=[];
  precioArticulo!: number;
  subTotal: number=0;
  totalArticulo!: number;
  calculoPrecio!: number;
  numeroRegistro!: number;
  loadingButtonBuscar: boolean = false;
  btnDisabledTelefono: boolean = true;
  btnDisabledArticulo: boolean = true;
  dateTimeFormat!: any;


  constructor(
              private fb: FormBuilder,
              private catalogosService: CatalogosService,
              private toastr: ToastrService,
              private clientesService: ClientesService,
              private vendedorService: VendedorService,
              private mantenimientoService: MantenimientoService,
              ) { }

  ngOnInit(): void {
    this.btnDisableTelefono();
    this.btnDisableArticulo();
    this.obtenerTipoFactura();
    this.obtenerTipoPago();
    this.obtenerTipoComprobante();
    this.obtenerVendedor();
    this.obtenetAccesorios();
    this.deshabilitadorInputs();
    this.setFechaDiaActual();
    this.obtenerGarantia();
    this.validarInputArticulo(); 
    this.validarInputDescuentoArticulo();

}


  //Forms
  formRegistroArticulo: FormGroup = this.fb.group({
    codigo:[,],
    cantidadElegida:[,],
    articulo:[,],
    descuento:[,],
  })
  formRegistro: FormGroup = this.fb.group({
    idCliente:  [''],
    nombre:     [''],
    apellido:   [''],
    telefono:   [,Validators.required],
    vendedor:   [,],
    almacen:    [,],
    tipoFactura:[1,],
    tipoPago:[1,],
    fechaFacturacion:['',],
    comprobante:[0,],
    fechaLimitePago:[,],
    garantia:[8,],
    nota:['',],
    // persona:[1,],
    empresa:[,],
    codigo:[,],
    // monto:[,],
    RNC:['',],

    cantidadElegidaLista:[,],
    articuloLista:[,],
    descuentoLista:[,],

    subTotal:[,],
    subTotalArticulo:[,],
    precioArticulo:[,],
    totalArticulo:[,],
  });


  criterioBusqueda: any = {
    criterio: '',
  }

  registroFactura(){
    this.obtenerDetalleFactura();
    if (this.formRegistro.invalid) {
      
        this.formRegistro.markAllAsTouched();
    }
    else{

      const modelo = this.modeloRegistroFacturacion();
      this.mantenimientoService.postFactura(modelo)
                              .subscribe(factura =>{
                                console.log(factura);
                                this.toastr.success('Factura impresa correctamente');
                              })
      console.log(modelo);
    }
  }
  calcularPrecioSegunTipofactura(precioDetalle: number,precioMayor: number){
   return Number( (this.formRegistro.get('tipoFactura')?.value == 1? precioDetalle : 0) ||
                (this.formRegistro.get('tipoFactura')?.value == 2? precioMayor : 0))
  }

  obtenerDetalleFactura(){

      let articulo =this.formRegistroArticulo.get('articulo')?.value;
      let idEquipo =      articulo.split('/')[0];
      let descripcion =   articulo.split('/')[1] +  '  ' + articulo.split('/')[2];
      let precioDetalle = articulo.split('/')[3];
      let precioMayor =   articulo.split('/')[4];

      this.calculoPrecio = this.calcularPrecioSegunTipofactura(precioDetalle,precioMayor);
      let subTotal =this.calcularSubTotalArticulo( this.calculoPrecio);
     
      this.obtenerCantidadArticuloStock();
      this.validarInputArticulo();
      
      let modelAccesorio: DetalleFacturaList ={
        numeroFactura: this.numeroRegistro,
        idEquipo: Number(idEquipo),
        descripcion: descripcion,
        idTipo: 1,
        idVendedor: Number(this.formRegistro.get('vendedor')?.value),
        idTipoFactura: Number(this.formRegistro.get('tipoFactura')?.value),
        idGarantia: this.formRegistro.get('garantia')?.value,
        subTotal: subTotal,
        cantidad: this.obtenerCantidadArticuloStock() ?
          this.formRegistroArticulo.get('cantidadElegida')?.value || 0 :
          Number(this.formRegistroArticulo.get('cantidadElegida')?.value),
        precio: this.calculoPrecio,
        descuento: Number(this.formRegistroArticulo.get('descuento')?.value),
        total: this.totalArticulo,
        fechaRegistro: this.obtenerFechaFacturacion(),
        itbis: 0,
        Usuario: ''
      }
      this.calculoTotal();
       
        return modelAccesorio;
    
  }


  calcularSubTotalArticulo(precio: number) {
    return  this.subTotal = precio * 
            this.formRegistroArticulo.get('cantidadElegida')?.value;
  }

  desactivarActivarFechaLimitepago(){

    if (this.formRegistro.get('tipoPago')?.value == 2) {
      this.formRegistro.get('fechaLimitePago')?.enable()
    }
    else{
      this.formRegistro.get('fechaLimitePago')?.disable()
    }
    
  }
  setFechaDiaActual(){
  

    let date = new Date();
    let output =  String( date.getFullYear() ).padStart(2, '0') + '-' + 
                  String( date.getMonth() + 1).padStart(2, '0') + '-' + 
                  String( date.getDate()).padStart(2, '0');
    this.formRegistro.get('fechaFacturacion')?.setValue(output);
    this.formRegistro.get('fechaLimitePago')?.setValue(output);
    // this.dateTimeFormat = this.datePipe.transform(output, "MM-dd-yyyy");
    // console.log(this.dateTimeFormat);
    
    return output
  }
  replacer(str:string, p1:string, p2:string)
  {
    return str + " / " + p1 + " / " + p2;
  }
  obtenerFechaFacturacion(){
    let fecha= this.formRegistro.get('fechaFacturacion')?.value;
    let fechaReplaceSignos =fecha.replace(/-/g,'/');
    return fechaReplaceSignos.replace(/(\w+)\/(\w+)\/(\w+)/,"$2/$3/$1");
  }
  obtenerFechaLimitePago(){
    let fecha= this.formRegistro.get('fechaLimitePago')?.value;
    let fechaReplaceSignos =fecha.replace(/-/g,'/');
    return fechaReplaceSignos.replace(/(\w+)\/(\w+)\/(\w+)/,"$2/$3/$1");
  }
  agregarNuevoArticuloAlArray(){
    this.subTotal =0

    this.formRegistro.get('articuloLista')?.disable();
    this.formRegistro.get('cantidadElegidaLista')?.disable();
    this.formRegistro.get('descuentoLista')?.disable();

    // this.detalleFacturaRegistro= this.detalleFacturaRegistro.filter((id) => id.idEquipo !== 0);
 
    this.detalleFacturaRegistro.push(this.obtenerDetalleFactura());
    this.formRegistroArticulo.reset();

    console.log(this.detalleFacturaRegistro);

    /* Si ya se eligió un accesorio 
    se debe bloquear la opcion de elegir el tipo de factura */
    if (this.detalleFacturaRegistro.length > 1) {
      this.formRegistro.get('tipoFactura')?.disable();
    }
  }
  //TODO
  borrarArticulo(id: number){
    this.detalleFacturaRegistro.filter((item) => {
      return item.idEquipo !== id;
    });
        console.log(id);
        
  }

  obtenerCantidadArticuloStock(){
    
    this.calcularSubTotalArticulo(this.calculoPrecio); 
  
    
    let cantidadStockAccesorio =this.formRegistroArticulo.get('articulo')?.value.split('/')[5];
    let cantidadElegida =this.formRegistroArticulo.get('cantidadElegida')?.value;

    this.calculoTotal();
     return Number( cantidadElegida) > cantidadStockAccesorio? 
           this.toastr.info(`Inventario insuficiente, cantidad disponible:  ${cantidadStockAccesorio}`):
           Number( cantidadElegida)

  }
  obtenerDescuentoArticulo():number{

    return this.calculoTotal() - this.formRegistro.get('descuento')?.value;
  }

  calculoTotal(){
    this.totalArticulo= ( this.subTotal -  Number( this.formRegistroArticulo.get('descuento')?.value));
    return this.totalArticulo;

  }

  modeloRegistroFacturacion(){

    const model: FacturaRegistro= {
      numeroFactura: 0,
      idCliente: Number(this.formRegistro.get('idCliente')?.value),
      idVendedor: Number(this.formRegistro.get('vendedor')?.value),
      idAlmacen:1,
      // idAlmacen: Number(this.formRegistro.get('almacen')?.value),
      idTipoFactura: Number(this.formRegistro.get('tipoFactura')?.value),
      idTipoPago: Number(this.formRegistro.get('tipoPago')?.value),
      fechaRegistro: this.obtenerFechaFacturacion(),
      ncfTipoNumero: Number(this.formRegistro.get('comprobante')?.value),
      RNC: this.formRegistro.get('RNC')?.value,
      fechaLimitePago: this.obtenerFechaLimitePago(),
      garantia: this.formRegistro.get('garantia')?.value,
      nota: this.formRegistro.get('nota')?.value,
      descripcion: "",
      itbis: 0,
      subTotal: 0,
      total: 0,
      abono: 0,
      descuento: 0,
      cantidadArticulos: this.detalleFacturaRegistro.length,
      detalleFacturaList: this.detalleFacturaRegistro,
    }
    
    return model;
  }
 

  //  loadingSpinner(){
  //    return this.loadingButtonBuscar == true ? 
  //       this.loadingButtonBuscar == true 
  //       : this.loadingButtonBuscar == false;
  //  }
  obtenerClientesPorNombreTelefono(){
    this.formRegistro.controls.nombre.setValue('');
    this.formRegistro.controls.apellido.setValue('');
    this.formRegistro.controls.idCliente.setValue('');

    
    this.criterioBusqueda.criterio = this.formRegistro.controls.telefono.value;
    if (this.criterioBusqueda.criterio !== '' && this.criterioBusqueda.criterio !== null) {
      
      this.loadingButtonBuscar = true;
      
    this.clientesService.getClientesPorNombreTelefono(this.criterioBusqueda.criterio)
                        .subscribe( cliente => {
                  
                          if (cliente.length == 0) {
                            this.loadingButtonBuscar = false;
                            this.toastr.warning('No existe este número');
                          }
                          
                          cliente.forEach( ({nombres,apellidos, numero_Telefono,id_Cliente}) => {
                            this.loadingButtonBuscar = false;
                         
                            this.formRegistro.controls.nombre.setValue(nombres);
                            this.formRegistro.controls.apellido.setValue(apellidos);
                            this.formRegistro.controls.idCliente.setValue(id_Cliente);
                       
                          });
                          
                        });
                      }
  }
  onCheckboxChange(event: any, campo: any ) {
    if(event.target.checked == false) {
        this.formRegistro.get(campo)?.disable();
    } 
    else{
        this.formRegistro.get(campo)?.enable();
      }
  }
  onCheckboxChangeFactura( nfcTipoNumero: string) {
    
    if(this.formRegistro.get(nfcTipoNumero)?.value !== '0'){

        // if(!event.target.checked ) {
            // this.formRegistro.get('comprobante')?.disable();
            this.formRegistro.get('RNC')?.enable();
            this.formRegistro.get('empresa')?.enable();
      
        } 
        else{
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
  validarCamposArticulo(nombreCampo: string) {

    return this.formRegistroArticulo.get(nombreCampo)?.invalid && 
          this.formRegistroArticulo.get(nombreCampo)?.touched 
  }
  validarInputArticulo(){
  this.validarInputDescuentoArticulo()
    return !this.formRegistroArticulo.get('articulo')?.value  ?
            this.formRegistroArticulo.get('cantidadElegida')?.disable() :
            this.formRegistroArticulo.get('cantidadElegida')?.enable()
    
  }
  validarInputDescuentoArticulo(){
    return !this.formRegistroArticulo.get('articulo')?.value  ?
            this.formRegistroArticulo.get('descuento')?.disable() :
            this.formRegistroArticulo.get('descuento')?.enable()
    
  }
  btnDisableTelefono(){
    return (  this.formRegistro.get('telefono')?.value > 9)  ? 
              this.btnDisabledTelefono = false: 
              this.btnDisabledTelefono = true;
  }
  btnDisableArticulo(){
    return (  this.formRegistroArticulo.get('cantidadElegida')?.value > 0)  ? 
              this.btnDisabledTelefono = false: 
              this.btnDisabledTelefono = true;
  }
  deshabilitadorInputs(){
    // this.formRegistro.get('comprobante')?.disable();
    this.formRegistro.get('RNC')?.disable();
    this.formRegistro.get('empresa')?.disable();
    // this.formRegistro.get('garantia')?.disable();
    this.formRegistro.get('fechaLimitePago')?.disable()

  }
  obtenerEquipoNumeroRegistro(){
    this.mantenimientoService.getEquipoNumeroRegistro()
    .subscribe(numeroRegistro =>{
      numeroRegistro.forEach(({numero_Registro})=>{
        this.numeroRegistro = numero_Registro;
      });
    });
  }
  //catalogos

  obtenerGarantia(){
    this.catalogosService.getGarantiaLista()
                        .subscribe(garantia=>{
                          this.listaGarantia = garantia;
                        })
    }
  obtenerTipoFactura(){
    this.catalogosService.getTipoFacturaLista()
        .subscribe(TipoFactura =>{
            this.listaTipoFactura = TipoFactura;
        });
  }
  obtenerTipoPago(){
    this.catalogosService.getTipoPagoLista()
        .subscribe(TipoPago =>{
            this.listaPagoFactura = TipoPago;
          });
          
  }
  obtenerTipoComprobante(){
    this.catalogosService.getTipoComprobanteLista()
        .subscribe(TipoComprobante =>{
            this.listaTipoComprobante = TipoComprobante;
        });
  }
  obtenerVendedor(){
    this.vendedorService.getVendedorLista()
                        .subscribe( (vendedor) =>{
                            this.listaVendedor = vendedor;
                        })
  }
  obtenetAccesorios(){
    this.catalogosService.getAccesorioLista()
                        .subscribe(accesorio=>{
                          console.log(accesorio);
                          
                          this.listaAccesorio = accesorio;
                        })
  }
}
