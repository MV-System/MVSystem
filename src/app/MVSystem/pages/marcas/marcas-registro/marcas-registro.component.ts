import { Component, NgModule, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MarcaEquipo, ModeloEquipo } from 'src/app/MVSystem/interfaces/catalogo.interface';
import { CatalogosService } from '../../../services/catalogos.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { CommonModule } from '@angular/common';
import {MarcaObjRetorno } from 'src/app/MVSystem/interfaces/mantenimiento';
import { MantenimientoService } from 'src/app/MVSystem/services/mantenimiento.service';
import { ToastrService } from 'ngx-toastr';
import { MarcaService } from 'src/app/MVSystem/services/marca.service';


@Component({
  selector: 'app-marcas-registro',
  templateUrl: './marcas-registro.component.html',
  styleUrls: ['./marcas-registro.component.css']
})
export class MarcasRegistroComponent implements OnInit {
  modeloListado: ModeloEquipo[] = [];
  marcaListado: MarcaEquipo[] = [];
  marcaValorRetorno: MarcaObjRetorno[]=[];
  btnDisabled: boolean = true;

  constructor(
    private catalogosService: CatalogosService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private MarcaService: MarcaService,
  ) { }

  ngOnInit(): void {
    this.obtenerMarcasLista();
  }
  validarCampos(nombreCampo: string) {
    return this.formRegistro.get(nombreCampo)?.invalid &&
           this.formRegistro.get(nombreCampo)?.touched
  }
  btnDisable(){
    return this.formRegistro.valid  ? this.btnDisabled = false: this.btnDisabled = true;
  }

  formRegistro: FormGroup = this.fb.group({
    descripcion: [[Validators.required]]
  });

  obtenerMarcasLista() {
    this.catalogosService.getMarcasLista().subscribe((marca) => {
      this.marcaListado = marca;
    });
  }

  obtenerModeloLista() {
    let idMarca = this.formRegistro.get('marca')?.value;
    this.catalogosService.getModeloLista(idMarca).subscribe((modelo) => {
      this.modeloListado = modelo;
    });
  }


  // selectoresMarcaModeloValidator() {
  //   this.formRegistro.get('modelo')?.setValue('');
  //   if (this.formRegistro.get('marca')?.value) {
  //     this.formRegistro.get('modelo')?.enable();
  //     this.obtenerModeloLista();
  //   }
  //   else{
  //     this.formRegistro.controls.modelo.disable();

  //   }
  // }

  modeloRegistroMarca(){

    const registro: MarcaEquipo = {
      descripcion:        this.formRegistro.get('descripcion')?.value,
      usuario:            this.formRegistro.get('usuario')?.value,

    }
      return registro;
  }
  registroMarca(){

    const model: MarcaEquipo = this.modeloRegistroMarca();

    if (this.formRegistro.valid) {

        this.MarcaService.postMarca(model)
            .subscribe((MarcaInsertada: MarcaObjRetorno) =>{

				if (MarcaInsertada.mensaje.includes('ya está')) {
          this.toastr.error(MarcaInsertada.mensaje, '',
          {closeButton: true,progressBar:true});
				}
				else{
            console.log(MarcaInsertada.mensaje);

					this.toastr.success(MarcaInsertada.mensaje, '',
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
