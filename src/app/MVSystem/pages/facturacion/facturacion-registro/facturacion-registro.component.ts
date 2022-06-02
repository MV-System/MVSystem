import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CatalogosService } from 'src/app/MVSystem/services/catalogos.service';
import { ToastrService } from 'ngx-toastr';
import { TipoComprobante, TipoFactura, TipoPago } from 'src/app/MVSystem/interfaces/catalogo.interface';
import { ClientesService } from '../../../services/clientes.service';

@Component({
  selector: 'app-facturacion',
  templateUrl: './facturacion-registro.component.html',
  styleUrls: ['./facturacion-registro.component.css']
})
export class FacturacionRegistroComponent implements OnInit {
  listaTipoFactura: TipoFactura[]=[];
  listaPagoFactura: TipoPago[]=[];
  listaTipoComprobante: TipoComprobante[]=[];
  nombreCliente: string | undefined;
  loadingButtonBuscar: boolean = false;

  constructor(
              private fb: FormBuilder,
              private catalogosService: CatalogosService,
              private toastr: ToastrService,
              private clientesService: ClientesService ) { }

  ngOnInit(): void {
    this.btnDisable();
    this.obtenerTipoFactura();
    this.obtenerTipoPago();
    this.obtenerTipoComprobante();
    this.formRegistro.controls.comprobante.disable();
    // this.obtenerClientesPorNombreTelefono();
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

    monto:[,],
    empresa:[,],
    RNC:[,]
  });

  formCliente: FormGroup = this.fb.group({
    nombre:     [''],
    apellido:   [''],
    numeroTelefono: ['',[Validators.required,Validators.min(10)]],
  });

  criterioBusqueda: any = {
    criterio: '',
  }

  registroFactura(){

  }
  // loadingSpinner(){
  //   return this.loadingButtonBuscar == true ? this.loadingButtonBuscar == true : this.loadingButtonBuscar == false;
  // }
  obtenerClientesPorNombreTelefono(){
    this.formCliente.controls.nombre.setValue('');
    this.formCliente.controls.apellido.setValue('');
    console.log( this.loadingButtonBuscar);

    this.loadingButtonBuscar = true;
    
    this.criterioBusqueda.criterio = this.formCliente.controls.numeroTelefono.value;
    console.log(this.criterioBusqueda.criterio);
    if (this.criterioBusqueda.criterio !== '') {
      
    this.clientesService.getClientesPorNombreTelefono(this.criterioBusqueda.criterio)
                        .subscribe( cliente => {
                          
                          cliente.forEach( ({nombres,apellidos, numero_Telefono}) => {
                            this.loadingButtonBuscar = false;
                            this.nombreCliente = nombres;
                            this.formCliente.controls.nombre.setValue(nombres);
                            this.formCliente.controls.apellido.setValue(apellidos);
                            console.log(nombres);
                            console.log(numero_Telefono);
                          });
                          
                        });
                      }
  }
  onCheckboxChange(event: any ) {
    if(event.target.checked == false) {
        this.formRegistro.controls.comprobante.disable();
        // this.formRegistro.get('comprobante')?.setValue("");
    } 
    else{
        this.formRegistro.controls.comprobante.enable();
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
    return ( this.formCliente.valid )  ? this.btnDisabled = false: this.btnDisabled = true;
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
}
