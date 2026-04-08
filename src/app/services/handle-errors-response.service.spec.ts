import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { HandleErrorsResponseService } from './handle-errors-response.service';
import { LoadingService } from '../shared/components/r-loading/loading.service';
import { LoginService } from '../auth/login.service';

describe('HandleErrorsResponseService - Error 400', () => {
  let service: HandleErrorsResponseService;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockLoadingService: jasmine.SpyObj<LoadingService>;
  let mockLoginService: jasmine.SpyObj<LoginService>;

  beforeEach(() => {
    mockToastr = jasmine.createSpyObj('ToastrService', ['error', 'warning', 'info']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockLoadingService = jasmine.createSpyObj('LoadingService', ['hideLoading']);
    mockLoginService = jasmine.createSpyObj('LoginService', ['logout']);

    TestBed.configureTestingModule({
      providers: [
        HandleErrorsResponseService,
        { provide: ToastrService, useValue: mockToastr },
        { provide: Router, useValue: mockRouter },
        { provide: LoadingService, useValue: mockLoadingService },
        { provide: LoginService, useValue: mockLoginService }
      ]
    });

    service = TestBed.inject(HandleErrorsResponseService);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  describe('handleError con status 400', () => {

    it('debe extraer mensaje de error.error.error', (done) => {
      const httpError = new HttpErrorResponse({
        status: 400,
        error: { error: 'La suma de pagos no coincide con el total de la factura' }
      });

      const result = service.handleError(httpError);
      result!.subscribe({
        error: (mensaje: string) => {
          expect(mensaje).toBe('La suma de pagos no coincide con el total de la factura');
          done();
        }
      });
    });

    it('debe extraer mensaje de error.error.message si no hay error.error.error', (done) => {
      const httpError = new HttpErrorResponse({
        status: 400,
        error: { message: 'Pago Mixto requiere al menos 2 métodos de pago' }
      });

      const result = service.handleError(httpError);
      result!.subscribe({
        error: (mensaje: string) => {
          expect(mensaje).toBe('Pago Mixto requiere al menos 2 métodos de pago');
          done();
        }
      });
    });

    it('debe usar mensaje por defecto si no hay error ni message', (done) => {
      const httpError = new HttpErrorResponse({
        status: 400,
        error: {}
      });

      const result = service.handleError(httpError);
      result!.subscribe({
        error: (mensaje: string) => {
          expect(mensaje).toBe('Datos inválidos. Verifique la información enviada.');
          done();
        }
      });
    });

    it('no debe mostrar toastr para error 400 (deja al componente manejarlo)', () => {
      const httpError = new HttpErrorResponse({
        status: 400,
        error: { error: 'Tipo de pago duplicado' }
      });

      service.handleError(httpError);
      expect(mockToastr.error).not.toHaveBeenCalled();
    });

    it('debe ocultar el loading para error 400', () => {
      const httpError = new HttpErrorResponse({
        status: 400,
        error: { error: 'Error de validación' }
      });

      service.handleError(httpError);
      expect(mockLoadingService.hideLoading).toHaveBeenCalled();
    });
  });
});
