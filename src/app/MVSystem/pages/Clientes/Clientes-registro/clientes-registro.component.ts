import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { TipoTelefono } from '../../../interfaces/catalogo.interface';

import { Cliente, ClienteRegistro, TipoCliente } from '../../../interfaces/cliente.interface';
import { CatalogosService } from '../../../services/catalogos.service';
import { ClientesService } from '../../../services/clientes.service';
import * as $ from"jquery";
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
@Component({
  selector: 'app-clientes-registro',
  templateUrl: './clientes-registro.component.html',
  styleUrls: ['./clientes-registro.component.css']
})
export class ClientesRegistroComponent implements OnInit {
    constructor(
        private fb: FormBuilder,
        private clientesService: ClientesService,
        private catalogosService: CatalogosService,
        private toastr: ToastrService ) { }
        
        
    ngOnInit(): void {
      // this.formRegistro.reset({
      //   nombre:       'Xavier client',
      //   apellido:     'Mejia',
      //   tipoCliente:  [1],
      //   tipoClienteDescripcion:  [""],
      //   limiteCredito:"2500",
      //   tipoTelefono: 1,
      //   telefono:     8099728439,
      //   extensionNumero: '' ,
      //   email:        '',
      //   // criterio:     [''],
      //   usuario:      'Xmejia',
      //   provincia:  'Santo Domingo',
      //   sector:     'Buena Vista',
      //   calle:      'Primera',
      //   casaNumero: '#18',
      // })
        this.formRegistro.controls.extensionNumero.disable();
        this.obtenerTipoTelefonos();
        this.obtenerTipoClientes();
        this.btnDisable();
        // var needsValidation = document.querySelectorAll('.needs-validation')

        // Array.prototype.slice.call(needsValidation)
        //   .forEach((form) => {
        //     form.addEventListener('submit', (event: { preventDefault: () => void; stopPropagation: () => void; }) => {
        //       if (!form.checkValidity()) {
        //         event.preventDefault()
        //         event.stopPropagation()
        //       }
        //       if(this.formRegistro.valid){
        //         form.classList.add('was-validated')

        //       }
      
        //       form.classList.add('was-validated')
        //     }, false)
        //   })
    }
    //Properties
    nombreApellidoPattern: string = '([a-zA-ZÀ-ÿ]+)';
    emailPattern         : string = '^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$';

    clientes:          ClienteRegistro[]=[];
    clientesListar!:   Cliente;
    listaTipoClientes: TipoCliente[]=[];
    listaTipoTelefonos:TipoTelefono[]=[];
    btnDisabled: boolean = true;

  //Forms
  formRegistro: FormGroup = this.fb.group({
    nombre:       ['', [Validators.required]],
    apellido:     ['', Validators.required],
    tipoCliente:  [1],
    tipoClienteDescripcion:  [""],
    limiteCredito:[,],
    tipoTelefono: [1],
    telefono:     [,],
    extensionNumero: [,Validators.required] ,
    email:        ['',[Validators.pattern(this.emailPattern)]],
    // criterio:     [''],
    usuario:      [''],
    provincia:  [''],
    sector:     [''],
    calle:      [''],
    casaNumero: [''],
    // extensionNumero: new FormControl({disabled: this.bool},Validators.required) ,
  });

  modeloRegistroCliente(){
    let direccion: any =[
      this.formRegistro.get('calle')?.value ,
      this.formRegistro.get('casaNumero')?.value,
      this.formRegistro.get('sector')?.value ,
      this.formRegistro.get('provincia')?.value

  ];
    const registro: ClienteRegistro = {
        nombres:        this.formRegistro.get('nombre')?.value,
        apellidos:      this.formRegistro.get('apellido')?.value,
        iD_Tipo_Cliente:  Number(this.formRegistro.get('tipoCliente')?.value),
        limite_Credito:   this.formRegistro.get('limiteCredito')?.value,
        numero_Telefono:  Number( this.formRegistro.get('telefono')?.value),
        iD_Tipo_Telefono: Number(  this.formRegistro.get('tipoTelefono')?.value),
        extencion:  this.formRegistro.get('extencion')?.value,
        email_Detalle:      this.formRegistro.get('email')?.value,
        usuario:      this.formRegistro.get('usuario')?.value,
        direccion_Detalle:     direccion.toString(),
    }
      return registro;
  }

/**
 * If the checkbox is checked, enable the input field. If the checkbox is unchecked, disable the input
 * field.
 * @param {any} event - any
 */
  onCheckboxChange(event: any ) {
    if(event.target.checked == false) {
        this.formRegistro.controls.extensionNumero.disable();
        this.formRegistro.get('extensionNumero')?.setValue("");
    } 
    else{
        this.formRegistro.controls.extensionNumero.enable();
      }
  }
 
/**
 * If the form control has an error, return the error message. Otherwise, return an empty string.
 * @returns The error message.
 */
  get emailErrorMsg(): string{
    const errors = this.formRegistro.get('email')?.errors;
    if(errors?.pattern ){
         return 'El valor no tiene formato de correo';
       }
       return ''
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
  validarCamposEmail(nombreCampo: string) {
    return  this.formRegistro.get(nombreCampo)?.errors
  }
/**
 * The function obtenerTipoTelefonos() calls the getTipoTelefonoLista() function in the
 * catalogosService service, which returns an Observable of type TipoTelefono[], which is then
 * subscribed to and the result is assigned to the listaTipoTelefonos variable.
 */
  obtenerTipoTelefonos(){
      this.catalogosService.getTipoTelefonoLista()
          .subscribe(tipoTelefono =>{
              this.listaTipoTelefonos = tipoTelefono;
          });
  }
/**
 * It's a function that calls a service that returns an observable, which is then subscribed to and the
 * result is assigned to a variable.
 */
  obtenerTipoClientes(){
    this.clientesService.getTipoClienteLista()
        .subscribe(tipoCliente =>{
            this.listaTipoClientes = tipoCliente;
        });
  }
/**
 * If the form is valid, set the button to disabled, otherwise set it to enabled.
 * @returns The return value of the function is the value of the last statement executed.
 */
  btnDisable(){
    return this.formRegistro.valid  ? this.btnDisabled = false: this.btnDisabled = true;
  }
  registroCliente(){

    const model: ClienteRegistro = this.modeloRegistroCliente();
    if (this.formRegistro.valid) {
      
        this.clientesService.postCliente(model)
            .subscribe((clienteInsertado: Cliente) =>{
              this.clientesListar = clienteInsertado;
        
				if (clienteInsertado.mensaje.includes('ya está')) {
          this.toastr.error(clienteInsertado.mensaje, '',
          {closeButton: true,progressBar:true});
				}
				else{

					this.toastr.success(clienteInsertado.mensaje, '',
          {closeButton: true,progressBar:true});
          // this.toastr.success('Cliente registrado', '',{closeButton: true,progressBar:true});

          this.formRegistro.reset({
              tipoCliente: 1,
              tipoTelefono: 1
          });
				}
			});
    }
    else{
      this.formRegistro.markAllAsTouched();
      $("html, body").animate({ scrollTop: $("#registro").offset()?.top }, "slow");
        this.toastr.error('Hay datos en el formulario incompletos', '',
        {closeButton: true,progressBar:true});
    }
  }

  

}
