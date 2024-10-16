import { Component, HostListener, OnInit, Renderer2 } from '@angular/core';
import { ValidatorPermissionService } from 'src/app/core/services/validator-permission.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  inside: boolean = false;
  color: string | undefined;

  constructor(private renderer: Renderer2,
    private validatorPermissionService: ValidatorPermissionService
  ) { }

  ngOnInit(): void {

  }
  VerMenuMantenimiento(): boolean {
    return this.validatorPermissionService.validateUserRole("MNU_MANTENIMIENTO");
  }
  VerFormMarcas(): boolean {
    return this.validatorPermissionService.validateUserRole("MNU_MANT_MARCAS");
  }
  VerFormClientes(): boolean {
    return this.validatorPermissionService.validateUserRole("MNU_MANT_CLIENTES");
  }

  @HostListener('click', ['$event']) click() {
    this.inside = true;

  }
  @HostListener('document:click', ['$event']) clickOutside(event: Event) {
    const toggle = document.querySelector('.toggle-sidebar-btn');


      if ( !this.inside && event.target != toggle) {
      $('body').addClass('toggle-sidebar')
    }
    this.inside = false

  }
  // onMouseEnter() {
  //   this.color = 'white'; // Cambia el color al pasar el mouse
  // }

  // onMouseLeave() {
  //   this.color = 'white'; // Vuelve al color original al salir
  // }

}
