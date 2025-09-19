/**
 * ========================================
 * PATRONES DE BUENAS PRÁCTICAS - ANGULAR
 * ========================================
 * 
 * Este archivo define los patrones de código que aplicaremos
 * consistentemente en todo el proyecto para mantener calidad,
 * mantenibilidad y robustez.
 */

// ==========================================
// 1. ERROR HANDLING PATTERN
// ==========================================

export interface ErrorHandlingPattern {
  /**
   * Manejo centralizado de errores con logging y user feedback
   */
  handleError(error: any, context: string, userMessage?: string): void;
  
  /**
   * Validación de prerequisites antes de ejecutar operaciones
   */
  validatePrerequisites(): boolean;
  
  /**
   * Recuperación graceful de errores
   */
  recoverFromError(error: any): void;
}

export class ErrorHandler implements ErrorHandlingPattern {
  constructor(
    private toastr?: any,
    private logger?: any
  ) {}

  handleError(error: any, context: string, userMessage: string = 'Ha ocurrido un error'): void {
    // Log técnico para debugging
    console.error(`[${context}] Error:`, error);
    
    // Log estructurado si hay logger disponible
    if (this.logger) {
      this.logger.error(context, error);
    }
    
    // Feedback al usuario
    if (this.toastr) {
      this.toastr.error(userMessage);
    }
  }

  validatePrerequisites(): boolean {
    // Implementar validaciones específicas
    return true;
  }

  recoverFromError(error: any): void {
    // Implementar lógica de recuperación
    console.log('Attempting error recovery...');
  }
}

// ==========================================
// 2. LOADING STATE PATTERN
// ==========================================

export interface LoadingStatePattern {
  isLoading: boolean;
  loadingMessage: string;
  
  startLoading(message?: string): void;
  stopLoading(): void;
  setLoadingMessage(message: string): void;
}

export class LoadingStateManager implements LoadingStatePattern {
  isLoading: boolean = false;
  loadingMessage: string = 'Cargando...';

  startLoading(message: string = 'Cargando...'): void {
    this.isLoading = true;
    this.loadingMessage = message;
  }

  stopLoading(): void {
    this.isLoading = false;
    this.loadingMessage = '';
  }

  setLoadingMessage(message: string): void {
    this.loadingMessage = message;
  }
}

// ==========================================
// 3. VALIDATION PATTERN
// ==========================================

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ValidationPattern {
  validate(data: any): ValidationResult;
  validateRequired(value: any, fieldName: string): boolean;
  validateType(value: any, expectedType: string): boolean;
  validateRange(value: number, min: number, max: number): boolean;
}

export class Validator implements ValidationPattern {
  validate(data: any): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    // Implementar validaciones específicas
    return result;
  }

  validateRequired(value: any, fieldName: string): boolean {
    if (value === null || value === undefined || value === '') {
      return false;
    }
    return true;
  }

  validateType(value: any, expectedType: string): boolean {
    return typeof value === expectedType;
  }

  validateRange(value: number, min: number, max: number): boolean {
    return value >= min && value <= max;
  }
}

// ==========================================
// 4. SUBSCRIPTION MANAGEMENT PATTERN
// ==========================================

import { Subscription } from 'rxjs';

export interface SubscriptionPattern {
  subscriptions: Subscription[];
  
  addSubscription(subscription: Subscription): void;
  unsubscribeAll(): void;
  cleanupSubscriptions(): void;
}

export class SubscriptionManager implements SubscriptionPattern {
  subscriptions: Subscription[] = [];

  addSubscription(subscription: Subscription): void {
    this.subscriptions.push(subscription);
  }

  unsubscribeAll(): void {
    this.subscriptions.forEach(sub => {
      if (sub && !sub.closed) {
        sub.unsubscribe();
      }
    });
  }

  cleanupSubscriptions(): void {
    this.unsubscribeAll();
    this.subscriptions = [];
  }
}

// ==========================================
// 5. API OPERATION PATTERN
// ==========================================

import { Observable, of, throwError } from 'rxjs';
import { catchError, retry, finalize } from 'rxjs/operators';

export interface ApiOperationPattern<T> {
  execute(): Observable<T>;
  handleSuccess(data: T): void;
  handleError(error: any): void;
  handleFinally(): void;
}

export class ApiOperation<T> implements ApiOperationPattern<T> {
  constructor(
    private operation: () => Observable<T>,
    private loadingManager: LoadingStateManager,
    private errorHandler: ErrorHandler,
    private context: string
  ) {}

  execute(): Observable<T> {
    this.loadingManager.startLoading(`Ejecutando ${this.context}...`);
    
    return this.operation().pipe(
      retry(2), // Reintentar hasta 2 veces
      catchError(error => {
        this.handleError(error);
        return throwError(error);
      }),
      finalize(() => {
        this.handleFinally();
      })
    );
  }

  handleSuccess(data: T): void {
    console.log(`[${this.context}] Operación exitosa:`, data);
  }

  handleError(error: any): void {
    this.errorHandler.handleError(error, this.context);
  }

