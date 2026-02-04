import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe personalizado para filtrar arrays en templates de Angular
 * Similar a Array.filter() pero para usar directamente en templates
 *
 * @example
 * {{ items | filter: (item) => item.estado === 'activo' }}
 * {{ detalles | filter: esCredito as creditoItems }}
 */
@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {
  transform(array: any[], callback: (item: any, index?: number, array?: any[]) => boolean): any[] {
    if (!array || !Array.isArray(array)) {
      return [];
    }

    if (typeof callback !== 'function') {
      console.warn('FilterPipe: callback debe ser una función');
      return array;
    }

    try {
      return array.filter(callback);
    } catch (error) {
      console.error('Error en FilterPipe:', error);
      return array;
    }
  }
}
