import { Component, HostListener } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { cambioDeSesion } from './helpers/helper';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'MvSystem';

  constructor(private toastr: ToastrService) { }

  /**
   * El token se guarda en localStorage, que comparten todas las pestañas del navegador. Si en otra pestaña se inicia
   * sesión con otro usuario o empresa, esta pestaña seguiría con pantallas de la sesión anterior pero enviaría las
   * peticiones con el token nuevo (por ejemplo, una factura armada en la principal que se guarda en el espejo).
   * El evento 'storage' solo llega a las demás pestañas: aquí se avisa y se recarga para tomar la sesión vigente.
   */
  @HostListener('window:storage', ['$event'])
  recargarSiCambioLaSesion(evento: StorageEvent): void {
    if (evento.key !== null && evento.key !== 'token') { return; }
    if (!cambioDeSesion(evento.oldValue, evento.newValue)) { return; }
    this.toastr.warning('La sesión cambió en otra pestaña. Se recargará esta página para evitar guardar datos en la empresa equivocada.');
    setTimeout(() => window.location.reload(), 2500);
  }

  /**
   * Con un campo numérico seleccionado, girar la rueda del mouse cambia su valor (ej. 512 pasa a 489 sin que el usuario
   * escriba nada). Al girar la rueda se le quita el foco para que solo se desplace la página.
   */
  @HostListener('document:wheel')
  soltarCampoNumericoAlDesplazar(): void {
    const activo = document.activeElement;
    if (activo instanceof HTMLInputElement && activo.type === 'number') {
      activo.blur();
    }
  }
}
