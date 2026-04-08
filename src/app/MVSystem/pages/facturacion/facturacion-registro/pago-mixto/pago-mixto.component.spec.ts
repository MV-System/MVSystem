import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { PagoMixtoComponent } from './pago-mixto.component';

describe('PagoMixtoComponent', () => {
  let component: PagoMixtoComponent;
  let fixture: ComponentFixture<PagoMixtoComponent>;

  const tiposPagoMock = [
    { iD_Tipo_Pagos: 1, descripcion_Tipo_Pagos: 'Efectivo' },
    { iD_Tipo_Pagos: 2, descripcion_Tipo_Pagos: 'Tarjeta' },
    { iD_Tipo_Pagos: 3, descripcion_Tipo_Pagos: 'Transferencia' },
    { iD_Tipo_Pagos: 4, descripcion_Tipo_Pagos: 'Cheque' },
    { iD_Tipo_Pagos: 5, descripcion_Tipo_Pagos: 'Crédito' },
    { iD_Tipo_Pagos: 6, descripcion_Tipo_Pagos: 'Mixto' }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [PagoMixtoComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PagoMixtoComponent);
    component = fixture.componentInstance;
    component.tiposPago = tiposPagoMock;
    component.totalFactura = 1000;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Validación de tipos de pago duplicados - getTiposPagoDisponibles', () => {

    beforeEach(() => {
      component.tipoPagoSeleccionado = 6;
      component.ngOnChanges({
        tiposPago: { currentValue: tiposPagoMock, previousValue: [], firstChange: true, isFirstChange: () => true },
        tipoPagoSeleccionado: { currentValue: 6, previousValue: 0, firstChange: false, isFirstChange: () => false }
      });
    });

    it('debe retornar todos los tipos disponibles cuando no hay selección en otras filas', () => {
      const disponibles = component.getTiposPagoDisponibles(0);
      // Debe excluir Mixto (6) y Crédito (5) pero incluir el resto
      expect(disponibles.length).toBe(4);
      expect(disponibles.find((t: any) => t.iD_Tipo_Pagos === 6)).toBeUndefined();
      expect(disponibles.find((t: any) => t.iD_Tipo_Pagos === 5)).toBeUndefined();
    });

    it('debe excluir el tipo seleccionado en la otra fila', () => {
      // Seleccionar Efectivo en la fila 0
      component.detallesPagos.at(0).get('ID_Tipo_Pago')!.setValue(1);

      // La fila 1 no debe mostrar Efectivo
      const disponiblesFila1 = component.getTiposPagoDisponibles(1);
      expect(disponiblesFila1.find((t: any) => t.iD_Tipo_Pagos === 1)).toBeUndefined();
    });

    it('debe permitir el tipo actual en su propia fila', () => {
      // Seleccionar Efectivo en fila 0
      component.detallesPagos.at(0).get('ID_Tipo_Pago')!.setValue(1);

      // La fila 0 sí debe mostrar Efectivo (es su propia selección)
      const disponiblesFila0 = component.getTiposPagoDisponibles(0);
      expect(disponiblesFila0.find((t: any) => t.iD_Tipo_Pagos === 1)).toBeDefined();
    });

    it('debe excluir múltiples tipos seleccionados en otras filas', () => {
      // Agregar una tercera fila
      component.agregarFilaPago();
      expect(component.detallesPagos.length).toBe(3);

      // Seleccionar Efectivo en fila 0 y Tarjeta en fila 1
      component.detallesPagos.at(0).get('ID_Tipo_Pago')!.setValue(1);
      component.detallesPagos.at(1).get('ID_Tipo_Pago')!.setValue(2);

      // Fila 2 no debe mostrar ni Efectivo ni Tarjeta
      const disponiblesFila2 = component.getTiposPagoDisponibles(2);
      expect(disponiblesFila2.find((t: any) => t.iD_Tipo_Pagos === 1)).toBeUndefined();
      expect(disponiblesFila2.find((t: any) => t.iD_Tipo_Pagos === 2)).toBeUndefined();
      // Pero sí Transferencia y Cheque
      expect(disponiblesFila2.find((t: any) => t.iD_Tipo_Pagos === 3)).toBeDefined();
      expect(disponiblesFila2.find((t: any) => t.iD_Tipo_Pagos === 4)).toBeDefined();
    });

    it('debe ignorar filas sin selección (valor null o 0)', () => {
      // Fila 0 sin seleccionar (null), Fila 1 sin seleccionar (null)
      const disponibles = component.getTiposPagoDisponibles(0);
      // No debe filtrar nada porque no hay selecciones válidas
      expect(disponibles.length).toBe(4); // todos excepto Mixto y Crédito
    });

    it('no debe permitir seleccionar más de 10 filas', () => {
      // Ya tiene 2 filas. Agregar hasta 10
      for (let i = 0; i < 8; i++) {
        component.agregarFilaPago();
      }
      expect(component.detallesPagos.length).toBe(10);

      // Intentar agregar una más
      component.agregarFilaPago();
      expect(component.detallesPagos.length).toBe(10);
    });
  });
});
