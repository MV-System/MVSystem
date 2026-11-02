import { Component, EventEmitter, HostListener, Input, OnInit, Output, Renderer2 } from '@angular/core';
import { ValidatorPermissionService } from 'src/app/core/services/validator-permission.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  @Input() isCollapsed = false; // Recibe el estado desde el padre
  @Output() menuSelected = new EventEmitter<void>(); // <-- DEBE IR AQUÍ

  constructor(private renderer: Renderer2,
    private validatorPermissionService: ValidatorPermissionService
  ) { }

  ngOnInit(): void {

  }
  onMenuClick() {
  this.menuSelected.emit();
}
  VerFormFacturacion(): boolean {
    return this.validatorPermissionService.validateUserRole("MNU_MANT_FACTURACION");
  }
  VerFormcotizacion(): boolean {
    return this.validatorPermissionService.validateUserRole("CotizacionMenu");
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
  VerFormSuplidores(): boolean {
    return this.validatorPermissionService.validateUserRole("MNU_MANT_SUPLIDORES");
  }
  VerFormEquipos(): boolean {
    return this.validatorPermissionService.validateUserRole("MNU_MANT_EQUIPOS");
  }
  VerFormLaptopCambioPieza(): boolean {
    return this.validatorPermissionService.validateUserRole("LAPTOP_CAMBIO_PIEZA");
  }
  VerFormLaptopCustodia(): boolean {
    return this.validatorPermissionService.validateUserRole("LAPTOP_CUSTODIA_CONSULTA");
  }
  VerFormAccesorios(): boolean {
    return this.validatorPermissionService.validateUserRole("MNU_MANT_ACCESORIOS");
  }
  VerFormModelos(): boolean {
    return this.validatorPermissionService.validateUserRole("MNU_MANT_MODELOS");
  }
  VerFormTransferenciasEquipos(): boolean {
    return this.validatorPermissionService.validateUserRole("MNTransfiereEquipos");
  }
  VerFormRegistroVendedores(): boolean {
    return this.validatorPermissionService.validateUserRole("MNU_MANT_VENDEDORES");
  }
  VerFormCotizacion(): boolean {
    return this.validatorPermissionService.validateUserRole("CotizacionMenu");
  }
  VerFormCambiaEstatusEquipo(): boolean {
    return this.validatorPermissionService.validateUserRole("cambiarEstadoDeEquipoToolStripMenuItem");
  }
  VerFormRecepcionEquipo(): boolean {
    return this.validatorPermissionService.validateUserRole("MNU_RECEPCION_EQUIPOS");
  }
  VerFormReparacionEquipo(): boolean {
    return this.validatorPermissionService.validateUserRole("MNU_MANT_EET_REPARACION");
  }
  VerMenuConsultas(): boolean {
    return this.validatorPermissionService.validateUserRole("MNU_CONSULTA");
  }
  VerFormConsultaAccesorios(): boolean {
    return this.validatorPermissionService.validateUserRole("MNU_CONS_ACCESORIOS");
  }
  VerFormConsultaClientes(): boolean {
    return this.validatorPermissionService.validateUserRole("MNU_CONS_CLIENTES");
  }
  VerFormConsultaClientesPorCobrar(): boolean {
    return this.validatorPermissionService.validateUserRole("clienteConCuentesPendientesToolStripMenuItem");
  }
  VerFormConsultaEquipos(): boolean {
    return this.validatorPermissionService.validateUserRole("MNU_CONS_EQUIPOS");
  }
  VerFormEquiposVendidos(): boolean {
    return this.validatorPermissionService.validateUserRole("equiposVendidosMenu");
  }
  VerFormConsultaUtilidades(): boolean {
    return this.validatorPermissionService.validateUserRole("verUtilidadesToolStripMenuItem");
  }
  VerFormConsultaFacturas(): boolean {
    return this.validatorPermissionService.validateUserRole("MNU_CONS_FACTURAS");
  }
  VerFormConsultaCotizaciones(): boolean {
    return this.validatorPermissionService.validateUserRole("MNU_CONS_COTIZACIONES");
  }
  CajaPreFacturas(): boolean {
    return this.validatorPermissionService.validateUserRole("CajaPreFacturas");
  }
  VerFormConsultaTransferencias(): boolean {
    return this.validatorPermissionService.validateUserRole("Menu_Consulta_Transferencias");
  }
  VerFormConsultaRecepcionEquipos(): boolean {
    return this.validatorPermissionService.validateUserRole("recepcionequipos");
  }
  VerFormConsultaReparaciones(): boolean {
    return this.validatorPermissionService.validateUserRole("MNU_MANT_EET_REPARACION");
  }
  VerFormPasarInventario(): boolean {
    return this.validatorPermissionService.validateUserRole("MNU_MANT_PASARINVEQ");
  }
  VerMenuSeguridad(): boolean {
    return this.validatorPermissionService.validateUserRole("MenuSeguridad");
  }

  VerUsuarios(): boolean {
    return this.validatorPermissionService.validateUserRole("VerUsuarios");
  }

  VerRoles(): boolean {
    return this.validatorPermissionService.validateUserRole("VerRoles");
  }

  VerPermisos(): boolean {
    return this.validatorPermissionService.validateUserRole("VerPermisos");
  }

  VerDepartamentos(): boolean {
    return this.validatorPermissionService.validateUserRole("VerDepartamentos");
  }

  VerModulos(): boolean {
    return this.validatorPermissionService.validateUserRole("VerModulos");
  }

  VerSistemas(): boolean {
    return this.validatorPermissionService.validateUserRole("VerSistemas");
  }

  VerAsignarPermisos(): boolean {
    return this.validatorPermissionService.validateUserRole("AsignarPermisos");
  }

  VerCambiaClave(): boolean {
    return this.validatorPermissionService.validateUserRole("cambiarclave");
  }

  VerGestionarEquipo(): boolean {
    return this.validatorPermissionService.validateUserRole("GESTIONEQUIPO");
  }

  VerModoDesarrollador(): boolean {
    return this.validatorPermissionService.validateUserRole("ModoDesarrollador");
  }

}
