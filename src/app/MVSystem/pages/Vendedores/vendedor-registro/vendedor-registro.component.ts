import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { TipoTelefono } from '../../../interfaces/catalogo.interface';
import { Vendedor } from '../../../interfaces/vendedor.interface';
import { CatalogosService } from '../../../services/catalogos.service';
import { VendedorService } from '../../../services/vendedor.service';
import * as $ from"jquery";

@Component({
  selector: 'app-vendedor-registro',
  templateUrl: './vendedor-registro.component.html',
  styleUrls: ['./vendedor-registro.component.css']
})
export class VendedorRegistroComponent implements OnInit {

  constructor(
    private fb: FormBuilder,
    private catalogosService: CatalogosService,
    private vendedorService: VendedorService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.formRegistro.controls.extensionNumero.disable();

    this.obtenerTipoTelefonos();
  }

    vendedor: Vendedor[]=[];
    vendedorListar!: Vendedor;
    listaTipoTelefonos: TipoTelefono[]=[];
    btnDisabled: boolean = true;

  //Forms
  formRegistro: FormGroup = this.fb.group({
    nombre:       ['', [Validators.required]],
    apellido:     ['', Validators.required],
    tipoTelefono: [1],
    telefono:     [,Validators.required],
    extensionNumero: [] ,
    email:        [''],
    usuario:      [''],
    provincia:  [''],
    sector:     [''],
    calle:      [''],
    casaNumero: [''],
  });
  /**
 * If the form is valid, set the button to disabled, otherwise set it to enabled.
 * @returns The return value of the function is the value of the last statement executed.
 */
 btnDisable(){
  return this.formRegistro.valid  ? this.btnDisabled = false: this.btnDisabled = true;
}
  modeloRegistroVendedor(){
    let direccion: any =[
      this.formRegistro.get('calle')?.value ,
      this.formRegistro.get('casaNumero')?.value,
      this.formRegistro.get('sector')?.value ,
      this.formRegistro.get('provincia')?.value
  
  ];
      const registro: Vendedor = {

          nombres:         this.formRegistro.get('nombre')?.value,
          apellidos:       this.formRegistro.get('apellido')?.value,
          numero_Telefono: this.formRegistro.get('telefono')?.value,
          iD_Tipo_Telefono:this.formRegistro.get('tipoTelefono')?.value,
          extencion:       this.formRegistro.get('extencion')?.value,
          email_Detalle:   this.formRegistro.get('email')?.value,
          usuario:         this.formRegistro.get('usuario')?.value,
          direccion_Detalle:     direccion.toString(),
      }
      return registro;
  }
  
  onCheckboxChange(event: any) {
    if(event.target.checked == false) {
        this.formRegistro.controls.extensionNumero.disable();
        this.formRegistro.get('extensionNumero')?.setValue("");
    } 
    else{
        this.formRegistro.controls.extensionNumero.enable();
      }
  }
  
  get emailErrorMsg(): string{
    const errors = this.formRegistro.get('email')?.errors;
       if(errors?.pattern){
         return 'El valor no tiene formato de correo';
       }
       return ''
     }
  validarCampos(nombreCampo: string) {
    return this.formRegistro.get(nombreCampo)?.invalid && 
           this.formRegistro.get(nombreCampo)?.touched
  }
  obtenerTipoTelefonos(){
      this.catalogosService.getTipoTelefonoLista()
          .subscribe(tipoTelefono =>{
              this.listaTipoTelefonos = tipoTelefono;
          });
  }

  registroVendedor(){
    const model: Vendedor = this.modeloRegistroVendedor();
    if (this.formRegistro.valid) {
        this.vendedorService.postVendedor(model)
            .subscribe((VendedorInsertado: any) =>{
        
        this.vendedorListar = VendedorInsertado;
        if (VendedorInsertado.mensaje.includes('ya está')) {
          this.toastr.error(VendedorInsertado.mensaje, '',{closeButton: true,progressBar:true});
        }
        else{
          this.toastr.success(VendedorInsertado.mensaje, '',{closeButton: true,progressBar:true});
          this.formRegistro.reset({
              tipoVendedor: 1,
              tipoTelefono: 1
          });
        }
      });
    }
    else{
      this.formRegistro.markAllAsTouched();
      $("html, body").animate({ scrollTop: $("#registro").offset()?.top }, "slow");
      this.toastr.error('Hay datos en el formulario incompletos', '',{closeButton: true,progressBar:true});
    }
  }
  
  
  }
  

