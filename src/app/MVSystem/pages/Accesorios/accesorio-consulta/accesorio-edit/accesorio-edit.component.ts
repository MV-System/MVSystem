import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  Output,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Accesorio } from '../../../../../core/interfaces/accesorio.interface';
import { AccesoriosService } from '../../../../../core/services/accesorios.service';
import { ToastrService } from 'ngx-toastr';
import { EventEmitter } from '@angular/core';
import { LoginService } from 'src/app/auth/login.service';

@Component({
  selector: 'app-accesorio-edit',
  templateUrl: './accesorio-edit.component.html',
  styleUrls: ['./accesorio-edit.component.css'],
})
export class AccesorioEditComponent implements OnInit, OnChanges {
  constructor(
    private loginService: LoginService,
    private fb: FormBuilder,
    private accesorioService: AccesoriosService,
    private toastr: ToastrService
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['accesorio'] && changes['accesorio'].currentValue) {
      this.onAccesorio = changes['accesorio'].currentValue;
      this.getAccesorioForEdit();
    }
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  form: FormGroup = this.fb.group({
    id: [''],
    descripcion: [''],
    codigo: [''],
    costoEquipo: [{ value: '', disabled: true }],
    cantidad: ['', [Validators.required, Validators.min(0)]],
    descripcionAccesorio: ['', [Validators.required]],
    estado: ['A', [Validators.required]],
    precioDetalle: ['', [Validators.required, Validators.min(0.01)]],
    precioPorMayor: ['', [Validators.required, Validators.min(0.01)]],
    Usuario: [this.loginService.getUserName()],
  });

  @Input() accesorio!: Accesorio;
  @Output() closeModal = new EventEmitter<void>();
  onAccesorio: any;
  isLoading = false;

  /**
   * Initialize form with validators
   */
  private initializeForm() {
    // Subscribe to price changes for real-time validation
    this.form.get('precioPorMayor')?.valueChanges.subscribe(() => {
      this.validatePrices();
    });

    this.form.get('precioDetalle')?.valueChanges.subscribe(() => {
      this.validatePrices();
    });
  }

  /**
   * Validate price relationship
   */
  private validatePrices() {
    const precioPorMayor = this.form.get('precioPorMayor')?.value;
    const precioDetalle = this.form.get('precioDetalle')?.value;

    if (precioPorMayor && precioDetalle) {
      if (precioPorMayor >= precioDetalle) {
        this.form.get('precioPorMayor')?.setErrors({ priceRelation: true });
      } else {
        // Clear price relation error but keep other errors
        const currentErrors = this.form.get('precioPorMayor')?.errors;
        if (currentErrors) {
          delete currentErrors['priceRelation'];
          const hasOtherErrors = Object.keys(currentErrors).length > 0;
          this.form.get('precioPorMayor')?.setErrors(hasOtherErrors ? currentErrors : null);
        }
      }
    }
  }

