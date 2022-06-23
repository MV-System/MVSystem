import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CatalogosService } from 'src/app/MVSystem/services/catalogos.service';
import { ToastrService } from 'ngx-toastr';
import { Garantia, TipoComprobante, TipoFactura, TipoPago } from 'src/app/MVSystem/interfaces/catalogo.interface';
import { ClientesService } from '../../../services/clientes.service';
import { VendedorService } from '../../../services/vendedor.service';
import { VendedorLista } from 'src/app/MVSystem/interfaces/vendedor.interface';
import { DetalleFactura, FacturaRegistro } from 'src/app/MVSystem/interfaces/mantenimiento';
import { ModeloEquipo, AccesorioLista, Codigo } from '../../../interfaces/catalogo.interface';
import { AccesorioFactura, Accesorio } from '../../../interfaces/mantenimiento';

@Component({
  selector: 'app-facturacion',
  templateUrl: './facturacion-registro.component.html',
  styleUrls: ['./facturacion-registro.component.css']
})
export class FacturacionRegistroComponent implements OnInit {
  detalleFacturaRegistro: DetalleFactura[]=[];
  listaTipoFactura: TipoFactura[]=[];
  listaVendedor: VendedorLista[]=[]
  listaPagoFactura: TipoPago[]=[];
  listaGarantia: Garantia[]=[];
  listaAccesorio: AccesorioLista[]=[];
  listaTipoComprobante: TipoComprobante[]=[];
  nuevoInputAccesorio: number[]=[1]
  loadingButtonBuscar: boolean = false;


  constructor(
              private fb: FormBuilder,
              private catalogosService: CatalogosService,
              private toastr: ToastrService,
              private clientesService: ClientesService,
              private vendedorService: VendedorService ) { }

  ngOnInit(): void {
    this.btnDisable();
    this.obtenerTipoFactura();
    this.obtenerTipoPago();
    this.obtenerTipoComprobante();
    this.obtenerVendedor();
    this.obtenetAccesorios();
    this.deshabilitadorInputFacturaComprobante();
    this.obtenerFechaDiaActual();
    this.obtenerGarantia();
    
    // this.formRegistro.get('fechaFacturacion')?.setValue()
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
    fechaFacturacion:[,],
    comprobante:[0,],
    fechaLimitePago:[,],
    accesorio:[,],
    garantia:[8,],
    cantidadAccesorio:[,],
    nota:[,],
    // persona:[1,],
    empresa:[,],
    codigo:[,],
    // monto:[,],
    RNC:[,]
  });

  // formCliente: FormGroup = this.fb.group({
  //   nombre:     [''],
  //   apellido:   [''],
  //   numeroTelefono: ['',[Validators.required,Validators.min(10)]],
  //   idCliente: [,]
  // });

  criterioBusqueda: any = {
    criterio: '',
  }

  registroFactura(){
    this.obtenerDetalleFactura()

    if (this.formRegistro.invalid) {
      
        this.formRegistro.markAllAsTouched();
    }
    else{

      const modelo = this.modeloRegistroFacturacion();
      console.log(modelo);
    }
  }


  obtenerFechaDiaActual(){
    let date = new Date();
    let output =  String( date.getFullYear() ).padStart(2, '0') + '-' + 
                  String( date.getMonth() + 1).padStart(2, '0') + '-' + 
                  date.getDate();
    this.formRegistro.get('fechaFacturacion')?.setValue(output);
    return output;
  }
  agregarNuevoAccesorioAlArray(index: number){
    
  
    if( this.nuevoInputAccesorio.length == 1 ){
     this.nuevoInputAccesorio?.push(this.nuevoInputAccesorio.length + 1); 
   }
    
    else if( this.nuevoInputAccesorio.length ==index  ) {
      this.nuevoInputAccesorio?.push(this.nuevoInputAccesorio.length + 1);
      // this.formRegistro.controls.codigo.setValue(index);
      
    }

    /* Si ya se eligió un accesorio 
    se debe bloquear la opcion de elegir el tipo de factura */
    if (this.nuevoInputAccesorio.length > 1) {
      this.formRegistro.get('tipoFactura')?.disable();
    }
    
     
  }
  // precioVenta?: number, precioMayor?: number
  obtenerDetalleFactura(idEquipo?: number, precioDetalle?: number,precioMayor?: number){

    
      let modelAccesorio: DetalleFactura ={
        // descripcion: (accesorio +' '+ modelo),
        idEquipo:Number( idEquipo),
        cantidad: this.formRegistro.get('cantidadAccesorio')?.value,
        numeroFactura: 0,
        idAlmacen: 0,
        idTipo: 0,
        idVendedor: 0,
        idTipoFactura: 0,
        idGarantia: 0,
        precio: Number( (this.formRegistro.get('tipoFactura')?.value == 1? precioDetalle : 0) ||
                (this.formRegistro.get('tipoFactura')?.value == 2? precioMayor : 0)),
          // precio:       (this.formRegistro.get('tipoFactura')?.value == 1? precioVenta : 0),
        // precio:      (this.formRegistro.get('tipoFactura')?.value == 2? precioMayor : 0)
        subTotal: 0,
        descuento: 0,
        itbis: 0,
        total: 0,
        fechaRegistro: this.obtenerFechaDiaActual()
      }

    this.detalleFacturaRegistro.push(modelAccesorio)
    console.log(modelAccesorio);
    
  }
  modeloRegistroFacturacion(){
    // this.accesorioFacturaRegistro =[{
    //   codigo: this.formRegistro.get('codigo')?.value,
    //   descripcion: this.formRegistro.get('accesorio')?.value,
    //   cantidad: this.formRegistro.get('cantidadAccesorio')?.value,
  
    // }
    // ]
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
      fechaFacturacion: this.formRegistro.get('fechaFacturacion')?.value,
      ncfTipoNumero: Number(this.formRegistro.get('comprobante')?.value),
      // comprobante: Number(this.formRegistro.get('comprobante')?.value),
      fechaLimitePago: this.formRegistro.get('fechaLimitePago')?.value,
      garantia: this.formRegistro.get('garantia')?.value,
      nota: this.formRegistro.get('nota')?.value,
      // persona:Number( this.formRegistro.get('persona')?.value),
      // empresa: this.formRegistro.get('empresa')?.value,
      // monto: this.formRegistro.get('monto')?.value,
      // RNC: this.formRegistro.get('RNC')?.value,
      itbis: 0,
      subTotal: 0,
      total: 0,
      abono: 0,
      descuento: 0,
      cantidadArticulos: 0,
      detalleFactura: this.detalleFacturaRegistro,
    }
    return model;
  }
  deshabilitadorInputFacturaComprobante(){
    // this.formRegistro.get('comprobante')?.disable();
    this.formRegistro.get('RNC')?.disable();
    this.formRegistro.get('empresa')?.disable();
    // this.formRegistro.get('garantia')?.disable();
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
          this.deshabilitadorInputFacturaComprobante();
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
