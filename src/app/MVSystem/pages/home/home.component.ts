import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { LoginService } from 'src/app/auth/login.service';
import { ToastrService } from 'ngx-toastr';
import { UsoSistemaService } from 'src/app/core/services/uso-sistema.service';

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
    private loginService: LoginService,
    private usoSistema: UsoSistemaService
  ) {}

  ngOnInit(): void {
    this.usoSistema.iniciar();
    // Oculta el sidebar por defecto en pantallas pequeñas
    if (window.innerWidth < 992) {
      this.sidebarVisible = false;
    }
    // Mostrar solo si no se ha mostrado en esta sesión
    // Esperar 2 segundos después de que cargue el componente para asegurar que todo esté renderizado
    if (!localStorage.getItem('bienvenidaMostrada')) {
      setTimeout(() => {
        this.mostrarPopupBienvenida();
        localStorage.setItem('bienvenidaMostrada', 'true');
      }, 2000); // 2 segundos de espera
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
      `${saludo}, ${nombre}! 🌞<br>Arrancamos el día con buena vibra. ¡Hoy se trabaja con actitud positiva!`,
      `${saludo}, ${nombre}! ☕<br>Espero que hayas arrancado bien el día. ¡Vamos a darlo todo!`,
      `${saludo}, ${nombre}! 💪<br>Cada día trae nuevas oportunidades. ¡Aprovecha las tuyas!`,
      `${saludo}, ${nombre}! 😃<br>Gracias por seguir confiando en CellControl. ¡Hoy la rompemos!`,
      `${saludo}, ${nombre}! ✨<br>Empieza el día con energía y buenas ideas. ¡Tú puedes!`,
      `${saludo}, ${nombre}! 📈<br>Cada paso cuenta, y hoy es un buen día para avanzar.`,
      `${saludo}, ${nombre}! 🚀<br>Arriba ese ánimo, que el éxito se construye paso a paso.`,
      `${saludo}, ${nombre}! 🌅<br>Hoy es una buena oportunidad para crecer. ¡Vamos con todo!`,
      `${saludo}, ${nombre}! 🙌<br>Gracias por ser parte de esta comunidad. ¡Hoy será un gran día!`,
      `${saludo}, ${nombre}! 😄<br>Actitud positiva desde temprano, que eso siempre se nota. ¡Vamos arriba!`
    ];
  } else if (hora >= 12 && hora < 19) {
    saludo = '¡Buenas tardes';
    mensajes = [
      `${saludo}, ${nombre}! 🌤️<br>Espero que tu día vaya fluyendo bien. ¡Un poco más y lo logras!`,
      `${saludo}, ${nombre}! 👋<br>¿Ya almorzaste? Recarga energías y sigue con todo.`,
      `${saludo}, ${nombre}! 😃<br>La tarde es perfecta para avanzar con buen ritmo. ¡Sigue firme!`,
      `${saludo}, ${nombre}! 💡<br>Un café y seguimos, que aún queda tarde para lograr mucho.`,
      `${saludo}, ${nombre}! 🚀<br>Recuerda: cada esfuerzo suma. ¡Tú haces la diferencia!`,
      `${saludo}, ${nombre}! ✨<br>Gracias por tu dedicación. ¡Que tengas una tarde productiva!`,
      `${saludo}, ${nombre}! 📈<br>La constancia siempre da frutos. ¡No te detengas ahora!`,
      `${saludo}, ${nombre}! 🙌<br>CellControl te acompaña en todo momento. ¡Vamos a seguir creciendo!`,
      `${saludo}, ${nombre}! 😄<br>Un pequeño descanso puede traer grandes ideas. ¡Tú puedes!`,
      `${saludo}, ${nombre}! 🌟<br>Cada día se aprende algo nuevo. ¡Aprovecha la tarde!`
    ];
  } else {
    saludo = '¡Buenas noches';
    mensajes = [
      `${saludo}, ${nombre}! 🌙<br>Gracias por todo tu esfuerzo hoy. ¡Te lo ganaste!`,
      `${saludo}, ${nombre}! 😴<br>Desconéctate un poco y recarga energías para mañana.`,
      `${saludo}, ${nombre}! ✨<br>La noche es buena para agradecer lo logrado y planear lo que viene.`,
      `${saludo}, ${nombre}! 🌟<br>Esperamos que hayas tenido un gran día. ¡A descansar!`,
      `${saludo}, ${nombre}! 💤<br>CellControl te desea una noche tranquila y reparadora.`,
      `${saludo}, ${nombre}! 🤖<br>Mañana seguimos con más. ¡Gracias por ser parte del equipo!`,
      `${saludo}, ${nombre}! 📚<br>Un buen descanso también es parte del éxito. ¡Feliz noche!`,
      `${saludo}, ${nombre}! 🛌<br>Que descanses y recargues energías. ¡Nos vemos mañana!`,
      `${saludo}, ${nombre}! 🌌<br>Gracias por tu compromiso. ¡Sigue brillando!`,
      `${saludo}, ${nombre}! 🌠<br>Recuerda: cada día cuenta. ¡Buenas noches y a soñar en grande!`
    ];
  }

  const mensajeAleatorio = mensajes[Math.floor(Math.random() * mensajes.length)];
  this.toastr.info(mensajeAleatorio, '¡Hola!', {
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
