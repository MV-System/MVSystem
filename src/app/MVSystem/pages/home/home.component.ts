import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  sidebarVisible = true;
 @ViewChild('sidebarContainer', { static: false }) sidebarContainer!: ElementRef;


  ngOnInit(): void {
    // Oculta el sidebar por defecto en pantallas pequeñas
    if (window.innerWidth < 992) {
      this.sidebarVisible = false;
    }
  }
isMobileScreen(): boolean {
  return window.innerWidth < 992;
}
  onToggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
  }

  onSidebarMenuSelected() {
    if (window.innerWidth < 992) { // Solo en móvil/tablet
      this.sidebarVisible = false;
    }
  }
   
  onDocumentClick(event: MouseEvent) {
    if (
      window.innerWidth < 992 &&
      this.sidebarVisible &&
      this.sidebarContainer &&
      !this.sidebarContainer.nativeElement.contains(event.target)
    ) {
      this.sidebarVisible = false;
    }
  }
}