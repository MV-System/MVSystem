import { Component, HostListener, Input, OnInit, Output, ElementRef, ViewChild } from '@angular/core';
import { AccesoriosService } from 'src/app/MVSystem/services/accesorios.service';
import { Accesorio } from '../../../../interfaces/accesorio.interface';
import * as $ from 'jquery';
@Component({
  selector: 'app-accesorio-list',
  templateUrl: './accesorio-list.component.html',
  styleUrls: ['./accesorio-list.component.css']
})
export class AccesorioListComponent implements OnInit {

  constructor(private eRef:ElementRef,
    private accesoriosService:AccesoriosService) { }

  ngOnInit(): void {
  }
  
  @Input() accesorios: Accesorio[]=[];
  @Input() pageSize!:    number;
  @Input() pageIndex!:   number;
  @Input() totalRecord!: number;
  @Input() currentPage:  number=1;
  @ViewChild('table') table!: ElementRef;
  // accesorio= new EventEmitter<Accesorio>();
  accesorio!: Accesorio;
  onEditButton: boolean = true;

  // @Output() id= new EventEmitter<number>();
  isOpenModal = false;
  title ="Editar accesorio"
  filter: any = {
    almacen: '',
    criterio:'',
    pageIndex: 1,
    pageSize: 10,
  };

  // changeTable(id: number){
  //   this.id.emit(id)
  // }
  putAccesorio(){
    this.isOpenModal=!this.isOpenModal;
  
  }
  getIdAccesorio(id:number){
    this.onSelectAccesorio();
    if(id > 0){this.onEditButton =false;}
    
    this.accesoriosService.getAccesorioById(id)
    .subscribe(accesorio =>{
      this.accesorio = accesorio;
    });
  }
  onCancel() {
    this.isOpenModal = !this.isOpenModal;
    
  }
  onSelectAccesorio(){

 
    $('#table tbody').on('click', 'tr', (e)=> {
      
        if ($(e.currentTarget).hasClass('selected')) {
            $(e.currentTarget).removeClass('selected');
            $(e.currentTarget).addClass('selected');

        } else {
          var tr = document.querySelector('tr.selected');
            $('tr.selected').removeClass('selected');
            $(e.currentTarget).addClass('selected');
        }
    });

  }
  // @HostListener('document:click', ['$event']) toggleOpen(event: Event) {
  //   let table = document.querySelector('table');
  //   console.log(table);

    
  // }
}
  
