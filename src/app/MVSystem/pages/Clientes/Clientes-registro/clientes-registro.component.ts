import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { TipoTelefono } from '../../../interfaces/catalogo.interface';

import { Cliente, ClienteRegistro, TipoCliente } from '../../../interfaces/cliente.interface';
import { CatalogosService } from '../../../services/catalogos.service';
import { ClientesService } from '../../../services/clientes.service';

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
        this.formRegistro.controls.extensionNumero.disable();
        this.obtenerTipoTelefonos();
        this.obtenerTipoClientes();
    }
    //Properties
    nombreApellidoPattern: string = '([a-zA-ZÀ-ÿ]+)';
    emailPattern         : string = '^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$';

    clientes: ClienteRegistro[]=[];
    clientesListar!: Cliente;
    listaTipoClientes: TipoCliente[]=[];
    listaTipoTelefonos: TipoTelefono[]=[];
    bool!: boolean;
  //Forms
  formRegistro: FormGroup = this.fb.group({
    nombre:       ['Xavier client', [Validators.required]],
    apellido:     ['Mejia', Validators.required],
    tipoCliente:  [1],
    tipoClienteDescripcion:  [""],
    limiteCredito:["2500"],
    tipoTelefono: [1],
    telefono:     [8099728439,Validators.required],
    extensionNumero: [Validators.required] ,
    email:        ['',[Validators.pattern(this.emailPattern)]],
    // criterio:     [''],
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
          iD_Tipo_Cliente:   Number(this.formRegistro.get('tipoCliente')?.value),
          limite_Credito: this.formRegistro.get('limiteCredito')?.value,
          numero_Telefono:      this.formRegistro.get('telefono')?.value,
          iD_Tipo_Telefono:Number(  this.formRegistro.get('tipoTelefono')?.value),
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
    console.log(event);

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
  obtenerTipoClientes(){
    this.clientesService.getTipoClienteLista()
        .subscribe(tipoCliente =>{
            this.listaTipoClientes = tipoCliente;
        });
  }
  registroCLiente(){
    this.formRegistro.markAllAsTouched();

    const model: ClienteRegistro = this.modeloRegistroCliente();
    if (this.formRegistro.valid) {
        this.clientesService.postCliente(model)
            .subscribe((clienteInsertado: any) =>{
              this.clientesListar = clienteInsertado;
              console.log(clienteInsertado);
              
        
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
        this.toastr.error('Hay datos en el formulario incompletos', '',
        {closeButton: true,progressBar:true});
    }
  }

  

}
