import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { sesionVigente } from '../../helpers/helper';

@Component({
    selector: 'app-page-not-found',
    template: `
    <div class="container">
        <section class="section error-404 min-vh-100 d-flex flex-column align-items-center justify-content-center">
            <h1>Ooops!</h1>
            <h2 class="mt-5"> Conexión a internet lenta o inexistente. <br />
                Por favor verifique.
            </h2>
           
           
            <a class="btn" role="button" (click)="reintentar()">Reintentar</a>
            <img src="assets/img/not-found.svg" class="img-fluid py-5" alt="Page Not Found">
        </section>
    </div>`,
    styleUrls: ['./page-not-found.component.css']
})
export class PageNotFoundComponent implements OnInit {

    constructor(private location: Location, private router: Router) { }

    ngOnInit(): void {
    }

    /** Con la sesion vigente vuelve a la pantalla donde estaba; con la sesion vencida limpia y va al login. */
    reintentar(): void {
        if (!sesionVigente()) {
            localStorage.clear();
            this.router.navigate(['/']);
            return;
        }
        if (window.history.length > 1) {
            this.location.back();
        } else {
            this.router.navigate(['/']);
        }
    }

}
