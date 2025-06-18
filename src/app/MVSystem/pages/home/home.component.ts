import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import * as ApexCharts from 'apexcharts'
import { IMyDrpOptions } from 'mydaterangepicker';
import { ToastrService } from 'ngx-toastr';
import { LoginService } from 'src/app/auth/login.service';
import { Utilidades, utilidadesFiltros } from 'src/app/core/interfaces/utilidades.interface';
import { UtilidadesService } from 'src/app/core/services/utilidades.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  sidebarVisible = true;

  ngOnInit(): void {
    // Calcular el inicio de la semana y el mes actual
  }

  onToggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
  }

  onSidebarMenuSelected() {
    if (window.innerWidth < 992) { // Solo en móvil/tablet
      this.sidebarVisible = false;
    }
  }
}