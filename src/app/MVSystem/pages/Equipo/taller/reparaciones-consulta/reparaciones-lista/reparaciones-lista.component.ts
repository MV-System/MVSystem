import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ReparacionConsulta } from 'src/app/core/interfaces/equipo.interface';

@Component({
  selector: 'app-reparaciones-lista',
  templateUrl: './reparaciones-lista.component.html',
  styleUrls: ['./reparaciones-lista.component.css']
})
export class ReparacionesListaComponent {

  @Input() reparaciones: ReparacionConsulta[] = [];
  @Input() pageSize: number = 10;
  @Input() pageIndex: number = 1;
  @Input() totalRecord: number = 0;
  @Input() line: number = 0;
  @Input() lastLine: number = 0;
  @Input() isLoading: boolean = false;

  @Output() onReparacionClick = new EventEmitter<number>();
  @Output() onPageSizeChange = new EventEmitter<number>();
  @Output() onPageChange = new EventEmitter<number>();

  selectedRowIndex: number | null = null;

  /**
   * Detectar si es pantalla móvil
   */
  isMobileScreen(): boolean {
    return window.innerWidth < 768;
  }

  /**
   * Manejar click en una reparación
   */
  handleReparacionClick(idReparacion: number, index: number): void {
    this.selectedRowIndex = index;
    this.onReparacionClick.emit(idReparacion);
  }

  /**
   * Cambiar tamaño de página
   */
  handlePageSizeChange(): void {
    this.onPageSizeChange.emit(Number(this.pageSize));
  }

  /**
   * Cambiar página
   */
  handlePageChange(page: number): void {
    this.onPageChange.emit(page);
  }

  /**
   * Obtener clase de badge según el estatus
   */
  getEstatusBadgeClass(estatus: string): string {
    switch(estatus) {
      case 'Pendiente': return 'bg-warning';
      case 'En proceso': return 'bg-info';
      case 'Completado': return 'bg-success';
      case 'Entregado': return 'bg-primary';
      case 'Cancelado': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  /**
   * Formatear precio/costo
   */
  formatCurrency(value: number): string {
    return `RD$${value.toFixed(2)}`;
  }
}