  /**
   * Update accessory
   */
  updateAccesorio() {
    if (this.isFormValid()) {
      this.isLoading = true;

      const formData = { ...this.form.value };
      // Asegurar que costoEquipo se incluya aunque esté disabled
      formData.costoEquipo = this.form.get('costoEquipo')?.value;

      this.accesorioService.putAccesorio(formData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.toastr.success('Accesorio actualizado exitosamente', 'Éxito', {
            timeOut: 3000,
            progressBar: true,
            closeButton: true
          });
          this.closeModal.emit();
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error updating accessory:', error);
          this.toastr.error('Error al actualizar el accesorio. Por favor intente nuevamente.', 'Error', {
            timeOut: 5000,
            progressBar: true,
            closeButton: true
          });
        }
      });
    } else {
      this.showValidationErrors();
    }
  }

  /**
   * Validate form including custom price validation
   */
  private isFormValid(): boolean {
    this.form.markAllAsTouched();

    if (!this.form.valid) {
      return false;
    }

    // Check price relationship
    const precioPorMayor = this.form.get('precioPorMayor')?.value;
    const precioDetalle = this.form.get('precioDetalle')?.value;

    if (precioPorMayor && precioDetalle && precioPorMayor >= precioDetalle) {
      this.msgValidacionesCamposFormDetallePorMayor();
      return false;
    }

    return true;
  }

  /**
   * Show validation errors
   */
  private showValidationErrors() {
    const errors = [];

    if (this.form.get('codigo')?.invalid) {
      errors.push('Código es requerido');
    }

    if (this.form.get('descripcionAccesorio')?.invalid) {
      errors.push('Descripción es requerida');
    }

    if (this.form.get('cantidad')?.invalid) {
      errors.push('Cantidad debe ser válida y mayor o igual a 0');
    }

    if (this.form.get('precioDetalle')?.invalid) {
      errors.push('Precio por detalle debe ser mayor a 0');
    }

    if (this.form.get('precioPorMayor')?.invalid) {
      errors.push('Precio por mayor debe ser mayor a 0');
    }

    if (errors.length > 0) {
      this.toastr.error(errors.join('<br>'), 'Errores de validación', {
        timeOut: 5000,
        progressBar: true,
        closeButton: true,
        enableHtml: true
      });
    }
  }

  /**
   * Price validation message
   */
  msgValidacionesCamposFormDetallePorMayor() {
    this.toastr.error(
      'El precio por mayor debe ser menor que el precio por detalle',
      'Error de validación',
      {
        closeButton: true,
        progressBar: true,
        timeOut: 5000
      }
    );
  }

  /**
   * Clear form and reset to default values
   */
  clearForm() {
    const costoEquipo = this.form.get('costoEquipo')?.value;
    const id = this.form.get('id')?.value;

    this.form.reset({
      id: id,
      costoEquipo: costoEquipo,
      estado: 'A',
      Usuario: this.loginService.getUserName()
    });

    this.toastr.info('Formulario limpiado', 'Información', {
      timeOut: 2000,
      progressBar: true
    });
  }

  /**
   * Set values for edit form
   */
  setValuesFormeEdit(
    id: number,
    codigo: string,
    costoEquipo: number,
    cantidad: number,
    descripcionAccesorio: string,
    estado: string,
    precioDetalle: number,
    precioPorMayor: number
  ) {
    this.form.patchValue({
      id: id,
      codigo: codigo,
      costoEquipo: costoEquipo,
      cantidad: cantidad,
      descripcionAccesorio: descripcionAccesorio,
      estado: estado,
      precioDetalle: precioDetalle,
      precioPorMayor: precioPorMayor,
      Usuario: this.loginService.getUserName()
    });
  }

  /**
   * Get accessory data for editing
   */
  getAccesorioForEdit() {
    if (this.onAccesorio) {
      this.setValuesFormeEdit(
        this.onAccesorio.id,
        this.onAccesorio.codigo,
        this.onAccesorio.costoEquipo,
        this.onAccesorio.cantidad,
        this.onAccesorio.descripcionAccesorio,
        this.onAccesorio.estado || 'A',
        this.onAccesorio.precioDetalle,
        this.onAccesorio.precioPorMayor
      );
    }
  }

  /**
   * Check if price relationship is valid
   */
  isPriceRelationValid(): boolean {
    const precioPorMayor = this.form.get('precioPorMayor')?.value;
    const precioDetalle = this.form.get('precioDetalle')?.value;

    if (!precioPorMayor || !precioDetalle) {
      return true; // If either is empty, don't show error
    }

    return precioPorMayor < precioDetalle;
  }

  /**
   * Get field error message
   */
  getFieldError(fieldName: string): string {
    const field = this.form.get(fieldName);

    if (!field?.errors || !field.touched) {
      return '';
    }

    if (field.errors['required']) {
      return `${this.getFieldLabel(fieldName)} es requerido`;
    }

    if (field.errors['min']) {
      return `${this.getFieldLabel(fieldName)} debe ser mayor a ${field.errors['min'].min}`;
    }

    if (field.errors['priceRelation']) {
      return 'Debe ser menor que el precio por detalle';
    }

    return 'Campo inválido';
  }

  /**
   * Get field label for error messages
   */
  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      codigo: 'Código',
      descripcionAccesorio: 'Descripción',
      cantidad: 'Cantidad',
      precioDetalle: 'Precio por detalle',
      precioPorMayor: 'Precio por mayor',
      estado: 'Estado'
    };

    return labels[fieldName] || fieldName;
  }
}
