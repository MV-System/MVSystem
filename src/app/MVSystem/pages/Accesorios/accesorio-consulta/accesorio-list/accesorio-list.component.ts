import { Component, HostListener, Input, OnInit, Output, ElementRef } from '@angular/core';
import { AccesoriosService } from 'src/app/MVSystem/services/accesorios.service';
import { Accesorio, AccesorioAll } from '../../../../interfaces/accesorio.interface';
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
  
  @Input() accesorios: AccesorioAll[]=[];
  @Input() pageSize!:    number;
  @Input() pageIndex!:   number;
  @Input() totalRecord!: number;
  @Input() currentPage:  number=1;
  // accesorio= new EventEmitter<Accesorio>();
  accesorio!: Accesorio;

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
    console.log(id);
    this.accesoriosService.getAccesorioById(id)
    .subscribe(accesorio =>{
      console.log(accesorio);
      this.accesorio = accesorio;
    });
  }
  onCancel() {
    this.isOpenModal = !this.isOpenModal;
    
  }


}
  