  handleFinally(): void {
    this.loadingManager.stopLoading();
  }
}

// ==========================================
// 6. PERFORMANCE PATTERN
// ==========================================

export interface PerformancePattern {
  memoize<T>(fn: Function, keyGenerator?: Function): T;
  debounce(fn: Function, delay: number): Function;
  throttle(fn: Function, delay: number): Function;
}

export class PerformanceOptimizer implements PerformancePattern {
  private memoCache = new Map();

  memoize<T>(fn: Function, keyGenerator?: Function): T {
    return ((...args: any[]) => {
      const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
      
      if (this.memoCache.has(key)) {
        return this.memoCache.get(key);
      }
      
      const result = fn(...args);
      this.memoCache.set(key, result);
      return result;
    }) as any;
  }

  debounce(fn: Function, delay: number): Function {
    let timeoutId: any;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn(...args), delay);
    };
  }

  throttle(fn: Function, delay: number): Function {
    let lastCall = 0;
    return (...args: any[]) => {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        fn(...args);
      }
    };
  }
}

// ==========================================
// 7. TESTING PATTERN (AAA Pattern)
// ==========================================

export interface TestingPattern {
  arrange(): void;    // Preparar el escenario
  act(): any;         // Ejecutar la acción
  assert(result: any): void;  // Verificar el resultado
}

export class TestCase implements TestingPattern {
  protected testData: any;
  protected expectedResult: any;
  protected actualResult: any;

  arrange(): void {
    // Preparar datos de prueba, mocks, etc.
    console.log('Arranging test scenario...');
  }

  act(): any {
    // Ejecutar la función/método a probar
    console.log('Acting - executing test action...');
    return null;
  }

  assert(result: any): void {
    // Verificar que el resultado sea el esperado
    console.log('Asserting test result...');
  }
}

// ==========================================
// 8. COMPONENT LIFECYCLE PATTERN
// ==========================================

export interface ComponentLifecyclePattern {
  initializeComponent(): void;
  setupSubscriptions(): void;
  loadInitialData(): void;
  cleanupComponent(): void;
}

export class ComponentLifecycleManager implements ComponentLifecyclePattern {
  constructor(
    private subscriptionManager: SubscriptionManager,
    private loadingManager: LoadingStateManager,
    private errorHandler: ErrorHandler
  ) {}

  initializeComponent(): void {
    console.log('Initializing component...');
    this.loadInitialData();
    this.setupSubscriptions();
  }

  setupSubscriptions(): void {
    console.log('Setting up subscriptions...');
  }

  loadInitialData(): void {
    console.log('Loading initial data...');
  }

  cleanupComponent(): void {
    console.log('Cleaning up component...');
    this.subscriptionManager.cleanupSubscriptions();
    this.loadingManager.stopLoading();
  }
}

// ==========================================
// 9. USER FEEDBACK PATTERN
// ==========================================

export interface UserFeedbackPattern {
  showSuccess(message: string): void;
  showError(message: string): void;
  showWarning(message: string): void;
  showInfo(message: string): void;
  showLoading(message: string): void;
  hideLoading(): void;
}

export class UserFeedbackManager implements UserFeedbackPattern {
  constructor(private toastr?: any) {}

  showSuccess(message: string): void {
    console.log(`✅ Success: ${message}`);
    if (this.toastr) {
      this.toastr.success(message);
    }
  }

  showError(message: string): void {
    console.error(`❌ Error: ${message}`);
    if (this.toastr) {
      this.toastr.error(message);
    }
  }

  showWarning(message: string): void {
    console.warn(`⚠️ Warning: ${message}`);
    if (this.toastr) {
      this.toastr.warning(message);
    }
  }

  showInfo(message: string): void {
    console.info(`ℹ️ Info: ${message}`);
    if (this.toastr) {
      this.toastr.info(message);
    }
  }

  showLoading(message: string): void {
    console.log(`⏳ Loading: ${message}`);
  }

  hideLoading(): void {
    console.log('✅ Loading complete');
  }
}

// ==========================================
// 10. PATTERN FACTORY
// ==========================================

export class PatternFactory {
  static createErrorHandler(toastr?: any, logger?: any): ErrorHandler {
    return new ErrorHandler(toastr, logger);
  }

  static createLoadingManager(): LoadingStateManager {
    return new LoadingStateManager();
  }

  static createValidator(): Validator {
    return new Validator();
  }

  static createSubscriptionManager(): SubscriptionManager {
    return new SubscriptionManager();
  }

  static createPerformanceOptimizer(): PerformanceOptimizer {
    return new PerformanceOptimizer();
  }

  static createUserFeedbackManager(toastr?: any): UserFeedbackManager {
    return new UserFeedbackManager(toastr);
  }

  static createComponentLifecycleManager(
    subscriptionManager: SubscriptionManager,
    loadingManager: LoadingStateManager,
    errorHandler: ErrorHandler
  ): ComponentLifecycleManager {
    return new ComponentLifecycleManager(subscriptionManager, loadingManager, errorHandler);
  }
}