import { Component, Input } from '@angular/core';
import { EquipoConfiguracion, EquipoModuloRequest, ModeloComponente } from 'src/app/core/interfaces/laptop.interface';

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

  memoriaInvalida(i: number): boolean {
    const m = Number(this.memorias[i]);
    return this.intentado && (!m || m < 1 || m > 512);
  }
  discoCapacidadInvalida(i: number): boolean {
    const c = Number(this.discos[i]?.capacidad);
    return this.intentado && (!c || c < 1 || c > 16000);
  }
  discoModeloInvalido(i: number): boolean {
    return this.intentado && !this.discos[i]?.idModelo;
  }

  /** Mensaje del primer problema de la configuración, o '' si está completa. */
  get error(): string {
    if (!this.ramTipo) { return 'Seleccione el tipo de RAM.'; }
    if (this.memorias.some(m => !m || Number(m) < 1 || Number(m) > 512)) { return 'Cada memoria debe tener entre 1 y 512 GB.'; }
    if (this.discos.some(d => !d.capacidad || Number(d.capacidad) < 1 || Number(d.capacidad) > 16000)) { return 'Cada disco debe tener entre 1 y 16000 GB.'; }
    if (this.discos.some(d => !d.idModelo)) { return 'Seleccione el modelo de cada disco.'; }
    return '';
  }

  /** Devuelve la configuración lista para guardar, o null (y marca en rojo lo que falta) si está incompleta. */
  armarConfiguracion(imei: string, usuario: string): EquipoConfiguracion | null {
    this.intentado = true;
    if (this.error) { return null; }

    const idModeloRam = this.modelosComponente.find(m => m.tipo_Pieza === 'RAM' && m.tipo === this.ramTipo)?.iD_Modelo ?? 0;
    const modulos: EquipoModuloRequest[] = [
      ...this.memorias.map(m => ({ tipoPieza: 'RAM' as const, capacidadGB: Number(m), idModeloComponente: idModeloRam })),
      ...this.discos.map(d => ({ tipoPieza: 'ALMACENAMIENTO' as const, capacidadGB: Number(d.capacidad), idModeloComponente: Number(d.idModelo) }))
    ];
    return {
      imei,
      ram_GB: this.totalRam,
      ram_Tipo: this.ramTipo,
      almacenamiento_GB: modulos.filter(x => x.tipoPieza === 'ALMACENAMIENTO').reduce((t, x) => t + x.capacidadGB, 0),
      almacenamiento_Tipo: this.modelosComponente.find(m => m.iD_Modelo === Number(this.discos[0]?.idModelo))?.tipo ?? null,
      modulos,
      notas: this.notas || null,
      usuario
    };
  }

  limpiar() {
    this.ramTipo = null;
    this.memorias = [null];
    this.discos = [{ capacidad: null, idModelo: null }];
    this.notas = '';
    this.intentado = false;
  }
}
