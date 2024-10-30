import { Component, ElementRef, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Almacen } from 'src/app/core/interfaces/catalogo.interface';
import { CatalogosService } from 'src/app/core/services/catalogos.service';
import { LoginService } from 'src/app/auth/login.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit,OnDestroy {

  constructor(
   private loginService: LoginService,
   private catalogosService:CatalogosService
  ) {
    this.userName = loginService.getUserName();
    this.userGiveName = loginService.getUserGiveName();
    this.userEmpresa = loginService.getUserEmpresaMostrar;
  }
  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
  ngOnInit(): void {

    //this.destroy$.unsubscribe();
    this.loadUseSucursal();
  }
  destroy$: Subject<any> = new Subject<any>();
  sucursales!: Almacen[];

  userName: string
  userGiveName: string;
  userSucursal: any;
  userEmpresa: string;
  @ViewChild('toggleSidebarBtn') toggleSidebar!: ElementRef;


  onSidebarToggle = () => {
    const toggle = document.querySelector('.toggle-sidebar');
    if (!toggle) {
      $('body').addClass('toggle-sidebar')
    }
    else {
      $('body').removeClass('toggle-sidebar')
    }
  }

  logout() {
    this.loginService.logout();
  }
  private loadUseSucursal(){
      this.catalogosService.getSucursales()
      .pipe(takeUntil(this.destroy$))
      .subscribe(sucursales => {
         this.userSucursal= sucursales.find(x =>x.iD_Almacen == +this.loginService.getUserIdSucursal)?.descripcion
      })

  }
}
