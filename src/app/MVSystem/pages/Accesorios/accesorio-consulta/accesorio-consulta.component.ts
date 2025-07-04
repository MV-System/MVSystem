import { Component, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Almacen } from 'src/app/core/interfaces/catalogo.interface';
import { CatalogosService } from 'src/app/core/services/catalogos.service';
import { AccesoriosService } from '../../../../core/services/accesorios.service';
import { Pagination } from '../../../../core/interfaces/pagination.interfaces';
import { Accesorio } from 'src/app/core/interfaces/accesorio.interface';
import { Router } from '@angular/router';
import { LoginService } from 'src/app/auth/login.service';
import { ValidatorPermissionService } from 'src/app/core/services/validator-permission.service';

@Component({
  selector: 'app-accesorio-consulta',
  templateUrl: './accesorio-consulta.component.html',
  styleUrls: ['./accesorio-consulta.component.css']
})
export class AccesorioConsultaComponent implements OnInit {


  constructor(
    private validatorPermissionService:ValidatorPermissionService,
    private loginService: LoginService,
    private catalogosService: CatalogosService,
    private accesoriosService:AccesoriosService,
    private fb: FormBuilder,
    private router: Router) { }

  ngOnInit(): void {
    this.getAccesorios();
    this.obtenerAlmacenes();
  }
  almacenes:   Almacen[] = [];
  accesorios:  Accesorio[] = [];
  accesorio!:  Accesorio[];
  currentPage:     number = 1;
  totalInventario: number = 0;
  totalRecord!:    number;
  accesorioQuantity:number = 0;
  line!:           number;
  lastLine!:       number;
  pageIndex:       number = 1;
  pageSize:        number = 10;
  accesorioTipo:   number = 1;
  disponible:      number = 1;
  vendido:         number = 2;
  form: FormGroup = this.fb.group({
    almacen: [0,],
    accesorio:['',],
    totalAccesorio: [0,],
    totalInventario: [0,]
  });
  SelectSucursal(): boolean {
    return this.validatorPermissionService.validateUserRole("CB_SUCURSAL");
  }
   // Obtener la fecha actual
   fechaHoy = new Date();
   // Crear una nueva fecha para el primer día del mes actual
  FechaInicio = new Date(this.fechaHoy.getFullYear(), this.fechaHoy.getMonth(), 1);


  paginate:Pagination={
    pageIndex: 1,
    pageSize: 10,
    fechaInicio: this.FechaInicio.toISOString().split('T')[0],
    fechaFinal: this.fechaHoy.toISOString().split('T')[0],
  }
  filter: any = {
    almacen: '',
    criterio:'',

  };


  pageChanged(index: number) {
    this.currentPage = index;
    this.paginate.pageIndex= this.pageIndex = index;
    this.getAccesorios()
  }
  getAccesorios(){
    let accesorio = this.form.get('accesorio')?.value;

    let almacen;
    if(this.form.get('almacen')?.value !="")
  {
    almacen =this.form.get('almacen')?.value;
  }
  else
  {
    almacen =this.loginService.getUserIdSucursal; //this.form.get('almacen')?.value;
  }

   // let almacen = Number( this.form.get('almacen')?.value);

    this.accesoriosService.getAccesorios(this.paginate,accesorio,almacen)
    .subscribe(accesorios=>{
      let record = accesorios.length == 0 ? 0 : accesorios[0].totalRecord;
      let totalInventario = accesorios.length == 0 ? 0 : accesorios[0].totalInventario;
      this.obtenerTotalAccesorio(record);
      this.obtenerTotalInventario(totalInventario);
      if (accesorios.length) {
        this.totalRecord = accesorios[0].totalRecord;
        this.line = accesorios[0].line;
        this.lastLine = accesorios[0].lastLine;
      }

      this.accesorios= accesorios;

    });
  }
  obtenerTotalInventario(totalInventario: number) {
    this.totalInventario = totalInventario;
  }
  obtenerTotalAccesorio(cantidadAccesorio: number) {
    this.accesorioQuantity = cantidadAccesorio;
  }
  obtenerAlmacenes() {
    this.catalogosService.getSucursales().subscribe((almacen) => {
      this.almacenes = almacen;
    });
  }
  onCheckboxAccesorioChange(event: Event){
    this.accesorioTipo = Number((<HTMLInputElement>event.target).value);
  }
  /**
   * Navigate to accessories registration page
   */
  navigateToRegistro() {
    this.router.navigate(['/mvSystem/home/accesorios/registro']).then(
      (success) => {
        if (!success) {
          console.error('Error navigating to accessories registration');
        }
      }
    );
  }
}
