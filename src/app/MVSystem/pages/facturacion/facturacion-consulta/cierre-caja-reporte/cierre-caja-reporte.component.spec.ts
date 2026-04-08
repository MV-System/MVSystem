import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CierreCajaReporteComponent } from './cierre-caja-reporte.component';
import { MantenimientoService } from 'src/app/core/services/mantenimiento.service';
import { ToastrService } from 'ngx-toastr';
import { of } from 'rxjs';

describe('CierreCajaReporteComponent', () => {
  let component: CierreCajaReporteComponent;
  let fixture: ComponentFixture<CierreCajaReporteComponent>;
  let mockMantenimientoService: jasmine.SpyObj<MantenimientoService>;
  let mockToastrService: jasmine.SpyObj<ToastrService>;

  beforeEach(async () => {
    mockMantenimientoService = jasmine.createSpyObj('MantenimientoService', ['getCierreCajaReport']);
    mockToastrService = jasmine.createSpyObj('ToastrService', ['warning', 'error', 'info']);

    await TestBed.configureTestingModule({
      declarations: [CierreCajaReporteComponent],
      providers: [
        { provide: MantenimientoService, useValue: mockMantenimientoService },
        { provide: ToastrService, useValue: mockToastrService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CierreCajaReporteComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('esCredito - maneja string y objeto', () => {

    it('debe retornar true para string "Crédito"', () => {
      expect(component.esCredito('Crédito')).toBeTrue();
    });

    it('debe retornar true para string "credito" sin tilde', () => {
      expect(component.esCredito('credito')).toBeTrue();
    });

    it('debe retornar true para string "CRÉDITO" en mayúsculas', () => {
      expect(component.esCredito('CRÉDITO')).toBeTrue();
    });

    it('debe retornar false para string "Efectivo"', () => {
      expect(component.esCredito('Efectivo')).toBeFalse();
    });

    it('debe retornar true para objeto con tipoPago "Crédito"', () => {
      expect(component.esCredito({ tipoPago: 'Crédito', monto: 500 })).toBeTrue();
    });

    it('debe retornar false para objeto con tipoPago "Tarjeta"', () => {
      expect(component.esCredito({ tipoPago: 'Tarjeta', monto: 500 })).toBeFalse();
    });

    it('debe retornar false para null', () => {
      expect(component.esCredito(null)).toBeFalse();
    });

    it('debe retornar false para undefined', () => {
      expect(component.esCredito(undefined)).toBeFalse();
    });
  });
});
