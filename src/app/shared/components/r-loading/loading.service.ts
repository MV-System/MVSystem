import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

/** Una etapa de una espera larga: a partir de `desde` segundos se muestra un mensaje al azar de `mensajes`. */
export interface EtapaEspera {
  desde: number;
  mensajes: string[];
}

@Injectable({
  providedIn: 'root'
})
export class LoadingService {

  isLoading:Subject<boolean> = new Subject<boolean>();
  private message:string = "Cargando...";
  private detail:string = "";
  private temporizadores: any[] = [];
  /** Último mensaje elegido por etapa, para no repetirlo seguido (ni dentro de una espera ni en la siguiente). */
  private ultimoPorEtapa = new Map<string, string>();

  constructor() {
  }

  /** message: texto principal; detail (opcional): línea secundaria más pequeña, p. ej. "Por favor espere...". */
  showLoading(message:string = 'Cargando...', detail:string = ''){
    this.limpiarTemporizadores();
    this.message = message;
    this.detail = detail;
    this.isLoading.next(true);
  }

  /**
   * Espera larga con mensajes que cambian según pasan los segundos. En cada etapa se elige un mensaje al azar entre varios
   * (sin repetir el último que salió en esa etapa), como el mensaje de bienvenida.
   */
  showLoadingEscalonado(etapas: EtapaEspera[], detail:string = ''){
    this.limpiarTemporizadores();
    this.detail = detail;
    for (const etapa of etapas) {
      const mostrar = () => {
        this.message = this.elegir(etapa);
        this.isLoading.next(true);   // el componente relee el mensaje en cada emisión
      };
      if (etapa.desde <= 0) {
        mostrar();
      } else {
        this.temporizadores.push(setTimeout(mostrar, etapa.desde * 1000));
      }
    }
  }

  hideLoading(){
    this.limpiarTemporizadores();
    this.isLoading.next(false);
    this.message = 'Cargando...';
    this.detail = '';
  }

  public get Message():string{
      return this.message;
  }

  public get Detail():string{
      return this.detail;
  }

  private limpiarTemporizadores() {
    this.temporizadores.forEach(t => clearTimeout(t));
    this.temporizadores = [];
  }

  private elegir(etapa: EtapaEspera): string {
    const clave = etapa.mensajes[0];
    const ultimo = this.ultimoPorEtapa.get(clave);
    const opciones = etapa.mensajes.length > 1 ? etapa.mensajes.filter(m => m !== ultimo) : etapa.mensajes;
    const elegido = opciones[Math.floor(Math.random() * opciones.length)];
    this.ultimoPorEtapa.set(clave, elegido);
    return elegido;
  }
}
