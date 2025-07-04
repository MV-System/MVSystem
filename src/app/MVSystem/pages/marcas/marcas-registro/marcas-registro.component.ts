import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MarcaEquipo, ModeloEquipo } from 'src/app/core/interfaces/catalogo.interface';
import { CatalogosService } from '../../../../core/services/catalogos.service';
import { MarcaObjRetorno } from 'src/app/core/interfaces/mantenimiento';
import { ToastrService } from 'ngx-toastr';
import { MarcaService } from 'src/app/core/services/marca.service';
import { LoginService } from 'src/app/auth/login.service';
import { ValidatorPermissionService } from 'src/app/core/services/validator-permission.service';
@Component({
  selector: 'app-marcas-registro',
  templateUrl: './marcas-registro.component.html',
  styleUrls: ['./marcas-registro.component.css']
})

export class MarcasRegistroComponent implements OnInit {
  //[x: string]: any;
  modeloListado: ModeloEquipo[] = [];
  marcaListado: MarcaEquipo[] = [];
  marcaValorRetorno: MarcaObjRetorno[]=[];
  btnDisabled: boolean = true;
  IdMarcaReg!: number;
  filtroMarca: string = "";



  constructor(
    private catalogosService: CatalogosService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private MarcaService: MarcaService,
    private LoginPermisos: LoginService,
    private validatorPermissionService: ValidatorPermissionService
  ) {
}

  ngOnInit(): void {
    this.obtenerMarcasLista();
    this.marcaValorRetorno = [];
  }
  // VerFormMarca(): boolean {
  //   return this.validatorPermissionService.validateUserRole("MNU_MANT_MARCAS");
  // }

  validarCampos(nombreCampo: string) {
    return this.formRegistro.get(nombreCampo)?.invalid &&
           this.formRegistro.get(nombreCampo)?.touched
  }
  btnDisable(){
    return this.formRegistro.valid  ? this.btnDisabled = false: this.btnDisabled = true;
  }


  formRegistro: FormGroup = this.fb.group({
    descripcion: ['', Validators.required]
  });

  obtenerMarcasLista() {
    this.catalogosService.getMarcasLista().subscribe((marca) => {
      this.marcaListado = marca;
    });
  }

  modeloRegistroMarca(){

    const registro: MarcaEquipo = {
      descripcion:        this.formRegistro.get('descripcion')?.value,
      usuario:  this.LoginPermisos.getUserName(),//    "Ventura"//       this.formRegistro.get('usuario')?.value,

    }
      return registro;
  }
  registroMarca(){
    const model: MarcaEquipo = this.modeloRegistroMarca();
    if (this.formRegistro.valid) {
        this.MarcaService.postMarca(model)
            .subscribe((MarcaInsertada: MarcaObjRetorno) =>{
                 // Agregar la nueva marca a la lista general
                 this.marcaListado.unshift({
                   iD_Marca: MarcaInsertada.iD_Marca,
                   descripcion: MarcaInsertada.descripcion
                 });
                 this.toastr.success(MarcaInsertada.mensaje, '',
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

  get marcasFiltradas() {
    const valor = this.formRegistro.get('descripcion')?.value || '';
    if (!valor.trim()) return this.marcaListado;
    return this.marcaListado.filter(m => m.descripcion?.toLowerCase().includes(valor.trim().toLowerCase()));
  }
}
function jwt_decode<T>(arg0: string): any {
  throw new Error('Function not implemented.');
}

