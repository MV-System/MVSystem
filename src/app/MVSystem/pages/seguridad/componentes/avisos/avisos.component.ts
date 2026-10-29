import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Aviso, AvisosService, AvisoVisto } from 'src/app/core/services/avisos.service';
import { UsoSistemaService } from 'src/app/core/services/uso-sistema.service';

interface FormularioAviso {
  tipo: 'NOVEDAD' | 'AVISO';
  prioridad: 'N' | 'U';
  titulo: string;
  mensaje: string;
  donde: string;
  destino: 'TODOS' | 'EMPRESA' | 'USUARIOS';
  destinoValor: string;
  permiso: string;
  fechaInicio: string;
  fechaVence: string;
}

@Component({
  selector: 'app-avisos',
  templateUrl: './avisos.component.html',
  styleUrls: ['./avisos.component.css']
})
export class AvisosComponent implements OnInit {

  avisos: Aviso[] = [];
  empresas: string[] = [];
  cargando = false;
  enviando = false;
  error = '';

  form: FormularioAviso = this.formularioVacio();

  // Detalle de quien vio un aviso
  avisoSeleccionado: Aviso | null = null;
  vistos: AvisoVisto[] = [];
  cargandoVistos = false;

  constructor(
    private avisosService: AvisosService,
    private usoSistema: UsoSistemaService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.usoSistema.empresas().subscribe({ next: e => this.empresas = e, error: () => { } });
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    this.avisosService.listar().subscribe({
      next: lista => { this.avisos = lista; this.error = ''; this.cargando = false; },
      error: () => { this.error = 'No se pudo consultar los avisos.'; this.cargando = false; }
    });
  }

  get puedeEnviar(): boolean {
    const f = this.form;
    if (!f.titulo.trim() || !f.mensaje.trim()) return false;
    if (f.destino !== 'TODOS' && !f.destinoValor.trim()) return false;
    return !this.enviando;
  }

  enviar(): void {
    if (!this.puedeEnviar) return;
    const f = this.form;
    this.enviando = true;

    this.avisosService.crear({
      tipo: f.tipo,
      prioridad: f.prioridad,
      titulo: f.titulo.trim(),
      mensaje: f.mensaje.trim(),
      donde: f.donde.trim() || undefined,
      destino: f.destino,
      destinoValor: f.destino === 'TODOS' ? undefined : f.destinoValor.trim(),
      permiso: f.permiso.trim() || undefined,
      fechaInicio: f.fechaInicio || null,
      fechaVence: f.fechaVence || null
    }).subscribe({
      next: () => {
        this.toastr.success('Aviso publicado.');
        this.form = this.formularioVacio();
        this.enviando = false;
        this.cargar();
      },
      error: err => {
        this.enviando = false;
        // El interceptor ya muestra el error del servidor
        console.error('No se pudo publicar el aviso', err);
      }
    });
  }

  cambiarActivo(aviso: Aviso): void {
    this.avisosService.cambiarActivo(aviso.idAviso, !aviso.activo).subscribe({
      next: () => { aviso.activo = !aviso.activo; },
      error: () => { }
    });
  }

  verVistos(aviso: Aviso): void {
    if (this.avisoSeleccionado === aviso) {
      this.avisoSeleccionado = null;
      return;
    }
    this.avisoSeleccionado = aviso;
    this.vistos = [];
    this.cargandoVistos = true;
    this.avisosService.quienLoVio(aviso.idAviso).subscribe({
      next: lista => { this.vistos = lista; this.cargandoVistos = false; },
      error: () => { this.cargandoVistos = false; }
    });
  }

  estado(aviso: Aviso): { texto: string, clase: string } {
    if (!aviso.activo) return { texto: 'Desactivado', clase: 'bg-secondary' };
    const ahora = this.ahoraRD().getTime();
    if (new Date(aviso.fechaInicio).getTime() > ahora) return { texto: 'Programado', clase: 'bg-info' };
    if (aviso.fechaVence && new Date(aviso.fechaVence).getTime() <= ahora) return { texto: 'Vencido', clase: 'bg-warning text-dark' };
    return { texto: 'Vigente', clase: 'bg-success' };
  }

  destinoTexto(aviso: Aviso): string {
    if (aviso.destino === 'TODOS') return 'Todos';
    return (aviso.destino === 'EMPRESA' ? 'Empresa: ' : 'Usuarios: ') + aviso.destinoValor;
  }

  private ahoraRD(): Date {
    // Hora de Republica Dominicana (UTC-4) expresada como hora local del navegador, igual que las fechas del servidor
    const ahora = new Date();
    return new Date(ahora.getTime() + ahora.getTimezoneOffset() * 60000 - 4 * 3600000);
  }

  private formularioVacio(): FormularioAviso {
    return {
      tipo: 'AVISO', prioridad: 'N', titulo: '', mensaje: '', donde: '',
      destino: 'TODOS', destinoValor: '', permiso: '', fechaInicio: '', fechaVence: ''
    };
  }
}
