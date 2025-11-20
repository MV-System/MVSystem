import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Banco } from '../bancos-lista/banco.interface';

export interface Movimiento {
  id: number;
  fecha: string;
  descripcion: string;
  monto: number;
  tipo: 'factura' | 'transferencia';
  bankOrigenId?: number;
  bankDestinoId?: number;
}

@Component({
  selector: 'app-bancos-lista',
  templateUrl: './bancos-lista.component.html',
  styleUrls: ['./bancos-lista.component.css']
})
export class BancosListaComponent {
  constructor(private toastr: ToastrService) {}
  bancos: Banco[] = [
    { id: 0, nombre: 'Efectivo', saldo: 5000 },
    { id: 1, nombre: 'Banco Popular', saldo: 15000 },
    { id: 2, nombre: 'Banco Reservas', saldo: 8000 },
    { id: 3, nombre: 'Banco BHD', saldo: 12000 }
  ];

  bancoSeleccionado: Banco | null = null;
  mostrarModalMovimientos: boolean = false;
  mostrarModalAcciones: boolean = false;
  movimientos: Movimiento[] = [];
  movimientosBanco: Movimiento[] = [];

  mockMovimientos: Movimiento[] = [
    { id: 1, fecha: '2025-11-01', descripcion: 'Factura #1001', monto: 2500, tipo: 'factura', bankOrigenId: 0 },
    { id: 2, fecha: '2025-11-03', descripcion: 'Factura #1002', monto: 1800, tipo: 'factura', bankOrigenId: 0 },
    { id: 3, fecha: '2025-11-05', descripcion: 'Factura #1003', monto: 3200, tipo: 'factura', bankOrigenId: 0 },
    { id: 4, fecha: '2025-11-03', descripcion: 'Transferencia recibida de Banco Popular', monto: 2000, tipo: 'transferencia', bankOrigenId: 1, bankDestinoId: 0 },
    { id: 5, fecha: '2025-11-07', descripcion: 'Pago proveedor', monto: -1500, tipo: 'transferencia', bankOrigenId: 2, bankDestinoId: 2 },
    { id: 6, fecha: '2025-11-10', descripcion: 'Factura #1004', monto: 4000, tipo: 'factura', bankOrigenId: 3 }
  ];


  bancoDestinoId: number | null = null;
  montoTransferencia: number = 0;
  transferenciaDescripcion: string = '';
  transferenciaError: string = '';
  // Eliminado: transferenciaExito, ahora se usa toast

  verDetalles(banco: Banco) {
    this.bancoSeleccionado = banco;
    this.movimientosBanco = this.mockMovimientos.filter(m => {
      if (m.tipo === 'factura' && m.bankOrigenId === banco.id) return true;
      if (m.tipo === 'transferencia' && m.bankOrigenId === banco.id && m.monto < 0) return true;
      if (m.tipo === 'transferencia' && m.bankDestinoId === banco.id && m.monto > 0) return true;
      return false;
    });
    this.mostrarModalMovimientos = true;
  }

  abrirAcciones(banco: Banco) {
    this.bancoSeleccionado = banco;
    this.bancoDestinoId = null;
    this.montoTransferencia = 0;
    this.transferenciaDescripcion = '';
    this.transferenciaError = '';
    this.mostrarModalAcciones = true;
  }

  realizarTransferencia() {
    if (!this.bancoSeleccionado || !this.bancoDestinoId || this.montoTransferencia <= 0) {
      this.transferenciaError = 'Complete todos los campos correctamente.';
      return;
    }
    if (this.bancoDestinoId === this.bancoSeleccionado.id) {
      this.transferenciaError = 'No puede transferir al mismo banco.';
      return;
    }
    if (this.bancoSeleccionado.saldo < this.montoTransferencia) {
      this.transferenciaError = 'Saldo insuficiente.';
      return;
    }
    // Simular transferencia
    const bancoDestino = this.bancos.find(b => b.id === this.bancoDestinoId);
    if (!bancoDestino) {
      this.transferenciaError = 'Banco destino no encontrado.';
      return;
    }
    this.bancoSeleccionado.saldo -= this.montoTransferencia;
    bancoDestino.saldo += this.montoTransferencia;
    const fecha = new Date().toISOString().slice(0,10);
    const descOrigen = this.transferenciaDescripcion ? `${this.transferenciaDescripcion} | Transferencia a ${bancoDestino.nombre}` : `Transferencia a ${bancoDestino.nombre}`;
    const descDestino = this.transferenciaDescripcion ? `${this.transferenciaDescripcion} | Transferencia recibida de ${this.bancoSeleccionado.nombre}` : `Transferencia recibida de ${this.bancoSeleccionado.nombre}`;
    this.mockMovimientos.push({
      id: this.mockMovimientos.length + 1,
      fecha,
      descripcion: descOrigen,
      monto: -this.montoTransferencia,
      tipo: 'transferencia',
      bankOrigenId: this.bancoSeleccionado.id,
      bankDestinoId: bancoDestino.id
    });
    this.mockMovimientos.push({
      id: this.mockMovimientos.length + 1,
      fecha,
      descripcion: descDestino,
      monto: this.montoTransferencia,
      tipo: 'transferencia',
      bankOrigenId: this.bancoSeleccionado.id,
      bankDestinoId: bancoDestino.id
    });
    this.movimientosBanco = this.mockMovimientos.filter(m => {
      if (!this.bancoSeleccionado) return false;
      if (m.tipo === 'factura' && m.bankOrigenId === this.bancoSeleccionado.id) return true;
      if (m.tipo === 'transferencia' && m.bankOrigenId === this.bancoSeleccionado.id && m.monto < 0) return true;
      if (m.tipo === 'transferencia' && m.bankDestinoId === this.bancoSeleccionado.id && m.monto > 0) return true;
      return false;
    });
    this.montoTransferencia = 0;
    this.bancoDestinoId = null;
    this.transferenciaDescripcion = '';
    this.transferenciaError = '';
    this.toastr.success('Transferencia realizada correctamente.', 'Éxito');
  }

  cerrarModal() {
    this.mostrarModalMovimientos = false;
    this.mostrarModalAcciones = false;
    this.bancoSeleccionado = null;
    this.movimientosBanco = [];
  }

  obtenerClaseBanco(nombre: string): string {
    return nombre.toLowerCase().replace(/\s+/g, '').replace('banco', '');
  }
}
