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
});
