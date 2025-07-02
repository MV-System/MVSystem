import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AccesoriosService } from 'src/app/core/services/accesorios.service';
import { Accesorio } from '../../../../../core/interfaces/accesorio.interface';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-accesorio-list',
  templateUrl: './accesorio-list.component.html',
  styleUrls: ['./accesorio-list.component.css']
})
export class AccesorioListComponent implements OnInit {

  constructor(
    private accesoriosService: AccesoriosService,
    private router: Router,
    private toastr: ToastrService
  ) { }

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

  /**
   * Navigate to accessory registration page
   */
  navigateToRegistro() {
    this.router.navigate(['/mvSystem/home/accesorios/registro']).then(
      (success) => {
        if (success) {
          this.toastr.success('Navegando al formulario de registro', 'Éxito');
        } else {
          this.toastr.error('No se pudo navegar a la página de registro', 'Error');
        }
      }
    );
  }

  /**
   * Edit accessory
   */
  editarAccesorio(accesorioId: number) {
    console.log('Editando accesorio:', accesorioId);
    this.getIdAccesorio(accesorioId);
    this.putAccesorio();
  }

  /**
   * View accessory details
   */
  verDetalle(accesorioId: number) {
    console.log('Viendo detalle del accesorio:', accesorioId);
    this.toastr.info('Funcionalidad de detalle en desarrollo', 'Información');
  }

  /**
   * Detect if the current screen is mobile
   */
  isMobileScreen(): boolean {
    return window.innerWidth <= 768;
  }

}

