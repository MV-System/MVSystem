import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IMyDrpOptions } from 'mydaterangepicker';
import { interval, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

import {
  Almacen,
  ModeloEquipo,
} from 'src/app/MVSystem/interfaces/catalogo.interface';
import { EquipoDisponible } from 'src/app/MVSystem/interfaces/equipo.interface';
import { VendedorLista } from 'src/app/MVSystem/interfaces/vendedor.interface';
import { CatalogosService } from 'src/app/MVSystem/services/catalogos.service';
import { EquipoService } from 'src/app/MVSystem/services/equipo.service';
import { VendedorService } from 'src/app/MVSystem/services/vendedor.service';

@Component({
  selector: 'app-equipo-disponible',
  templateUrl: './equipo-disponible.component.html',
  styleUrls: ['./equipo-disponible.component.css'],
})
export class EquipoDisponibleComponent implements OnInit, OnDestroy {
  equipoQuantity: any;
  constructor(
    private fb: FormBuilder,
    private equipoService: EquipoService,
    private catalogosService: CatalogosService,
    private vendedorService: VendedorService
  ) {}

  ngOnInit(): void {
    this.obtenerEquiposDisponibles();
    this.obtenerAlmacenLista();
    this.obtenerModeloLista();
    this.obtenerVendedor();
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
  subscription!: Subscription;
  currentPage: number = 1;
  totalRecord!: number;
  line!: number;
  lastLine!: number;
  almacenListado: Almacen[] = [];
  modeloListado: ModeloEquipo[] = [];
  listaVendedor: VendedorLista[] = [];
  equiposDisponibles: EquipoDisponible[] = [];
  filter: any = {
    almacen: 0,
    modelo: '',
    imei: '',
    suplidor: '',
    pageIndex: 1,
    pageSize: 10,
    fechaInicio: '',
    fechaFinal: '',
  };

  myDateRangePickerOptions: IMyDrpOptions = {
    dateFormat: 'dd.mm.yyyy',
  };
  form: FormGroup = this.fb.group({
    almacen: [''],
    suplidor: [''],
    imei: [''],
    modelo: [''],
    rangeDate: [''],
    totalEquipos:[0,],
    totalInventario:[0,]
  });
  obtenerTotalEquipos(cantidad: number){
    this.equipoQuantity =interval(10).pipe(take(cantidad + 1));
  }
  obtenerEquiposDisponibles() {
    this.getValueFilterForm();
    this.subscription = this.equipoService
      .getEquipoDisponible(this.filter)
      .subscribe((equipo) => {
        this.obtenerTotalEquipos(equipo[0].totalRecord);
        if (equipo.length) {
          this.totalRecord = equipo[0].totalRecord;
          this.line = equipo[0].line;
          this.lastLine = equipo[0].lastLine;
        }
        this.equiposDisponibles = equipo;
      });
  }
  getValueFilterForm() {
    let almacenValue = this.form.get('almacen')?.value;
    let suplidorValue = this.form.get('suplidor')?.value;
    let modeloValue = this.form.get('modelo')?.value;
    this.filter.almacen = almacenValue == null ? '' : almacenValue;
    this.filter.suplidor = suplidorValue == null ? '' : suplidorValue;
    this.filter.modelo = modeloValue == null ? '' : modeloValue;
    this.filter.imei = this.form.get('imei')?.value;
  }
  setDateRange(): void {
    let date = new Date();
    this.form.patchValue({
      rangoFecha: {
        beginDate: {
          day: date.getDate(),
          month: date.getMonth() + 1,
          year: date.getFullYear(),
        },
        endDate: {
          day: date.getDate(),
          month: date.getMonth() + 1,
          year: date.getFullYear(),
        },
      },
    });
  }

  onDateRangeChanged(event: any) {
    if (event.beginDate.year === 0) {
      this.filter.fechaInicio = '';
      this.filter.fechaFinal = '';
    } else {
      this.filter.fechaInicio = `${event.beginDate.month}/${event.beginDate.day}/${event.beginDate.year}`;
      this.filter.fechaFinal = `${event.endDate.month}/${event.endDate.day}/${event.endDate.year}`;
    }

    this.obtenerEquiposDisponibles();
  }
  pageChanged(index: number) {
    this.currentPage = index;
    this.filter.pageIndex = index;
    this.obtenerEquiposDisponibles();
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
  obtenerVendedor() {
    this.vendedorService.getVendedorLista().subscribe((vendedor) => {
      this.listaVendedor = vendedor;
    });
  }
}
