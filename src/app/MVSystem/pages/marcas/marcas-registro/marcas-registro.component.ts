import { Component, NgModule, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MarcaEquipo, ModeloEquipo } from 'src/app/MVSystem/interfaces/catalogo.interface';
import { CatalogosService } from '../../../services/catalogos.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-marcas-registro',
  templateUrl: './marcas-registro.component.html',
  styleUrls: ['./marcas-registro.component.css']
})
export class MarcasRegistroComponent implements OnInit {
  modeloListado: ModeloEquipo[] = [];
  marcaListado: MarcaEquipo[] = [];
  constructor(
    private catalogosService: CatalogosService,
    private fb: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.obtenerMarcasLista();
  }

  formRegistro: FormGroup = this.fb.group({
    descripcion: ['', [Validators.required]],
    marca: [, Validators.required],
    modelo: [, Validators.required],
    usuario: [''],

    fechaFacturacion:[,]
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
}
