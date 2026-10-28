import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { LaptopCambioHistorial } from 'src/app/core/interfaces/laptop.interface';
import { LaptopsService } from 'src/app/core/services/laptops.service';

/** Ventana con todos los cambios de pieza de una laptop y su estado de custodia. */
@Component({
  selector: 'app-laptop-historial',
  templateUrl: './laptop-historial.component.html',
  styleUrls: ['./laptop-historial.component.css']
})
export class LaptopHistorialComponent implements OnInit {
  @Input() imei = '';
  @Output() cerrar = new EventEmitter<void>();

  historial: LaptopCambioHistorial[] = [];
  isLoading = false;

  constructor(private laptopsService: LaptopsService, private toastr: ToastrService) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.laptopsService.consultarHistorial(this.imei).subscribe({
      next: (lista) => {
        this.historial = lista || [];
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.toastr.error(typeof err === 'string' && err ? err : 'Error al cargar el historial.');
      }
    });
  }

  claseCustodia(estado: string): string {
    switch (estado) {
      case 'PENDIENTE': return 'bg-warning text-dark';
      case 'RECIBIDA': return 'bg-success';
      case 'ENTREGADA_CLIENTE': return 'bg-info text-dark';
      default: return 'bg-secondary';
    }
  }
}
