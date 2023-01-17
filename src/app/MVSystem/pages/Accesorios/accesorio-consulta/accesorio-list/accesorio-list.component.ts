import { Component, Input, OnInit } from '@angular/core';
import { AccesoriosService } from 'src/app/core/services/accesorios.service';
import { Accesorio } from '../../../../../core/interfaces/accesorio.interface';
@Component({
  selector: 'app-accesorio-list',
  templateUrl: './accesorio-list.component.html',
  styleUrls: ['./accesorio-list.component.css']
})
export class AccesorioListComponent implements OnInit {

  constructor(private accesoriosService:AccesoriosService) { }

  ngOnInit(): void {
  }
  
  @Input() accesorios: Accesorio[]=[];
  @Input() pageSize!:    number;
  @Input() pageIndex!:   number;
  @Input() totalRecord!: number;
  @Input() currentPage:  number=1;
  @Input() line!:  number;
  @Input() lastLine!:  number;
  accesorio!: Accesorio;
  onEditButton: boolean = true;

  isOpenModal = false;
  title ="Editar accesorio"
  filter: any = {
    almacen: '',
    criterio:'',
    pageIndex: 1,
    pageSize: 10,
  };

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
    $('table tbody').on('click', 'tr', (e)=> {
      
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

}
  
