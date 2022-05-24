import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CatalogosService } from 'src/app/MVSystem/services/catalogos.service';
import { ToastrService } from 'ngx-toastr';
import { TipoFactura } from 'src/app/MVSystem/interfaces/catalogo.interface';

@Component({
  selector: 'app-facturacion',
  templateUrl: './facturacion-registro.component.html',
  styleUrls: ['./facturacion-registro.component.css']
})
export class FacturacionRegistroComponent implements OnInit {
  listaTipoFactura: TipoFactura[]=[];

  constructor(
              private fb: FormBuilder,
              private catalogosService: CatalogosService,
              private toastr: ToastrService ) { }

  ngOnInit(): void {
    this.btnDisable();
    this.obtenerTipoFactura();
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
    tipoFactura:[,],
    tipoPago:[,],
    fechaFacturacion:[,],
    comprobante:[,],


    tipoClienteDescripcion:  [""],
    tipoTelefono: [1],
    extensionNumero: [,Validators.required] ,
   
    // criterio:     [''],
    usuario:      [''],
    provincia:  [''],
    sector:     [''],
    calle:      [''],
    casaNumero: [''],
    // extensionNumero: new FormControl({disabled: this.bool},Validators.required) ,
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
}
