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
  accesorioDetalle!: Accesorio;
  onEditButton: boolean = true;

  isOpenModal = false;
  isOpenDetalleModal = false;
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
    this.accesoriosService.getAccesorioById(accesorioId)
      .subscribe({
        next: (accesorio) => {
          this.accesorioDetalle = accesorio;
          // Debug: Mostrar todos los datos del accesorio en consola
          console.log('Datos completos del accesorio:', accesorio);
          console.log('Campos específicos:', {
            id: accesorio.id,
            modelo: accesorio.modelo,
            codigo: accesorio.codigo,
            codBarra: accesorio.codBarra,
            almacen: accesorio.almacen,
            disponible: accesorio.disponible,
            disponibleDetalle: accesorio.disponibleDetalle,
            descripcionAccesorio: accesorio.descripcionAccesorio,
            cantidad: accesorio.cantidad,
            costoEquipo: accesorio.costoEquipo,
            precioDetalle: accesorio.precioDetalle,
            precioPorMayor: accesorio.precioPorMayor,
            totalInventario: accesorio.totalInventario,
            totalFacturado: accesorio.totalFacturado,
            totalGanancia: accesorio.totalGanancia,
            totalItbis: accesorio.totalItbis
          });
          this.isOpenDetalleModal = true;
          this.toastr.success('Cargando detalles del accesorio', 'Éxito');
        },
        error: (error) => {
          console.error('Error al cargar detalles:', error);
          this.toastr.error('Error al cargar los detalles del accesorio', 'Error');
        }
      });
  }

  /**
   * Close detail modal
   */
  closeDetalleModal() {
    this.isOpenDetalleModal = false;
    this.accesorioDetalle = {} as Accesorio;
  }

  /**
   * Detect if the current screen is mobile
   */
  isMobileScreen(): boolean {
    return window.innerWidth <= 768;
  }

  /**
   * Helper function to check if a value is valid (not null, undefined, or empty string)
   */
  isValidValue(value: any): boolean {
    return value !== null && value !== undefined && value !== '';
  }

  /**
   * Helper function to check if a numeric value is valid and greater than 0
   */
  isValidNumericValue(value: any): boolean {
    return this.isValidValue(value) && !isNaN(value) && value > 0;
  }

  /**
   * Helper function to format availability status
   */
  getAvailabilityStatus(disponible: any): string {
    if (disponible === 'S' || disponible === '1' || disponible === 1 || disponible === true) {
      return 'Sí';
    }
    return 'No';
  }

  /**
   * Helper function to check if availability is positive
   */
  isAvailable(disponible: any): boolean {
    return disponible === 'S' || disponible === '1' || disponible === 1 || disponible === true;
  }

  /**
   * Edit accessory from detail modal
   */
  editarAccesorioDesdeDetalle(accesorioId: number) {
    // Primero cerrar el modal de detalles
    this.closeDetalleModal();
    // Luego abrir el modal de edición con un pequeño delay para evitar conflictos
    setTimeout(() => {
      this.editarAccesorio(accesorioId);
    }, 100);
  }

}

