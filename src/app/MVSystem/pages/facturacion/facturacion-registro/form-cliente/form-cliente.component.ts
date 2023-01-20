import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { forkJoin } from 'rxjs';

import { ToastrService } from 'ngx-toastr';
import * as $ from "jquery";

import { TipoTelefono } from 'src/app/core/interfaces/catalogo.interface';
import { Cliente, ClienteRegistro, TipoCliente } from 'src/app/core/interfaces/cliente.interface';

import { ClientesService } from 'src/app/core/services/clientes.service';
import { CatalogosService } from 'src/app/core/services/catalogos.service';
import { LoginService } from 'src/app/services/login.service';
import { LoadingService } from '../../../../../shared/components/r-loading/loading.service';

@Component({
  selector: 'form-cliente',
  templateUrl: './form-cliente.component.html',
  styleUrls: ['./form-cliente.component.css']
})
export class FormClienteComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private customerService: ClientesService,
    private catalogosService: CatalogosService,
    private toastr: ToastrService,
    private auth: LoginService,
    private Loading:LoadingService) { }

  ngOnInit(): void {

    this.form.controls.extencion.disable();
    this.loadCatalogos();
    this.btnDisable();
    this.customerService.isOpeningForm$
    .subscribe(resp =>{
      this.isOpenModal = resp;
    })
  }

  @Output() customer = new EventEmitter<Cliente>();

  namePattern: string = '([a-zA-ZÀ-ÿ]+)';
  emailPattern: string = '^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$';
  customers: ClienteRegistro[] = [];
  customerTypes: TipoCliente[] = [];
  phoneTypes: TipoTelefono[] = [];
  btnDisabled: boolean = true;
  isOpenModal: boolean = false;

  form: FormGroup = this.fb.group({
    nombres: ['', [Validators.required]],
    apellidos: ['', Validators.required],
    iD_Tipo_Cliente: [1],
    tipoClienteDescripcion: [""],
    limite_Credito: [0,],
    iD_Tipo_Telefono: [1],
    numero_Telefono: [,],
    extencion: [, Validators.required],
    email_Detalle: ['', [Validators.pattern(this.emailPattern)]],
    usuario: ['',],
    provincia: [''],
    sector: [''],
    calle: [''],
    casaNumero: [''],
  });
  onSubmit(){
      if(this.form.valid){
        this.addCustomer();
      }
      else{
        
      }
  }

  get user(){
    return this.auth.getUserName();
  }
  modeloRegistroCliente() {
    const model: ClienteRegistro ={...this.form.value}
          let direccion = [
            model.calle,
            model.casaNumero,
            model.sector,
            model.provincia,
          ];
    const registro: ClienteRegistro = {
      ...this.form.value,
      usuario: this.user,
      direccion_Detalle: direccion.toString(),
    }
    return registro;
  }

  onCheckboxChange(event: any) {
    if (event.target.checked == false) {
      this.form.controls.extencion.disable();
      this.form.get('extencion')?.setValue("");
    }
    else {
      this.form.controls.extencion.enable();
    }
  }

  get emailErrorMsg(): string {
    const errors = this.form.get('email_Detalle')?.errors;
    if (errors?.pattern) {
      return 'El valor no tiene formato de correo';
    }
    return ''
  }

  validateFields(nombreCampo: string) {
    return this.form.get(nombreCampo)?.invalid &&
      this.form.get(nombreCampo)?.touched
  }
  validateFieldsEmail(nombreCampo: string) {
    return this.form.get(nombreCampo)?.errors
  }





  btnDisable() {
    return this.form.valid ? this.btnDisabled = false : this.btnDisabled = true;
  }
  addCustomer() {
    const model: ClienteRegistro = this.modeloRegistroCliente();
    
    if (this.form.valid) {
      this.Loading.showLoading();
      this.customerService.postCliente(model)
        .subscribe((customerResp: Cliente) => {
          if (customerResp.mensaje.includes('ya está')) {
            this.toastr.error(customerResp.mensaje, '',
              { closeButton: true, progressBar: true });
          }
          else {
            this.toastr.success(customerResp.mensaje, '',
              { closeButton: true, progressBar: true });
              this.customer.emit(customerResp);
              
            this.isOpenModal = false;
            
            this.form.reset({
              iD_Tipo_Cliente: 1,
              iD_Tipo_Telefono: 1
            });

          }
         this.Loading.hideLoading();
        },err=>{
          this.Loading.hideLoading();
          this.toastr.error('Upss! Ha ocurrido un error')

        });
    }
    else {
      this.form.markAllAsTouched();
      $("html, body").animate({ scrollTop: $("#registro").offset()?.top }, "slow");
      this.toastr.error('Hay datos en el formulario incompletos', '',
        { closeButton: true, progressBar: true });
    }
  }
  onCancel(){
    this.isOpenModal = false;
    this.form.reset({
      iD_Tipo_Cliente:1,
      iD_Tipo_Telefono:1
    })
  }

  private loadCatalogos(){
    forkJoin([
    this.customerService.getTipoClienteLista(),
    this.catalogosService.getTipoTelefonoLista()

    ]).subscribe(resp=>{
      console.log(resp);
      
      this.customerTypes = resp[0];
      this.phoneTypes = resp[1];

    })
  }
}
