import { Component, HostListener, OnInit, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  inside: boolean = false;

  constructor(private renderer: Renderer2) { }

  ngOnInit(): void {
    
  }

  @HostListener('click', ['$event']) click() {
    this.inside = true;
  }
  @HostListener('document:click', ['$event']) clickOutside(event: Event) {
    const toggle = document.querySelector('.toggle-sidebar-btn');
   
      if ( !this.inside && event.target != toggle) {
      $('body').addClass('toggle-sidebar')
    
      console.log( this.inside);

    }
    this.inside = false

  }
}
