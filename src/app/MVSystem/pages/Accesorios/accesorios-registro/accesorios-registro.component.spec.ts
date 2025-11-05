import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AccesoriosRegistroComponent } from './accesorios-registro.component';
import { CatalogosService } from '../../../../core/services/catalogos.service';
import { MantenimientoService } from 'src/app/core/services/mantenimiento.service';
import { UserTrackingService } from 'src/app/core/services/user-tracking.service';
import { ToastrService } from 'ngx-toastr';
import { LoginService } from 'src/app/auth/login.service';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('AccesoriosRegistroComponent', () => {
  let component: AccesoriosRegistroComponent;
  let fixture: ComponentFixture<AccesoriosRegistroComponent>;
  let catalogosService: jasmine.SpyObj<CatalogosService>;
  let mantenimientoService: jasmine.SpyObj<MantenimientoService>;
  let toastrService: jasmine.SpyObj<ToastrService>;
  let loginService: jasmine.SpyObj<LoginService>;
  let trackingService: jasmine.SpyObj<UserTrackingService>;

  // Mock data
  const mockMarcas = [
    { iD_Marca: 1, descripcion: 'Samsung' },
    { iD_Marca: 2, descripcion: 'Apple' }
  ];

  const mockModelos = [
    { iD_Modelo: 1, descripcion: 'Galaxy S21', id_Marca: 1 },
    { iD_Modelo: 2, descripcion: 'Galaxy S22', id_Marca: 1 }
  ];

  const mockAlmacenes = [
    { iD_Almacen: 1, descripcion: 'Almacén Principal' },
    { iD_Almacen: 2, descripcion: 'Almacén Secundario' }
  ];

  const mockAccesorioRegistrado = {
    id_Accesorio: 1,
    descripcion_Accesorio: 'Funda de silicona',
    cantidad: 10,
    precio_Detalle: 500,
    precio_Por_Mayor: 350
  };

  beforeEach(async () => {
    // Create spies
    const catalogosServiceSpy = jasmine.createSpyObj('CatalogosService', [
      'getMarcasLista',
      'getModeloByMarcaLista',
      'getAlmaceLista'
    ]);
    const mantenimientoServiceSpy = jasmine.createSpyObj('MantenimientoService', ['postAccesorio']);
    const toastrServiceSpy = jasmine.createSpyObj('ToastrService', ['success', 'error', 'warning', 'info']);
    const loginServiceSpy = jasmine.createSpyObj('LoginService', ['getUserName']);
    const trackingServiceSpy = jasmine.createSpyObj('UserTrackingService', ['trackPageView', 'trackAction', 'trackError']);

    // Setup default return values
    catalogosServiceSpy.getMarcasLista.and.returnValue(of(mockMarcas));
    catalogosServiceSpy.getModeloByMarcaLista.and.returnValue(of(mockModelos));
    catalogosServiceSpy.getAlmaceLista.and.returnValue(of(mockAlmacenes));
    mantenimientoServiceSpy.postAccesorio.and.returnValue(of(mockAccesorioRegistrado));
    loginServiceSpy.getUserName.and.returnValue('testuser');
    trackingServiceSpy.trackPageView.and.returnValue(of({ success: true, message: 'Tracked' }));
    trackingServiceSpy.trackAction.and.returnValue(of({ success: true, message: 'Tracked' }));
    trackingServiceSpy.trackError.and.returnValue(of({ success: true, message: 'Tracked' }));

    await TestBed.configureTestingModule({
      declarations: [AccesoriosRegistroComponent],
      imports: [ReactiveFormsModule, HttpClientTestingModule],
      providers: [
        FormBuilder,
        { provide: CatalogosService, useValue: catalogosServiceSpy },
        { provide: MantenimientoService, useValue: mantenimientoServiceSpy },
        { provide: ToastrService, useValue: toastrServiceSpy },
        { provide: LoginService, useValue: loginServiceSpy },
        { provide: UserTrackingService, useValue: trackingServiceSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    catalogosService = TestBed.inject(CatalogosService) as jasmine.SpyObj<CatalogosService>;
    mantenimientoService = TestBed.inject(MantenimientoService) as jasmine.SpyObj<MantenimientoService>;
    toastrService = TestBed.inject(ToastrService) as jasmine.SpyObj<ToastrService>;
    loginService = TestBed.inject(LoginService) as jasmine.SpyObj<LoginService>;
    trackingService = TestBed.inject(UserTrackingService) as jasmine.SpyObj<UserTrackingService>;

    fixture = TestBed.createComponent(AccesoriosRegistroComponent);
    component = fixture.componentInstance;
    // Inicializar el componente manualmente sin renderizar el template
    component.ngOnInit();
  });

  afterEach(() => {
    try {
      fixture.destroy();
    } catch (error) {
      // Ignorar errores de destroy
    }
  });

  // ==================== INICIALIZACIÓN ====================

  describe('Inicialización del componente', () => {
    it('debe crear el componente', () => {
      expect(component).toBeTruthy();
    });

    it('debe inicializar el formulario con todos los campos', () => {
      expect(component.formRegistro).toBeDefined();
      expect(component.formRegistro.get('descripcion')).toBeDefined();
      expect(component.formRegistro.get('cantidad')).toBeDefined();
      expect(component.formRegistro.get('costo')).toBeDefined();
      expect(component.formRegistro.get('alDetalle')).toBeDefined();
      expect(component.formRegistro.get('alPorMayor')).toBeDefined();
      expect(component.formRegistro.get('IMEI')).toBeDefined();
      expect(component.formRegistro.get('cantidadMax')).toBeDefined();
      expect(component.formRegistro.get('cantidadMin')).toBeDefined();
      expect(component.formRegistro.get('marca')).toBeDefined();
      expect(component.formRegistro.get('modelo')).toBeDefined();
      expect(component.formRegistro.get('almacen')).toBeDefined();
    });

    it('debe cargar las marcas al inicializar', () => {
      expect(catalogosService.getMarcasLista).toHaveBeenCalled();
      expect(component.marcaListado).toEqual(mockMarcas);
    });

    it('debe cargar los almacenes al inicializar', () => {
      expect(catalogosService.getAlmaceLista).toHaveBeenCalled();
      expect(component.almacenListado).toEqual(mockAlmacenes);
    });

    it('debe deshabilitar el campo modelo al iniciar', () => {
      expect(component.formRegistro.get('modelo')?.disabled).toBeTruthy();
    });

    it('debe inicializar btnDisabled como true', () => {
      expect(component.btnDisabled).toBeTruthy();
    });
  });

  // ==================== VALIDACIONES DE CAMPOS REQUERIDOS ====================

  describe('Validaciones de campos requeridos', () => {
    it('descripcion debe ser requerido', () => {
      const descripcion = component.formRegistro.get('descripcion');
      descripcion?.setValue('');
      expect(descripcion?.hasError('required')).toBeTruthy();
    });

    it('descripcion debe tener mínimo 3 caracteres', () => {
      const descripcion = component.formRegistro.get('descripcion');
      descripcion?.setValue('ab');
      expect(descripcion?.hasError('minlength')).toBeTruthy();

      descripcion?.setValue('abc');
      expect(descripcion?.hasError('minlength')).toBeFalsy();
    });

    it('cantidad debe ser requerida', () => {
      const cantidad = component.formRegistro.get('cantidad');
      cantidad?.setValue('');
      expect(cantidad?.hasError('required')).toBeTruthy();
    });

    it('costo debe ser requerido', () => {
      const costo = component.formRegistro.get('costo');
      costo?.setValue('');
      expect(costo?.hasError('required')).toBeTruthy();
    });

    it('alDetalle debe ser requerido', () => {
      const alDetalle = component.formRegistro.get('alDetalle');
      alDetalle?.setValue('');
      expect(alDetalle?.hasError('required')).toBeTruthy();
    });

    it('alPorMayor debe ser requerido', () => {
      const alPorMayor = component.formRegistro.get('alPorMayor');
      alPorMayor?.setValue('');
      expect(alPorMayor?.hasError('required')).toBeTruthy();
    });

    it('marca debe ser requerida', () => {
      const marca = component.formRegistro.get('marca');
      marca?.setValue('');
      expect(marca?.hasError('required')).toBeTruthy();
    });

    it('modelo debe ser requerido', () => {
      const modelo = component.formRegistro.get('modelo');
      modelo?.setValue('');
      modelo?.enable();
      expect(modelo?.hasError('required')).toBeTruthy();
    });

    it('almacen debe ser requerido', () => {
      const almacen = component.formRegistro.get('almacen');
      almacen?.setValue('');
      expect(almacen?.hasError('required')).toBeTruthy();
    });
  });

  // ==================== VALIDACIONES DE CAMPOS OPCIONALES ====================

  describe('Validaciones de campos opcionales', () => {
    it('IMEI debe ser opcional', () => {
      const imei = component.formRegistro.get('IMEI');
      imei?.setValue('');
      expect(imei?.hasError('required')).toBeFalsy();
    });

    it('IMEI no debe permitir espacios al inicio o final', () => {
      const imei = component.formRegistro.get('IMEI');

      imei?.setValue(' ABC123');
      expect(imei?.hasError('pattern')).toBeTruthy();

      imei?.setValue('ABC123 ');
      expect(imei?.hasError('pattern')).toBeTruthy();

      imei?.setValue('ABC123');
      expect(imei?.hasError('pattern')).toBeFalsy();
    });

    it('IMEI debe tener máximo 30 caracteres', () => {
      const imei = component.formRegistro.get('IMEI');
      const longString = 'A'.repeat(31);

      imei?.setValue(longString);
      expect(imei?.hasError('maxlength')).toBeTruthy();

      imei?.setValue('A'.repeat(30));
      expect(imei?.hasError('maxlength')).toBeFalsy();
    });

    it('cantidadMin debe ser opcional', () => {
      const cantidadMin = component.formRegistro.get('cantidadMin');
      cantidadMin?.setValue('');
      expect(cantidadMin?.hasError('required')).toBeFalsy();
    });

    it('cantidadMax debe ser opcional', () => {
      const cantidadMax = component.formRegistro.get('cantidadMax');
      cantidadMax?.setValue('');
      expect(cantidadMax?.hasError('required')).toBeFalsy();
    });
  });

  // ==================== VALIDADORES PERSONALIZADOS ====================

  describe('Validadores personalizados', () => {
    it('debe validar que cantidadMin no sea mayor que cantidadMax', () => {
      component.formRegistro.patchValue({
        cantidadMin: 10,
        cantidadMax: 5
      });

      expect(component.formRegistro.hasError('cantidadMinMayorQueMax')).toBeTruthy();

      component.formRegistro.patchValue({
        cantidadMin: 5,
        cantidadMax: 10
      });

      expect(component.formRegistro.hasError('cantidadMinMayorQueMax')).toBeFalsy();
    });

    it('debe validar que precio por mayor sea menor que precio al detalle', () => {
      component.formRegistro.patchValue({
        alPorMayor: 200,
        alDetalle: 150
      });

      expect(component.formRegistro.hasError('precioMayorSuperaDetalle')).toBeTruthy();

      component.formRegistro.patchValue({
        alPorMayor: 150,
        alDetalle: 200
      });

      expect(component.formRegistro.hasError('precioMayorSuperaDetalle')).toBeFalsy();
    });

    it('debe validar que precio al detalle no sea menor que el costo', () => {
      component.formRegistro.patchValue({
        costo: 100,
        alDetalle: 80
      });

      expect(component.formRegistro.hasError('precioDetalleMenorQueCosto')).toBeTruthy();

      component.formRegistro.patchValue({
        costo: 100,
        alDetalle: 120
      });

      expect(component.formRegistro.hasError('precioDetalleMenorQueCosto')).toBeFalsy();
    });

    it('debe validar que precio por mayor no sea menor que el costo', () => {
      component.formRegistro.patchValue({
        costo: 100,
        alPorMayor: 80
      });

      expect(component.formRegistro.hasError('precioMayorMenorQueCosto')).toBeTruthy();

      component.formRegistro.patchValue({
        costo: 100,
        alPorMayor: 120
      });

      expect(component.formRegistro.hasError('precioMayorMenorQueCosto')).toBeFalsy();
    });
  });

  // ==================== FUNCIONALIDAD DE MARCA Y MODELO ====================

  describe('Funcionalidad de Marca y Modelo', () => {
    it('debe habilitar el campo modelo cuando se selecciona una marca', () => {
      component.formRegistro.get('marca')?.setValue(1);
      component.selectoresMarcaModeloValidator();

      expect(component.formRegistro.get('modelo')?.enabled).toBeTruthy();
    });

    it('debe cargar los modelos cuando se selecciona una marca', () => {
      component.formRegistro.get('marca')?.setValue(1);
      component.selectoresMarcaModeloValidator();

      expect(catalogosService.getModeloByMarcaLista).toHaveBeenCalledWith(1);
      expect(component.modeloListado).toEqual(mockModelos);
    });

    it('debe deshabilitar el campo modelo cuando se deselecciona la marca', () => {
      component.formRegistro.get('marca')?.setValue(1);
      component.selectoresMarcaModeloValidator();
      expect(component.formRegistro.get('modelo')?.enabled).toBeTruthy();

      component.formRegistro.get('marca')?.setValue('');
      component.selectoresMarcaModeloValidator();
      expect(component.formRegistro.get('modelo')?.disabled).toBeTruthy();
    });

    it('debe limpiar el valor del modelo al cambiar de marca', () => {
      component.formRegistro.get('marca')?.setValue(1);
      component.formRegistro.get('modelo')?.enable();
      component.formRegistro.get('modelo')?.setValue(1);

      component.formRegistro.get('marca')?.setValue(2);
      component.selectoresMarcaModeloValidator();

      expect(component.formRegistro.get('modelo')?.value).toBe('');
    });
  });

  // ==================== VALIDACIÓN DE CAMPOS NUMÉRICOS ====================

  describe('Validación de campos numéricos mayores a 0', () => {
    it('msgValidacionesCamposFormNumericos debe retornar true si cantidad es 0', () => {
      component.formRegistro.patchValue({
        cantidad: 0,
        costo: 100,
        alDetalle: 150,
        alPorMayor: 120
      });

      const result = component.msgValidacionesCamposFormNumericos();

      expect(result).toBeTruthy();
      expect(toastrService.error).toHaveBeenCalledWith(
        'Los valores de los campos deben ser mayor a 0',
        '',
        jasmine.any(Object)
      );
    });

    it('msgValidacionesCamposFormNumericos debe retornar true si costo es negativo', () => {
      component.formRegistro.patchValue({
        cantidad: 10,
        costo: -100,
        alDetalle: 150,
        alPorMayor: 120
      });

      const result = component.msgValidacionesCamposFormNumericos();

      expect(result).toBeTruthy();
    });

    it('msgValidacionesCamposFormNumericos debe retornar false si todos los valores son válidos', () => {
      component.formRegistro.patchValue({
        cantidad: 10,
        costo: 100,
        alDetalle: 150,
        alPorMayor: 120
      });

      const result = component.msgValidacionesCamposFormNumericos();

      expect(result).toBeFalsy();
    });

    it('debe validar cantidadMin opcional solo si tiene valor mayor a 0', () => {
      component.formRegistro.patchValue({
        cantidad: 10,
        costo: 100,
        alDetalle: 150,
        alPorMayor: 120,
        cantidadMin: 0
      });

      const result = component.msgValidacionesCamposFormNumericos();

      expect(result).toBeTruthy();
    });

    it('no debe validar cantidadMin si está vacío', () => {
      component.formRegistro.patchValue({
        cantidad: 10,
        costo: 100,
        alDetalle: 150,
        alPorMayor: 120,
        cantidadMin: ''
      });

      const result = component.msgValidacionesCamposFormNumericos();

      expect(result).toBeFalsy();
    });
  });

  // ==================== BOTÓN GUARDAR ====================

  describe('Estado del botón Guardar', () => {
    it('btnDisable debe retornar true cuando el formulario es inválido', () => {
      component.formRegistro.patchValue({
        descripcion: '',
        cantidad: '',
        costo: ''
      });

      const result = component.btnDisable();

      expect(result).toBeTruthy();
      expect(component.btnDisabled).toBeTruthy();
    });

    it('btnDisable debe retornar false cuando el formulario es válido', () => {
      component.formRegistro.patchValue({
        descripcion: 'Funda de silicona',
        cantidad: 10,
        costo: 200,
        alDetalle: 500,
        alPorMayor: 350,
        marca: 1,
        almacen: 1
      });
      component.formRegistro.get('modelo')?.enable();
      component.formRegistro.patchValue({ modelo: 1 });

      const result = component.btnDisable();

      expect(result).toBeFalsy();
      expect(component.btnDisabled).toBeFalsy();
    });
  });

  // ==================== MARCAR CAMPOS COMO TOCADOS ====================

  describe('marcarCamposComoTocados', () => {
    it('debe marcar todos los campos como touched', () => {
      component.marcarCamposComoTocados();

      Object.keys(component.formRegistro.controls).forEach(field => {
        const control = component.formRegistro.get(field);
        expect(control?.touched).toBeTruthy();
      });
    });

    it('debe marcar todos los campos como dirty', () => {
      component.marcarCamposComoTocados();

      Object.keys(component.formRegistro.controls).forEach(field => {
        const control = component.formRegistro.get(field);
        expect(control?.dirty).toBeTruthy();
      });
    });

    it('debe mostrar un toastr informativo', () => {
      component.marcarCamposComoTocados();

      expect(toastrService.info).toHaveBeenCalledWith(
        'Por favor, complete todos los campos obligatorios correctamente',
        'Formulario incompleto',
        jasmine.any(Object)
      );
    });
  });

  // ==================== INTENTAR GUARDAR ====================

  describe('intentarGuardar', () => {
    it('debe llamar marcarCamposComoTocados si el botón está deshabilitado', () => {
      spyOn(component, 'marcarCamposComoTocados');
      component.btnDisabled = true;

      component.intentarGuardar();

      expect(component.marcarCamposComoTocados).toHaveBeenCalled();
    });

    it('debe llamar registroAccesorio si el botón está habilitado', () => {
      spyOn(component, 'registroAccesorio');
      component.btnDisabled = false;

      component.intentarGuardar();

      expect(component.registroAccesorio).toHaveBeenCalled();
    });

    it('no debe llamar registroAccesorio si el botón está deshabilitado', () => {
      spyOn(component, 'registroAccesorio');
      component.btnDisabled = true;

      component.intentarGuardar();

      expect(component.registroAccesorio).not.toHaveBeenCalled();
    });
  });

  // ==================== REGISTRO DE ACCESORIO ====================

  describe('Registro de accesorio', () => {
    beforeEach(() => {
      // Configurar formulario válido
      component.formRegistro.patchValue({
        descripcion: 'Funda de silicona',
        cantidad: 10,
        costo: 200,
        alDetalle: 500,
        alPorMayor: 350,
        IMEI: 'ABC123XYZ',
        marca: 1,
        almacen: 1
      });
      component.formRegistro.get('modelo')?.enable();
      component.formRegistro.patchValue({ modelo: 1 });
    });

    it('debe registrar un accesorio exitosamente', () => {
      component.registroAccesorio();

      expect(mantenimientoService.postAccesorio).toHaveBeenCalled();
      expect(toastrService.success).toHaveBeenCalledWith('Accesorio registrado con exito!');
    });

    it('debe agregar el accesorio a la lista de retorno', () => {
      component.registroAccesorio();

      expect(component.AccesorioValorRetorno.length).toBe(1);
      expect(component.AccesorioValorRetorno[0]).toEqual(mockAccesorioRegistrado);
    });

    it('debe aplicar trim al IMEI al crear el modelo', () => {
      component.formRegistro.patchValue({
        IMEI: '  ABC123  '
      });

      const model = component.modeloRegistroAccesorio();

      expect(model.imei_Equipo).toBe('ABC123');
    });

    it('debe usar valores por defecto para cantidadMin (1) y cantidadMax (2)', () => {
      component.formRegistro.patchValue({
        cantidadMin: '',
        cantidadMax: ''
      });

      const model = component.modeloRegistroAccesorio();

      expect(model.can_Min).toBe(1);
      expect(model.can_Max).toBe(2);
    });

    it('debe usar valores personalizados para cantidadMin y cantidadMax si se proporcionan', () => {
      component.formRegistro.patchValue({
        cantidadMin: 5,
        cantidadMax: 20
      });

      const model = component.modeloRegistroAccesorio();

      expect(model.can_Min).toBe(5);
      expect(model.can_Max).toBe(20);
    });

    it('debe incluir el nombre de usuario del loginService', () => {
      const model = component.modeloRegistroAccesorio();

      expect(model.usuario).toBe('testuser');
      expect(loginService.getUserName).toHaveBeenCalled();
    });

    it('no debe guardar si hay errores de validación personalizados', () => {
      component.formRegistro.patchValue({
        costo: 100,
        alDetalle: 80  // Error: menor que costo
      });

      component.registroAccesorio();

      expect(mantenimientoService.postAccesorio).not.toHaveBeenCalled();
    });

    it('no debe guardar si el formulario es inválido', () => {
      component.formRegistro.patchValue({
        descripcion: ''  // Campo requerido vacío
      });

      component.registroAccesorio();

      expect(mantenimientoService.postAccesorio).not.toHaveBeenCalled();
    });
  });

  // ==================== LIMPIAR FORMULARIO ====================

  describe('Limpiar formulario', () => {
    it('debe resetear todos los campos del formulario', () => {
      component.formRegistro.patchValue({
        descripcion: 'Test',
        cantidad: 10,
        costo: 100,
        marca: 1
      });

      component.limpiarFormulario();

      expect(component.formRegistro.get('descripcion')?.value).toBe('');
      expect(component.formRegistro.get('cantidad')?.value).toBe('');
      expect(component.formRegistro.get('costo')?.value).toBe('');
      expect(component.formRegistro.get('marca')?.value).toBe('');
    });

    it('debe marcar el formulario como pristine', () => {
      component.formRegistro.markAsDirty();

      component.limpiarFormulario();

      expect(component.formRegistro.pristine).toBeTruthy();
    });

    it('debe marcar el formulario como untouched', () => {
      component.formRegistro.markAllAsTouched();

      component.limpiarFormulario();

      expect(component.formRegistro.untouched).toBeTruthy();
    });

    it('debe deshabilitar el campo modelo', () => {
      component.formRegistro.get('modelo')?.enable();

      component.limpiarFormulario();

      expect(component.formRegistro.get('modelo')?.disabled).toBeTruthy();
    });

    it('debe limpiar la lista de modelos', () => {
      component.modeloListado = mockModelos;

      component.limpiarFormulario();

      expect(component.modeloListado.length).toBe(0);
    });

    it('debe mostrar un toastr informativo', () => {
      component.limpiarFormulario();

      expect(toastrService.info).toHaveBeenCalledWith(
        'Formulario limpiado correctamente',
        'Información'
      );
    });

    it('debe resetear almacen a valor vacío', () => {
      component.formRegistro.get('almacen')?.setValue(1);

      component.limpiarFormulario();

      expect(component.formRegistro.get('almacen')?.value).toBe('');
    });
  });

  // ==================== VALIDAR CAMPOS ====================

  describe('validarCampos', () => {
    it('debe retornar true si el campo es inválido y está touched', () => {
      const descripcion = component.formRegistro.get('descripcion');
      descripcion?.setValue('');
      descripcion?.markAsTouched();

      const result = component.validarCampos('descripcion');

      expect(result).toBeTruthy();
    });

    it('debe retornar false si el campo es válido', () => {
      const descripcion = component.formRegistro.get('descripcion');
      descripcion?.setValue('Funda de silicona');
      descripcion?.markAsTouched();

      const result = component.validarCampos('descripcion');

      expect(result).toBeFalsy();
    });

    it('debe retornar false si el campo no está touched', () => {
      const descripcion = component.formRegistro.get('descripcion');
      descripcion?.setValue('');
      descripcion?.markAsUntouched();

      const result = component.validarCampos('descripcion');

      expect(result).toBeFalsy();
    });
  });

  // ==================== MODELO DE ACCESORIO ====================

  describe('modeloRegistroAccesorio', () => {
    beforeEach(() => {
      component.formRegistro.patchValue({
        descripcion: 'Funda de silicona',
        cantidad: 10,
        costo: 200,
        alDetalle: 500,
        alPorMayor: 350,
        IMEI: 'ABC123',
        cantidadMin: 5,
        cantidadMax: 20,
        marca: 1,
        modelo: 1,
        almacen: 1
      });
      component.formRegistro.get('modelo')?.enable();
    });

    it('debe crear el modelo con todos los campos correctos', () => {
      const model = component.modeloRegistroAccesorio();

      expect(model.descripcion_Accesorio).toBe('Funda de silicona');
      expect(model.cantidad).toBe(10);
      expect(model.costo_Equipo).toBe(200);
      expect(model.precio_Detalle).toBe(500);
      expect(model.precio_Por_Mayor).toBe(350);
      expect(model.imei_Equipo).toBe('ABC123');
      expect(model.can_Min).toBe(5);
      expect(model.can_Max).toBe(20);
      expect(model.id_Modelo).toBe(1);
      expect(model.id_Almacen).toBe(1);
      expect(model.usuario).toBe('testuser');
      expect(model.disponible).toBe('S');
    });

    it('debe manejar IMEI vacío correctamente', () => {
      component.formRegistro.patchValue({ IMEI: '' });

      const model = component.modeloRegistroAccesorio();

      expect(model.imei_Equipo).toBe('');
    });

    it('debe convertir valores numéricos correctamente', () => {
      component.formRegistro.patchValue({
        cantidad: '15',
        costo: '250.50',
        alDetalle: '600.75',
        alPorMayor: '400.25'
      });

      const model = component.modeloRegistroAccesorio();

      expect(model.cantidad).toBe(15);
      expect(model.costo_Equipo).toBe(250.50);
      expect(model.precio_Detalle).toBe(600.75);
      expect(model.precio_Por_Mayor).toBe(400.25);
    });
  });

  // ==================== MANEJO DE ERRORES ====================

  describe('Manejo de errores en servicios', () => {
    it('debe manejar error al registrar accesorio', () => {
      const errorSpy = mantenimientoService.postAccesorio.and.returnValue(throwError(() => new Error('Error al registrar')));

      component.formRegistro.patchValue({
        descripcion: 'Funda de silicona',
        cantidad: 10,
        costo: 200,
        alDetalle: 500,
        alPorMayor: 350,
        marca: 1,
        almacen: 1
      });
      component.formRegistro.get('modelo')?.enable();
      component.formRegistro.patchValue({ modelo: 1 });

      component.registroAccesorio();

      expect(mantenimientoService.postAccesorio).toHaveBeenCalled();
      expect(component.AccesorioValorRetorno.length).toBe(0);

      // Restaurar el comportamiento original
      mantenimientoService.postAccesorio.and.returnValue(of(mockAccesorioRegistrado));
    });    it('debe validar que los servicios de catálogos estén disponibles', () => {
      expect(catalogosService).toBeDefined();
      expect(mantenimientoService).toBeDefined();
    });

    it('debe manejar modelos vacíos cuando no hay marca seleccionada', () => {
      component.formRegistro.get('marca')?.setValue('');
      component.selectoresMarcaModeloValidator();

      expect(component.modeloListado).toEqual([]);
    });
  });

  // ==================== INTEGRACIÓN ====================

  describe('Pruebas de integración', () => {
    it('flujo completo: seleccionar marca, modelo y guardar accesorio', () => {
      // Seleccionar marca
      component.formRegistro.patchValue({ marca: 1 });
      component.selectoresMarcaModeloValidator();
      expect(component.formRegistro.get('modelo')?.enabled).toBeTruthy();

      // Completar formulario
      component.formRegistro.patchValue({
        descripcion: 'Funda de silicona',
        cantidad: 10,
        costo: 200,
        alDetalle: 500,
        alPorMayor: 350,
        modelo: 1,
        almacen: 1
      });

      // Guardar
      component.registroAccesorio();

      expect(mantenimientoService.postAccesorio).toHaveBeenCalled();
      expect(component.AccesorioValorRetorno.length).toBe(1);
      expect(toastrService.success).toHaveBeenCalled();
    });

    it('flujo completo: intentar guardar con errores, corregir y guardar', () => {
      // Formulario con errores
      component.formRegistro.patchValue({
        descripcion: 'ab',  // Menos de 3 caracteres
        cantidad: 0,  // Debe ser mayor a 0
        costo: 100,
        alDetalle: 80,  // Menor que costo
        alPorMayor: 120
      });

      component.btnDisabled = true;
      component.intentarGuardar();

      // Debe marcar campos como touched
      expect(component.formRegistro.get('descripcion')?.touched).toBeTruthy();
      expect(toastrService.info).toHaveBeenCalled();
      expect(mantenimientoService.postAccesorio).not.toHaveBeenCalled();

      // Corregir errores
      component.formRegistro.patchValue({
        descripcion: 'Funda de silicona',
        cantidad: 10,
        alDetalle: 500,
        marca: 1,
        almacen: 1
      });
      component.formRegistro.get('modelo')?.enable();
      component.formRegistro.patchValue({ modelo: 1 });

      component.btnDisabled = false;
      component.intentarGuardar();

      expect(mantenimientoService.postAccesorio).toHaveBeenCalled();
    });
  });
});
