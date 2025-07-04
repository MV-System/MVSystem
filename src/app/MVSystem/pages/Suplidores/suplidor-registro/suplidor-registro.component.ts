import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { TipoTelefono } from '../../../../core/interfaces/catalogo.interface';
import { CatalogosService } from '../../../../core/services/catalogos.service';
import { SuplidorService } from '../../../../core/services/suplidor.service';
import {
  Suplidor,
  SuplidorRegistro,
  TipoSuplidor,
} from 'src/app/core/interfaces/suplidor.interface';
import * as $ from"jquery";
import { LoginService } from 'src/app/auth/login.service';

@Component({
  selector: 'app-suplidor-registro',
  templateUrl: './suplidor-registro.component.html',
  styleUrls: ['./suplidor-registro.component.css'],
})
export class SuplidorRegistroComponent implements OnInit {
  constructor(
    private loginService: LoginService,
    private fb: FormBuilder,
    private suplidorService: SuplidorService,
    private catalogosService: CatalogosService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.formRegistro.controls.extensionNumero.disable();
    this.obtenerTipoSuplidor();
    this.obtenerTipoTelefonos();
  }
  suplidor: SuplidorRegistro[] = [];
  suplidorListar!: Suplidor;
  listaTipoSuplidores: TipoSuplidor[] = [];
  listaTipoTelefonos: TipoTelefono[] = [];
  btnDisabled: boolean = true;
  isLoading: boolean = false;

  //Forms
  formRegistro: FormGroup = this.fb.group({
    nombre: ['', [Validators.required]],
    apellido: ['', Validators.required],
    tipoSuplidor: [1],
    tipoTelefono: [1],
    telefono: [, Validators.required],
    extensionNumero: [,],
    email: [''],
    // criterio:     [''],
    usuario: [this.loginService.getUserName()],
    provincia: [''],
    sector: [''],
    calle: [''],
    casaNumero: [''],
  });

  modeloRegistroSuplidor() {
    let direccion: any = [
      this.formRegistro.get('calle')?.value,
      this.formRegistro.get('casaNumero')?.value,
      this.formRegistro.get('sector')?.value,
      this.formRegistro.get('provincia')?.value,
    ];
    const registro: SuplidorRegistro = {
      nombres: this.formRegistro.get('nombre')?.value,
      apellidos: this.formRegistro.get('apellido')?.value,
      numero_Telefono: Number( this.formRegistro.get('telefono')?.value),
      iD_Tipo_Telefono: Number(this.formRegistro.get('tipoTelefono')?.value),
      iD_Tipo_Suplidor: Number(this.formRegistro.get('tipoSuplidor')?.value),
      extencion: this.formRegistro.get('extencion')?.value,
      email_Detalle: this.formRegistro.get('email')?.value,
      Usuario: this.loginService.getUserName(),
      direccion_Detalle: direccion.toString(),
    };
    return registro;
  }
/**
 * If the form is valid, set the button to disabled, otherwise set it to enabled.
 * @returns The return value of the function is the value of the last statement executed.
 */
 btnDisable(){
  return this.formRegistro.valid  ? this.btnDisabled = false: this.btnDisabled = true;
}
/**
 * If the checkbox is checked, enable the input field. If the checkbox is unchecked, disable the input
 * field and clear the value
 * @param {any} event - any
 */
  onCheckboxChange(event: any) {

    if (event.target.checked == false) {
      this.formRegistro.controls.extensionNumero.disable();
      this.formRegistro.get('extensionNumero')?.setValue('');
    } else {
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
    return '';
  }
/**
 * It returns true if the form control is invalid and has been touched.
 * @param {string} nombreCampo - string
 * @returns a boolean value.
 */
  validarCampos(nombreCampo: string) {
    return (
      this.formRegistro.get(nombreCampo)?.invalid &&
      this.formRegistro.get(nombreCampo)?.touched
    );
  }
/**
 * It gets a list of phone types from the server and assigns it to the listaTipoTelefonos variable.
 */
  obtenerTipoTelefonos() {
    this.catalogosService.getTipoTelefonoLista().subscribe((tipoTelefono) => {
      this.listaTipoTelefonos = tipoTelefono;
    });
  }
  obtenerTipoSuplidor() {
    this.suplidorService.getTipoSuplidorLista().subscribe((tipoSuplidor) => {

      this.listaTipoSuplidores = tipoSuplidor;
    });
  }
  registroSuplidores() {
    this.formRegistro.markAllAsTouched();
    const model: SuplidorRegistro = this.modeloRegistroSuplidor();
    if (this.formRegistro.valid) {
      this.isLoading = true;
      this.suplidorService
        .postSuplidor(model)
        .subscribe({
          next: (suplidorInsertado: any) => {
            this.suplidorListar = suplidorInsertado;
            if (suplidorInsertado.mensaje.includes('ya está')) {
              this.toastr.error(suplidorInsertado.mensaje, '', {
                closeButton: true,
                progressBar: true,
              });
            } else {
              this.toastr.success(suplidorInsertado.mensaje, '', {
                closeButton: true,
                progressBar: true,
              });
              this.limpiarFormulario();
            }
            this.isLoading = false;
          },
          error: () => {
            this.isLoading = false;
            this.toastr.error('Error al registrar el suplidor', '', {
              closeButton: true,
              progressBar: true,
            });
          }
        });
    } else {
      this.toastr.error('Hay datos en el formulario incompletos', '', {
        closeButton: true,
        progressBar: true,
      });
      $("html, body").animate({ scrollTop: $("#registro").offset()?.top }, "slow");

    }
  }
  limpiarFormulario() {
    this.formRegistro.reset({
      tipoSuplidor: 1,
      tipoTelefono: 1,
    });
  }
}
