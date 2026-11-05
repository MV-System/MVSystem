import { Component, Input } from '@angular/core';
import { EquipoConfiguracion, ModeloComponente } from 'src/app/core/interfaces/laptop.interface';
import { armarConfiguracionLaptop, DatosConfigLaptop, discosVacios, errorConfigLaptop, ramVacia } from './laptop-config.validacion';

/**
 * Editor compacto de la configuración de una laptop (memorias y discos). Se usa para agregar la configuración
 * a laptops que ya existían sin ella. El padre lo lee con armarConfiguracion().
 */
@Component({
  selector: 'app-laptop-config-editor',
  templateUrl: './laptop-config-editor.component.html'
})
export class LaptopConfigEditorComponent {
  @Input() modelosComponente: ModeloComponente[] = [];

  ramTipo: string | null = null;
  memorias: (number | null)[] = [null];
  discos: { capacidad: number | null; idModelo: number | null }[] = [{ capacidad: null, idModelo: null }];
  notas = '';
  intentado = false;

  get tiposRam(): string[] {
    const tipos = this.modelosComponente.filter(m => m.tipo_Pieza === 'RAM').map(m => m.tipo);
    return tipos.length ? Array.from(new Set(tipos)) : ['DDR3', 'DDR4', 'DDR5'];
  }

  get modelosDisco(): ModeloComponente[] {
    return this.modelosComponente.filter(m => m.tipo_Pieza === 'ALMACENAMIENTO');
  }

  get totalRam(): number {
    return this.memorias.reduce((total: number, m) => total + (Number(m) || 0), 0);
  }

  trackByIndex(indice: number): number { return indice; }

  agregarMemoria() { this.memorias.push(null); }
  quitarMemoria(i: number) { if (this.memorias.length > 1) { this.memorias.splice(i, 1); } }
  agregarDisco() { this.discos.push({ capacidad: null, idModelo: null }); }
  quitarDisco(i: number) { if (this.discos.length > 1) { this.discos.splice(i, 1); } }

  private get datos(): DatosConfigLaptop {
    return { ramTipo: this.ramTipo, memorias: this.memorias, discos: this.discos, notas: this.notas };
  }

  get sinRam(): boolean { return ramVacia(this.datos); }
  get sinDiscos(): boolean { return discosVacios(this.datos); }

  /** RAM y discos son opcionales: solo se marca en rojo la seccion que se empezo a llenar. */
  ramTipoInvalido(): boolean {
    return this.intentado && !this.sinRam && !this.ramTipo;
  }
  memoriaInvalida(i: number): boolean {
    const m = Number(this.memorias[i]);
    return this.intentado && !this.sinRam && (!m || m < 1 || m > 512);
  }
  discoCapacidadInvalida(i: number): boolean {
    const c = Number(this.discos[i]?.capacidad);
    return this.intentado && !this.sinDiscos && (!c || c < 1 || c > 16000);
  }
  discoModeloInvalido(i: number): boolean {
    return this.intentado && !this.sinDiscos && !this.discos[i]?.idModelo;
  }

  /** Mensaje del primer problema, o '' si se puede guardar. Aqui no hay nada que guardar si las dos secciones estan vacias. */
  get error(): string {
    const e = errorConfigLaptop(this.datos);
    if (e) { return e; }
    if (this.sinRam && this.sinDiscos) { return 'Indique al menos una memoria o un disco.'; }
    return '';
  }

  /** Devuelve la configuracion lista para guardar, o null (y marca en rojo lo que falta) si no se puede guardar. */
  armarConfiguracion(imei: string, usuario: string): EquipoConfiguracion | null {
    this.intentado = true;
    if (this.error) { return null; }
    return armarConfiguracionLaptop(this.datos, this.modelosComponente, imei, usuario);
  }

  limpiar() {
    this.ramTipo = null;
    this.memorias = [null];
    this.discos = [{ capacidad: null, idModelo: null }];
    this.notas = '';
    this.intentado = false;
  }
}
