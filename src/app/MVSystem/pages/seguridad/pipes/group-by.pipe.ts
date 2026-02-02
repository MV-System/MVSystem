import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'groupBy'
})
export class GroupByPipe implements PipeTransform {
  transform(collection: any[], property: string): any[] {
    if (!collection) {
      return collection;
    }

    const groupedCollection = collection.reduce((previous, current) => {
      const key = current[property];
      if (!previous[key]) {
        previous[key] = [];
      }
      previous[key].push(current);
      return previous;
    }, {});

    return Object.keys(groupedCollection).map(key => [key, groupedCollection[key]]);
  }
}
