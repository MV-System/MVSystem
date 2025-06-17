import { Component, HostListener, Input, OnInit, Renderer2 } from '@angular/core';
import { ValidatorPermissionService } from 'src/app/core/services/validator-permission.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
 @Input() isCollapsed = false; // Recibe el estado desde el padre

  // inside: boolean = false;
  // color: string | undefined;

  constructor(private renderer: Renderer2,
    private validatorPermissionService: ValidatorPermissionService
  ) { }

  ngOnInit(): void {

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
  VerFormConsultaUtilidades(): boolean {
    return this.validatorPermissionService.validateUserRole("verUtilidadesToolStripMenuItem");
  }
  VerFormConsultaFacturas(): boolean {
    return this.validatorPermissionService.validateUserRole("MNU_CONS_FACTURAS");
  }
  VerFormConsultaTransferencias(): boolean {
    return this.validatorPermissionService.validateUserRole("Menu_Consulta_Transferencias");
  }

}
