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

  isMobileScreen(): boolean {
    return window.innerWidth < 992;
  }

  constructor(
    private toastr: ToastrService,
    private loginService: LoginService
  ) {}

  ngOnInit(): void {
    // Oculta el sidebar por defecto en pantallas pequeñas
    if (window.innerWidth < 992) {
      this.sidebarVisible = false;
    }
    // Mostrar solo si no se ha mostrado en esta sesión
    if (!localStorage.getItem('bienvenidaMostrada')) {
      this.mostrarPopupBienvenida();
      localStorage.setItem('bienvenidaMostrada', 'true');
    }
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
      `${saludo}, ${nombre}! 💪<br>Gracias por seguir confiando en CellControl. ¡Hoy se trabaja con flow!`,
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
      `${saludo}, ${nombre}! 👋<br>¿Ya almorzaste? Tómate un respiro y sigue dando lo mejor de ti.`,
      `${saludo}, ${nombre}! 😃<br>La tarde es ideal para avanzar en tus proyectos. ¡Sigue así!`,
      `${saludo}, ${nombre}! 💡<br>Un café y seguimos, que la tarde aún tiene mucho por ofrecer.`,
      `${saludo}, ${nombre}! 🚀<br>Recuerda que cada esfuerzo suma. ¡Vamos por más!`,
      `${saludo}, ${nombre}! ✨<br>Gracias por tu dedicación. ¡Que tengas una excelente tarde!`,
      `${saludo}, ${nombre}! 📈<br>La constancia es la clave. ¡No te detengas!`,
      `${saludo}, ${nombre}! 🙌<br>CellControl te acompaña en cada paso. ¿En qué puedo ayudarte esta tarde?`,
      `${saludo}, ${nombre}! 😄<br>Un pequeño descanso puede darte nuevas ideas. ¡Ánimo!`,
      `${saludo}, ${nombre}! 🌟<br>La tarde es perfecta para aprender algo nuevo. ¡Aprovecha!`
    ];
  } else {
    saludo = '¡Buenas noches';
    mensajes = [
      `${saludo}, ${nombre}! 🌙<br>Gracias por tu esfuerzo hoy. Que tengas un merecido descanso.`,
      `${saludo}, ${nombre}! 😴<br>Recuerda desconectarte y recargar energías para mañana.`,
      `${saludo}, ${nombre}! ✨<br>La noche es perfecta para reflexionar y agradecer. ¡Descansa!`,
      `${saludo}, ${nombre}! 🌟<br>Esperamos que hayas tenido un día productivo. ¡Hasta mañana!`,
      `${saludo}, ${nombre}! 💤<br>CellControl te desea una noche tranquila y reparadora.`,
      `${saludo}, ${nombre}! 🤖<br>Si necesitas algo, aquí estaremos mañana para ayudarte.`,
      `${saludo}, ${nombre}! 📚<br>Un buen libro y un descanso merecido, ¡feliz noche!`,
      `${saludo}, ${nombre}! 🛌<br>Que sueñes con grandes logros. ¡Nos vemos mañana!`,
      `${saludo}, ${nombre}! 🌌<br>Gracias por ser parte de CellControl. ¡Descansa!`,
      `${saludo}, ${nombre}! 🌠<br>Recuerda: cada día es una nueva oportunidad. ¡Buenas noches!`
    ];
  }
  const mensajeAleatorio = mensajes[Math.floor(Math.random() * mensajes.length)];
  this.toastr.info(mensajeAleatorio, 'Bienvenido a CellControl', {
    closeButton: true,
    progressBar: true,
    timeOut: 10000,
    enableHtml: true
  });
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
