import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { LoginService } from 'src/app/auth/login.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  sidebarVisible = true;
 @ViewChild('sidebarContainer', { static: false }) sidebarContainer!: ElementRef;
 mensajeBienvenida: string = '';

  constructor(
    private toastr: ToastrService,
    private loginService: LoginService
  ) {}

  ngOnInit(): void {
    // Oculta el sidebar por defecto en pantallas pequeñas
    if (window.innerWidth < 992) {
      this.sidebarVisible = false;
    }
    this.mostrarPopupBienvenida();
  }

  mostrarPopupBienvenida() {
  const hora = new Date().getHours();
  let saludo = '';
  let mensajes: string[] = [];
  const nombre = this.loginService.getUserGiveName() || this.loginService.getUserName() || '';

  if (hora >= 5 && hora < 12) {
    saludo = '¡Buenos días';
    mensajes = [
      `${saludo}, ${nombre}! 🌞<br>Arrancamos el día con buena vibra. ¡Hoy la rompemos!`,
      `${saludo}, ${nombre}! ☕<br>Espero que hayas desayunado bien, porque hoy toca darlo todo.`,
      `${saludo}, ${nombre}! 😃<br>Vamos a meter mano desde temprano, que el éxito no se deja esperar.`,
      `${saludo}, ${nombre}! 💪<br>Gracias por seguir confiando en MVSystem. ¡Hoy se trabaja con flow!`,
      `${saludo}, ${nombre}! ✨<br>Sonríe, que hoy puede ser un gran día para lograr algo nuevo.`,
      `${saludo}, ${nombre}! 📈<br>Cada pasito que des hoy, te acerca más a tus metas.`,
      `${saludo}, ${nombre}! 🚀<br>Comienza el día con energía, que el éxito está en movimiento.`,
      `${saludo}, ${nombre}! 🌅<br>Hoy es una buena oportunidad para avanzar. ¡Vamos con todo!`,
      `${saludo}, ${nombre}! 🙌<br>Gracias por formar parte de esta familia. ¡A romperla hoy!`,
      `${saludo}, ${nombre}! 😄<br>Actitud positiva desde temprano, que eso se nota. ¡Vamos arriba!`
    ];
  } else if (hora >= 12 && hora < 19) {
    saludo = '¡Buenas tardes';
    mensajes = [
      `${saludo}, ${nombre}! 🌤️<br>Espero que tu día vaya bien. ¡Un empujoncito más y lo logras!`,
      `${saludo}, ${nombre}! 👋<br>¿Ya almorzaste? Tómate un respiro y sigue dándole con todo.`,
      `${saludo}, ${nombre}! 💼<br>La tarde está perfecta para cerrar esos pendientes con estilo.`,
      `${saludo}, ${nombre}! 😎<br>Vamos bien, no aflojes. ¡El esfuerzo de ahora es el éxito de mañana!`,
      `${saludo}, ${nombre}! ✨<br>Gracias por tu dedicación. ¡El trabajo bien hecho siempre se nota!`,
      `${saludo}, ${nombre}! 🚀<br>Recuerda hidratarte y mantenerte activo. ¡Tú puedes!`,
      `${saludo}, ${nombre}! 💪<br>Un poco más de esfuerzo y terminas el día con broche de oro.`,
      `${saludo}, ${nombre}! 😊<br>MVSystem sigue contigo, ayudándote a sacar lo mejor de ti.`,
      `${saludo}, ${nombre}! ⚡<br>Vamos a cerrar la tarde con buena energía. ¡A romperla!`,
      `${saludo}, ${nombre}! 😃<br>Gracias por dar siempre lo mejor. ¡Sigue brillando!`
    ];
  } else {
    saludo = '¡Buenas noches';
    mensajes = [
      `${saludo}, ${nombre}! 🌙<br>Gracias por todo tu esfuerzo hoy. ¡Te lo ganaste, descansa tranquilo!`,
      `${saludo}, ${nombre}! 😴<br>Desconecta un poco, mañana seguimos con más ánimo.`,
      `${saludo}, ${nombre}! ✨<br>Respira profundo, agradece el día y suéltalo. ¡Mañana hay más!`,
      `${saludo}, ${nombre}! 🌟<br>Hoy diste lo mejor. ¡Ahora toca recargar energías!`,
      `${saludo}, ${nombre}! 💤<br>Que descanses bien, mañana seguimos construyendo tus metas.`,
      `${saludo}, ${nombre}! 📱<br>MVSystem sigue aquí para ti, pero ahora es hora de soltar el celular 😅.`,
      `${saludo}, ${nombre}! 🌌<br>Gracias por formar parte de esta comunidad. ¡Nos vemos mañana!`,
      `${saludo}, ${nombre}! 💫<br>Descansa, que el éxito también se construye durmiendo bien.`,
      `${saludo}, ${nombre}! 🛌<br>Apaga las luces y deja que los sueños te inspiren. ¡Feliz noche!`,
      `${saludo}, ${nombre}! 🌠<br>Cada día cuenta, pero el descanso también. ¡Hasta mañana!`
    ];
  }

  const icono = hora >= 5 && hora < 12 ? '☀️' : (hora >= 12 && hora < 19 ? '🌤️' : '🌙');
    const mensajeHtml = `<div class='bienvenida-text'>${saludo}, ${nombre}!</div>
      <div class='bienvenida-msg'>${mensajes[Math.floor(Math.random() * mensajes.length)].replace(`${saludo}, ${nombre}!`, '')}</div>`;
    this.toastr.info(mensajeHtml, '', {
      timeOut: 6500,
      closeButton: true,
      progressBar: true,
      positionClass: 'toast-top-center',
      enableHtml: true,
      toastClass: 'ngx-toastr bienvenida-toast',
      // icono dinámico para el ::before
      tapToDismiss: true
    });
    // Establecer el icono dinámico en el toast
    setTimeout(() => {
      const toast = document.querySelector('.bienvenida-toast');
      if (toast) toast.setAttribute('data-icon', icono);
    }, 100);
  }
  setMensajeBienvenida() {
    const hora = new Date().getHours();
    let saludo = 'Bienvenido';
    if (hora >= 6 && hora < 12) {
      saludo = 'Buenos días';
    } else if (hora >= 12 && hora < 19) {
      saludo = 'Buenas tardes';
    } else {
      saludo = 'Buenas noches';
    }
    const nombre = this.loginService.getUserGiveName ? this.loginService.getUserGiveName() : this.loginService.getUserName();
    this.mensajeBienvenida = `${saludo}${nombre ? ', ' + nombre : ''}!`;
  }

  isMobileScreen(): boolean {
    return window.innerWidth < 992;
  }
  onToggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
  }

  onSidebarMenuSelected() {
    if (window.innerWidth < 992) { // Solo en móvil/tablet
      this.sidebarVisible = false;
    }
  }

  onDocumentClick(event: MouseEvent) {
    if (
      window.innerWidth < 992 &&
      this.sidebarVisible &&
      this.sidebarContainer &&
      !this.sidebarContainer.nativeElement.contains(event.target)
    ) {
      this.sidebarVisible = false;
    }
  }
}
