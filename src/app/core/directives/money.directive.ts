import { Directive, ElementRef, forwardRef, HostListener, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * Campo de dinero: mientras se escribe muestra el número tal cual (20000) y al salir del campo lo formatea (20,000.00).
 * El valor del formulario siempre es un número (o null si está vacío).
 */
@Directive({
  selector: 'input[appMoney]',
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => MoneyDirective), multi: true }]
})
export class MoneyDirective implements ControlValueAccessor {
  /** Longitud máxima de lo que se digita (enteros + punto + decimales). */
  @Input() maxlen = 12;

  private valor: number | null = null;
  private onChange: (v: number | null) => void = () => { };
  private onTouched: () => void = () => { };

  constructor(private el: ElementRef<HTMLInputElement>) { }

  writeValue(v: any): void {
    const n = v === null || v === undefined || v === '' ? null : Number(v);
    this.valor = n === null || isNaN(n) ? null : n;
    this.mostrarFormateado();
  }

  registerOnChange(fn: (v: number | null) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(disabled: boolean): void { this.el.nativeElement.disabled = disabled; }

  @HostListener('input')
  onInput(): void {
    const el = this.el.nativeElement;
    let t = el.value.replace(/[^0-9.]/g, '');
    const punto = t.indexOf('.');
    if (punto >= 0) {
      t = t.slice(0, punto + 1) + t.slice(punto + 1).replace(/\./g, '').slice(0, 2);
    }
    if (this.maxlen > 0 && t.length > this.maxlen) { t = t.slice(0, this.maxlen); }
    if (t !== el.value) { el.value = t; }
    this.valor = t === '' || t === '.' ? null : Number(t);
    this.onChange(this.valor);
  }

  @HostListener('focus')
  onFocus(): void {
    const el = this.el.nativeElement;
    el.value = this.valor === null ? '' : String(this.valor);
    el.select();
  }

  @HostListener('blur')
  onBlur(): void {
    this.onTouched();
    this.mostrarFormateado();
  }

  private mostrarFormateado(): void {
    this.el.nativeElement.value = this.valor === null
      ? ''
      : this.valor.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}
