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
  nuevoInputArticulo: number[]=[1];
  nuevoInputArticuloList: any[]=[]
  loadingButtonBuscar: boolean = false;
  precioArticulo!: number;
  subTotal!: number;
  totalArticulo!: number;


  constructor(
              private fb: FormBuilder,
              private catalogosService: CatalogosService,
              private toastr: ToastrService,
              private clientesService: ClientesService,
              private vendedorService: VendedorService,
              private mantenimientoService: MantenimientoService ) { }

  ngOnInit(): void {
    this.btnDisable();
    this.obtenerTipoFactura();
    this.obtenerTipoPago();
    this.obtenerTipoComprobante();
    this.obtenerVendedor();
    this.obtenetAccesorios();
    this.deshabilitadorInputs();
    this.obtenerFechaDiaActual();
    this.obtenerGarantia();
    // this.nuevoInputArticuloList =[{
    //   idEquipo: 0,
    //   descripcion: '',

    // }]
    this.detalleFacturaRegistro =[{
      numeroFactura: 0,
        idEquipo:0,
        descripcion: '',
        idTipo:  0,
        idGarantia: 0,
        subTotal: 0,
        cantidad: 0,
        precio: 0,
        descuento: 0,
        // itbis: 0,
        total: 0,
        fechaRegistro: ''
    // this.formRegistro.get('fechaFacturacion')?.setValue()
  }];
  
}
  btnDisabled: boolean = true;

  //Forms
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
    articulo:[,],
    garantia:[8,],
    cantidadElegida:[,],
    nota:['',],
    // persona:[1,],
    empresa:[,],
    codigo:[,],
    // monto:[,],
    RNC:['',],
    subTotal:[,],
    subTotalArticulo:[,],
    precioArticulo:[,],
    totalArticulo:[,],
    descuento:[,]
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
      // this.mantenimientoService.postFactura(modelo)
      //                         .subscribe(factura =>{
      //                           console.log(factura);
                                
      //                         })
      console.log(modelo);
    }
  }
  calcularPrecioSegunTipofactura(precioDetalle: number,precioMayor: number){
   return Number( (this.formRegistro.get('tipoFactura')?.value == 1? precioDetalle : 0) ||
                (this.formRegistro.get('tipoFactura')?.value == 2? precioMayor : 0))
  }
  obtenerDetalleFactura(){
    console.log('obtenerDetalleFactura');

      let articulo =this.formRegistro.get('articulo')?.value;
      if (articulo == null) {
        //Aqui limpiar valores del objeto del articulo
      }


      let idEquipo =   articulo.split('/')[0];
      let descripcion =articulo.split('/')[1] + articulo.split('/')[2];
      let precioDetalle =   articulo.split('/')[3];
      let precioMayor =   articulo.split('/')[4];
      let cantidadElegida =this.formRegistro.get('cantidadElegida')?.value;
      let calculoPrecio =  this.calcularPrecioSegunTipofactura(precioDetalle,precioMayor);
      
      
      this.precioArticulo =calculoPrecio
      // console.log(this.subTotal= cantidadElegida == 0?calculoPrecio :  cantidadElegida * calculoPrecio);
      this.obtenerCantidadArticulo();
      let modelAccesorio: DetalleFacturaList ={
        numeroFactura: 0,
        idEquipo:Number( idEquipo),
        descripcion: descripcion,
        idTipo:  1,
        idGarantia: this.formRegistro.get('garantia')?.value,
        // subTotal: this.subTotal,
        subTotal:  this.subTotal ,
        // cantidad: cantidadElegida,
        cantidad: this.obtenerCantidadArticulo() ?
                  this.formRegistro.get('cantidadElegida')?.value || 0   :
                  Number(this.formRegistro.get('cantidadElegida')?.value),
        precio: calculoPrecio,
        descuento: Number( this.formRegistro.get('descuento')?.value),
        // itbis: 0,
        total: this.totalArticulo,
        fechaRegistro: this.obtenerFechaDiaActual(),
      }
     
      
        this.precioArticulo= modelAccesorio.precio

    //  console.log(this.totalArticulo= ( this.subTotal - modelAccesorio.descuento)   );
      this.calculoTotal();
    //  this.calcularSubTotal(modelAccesorio.precio, modelAccesorio.cantidad)
       
        return modelAccesorio;
    
  }
  desactivarActivarFechaLimitepago(){

    if (this.formRegistro.get('tipoPago')?.value == 2) {
      this.formRegistro.get('fechaLimitePago')?.enable()
    }
    else{
      this.formRegistro.get('fechaLimitePago')?.disable()
    }
    
  }
  obtenerFechaDiaActual(){

    let date = new Date();
    let output =  String( date.getFullYear() ).padStart(2, '0') + '-' + 
                  String( date.getMonth() + 1).padStart(2, '0') + '-' + 
                  String(date.getDate()).padStart(2, '0');
                  // console.log(output);
                  // console.log(date);
                  
                  
    this.formRegistro.get('fechaFacturacion')?.setValue(output);
    this.formRegistro.get('fechaLimitePago')?.setValue(output);
    return output;
  }
  agregarNuevoArticuloVacioAlArray(){
    this.detalleFacturaRegistro.push({ 
      numeroFactura: 0,
      idEquipo:0,
      descripcion: '',
      idTipo:  0,
      idGarantia: 0,
      subTotal: 0,
      cantidad: 0,
      precio: 0,
      descuento: 0,
      // itbis: 0,
      total: 0,
      fechaRegistro: ''})
  }

  //TODO
  agregarNuevoArticuloAlArray(){
    
    
    
    
    this.detalleFacturaRegistro= this.detalleFacturaRegistro.filter((id) => id.idEquipo !== 0);
 
    this.detalleFacturaRegistro.push(this.obtenerDetalleFactura());
    this.detalleFacturaRegistro.push({ 
      numeroFactura: 0,
      idEquipo:0,
      descripcion: '',
      idTipo:  0,
      idGarantia: 0,
      subTotal: 0,
      cantidad: 0,
      precio: 0,
      descuento: 0,
      // itbis: 0,
      total: 0,
      fechaRegistro: ''})
    

console.log(this.detalleFacturaRegistro);

    
    //  this.nuevoInputArticulo.lastIndexOf(this.nuevoInputArticulo.length ) == 1  )
   
    /* Si ya se eligió un accesorio 
    se debe bloquear la opcion de elegir el tipo de factura */
    if (this.detalleFacturaRegistro.length > 1) {
      this.formRegistro.get('tipoFactura')?.disable();
    }
    // console.log({index:index});
    
    // console.log({arrays:this.nuevoInputArticulo});
    // console.log({arraysLength:this.nuevoInputArticulo.length});
    // console.log({ultimoLista:this.nuevoInputArticulo.lastIndexOf(this.nuevoInputArticulo.length)});
     
  }
  //TODO
  borrarArticulo(id: number){
    console.log(id);
    let deleteInputAccesorio: number[]=[];
    deleteInputAccesorio = this.nuevoInputArticulo.filter((item) => {
      return item !== id;
    });
   this.nuevoInputArticulo =deleteInputAccesorio;
  }
   //TODO
  alQuitarArticulo(e: any){
    console.log(e);
    
  }
   //TODO
  obtenerCantidadArticulo(){
    console.log('key');
    
    let cantidadStockAccesorio =this.formRegistro.get('articulo')?.value.split('/')[5];
    let cantidadElegida =this.formRegistro.get('cantidadElegida')?.value;
    this.subTotal =this.precioArticulo * cantidadElegida;
 
    this.calculoTotal()
     return Number( cantidadElegida) > cantidadStockAccesorio? 
           this.toastr.info(`Inventario insuficiente, cantidad disponible:  ${cantidadStockAccesorio}`):
           Number( cantidadElegida)

    
    
  }
  obtenerDescuentoArticulo():number{

    return this.calculoTotal() - this.formRegistro.get('descuento')?.value;
  }

  calculoTotal(){
    this.totalArticulo= ( this.subTotal -  Number( this.formRegistro.get('descuento')?.value));
    return this.totalArticulo;

  }
  calcularSubTotal(numero1: number, numero2: number){
    console.log(numero1 * numero2);
    
        return numero1 * numero2;
  }
  modeloRegistroFacturacion(){

    const model: FacturaRegistro= {
      numeroFactura: 0,
      idCliente: Number(this.formRegistro.get('idCliente')?.value),
      idVendedor: Number(this.formRegistro.get('vendedor')?.value),
      idAlmacen: Number(this.formRegistro.get('almacen')?.value),
      idTipoFactura: Number(this.formRegistro.get('tipoFactura')?.value),
      idTipoPago: Number(this.formRegistro.get('tipoPago')?.value),
      // nombre: this.formRegistro.get('nombre')?.value,
      // apellido: this.formRegistro.get('apellido')?.value,
      // telefono: this.formRegistro.get('telefono')?.value,
      fechaRegistro: this.formRegistro.get('fechaFacturacion')?.value,
      ncfTipoNumero: Number(this.formRegistro.get('comprobante')?.value),
      RNC: this.formRegistro.get('RNC')?.value,
      fechaLimitePago: this.formRegistro.get('fechaLimitePago')?.value,
      garantia: this.formRegistro.get('garantia')?.value,
      nota: this.formRegistro.get('nota')?.value,
      // persona:Number( this.formRegistro.get('persona')?.value),
      // empresa: this.formRegistro.get('empresa')?.value,
      // monto: this.formRegistro.get('monto')?.value,
      descripcion: "",
      itbis: 0,
      subTotal: 0,
      total: 0,
      abono: 0,
      descuento: 0,
      cantidadArticulos: this.nuevoInputArticulo.length,
      detalleFacturaList: this.detalleFacturaRegistro,
    }
    // console.log(this.detalleFacturaRegistro);
    
    return model;
  }
  deshabilitadorInputs(){
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
  btnDisable(){
    return (  this.formRegistro.get('telefono')?.value > 9)  ? 
              this.btnDisabled = false: 
              this.btnDisabled = true;
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
                          this.listaAccesorio = accesorio;
                        })
  }
}
