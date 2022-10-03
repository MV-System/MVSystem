import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CatalogosService } from '../../../services/catalogos.service';
import {
  Almacen,
  MarcaEquipo,
  ModeloEquipo,
} from '../../../interfaces/catalogo.interface';
import { Accesorio, AccesorioLista } from '../../../interfaces/mantenimiento';
import { MantenimientoService } from 'src/app/MVSystem/services/mantenimiento.service';
import { ToastrService } from 'ngx-toastr';
import { switchMap, tap } from 'rxjs/operators';
import * as $ from"jquery";

@Component({
  selector: 'app-accesorios',
  templateUrl: './accesorios-registro.component.html',
  styleUrls: ['./accesorios-registro.component.css'],
})
export class AccesoriosRegistroComponent implements OnInit {
  marcaListado: MarcaEquipo[] = [];
  costoMask: string = '';
  accesoriosLista!: any;
  almacenListado: Almacen[] = [];
  modeloListado: ModeloEquipo[] = [];
  btnDisabled: boolean = true;

  constructor(
    private fb: FormBuilder,
    private catalogosService: CatalogosService,
    private mantenimientoService: MantenimientoService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {

    this.obtenerMarcasLista();
    this.obtenerAlmacenLista();
    this.btnDisable();
    this.formRegistro.get('modelo')?.disable();

  }
  //Forms
  formRegistro: FormGroup = this.fb.group({
    descripcion: ['', [Validators.required]],
    cantidad: [, Validators.required],
    costo: [, Validators.required],
    alDetalle: [, Validators.required],
    alPorMayor: [, Validators.required],
    IMEI: [,Validators.max(15)],
    cantidadMax: [, Validators.required],
    cantidadMin: [, Validators.required],
    marca: [, Validators.required],
    modelo: [, Validators.required],
    almacen: [2, Validators.required],
    usuario: [''],

    fechaFacturacion:[,]
  });
  /**
 * If the form is valid, set the button to disabled, otherwise set it to enabled.
 * @returns The return value of the function is the value of the last statement executed.
 */
   btnDisable(){
    return this.formRegistro.valid  ? this.btnDisabled = false: this.btnDisabled = true;
  }
  selectoresMarcaModeloValidator() {

    this.formRegistro.get('modelo')?.setValue('');
    if (this.formRegistro.get('marca')?.value) {
      this.formRegistro.get('modelo')?.enable();
      this.obtenerModeloLista();
    }
    else{
      this.formRegistro.controls.modelo.disable();

    }
  }
  obtenerMarcasLista() {
    this.catalogosService.getMarcasLista().subscribe((marca) => {
      this.marcaListado = marca;
    });
  }
  msgValidacionesCamposFormCantMaxCantMin() {
    if (
      this.formRegistro.get('cantidadMin')?.value >
      this.formRegistro.get('cantidadMax')?.value
    ) {
      this.formRegistro.setErrors({error:''})
      this.toastr.error(
        'La cantidad minima no puede ser mayor a la cantidad maxima',
        '',
        { closeButton: true, progressBar: true }
      );
      return;
    }
  }
  msgValidacionesCamposFormDetallePorMayor() {
    if (
      this.formRegistro.get('alPorMayor')?.value >
      this.formRegistro.get('alDetalle')?.value
    ) {
      this.formRegistro.setErrors({error:''})
      this.toastr.error(
        'El monto al por mayor, debe ser menor que el monto Al detalle',
        '',
        { closeButton: true, progressBar: true }
      );
      return;
    }
  }
  //Al detalle no puede ser mayor que el costo
  validarCamposFormCostoDetalle() {

    if (
      this.formRegistro.get('alDetalle')?.value <
      this.formRegistro.get('costo')?.value  && this.formRegistro.get('costo')?.value !== null)
     {
      this.formRegistro.setErrors({error:''})
      this.toastr.error(
        'El monto de Al detalle no puede ser menor que el Costo',
        '',
        { closeButton: true, progressBar: true }
      );
      return;
    }
  }

  msgValidacionesCamposFormNumericos() {
    let camposNumerico: string[] = [
      'cantidad',
      'costo',
      'alDetalle',
      'alPorMayor',
      'cantidadMax',
      'cantidadMin',
    ];
    camposNumerico.forEach((campo) => {
      if (
        this.formRegistro.get(campo)?.value < 0 ||
        this.formRegistro.get(campo)?.value == 0
      ) {
      this.formRegistro.setErrors({error:''})
      this.toastr.error('Los valores de los campos deben ser mayor a 0', '', {
          closeButton: true,
          progressBar: true,
        });
        return;
      }
    });
  }


  validacionesRegistro(){
    this.msgValidacionesCamposFormCantMaxCantMin();
    this.msgValidacionesCamposFormDetallePorMayor();
    this.msgValidacionesCamposFormNumericos();
    this.validarCamposFormCostoDetalle();
  }

  registroAccesorio() {
    const model: Accesorio = this.modeloRegistroAccesorio();

    this.validacionesRegistro()
      if ( this.formRegistro.valid   ) {
        this.mantenimientoService.postAccesorio(model)
                                .subscribe((accesorio:any) =>{
                                  this.accesoriosLista = accesorio;
                                  this.toastr.success('Accesorio registrado con exito!')
                                  this.formRegistro.reset({
                                  });
                                });
      }
      else{
        this.formRegistro.markAllAsTouched();
        $("html, body").animate({ scrollTop: $("#registro").offset()?.top }, "slow");

        this.toastr.error('Hay datos en el formulario incompletos', '', {
          closeButton: true,
          progressBar: true,
        });
      }
  }
  modeloRegistroAccesorio() {
    const accesorioModel: Accesorio = {
      // codigo: this.formRegistro.get('IMEI')?.value,
      descripcion_Accesorio: this.formRegistro.get('descripcion')?.value,
      cantidad:Number(  this.formRegistro.get('cantidad')?.value),
      costo_Equipo: Number(this.formRegistro.get('costo')?.value),
      precio_Detalle:Number( this.formRegistro.get('alDetalle')?.value),
      precio_Por_Mayor:Number(  this.formRegistro.get('alPorMayor')?.value),
      imei_Equipo: this.formRegistro.get('IMEI')?.value,
      can_Max:Number(  this.formRegistro.get('cantidadMax')?.value),
      can_Min:Number(  this.formRegistro.get('cantidadMin')?.value),
      id_Modelo:Number( this.formRegistro.get('modelo')?.value),
      id_Almacen: this.formRegistro.get('almacen')?.value,
      // cod_Barra:this.formRegistro.get('IMEI')?.value, //? preguntar //
      // disponible: this.formRegistro.get('IMEI')?.value,
      // disponible_Detalle: this.formRegistro.get('IMEI')?.value,
      usuario: this.formRegistro.get('usuario')?.value,
      // usuario: this.formRegistro.get('fechaFacturacion')?.value,
      disponible: 'S',
    };
    return accesorioModel;
  }
  validarCampos(nombreCampo: string) {
    return (
      this.formRegistro.get(nombreCampo)?.invalid &&
      this.formRegistro.get(nombreCampo)?.touched
    );
  }


  obtenerAlmacenLista() {
    this.catalogosService.getAlmaceLista().subscribe((almacen) => {
      this.almacenListado = almacen;
    });
  }
  obtenerModeloLista() {
    let idMarca = this.formRegistro.get('marca')?.value;
    this.catalogosService.getModeloByMarcaLista(idMarca).subscribe((modelo) => {
      this.modeloListado = modelo;
    });
  }

}
