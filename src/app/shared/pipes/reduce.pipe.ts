import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe personalizado para reducir un array a un valor único
 * Similar a Array.reduce() pero para usar en templates de Angular
 * 
 * @example
 * {{ items | reduce: (acc, item) => acc + item.valor : 0 }}
 */
@Pipe({
  name: 'reduce'
})
export class ReducePipe implements PipeTransform {
  transform(array: any[], callback: (accumulator: any, currentValue: any, index?: number, array?: any[]) => any, initialValue: any = 0): any {
    if (!array || !Array.isArray(array)) {
      return initialValue;
    }

    if (typeof callback !== 'function') {
      console.warn('ReducePipe: callback debe ser una función');
      return initialValue;
    }

    try {
      return array.reduce(callback, initialValue);
    } catch (error) {
      console.error('Error en ReducePipe:', error);
      return initialValue;
    }
  }
}
