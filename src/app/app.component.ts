import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'MvSystem';

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
