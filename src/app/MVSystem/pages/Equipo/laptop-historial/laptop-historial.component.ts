import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { LoginService } from 'src/app/auth/login.service';
import { LaptopCambioHistorial, LaptopCorreccion, LaptopModulo, ModeloComponente } from 'src/app/core/interfaces/laptop.interface';
import { LaptopsService } from 'src/app/core/services/laptops.service';
import { ValidatorPermissionService } from 'src/app/core/services/validator-permission.service';

/** Ventana con los modulos de una laptop, sus correcciones y todos sus cambios de pieza con el estado de custodia. */
@Component({
  selector: 'app-laptop-historial',
  templateUrl: './laptop-historial.component.html',
  styleUrls: ['./laptop-historial.component.css']
})
export class LaptopHistorialComponent implements OnInit {
  @Input() imei = '';
  @Output() cerrar = new EventEmitter<void>();

  historial: LaptopCambioHistorial[] = [];
  modulos: LaptopModulo[] = [];
  correcciones: LaptopCorreccion[] = [];
  modelosComponente: ModeloComponente[] = [];
  isLoading = false;

  // Correccion de un modulo
  moduloEnCorreccion: LaptopModulo | null = null;
  correccionModelo: number | null = null;
  correccionCapacidad: number | null = null;
  correccionMotivo = '';
  isGuardando = false;

  // Anulacion de un cambio de pieza
  cambioAnular: LaptopCambioHistorial | null = null;

  constructor(
    private laptopsService: LaptopsService,
    private toastr: ToastrService,
    private loginService: LoginService,
    private validatorPermissionService: ValidatorPermissionService
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.laptopsService.consultarHistorial(this.imei).subscribe({
      next: (lista) => {
        this.historial = lista || [];
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.toastr.error(typeof err === 'string' && err ? err : 'Error al cargar el historial.');
      }
    });
    this.cargarModulos();
  }

  get puedeAnular(): boolean {
    return this.validatorPermissionService.validateUserRole('LAPTOP_CAMBIO_ANULAR');
  }

  /** Tras anular se recarga todo: historial, modulos y correcciones. */
  alAnular() {
    this.cambioAnular = null;
    this.ngOnInit();
  }

  get puedeCorregir(): boolean {
    return this.validatorPermissionService.validateUserRole('LAPTOP_CORREGIR_CONFIG');
  }

  /** Modelos del mismo tipo de pieza que el modulo que se corrige (RAM con RAM, disco con disco). */
  get modelosDelModulo(): ModeloComponente[] {
    return this.modelosComponente.filter(m => m.tipo_Pieza === this.moduloEnCorreccion?.tipo_Pieza);
  }

  get correccionValida(): boolean {
    return !!this.correccionModelo && !!this.correccionCapacidad && this.correccionCapacidad >= 1
      && this.correccionCapacidad <= 16000 && this.correccionMotivo.trim().length > 0;
  }

  cargarModulos() {
    this.laptopsService.consultarModulos(this.imei).subscribe({
      next: (lista) => this.modulos = lista || [],
      error: (err) => console.error('Error cargando los modulos de la laptop:', err)
    });
    this.laptopsService.consultarCorrecciones(this.imei).subscribe({
      next: (lista) => this.correcciones = lista || [],
      error: (err) => console.error('Error cargando las correcciones de la laptop:', err)
    });
  }

  abrirCorreccion(modulo: LaptopModulo) {
    if (!this.modelosComponente.length) {
      this.laptopsService.consultarModelosComponente().subscribe({
        next: (modelos) => this.modelosComponente = modelos || [],
        error: (err) => console.error('Error cargando los modelos de componentes:', err)
      });
    }
    this.moduloEnCorreccion = modulo;
    this.correccionModelo = modulo.iD_Modelo_Componente;
    this.correccionCapacidad = modulo.capacidad_GB;
    this.correccionMotivo = '';
  }

  cancelarCorreccion() {
    this.moduloEnCorreccion = null;
  }

  guardarCorreccion() {
    if (!this.moduloEnCorreccion || !this.correccionValida) { return; }
    this.isGuardando = true;
    this.laptopsService.corregirModulo({
      iD_Modulo: this.moduloEnCorreccion.iD_Modulo,
      iD_Modelo_Componente: Number(this.correccionModelo),
      capacidad_GB: Number(this.correccionCapacidad),
      motivo: this.correccionMotivo.trim(),
      usuario: this.loginService.getUserName()
    }).subscribe({
      next: () => {
        this.isGuardando = false;
        this.moduloEnCorreccion = null;
        this.toastr.success('Módulo corregido.');
        this.cargarModulos();
      },
      error: (err) => {
        this.isGuardando = false;
        this.toastr.error(typeof err === 'string' && err ? err : 'No se pudo corregir el módulo.');
      }
    });
  }

  claseCustodia(estado: string): string {
    switch (estado) {
      case 'PENDIENTE': return 'bg-warning text-dark';
      case 'RECIBIDA': return 'bg-success';
      case 'ANULADO': return 'bg-danger';
      case 'ENTREGADA_CLIENTE': return 'bg-info text-dark';
      default: return 'bg-secondary';
    }
  }
}
