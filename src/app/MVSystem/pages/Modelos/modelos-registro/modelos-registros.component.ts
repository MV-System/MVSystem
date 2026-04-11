import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ModeloObjRetorno } from 'src/app/core/interfaces/mantenimiento';
import { CatalogosService } from 'src/app/core/services/catalogos.service';
import { ModeloService } from 'src/app/core/services/modelo.service';
import { MarcaEquipo, ModeloEquipo } from 'src/app/core/interfaces/catalogo.interface';

@Component({
  selector: 'app-modelos-registros',
  templateUrl: './modelos-registros.component.html',
  styleUrls: ['./modelos-registros.component.css']
})

export class ModelosRegistrosComponent implements OnInit {
  modeloValorRetorno: ModeloObjRetorno[]=[];
  btnDisabled: boolean = true;
  IdMarcaReg!: number;
  listaModelo: ModeloEquipo[] = [];
  marcaListado: MarcaEquipo[] = [];

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private ModeloService: ModeloService,
    private catalogosService: CatalogosService,
  ) { }

  ngOnInit(): void {
    this.obtenerMarcasLista();
    this.formRegistro.get('descripcion')?.disable();
    this.formRegistro.get('modelo')?.disable();
  }
  formRegistro: FormGroup = this.fb.group({
    descripcion: ['', Validators.required],
    marca: [, Validators.required],
    modelo: [, Validators.required]
  });
  selectoresMarcaModeloValidator() {
    this.formRegistro.get('modelo')?.setValue('');

    if (this.formRegistro.get('marca')?.value) {
      this.formRegistro.get('descripcion')?.enable();
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
  obtenerModeloLista() {

    let idMarca = this.formRegistro.get('marca')?.value;
    this.catalogosService.getModeloByMarcaLista(idMarca).subscribe((modelo) => {
      this.listaModelo = modelo;
    });
  }
  modeloRegistroMarca(){

    const registro: ModeloEquipo = {
      iD_Marca: this.formRegistro.get('marca')?.value,
      descripcion: this.formRegistro.get('descripcion')?.value,
      usuario: "Ventura" //       this.formRegistro.get('usuario')?.value,
      ,
      iD_Modelo: 0
    }
      return registro;
  }
  validarCampos(nombreCampo: string) {
    return this.formRegistro.get(nombreCampo)?.invalid &&
           this.formRegistro.get(nombreCampo)?.touched
  }
  btnDisable(){
       return this.formRegistro.valid  ? this.btnDisabled = false: this.btnDisabled = true;
  }
  registroModelo(){

    const model: ModeloEquipo = this.modeloRegistroMarca();
    if (this.formRegistro.valid) {
        this.ModeloService.postModelo(model)
            .subscribe((ModeloInsertado: ModeloObjRetorno) =>{
                 this.modeloValorRetorno.push(ModeloInsertado);

              this.toastr.success(ModeloInsertado.mensaje, '',
           {closeButton: true,progressBar:true});

          this.formRegistro.reset({
          });
			});
    }
    else{
      this.formRegistro.markAllAsTouched();
      $("html, body").animate({ scrollTop: $("#registro").offset()?.top }, "slow");
        this.toastr.error('Hay datos en el formulario incompletos', '',
        {closeButton: true,progressBar:true});
    }
  }
  get modelosFiltrados() {
    const valor = this.formRegistro.get('descripcion')?.value || '';
    if (!valor.trim()) return this.listaModelo;
    return this.listaModelo.filter(m => m.descripcion?.toLowerCase().includes(valor.trim().toLowerCase()));
  }
}
