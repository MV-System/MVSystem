import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { TipoTelefono } from '../../../../core/interfaces/catalogo.interface';

import { Cliente, ClienteRegistro, TipoCliente } from '../../../../core/interfaces/cliente.interface';
import { CatalogosService } from '../../../../core/services/catalogos.service';
import { ClientesService } from '../../../../core/services/clientes.service';
import * as $ from "jquery";
import { LoginService } from 'src/app/auth/login.service';
@Component({
  selector: 'app-clientes-registro',
  templateUrl: './clientes-registro.component.html',
  styleUrls: ['./clientes-registro.component.css']
})
export class ClientesRegistroComponent implements OnInit {
    @Output() customer = new EventEmitter<Cliente>();
  constructor(
    private loginService: LoginService,
    private fb: FormBuilder,
    private clientesService: ClientesService,
    private catalogosService: CatalogosService,
    private toastr: ToastrService) { }


  ngOnInit(): void {

    this.formRegistro.controls.extensionNumero.disable();
    this.obtenerTipoTelefonos();
    this.obtenerTipoClientes();
    this.btnDisable();
  }
  //Properties
  nombreApellidoPattern: string = '([a-zA-ZÀ-ÿ]+)';
  emailPattern: string = '^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$';
  telefonoPattern: string = '^[0-9]{3}-[0-9]{3}-[0-9]{4}$';

  /**
   * Custom validator for telephone with mask
   */
  telefonoValidator(control: any) {
    const value = control.value;
    if (!value) return null;
    
    // Remove any non-digit characters for validation
    const digitsOnly = value.replace(/\D/g, '');
    
    // Check if we have exactly 10 digits
    if (digitsOnly.length === 10) {
      return null; // Valid
    }
    
    return { invalidTelefono: true }; // Invalid
  }

  clientes: ClienteRegistro[] = [];
  clientesListar!: Cliente;
  listaTipoClientes: TipoCliente[] = [];
  listaTipoTelefonos: TipoTelefono[] = [];
  btnDisabled: boolean = true;
  isLoading: boolean = false;
  clientesRegistrados: any[] = [];

  //Forms
  formRegistro: FormGroup = this.fb.group({
    nombre: ['', [Validators.required]],
    apellido: ['', Validators.required],
    tipoCliente: [1],
    tipoClienteDescripcion: [""],
    limiteCredito: [0, [Validators.min(0)]],
    tipoTelefono: [1],
    telefono: ['', [Validators.required, this.telefonoValidator]],
    extensionNumero: [, Validators.required],
    email: ['', [Validators.pattern(this.emailPattern)]],
    // criterio:     [''],
    usuario: ['',],
    provincia: [''],
    sector: [''],
    calle: [''],
    casaNumero: [''],
  });
  limpiarFormulario(): void {
    this.formRegistro.reset();
    this.formRegistro.controls.extensionNumero.disable();
    
    // Reset to default values
    this.formRegistro.patchValue({
      tipoTelefono: '', // Reset phone type
      // Add any other default values if needed
    });
    
    this.toastr.info('Formulario limpiado correctamente', 'Información');
  }

  modeloRegistroCliente() {
    let direccion: any = [
      this.formRegistro.get('calle')?.value,
      this.formRegistro.get('casaNumero')?.value,
      this.formRegistro.get('sector')?.value,
      this.formRegistro.get('provincia')?.value

    ];
    const registro: ClienteRegistro = {
      nombres: this.formRegistro.get('nombre')?.value,
      apellidos: this.formRegistro.get('apellido')?.value,
      iD_Tipo_Cliente: Number(this.formRegistro.get('tipoCliente')?.value),
      limite_Credito: (this.formRegistro.get('limiteCredito')?.value == null) ?
       0 :  this.formRegistro.get('limiteCredito')?.value,
      numero_Telefono: Number(this.formRegistro.get('telefono')?.value),
      iD_Tipo_Telefono: Number(this.formRegistro.get('tipoTelefono')?.value),
      extencion: this.formRegistro.get('extensionNumero')?.value,
      email_Detalle: this.formRegistro.get('email')?.value,
      usuario: this.loginService.getUserName(),
      // usuario:      this.formRegistro.get('usuario')?.value,
      direccion_Detalle: direccion.toString(),
    }
    return registro;
  }

