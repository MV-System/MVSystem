import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CatalogosService } from 'src/app/MVSystem/services/catalogos.service';
import { ToastrService } from 'ngx-toastr';
import { TipoComprobante, TipoFactura, TipoPago } from 'src/app/MVSystem/interfaces/catalogo.interface';
import { ClientesService } from '../../../services/clientes.service';
import { VendedorService } from '../../../services/vendedor.service';
import { VendedorLista } from 'src/app/MVSystem/interfaces/vendedor.interface';
import { FacturaRegistro } from 'src/app/MVSystem/interfaces/mantenimiento';
import { ModeloEquipo, AccesorioLista } from '../../../interfaces/catalogo.interface';
import { AccesorioFactura } from '../../../interfaces/mantenimiento';

@Component({
  selector: 'app-facturacion',
  templateUrl: './facturacion-registro.component.html',
  styleUrls: ['./facturacion-registro.component.css']
})
export class FacturacionRegistroComponent implements OnInit {
  listaTipoFactura: TipoFactura[]=[];
  listaPagoFactura: TipoPago[]=[];
  listaTipoComprobante: TipoComprobante[]=[];
  loadingButtonBuscar: boolean = false;
  listaVendedor: VendedorLista[]=[]
  nuevoInputAccesorio: number[]=[1]
  listaAccesorio: AccesorioLista[]=[];
  AccesorioFacturaRegistro: AccesorioFactura[]=[];

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
  }
  btnDisabled: boolean = true;

  //Forms
  formRegistro: FormGroup = this.fb.group({
    idCliente:  [''],
    nombre:     [''],
    apellido:   [''],
    telefono:   [,Validators.required],
    vendedor:   [,],
    tipoFactura:[1,],
    tipoPago:[1,],
    fechaFacturacion:[,],
    comprobante:[0,],
    fechaLimitePago:[,],
    accesorio:[,],
    garantia:[,],
    cantidadAccesorio:[,],
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

  agregarNuevoAccesorio(index: number){

    if( this.nuevoInputAccesorio.length == 1 ){
     this.nuevoInputAccesorio?.push(this.nuevoInputAccesorio.length + 1); 
   }
    
    else if( this.nuevoInputAccesorio.length ==index  ) {
      this.nuevoInputAccesorio?.push(this.nuevoInputAccesorio.length + 1);
      // this.formRegistro.controls.codigo.setValue(index);
      
    }
     

  }
  obtenerIdAccesorio(id: number){
    console.log(id);
    
  }
  modeloRegistroFacturacion(){
    this.AccesorioFacturaRegistro =[{
      codigo: this.formRegistro.get('codigo')?.value,
      descripcion: this.formRegistro.get('accesorio')?.value,
      cantidad: this.formRegistro.get('cantidadAccesorio')?.value,
      // precio: this.formRegistro.get('precio')?.value,
    }
    ]
    const model: FacturaRegistro= {
      idCliente: Number(this.formRegistro.get('idCliente')?.value),
      nombre: this.formRegistro.get('nombre')?.value,
      apellido: this.formRegistro.get('apellido')?.value,
      telefono: this.formRegistro.get('telefono')?.value,
      vendedor: Number(this.formRegistro.get('vendedor')?.value),
      tipoFactura: Number(this.formRegistro.get('tipoFactura')?.value),
      tipoPago: Number(this.formRegistro.get('tipoPago')?.value),
      fechaFacturacion: this.formRegistro.get('fechaFacturacion')?.value,
      comprobante: Number(this.formRegistro.get('comprobante')?.value),
      fechaLimitePago: this.formRegistro.get('fechaLimitePago')?.value,
      garantia: this.formRegistro.get('garantia')?.value,
      accesorio: this.AccesorioFacturaRegistro,

      // persona:Number( this.formRegistro.get('persona')?.value),
      empresa: this.formRegistro.get('empresa')?.value,
      monto: this.formRegistro.get('monto')?.value,
      RNC: this.formRegistro.get('RNC')?.value,
    }
    return model;
  }
  deshabilitadorInputFacturaComprobante(){
    this.formRegistro.get('comprobante')?.disable();
    this.formRegistro.get('RNC')?.disable();
    this.formRegistro.get('empresa')?.disable();
    this.formRegistro.get('garantia')?.disable();
  }
  registroFactura(){
    if (this.formRegistro.invalid) {
      
        this.formRegistro.markAllAsTouched();
    }
    else{

      const modelo = this.modeloRegistroFacturacion();
      console.log(modelo);
    }
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
    if (this.criterioBusqueda.criterio !== '') {
      
      this.loadingButtonBuscar = true;
      
    this.clientesService.getClientesPorNombreTelefono(this.criterioBusqueda.criterio)
                        .subscribe( cliente => {
                          
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
  onCheckboxChangeFactura(event: any) {
    if(event.target.checked == false) {
        this.formRegistro.get('comprobante')?.disable();
        this.formRegistro.get('RNC')?.disable();
        this.formRegistro.get('empresa')?.disable();
    } 
    else{
        this.formRegistro.get('comprobante')?.enable();
        this.formRegistro.get('RNC')?.enable();
        this.formRegistro.get('empresa')?.enable();
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
