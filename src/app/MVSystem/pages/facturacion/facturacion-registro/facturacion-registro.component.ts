import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CatalogosService } from 'src/app/MVSystem/services/catalogos.service';
import { ToastrService } from 'ngx-toastr';
import { TipoComprobante, TipoFactura, TipoPago } from 'src/app/MVSystem/interfaces/catalogo.interface';

@Component({
  selector: 'app-facturacion',
  templateUrl: './facturacion-registro.component.html',
  styleUrls: ['./facturacion-registro.component.css']
})
export class FacturacionRegistroComponent implements OnInit {
  listaTipoFactura: TipoFactura[]=[];
  listaPagoFactura: TipoPago[]=[];
  listaTipoComprobante: TipoComprobante[]=[];

  constructor(
              private fb: FormBuilder,
              private catalogosService: CatalogosService,
              private toastr: ToastrService ) { }

  ngOnInit(): void {
    this.btnDisable();
    this.obtenerTipoFactura();
    this.obtenerTipoPago();
    this.obtenerTipoComprobante();
    this.formRegistro.controls.comprobante.disable();
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
    fechaLimitePago:[,]
  });

  // formCliente: FormGroup = this.fb.group({
  //   nombre:     [''],
  //   apellido:   [''],
  // })
  registroFactura(){

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
    return this.formRegistro.valid  ? this.btnDisabled = false: this.btnDisabled = true;
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
