import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ValidatorPermissionService } from 'src/app/core/services/validator-permission.service';
import { ToastrService } from 'ngx-toastr';
import { LoginService } from 'src/app/auth/login.service';
import { LaptopCambioHistorial } from 'src/app/core/interfaces/laptop.interface';
import { LaptopsService } from 'src/app/core/services/laptops.service';

/** Confirmación para anular un cambio de pieza: pide el motivo y muestra qué se revierte. */
@Component({
  selector: 'app-laptop-anular-cambio',
  templateUrl: './laptop-anular-cambio.component.html',
  styleUrls: ['./laptop-anular-cambio.component.css']
})
export class LaptopAnularCambioComponent {
  @Input() cambio!: LaptopCambioHistorial;
  @Output() anulado = new EventEmitter<void>();
  @Output() cancelar = new EventEmitter<void>();

  motivo = '';
  isProcesando = false;

  constructor(
    private laptopsService: LaptopsService,
    private toastr: ToastrService,
    private loginService: LoginService,
    private validatorPermissionService: ValidatorPermissionService
  ) { }

  puedeVerCosto(): boolean {
    return this.validatorPermissionService.validateUserRole("EQP_VER_COSTO");
  }

  get motivoValido(): boolean {
    return this.motivo.trim().length > 0;
  }

  confirmar() {
    if (!this.motivoValido || this.isProcesando) { return; }
    this.isProcesando = true;
    this.laptopsService.anularCambio({
      iD_Cambio: this.cambio.iD_Cambio,
      motivo: this.motivo.trim(),
      usuario: this.loginService.getUserName()
    }).subscribe({
      next: () => {
        this.isProcesando = false;
        this.toastr.success('Cambio de pieza anulado.');
        this.anulado.emit();
      },
      error: (err) => {
        this.isProcesando = false;
        this.toastr.error(typeof err === 'string' && err ? err : 'No se pudo anular el cambio de pieza.', '', {
          closeButton: true,
          progressBar: true,
        });
      }
    });
  }
}
