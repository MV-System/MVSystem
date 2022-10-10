import { Component, ElementRef, HostListener, OnInit } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  inside: boolean = false;

  constructor(private eRef: ElementRef) { }

  ngOnInit(): void {
  }
  @HostListener('click', ['$event']) click() {
    this.inside = true;
  }
  @HostListener('document:click', ['$event']) clickOutside(event: Event) {
    const toggle = document.querySelector('.toggle-sidebar-btn');
   
    // if ( event.target !==toggle && !this.eRef.nativeElement.contains(event.target)  ) {
      if ( !this.inside && event.target != toggle) {
      $('body').addClass('toggle-sidebar')
    }
    this.inside = false

  }
}
