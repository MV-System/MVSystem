import { Component, OnDestroy, OnInit } from '@angular/core';
import { Aviso, AvisosService } from 'src/app/core/services/avisos.service';

/**
 * Muestra a cada usuario los avisos y novedades que le corresponden y todavia no ha visto:
 * al entrar y, mientras tenga el sistema abierto, cada cierto tiempo.
 */
@Component({
  selector: 'app-novedades',
  templateUrl: './novedades.component.html',
  styleUrls: ['./novedades.component.css']
})
export class NovedadesComponent implements OnInit, OnDestroy {

  show = false;
  avisos: Aviso[] = [];

  private readonly esperaInicialMs = 2500; // despues del mensaje de bienvenida
  private readonly consultaMs = 45 * 1000;
  private temporizadorInicial: any;
  private temporizador: any;

  constructor(private avisosService: AvisosService) { }

  ngOnInit(): void {
    this.temporizadorInicial = setTimeout(() => this.consultar(), this.esperaInicialMs);
    this.temporizador = setInterval(() => this.consultar(), this.consultaMs);
  }

  ngOnDestroy(): void {
    clearTimeout(this.temporizadorInicial);
    clearInterval(this.temporizador);
  }

  get hayUrgente(): boolean {
    return this.avisos.some(a => a.prioridad === 'U');
  }

  get titulo(): string {
    if (this.avisos.length === 1 && this.avisos[0].tipo === 'AVISO') return 'Aviso importante';
    return this.avisos.every(a => a.tipo === 'NOVEDAD') ? 'Novedades del sistema' : 'Avisos del sistema';
  }

  entendido(): void {
    const ids = this.avisos.map(a => a.idAviso);
    this.show = false;
    this.avisos = [];
    // Si no se pudo guardar, el aviso volvera a salir en la proxima consulta
    this.avisosService.marcarVistos(ids).subscribe({ error: () => { } });
  }

  private consultar(): void {
    if (!localStorage.getItem('token')) return;
    this.avisosService.pendientes().subscribe({
      next: lista => {
        const nuevos = (lista || []).filter(a => !this.avisos.some(v => v.idAviso === a.idAviso));
        if (nuevos.length === 0) return;
        // Los urgentes primero, y los mas recientes antes
        this.avisos = [...this.avisos, ...nuevos].sort((a, b) =>
          (a.prioridad === b.prioridad ? 0 : a.prioridad === 'U' ? -1 : 1) || b.fechaInicio.localeCompare(a.fechaInicio));
        this.show = true;
      },
      error: () => { }
    });
  }
}
