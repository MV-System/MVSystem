import { Component, HostListener, OnInit } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }
  // @HostListener('document:click', ['$event']) toggleOpen(event: Event) {
  //   // console.log( this.elRef.nativeElement.contains(event.target) );
  //   const toggle = document.querySelector('.toggle-sidebar-btn');
  //   const sidebar = document.querySelector('.sidebar');
  //   const header = document.querySelector('.header');
  //   const li = document.querySelector('.bi.bi-chevron-down.ms-auto');
  //   // && event.target !==toggle 
  //   if (sidebar !== event.target  && event.target !==header && event.target !==toggle&& event.target !==li) {
  //     $('body').addClass('toggle-sidebar')
  //   }
  // }
}
