import { Component, EventEmitter, HostListener, Input, OnInit, Output, ElementRef } from '@angular/core';
import { AccesorioAll } from '../../../../interfaces/accesorio.interface';

@Component({
  selector: 'app-accesorio-list',
  templateUrl: './accesorio-list.component.html',
  styleUrls: ['./accesorio-list.component.css']
})
export class AccesorioListComponent implements OnInit {

  constructor(private eRef:ElementRef) { }

  ngOnInit(): void {
  }
  
  @Input() accesorios: AccesorioAll[]=[];
  @Input() pageSize!:    number;
  @Input() pageIndex!:   number;
  @Input() totalRecord!: number;
  @Input() currentPage:  number=1;
  filter: any = {
    almacen: '',
    criterio:'',
    pageIndex: 1,
    pageSize: 10,
  };
  @HostListener('document:click', ['$event']) selectAccesorio(event: Event) {
    // console.log( this.elRef.nativeElement.contains(event.target) );
    const tr = document.getElementById('put');
    if(this.eRef.nativeElement.contains(event.target)) {
      console.log(event.target);

      
    } 
    console.log(event.target);
  

  }
}
