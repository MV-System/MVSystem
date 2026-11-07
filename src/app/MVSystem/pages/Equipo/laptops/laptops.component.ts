import { Component, OnInit } from '@angular/core';
import { ValidatorPermissionService } from 'src/app/core/services/validator-permission.service';

/** Una sola entrada "Laptops" en el menú: Cambio de pieza | Custodia, según el permiso del usuario. */
@Component({
  selector: 'app-laptops',
  templateUrl: './laptops.component.html'
})
export class LaptopsComponent implements OnInit {

  vista: 'CAMBIO' | 'CUSTODIA' = 'CAMBIO';

  constructor(private validatorPermissionService: ValidatorPermissionService) { }

  ngOnInit(): void {
    if (!this.verCambioPieza && this.verCustodia) { this.vista = 'CUSTODIA'; }
  }

  get verCambioPieza(): boolean {
    return this.validatorPermissionService.validateUserRole('LAPTOP_CAMBIO_PIEZA');
  }

  get verCustodia(): boolean {
    return this.validatorPermissionService.validateUserRole('LAPTOP_CUSTODIA_CONSULTA');
  }
}
