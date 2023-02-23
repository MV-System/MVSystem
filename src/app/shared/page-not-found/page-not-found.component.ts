import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-page-not-found',
    template: `
    <div class="container">
        <section class="section error-404 min-vh-100 d-flex flex-column align-items-center justify-content-center">
            <h1>Ooops!</h1>
            <h2 class="mt-5"> Conexión a internet lenta o inexistente. <br />
                Por favor verifique.
            </h2>
           
           
            <a class="btn" routerLink="/">Reintentar</a>
            <img src="assets/img/not-found.svg" class="img-fluid py-5" alt="Page Not Found">
        </section>
    </div>`,
    styleUrls: ['./page-not-found.component.css']
})
export class PageNotFoundComponent implements OnInit {

    constructor() { }

    ngOnInit(): void {
    }

}
