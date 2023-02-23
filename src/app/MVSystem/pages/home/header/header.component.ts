import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  userName: string

  constructor(
   private loginService: LoginService
  ) {
    this.userName = loginService.getUserName()
  }

  ngOnInit(): void {
  }
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
}
