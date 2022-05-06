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

@Component({
  selector: 'app-accesorios',
  templateUrl: './accesorios.component.html',
  styleUrls: ['./accesorios.component.css'],
})
export class AccesoriosComponent implements OnInit {
  marcaListado: MarcaEquipo[] = [];
  costoMask: string = '';
  accesoriosLista!: any;
  almacenListado: Almacen[] = [];
  modeloListado: ModeloEquipo[] = [];

  constructor(
    private fb: FormBuilder,
    private catalogosService: CatalogosService,
    private mantenimientoService: MantenimientoService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.formRegistro.reset({
      descripcion: 'Protector Pantalla',
      cantidad: 10,
      costo: 500,
      alDetalle: 1000,
      alPorMayor: 975,
      IMEI: '',
      cantidadMax: 10,
      cantidadMin: 2,
      // marca:  11, //Apple
      // modelo: 63, // "Iphone 12 Pro Max"
      almacen: 2,
      usuario: 'Xavier08',
    });
    this.obtenerMarcasLista();
    this.obtenerAlmacenLista();
    // this.obtenerModeloLista();
    this.validarCostoMask();
  }
  //Forms
  formRegistro: FormGroup = this.fb.group({
    descripcion: ['', [Validators.required]],
    cantidad: [, Validators.required],
    costo: [, Validators.required],
    alDetalle: [, Validators.required],
    alPorMayor: [, Validators.required],
    IMEI: [,],
    cantidadMax: [, Validators.required],
    cantidadMin: [, Validators.required],
    marca: [, Validators.required],
    modelo: [, Validators.required],
    almacen: [, Validators.required],
    usuario: ['', Validators.required],
  });

  msgValidacionesCamposFormCantMaxCantMin() {
    if (
      this.formRegistro.get('cantidadMin')?.value >
      this.formRegistro.get('cantidadMax')?.value
    ) {
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
      this.toastr.error(
        'El monto al por mayor, debe ser menor que el monto Al detalle',
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
        this.toastr.error('Los valores de los campos deben ser mayor a 0', '', {
          closeButton: true,
          progressBar: true,
        });
        return;
      }
    });
  }

  selectoresMarcaModeloValidator() {
    if (this.formRegistro.get('marca')?.valid) {
      this.formRegistro.get('modelo')?.reset();
      this.obtenerModeloLista();
    }
  }

  registroAccesorio() {
    this.formRegistro.markAllAsTouched();

    const model: Accesorio = this.modeloRegistroAccesorio();

    if (this.formRegistro.valid) {
      this.msgValidacionesCamposFormCantMaxCantMin();
      this.msgValidacionesCamposFormDetallePorMayor();
      this.msgValidacionesCamposFormNumericos();
      console.log('form valid');

      // this.mantenimientoService.postAccesorio(model)
      //                         .subscribe((accesorio:any) =>{
      //                           console.log(accesorio);
      //                           this.accesoriosLista = accesorio;

      //                         });
    }
    console.log(this.accesoriosLista);
  }
  modeloRegistroAccesorio() {
    const accesorioModel: Accesorio = {
      // codigo: this.formRegistro.get('IMEI')?.value,
      descripcion_Accesorio: this.formRegistro.get('descripcion')?.value,
      cantidad: this.formRegistro.get('cantidad')?.value,
      costo_Equipo: Number(this.formRegistro.get('costo')?.value),
      precio_Detalle: this.formRegistro.get('alDetalle')?.value,
      precio_Por_Mayor: this.formRegistro.get('alPorMayor')?.value,
      imei_Equipo: this.formRegistro.get('IMEI')?.value,
      can_Max: this.formRegistro.get('cantidadMax')?.value,
      can_Min: this.formRegistro.get('cantidadMin')?.value,
      id_Modelo: this.formRegistro.get('modelo')?.value,
      id_Almacen: this.formRegistro.get('almacen')?.value,
      // cod_Barra:this.formRegistro.get('IMEI')?.value, //? preguntar //
      // disponible: this.formRegistro.get('IMEI')?.value,
      // disponible_Detalle: this.formRegistro.get('IMEI')?.value,
      usuario: this.formRegistro.get('usuario')?.value,
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

  obtenerMarcasLista() {
    this.catalogosService.getMarcasLista().subscribe((marca) => {
      this.marcaListado = marca;
    });
  }
  obtenerAlmacenLista() {
    this.catalogosService.getAlmaceLista().subscribe((almacen) => {
      this.almacenListado = almacen;
    });
  }
  obtenerModeloLista() {
    this.catalogosService.getModeloLista().subscribe((modelo) => {
      this.modeloListado = modelo;
    });
  }
  validarCostoMask() {
    const costoValue = this.formRegistro.get('costo')?.value;
    if (costoValue < 999) {
      this.costoMask = '000';
    }
    if (costoValue > 999) {
      this.costoMask = '0,0000';
    }
    if (costoValue > 9999) {
      this.costoMask = '00,000';
    }
    if (costoValue > 99999) {
      this.costoMask = '000,000';
    }
    // console.log(this.costoMask);

    return this.costoMask;
  }
}
