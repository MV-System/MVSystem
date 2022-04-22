import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

import { Cliente, ClienteRegistro, TipoCliente, TipoTelefono } from '../../interfaces/cliente.interface';
import { ClientesService } from '../../services/clientes.service';

@Component({
  selector: 'app-clientes-registro',
  templateUrl: './clientes-registro.component.html',
  styleUrls: ['./clientes-registro.component.css']
})
export class ClientesRegistroComponent implements OnInit {
	mensajeAvisoInsert: any;
    
    constructor(
        private fb: FormBuilder,
        private _clientesService: ClientesService,
        private toastr: ToastrService ) { }
        
        
    ngOnInit(): void {
        this.formRegistro.controls.extensionNumero.disable();
        this.obtenerTipoTelefonos();
        this.obtenerTipoClientes();
    }
    //Properties
    nombreApellidoPattern: string = '([a-zA-ZÀ-ÿ]+)';
    emailPattern         : string = '^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$';

    clientes: ClienteRegistro[]=[];
    clientesListar: Cliente[]=[];
    listaTipoClientes: TipoCliente[]=[];
    listaTipoTelefonos: TipoTelefono[]=[];
    bool!: boolean;
  //Forms
  formRegistro: FormGroup = this.fb.group({
    nombre:       ['Xavier', [Validators.required]],
    apellido:     ['Mejia', Validators.required],
    tipoCliente:  [1],
    tipoClienteDescripcion:  [""],
    limiteCredito:["2500"],
    tipoTelefono: [1],
    telefono:     [8099728439,Validators.required],
    extensionNumero: [Validators.required] ,
    email:        ['',[Validators.pattern(this.emailPattern)]],
    criterio:     [''],
    usuario:      ['Xmejia'],

    provincia:  ['Santo Domingo'],
    sector:     ['Buena Vista'],
    calle:      ['Primera'],
    casaNumero: ['#18'],
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
          iD_Tipo_Cliente:   this.formRegistro.get('tipoCliente')?.value,
          // tipo_Cliente_Descripcion:   this.formRegistro.get('tipoClienteDescripcion')?.value,
          limite_Credito: this.formRegistro.get('limiteCredito')?.value,
          numero_Telefono:      this.formRegistro.get('telefono')?.value,
          iD_Tipo_Telefono:  this.formRegistro.get('tipoTelefono')?.value,
          extencion:  this.formRegistro.get('extencion')?.value,
          email_Detalle:      this.formRegistro.get('email')?.value,
          usuario:      this.formRegistro.get('usuario')?.value,
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
    
    //    if (errors?.required) {
    //      return 'El correo es obligatorio'
    //    }
       if(errors?.pattern){
         return 'El valor no tiene formato de correo';
       }
    //    else if(errors?.emailTomado){
    //      return 'El email ya existe'
    //    }
       return ''
     }
validarCampos(nombreCampo: string) {
    return this.formRegistro.get(nombreCampo)?.invalid && 
           this.formRegistro.get(nombreCampo)?.touched
  }
  obtenerTipoTelefonos(){
      this._clientesService.getTipoTelefonoLista()
          .subscribe(tipoTelefono =>{
              this.listaTipoTelefonos = tipoTelefono;
              console.log(this.listaTipoTelefonos);
              
          })
  }
  obtenerTipoClientes(){
    this._clientesService.getTipoClienteLista()
        .subscribe(tipoCliente =>{
            this.listaTipoClientes = tipoCliente;
            console.log(this.listaTipoClientes);
            
        })
}
  registroCLiente(){
    const model: ClienteRegistro = this.modeloRegistroCliente();
    if (this.formRegistro.valid) {
        this._clientesService.postCliente(model)
            .subscribe(clienteInsertado =>{
				console.log(clienteInsertado);
				
				this.clientesListar =clienteInsertado;
				if (clienteInsertado.mensaje.includes('ya está')) {
					this.toastr.error(clienteInsertado.mensaje, '',{closeButton: true,progressBar:true});
					console.log('toastr clienteInsertado error');
					this.mensajeAvisoInsert = clienteInsertado.mensaje;
				}
				else{
					this.toastr.success(clienteInsertado.mensaje, '',{closeButton: true,progressBar:true});

					console.log('OK');
				}
				
				console.log(clienteInsertado);
				
			});
    // this.clientes.push(model);
    // console.log(this.clientes);
    this.toastr.success('Cliente registrado', '',{closeButton: true,progressBar:true});

    // this.formRegistro.reset({
    //     tipoCliente: 1,
    //     tipoTelefono: 1
    // });
    }
    else{
        this.toastr.error('Hay datos en el formulario incompletos', '',{closeButton: true,progressBar:true});
console.log('toastr error');

    }

  
  }

  

}