  /**
   * If the checkbox is checked, enable the input field. If the checkbox is unchecked, disable the input
   * field.
   * @param {any} event - any
   */
  onCheckboxChange(event: any) {
    if (event.target.checked == false) {
      this.formRegistro.controls.extensionNumero.disable();
      this.formRegistro.get('extensionNumero')?.setValue("");
    }
    else {
      this.formRegistro.controls.extensionNumero.enable();
    }
  }

  /**
   * If the form control has an error, return the error message. Otherwise, return an empty string.
   * @returns The error message.
   */
  get emailErrorMsg(): string {
    const errors = this.formRegistro.get('email')?.errors;
    if (errors?.pattern) {
      return 'El valor no tiene formato de correo';
    }
    return ''
  }

  /**
   * Get error message for telephone field
   * @returns The telephone error message
   */
  get telefonoErrorMsg(): string {
    const errors = this.formRegistro.get('telefono')?.errors;
    
    if (errors?.required) {
      return 'Este campo es requerido';
    }
    if (errors?.invalidTelefono) {
      return 'Debe ingresar un número de teléfono válido de 10 dígitos';
    }
    return '';
  }

  /**
   * Get error message for credit limit field
   * @returns The credit limit error message
   */
  get limiteCreditoErrorMsg(): string {
    const errors = this.formRegistro.get('limiteCredito')?.errors;
    if (errors?.min) {
      return 'El límite de crédito no puede ser negativo';
    }
    return '';
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
    return this.formRegistro.get(nombreCampo)?.errors
  }
  /**
   * The function obtenerTipoTelefonos() calls the getTipoTelefonoLista() function in the
   * catalogosService service, which returns an Observable of type TipoTelefono[], which is then
   * subscribed to and the result is assigned to the listaTipoTelefonos variable.
   */
  obtenerTipoTelefonos() {
    this.catalogosService.getTipoTelefonoLista()
      .subscribe(tipoTelefono => {
        this.listaTipoTelefonos = tipoTelefono;
      });
  }
  /**
   * It's a function that calls a service that returns an observable, which is then subscribed to and the
   * result is assigned to a variable.
   */
  obtenerTipoClientes() {
    this.clientesService.getTipoClienteLista()
      .subscribe(tipoCliente => {
        this.listaTipoClientes = tipoCliente;
      });
  }
  /**
   * Returns true if the form is invalid (button should be disabled)
   * @returns boolean indicating if the submit button should be disabled
   */
  btnDisable() {
    return !this.formRegistro.valid;
  }
  registroCliente() {
    const model: ClienteRegistro = this.modeloRegistroCliente();
    if (this.formRegistro.valid) {
      this.isLoading = true;
      this.clientesService.postCliente(model)
        .subscribe({
          next: (clienteInsertado: Cliente) => {
            this.clientesListar = clienteInsertado;
            this.isLoading = false;
            const mensaje = clienteInsertado.Mensaje || clienteInsertado.mensaje || '';
            if (mensaje.includes('ya está')) {
              this.toastr.error(mensaje, '',
                { closeButton: true, progressBar: true });
            }
            else {
              this.toastr.success(mensaje, '',
                { closeButton: true, progressBar: true });
              // Agregar cliente a la lista local para mostrar en la card
              this.clientesRegistrados.unshift({
                nombre: model.nombres,
                apellido: model.apellidos,
                telefono: model.numero_Telefono,
                email: model.email_Detalle
              });
              this.formRegistro.reset({
                tipoCliente: 1,
                tipoTelefono: 1,
                limiteCredito: 0
              });
              this.formRegistro.controls.extensionNumero.disable();
            }
          },
          error: (error) => {
            this.isLoading = false;
            this.toastr.error('Error al registrar el cliente', '',
              { closeButton: true, progressBar: true });
          }
        });
    }
    else {
      this.formRegistro.markAllAsTouched();
      $("html, body").animate({ scrollTop: $("#registro").offset()?.top }, "slow");
      this.toastr.error('Hay datos en el formulario incompletos', '',
        { closeButton: true, progressBar: true });
    }
  }



}
