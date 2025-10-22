import { Routes } from '@angular/router';
import { CatalogoComponent } from './componentes/catalogo/catalogo.component';
import { CarritoComponent } from './componentes/carrito/carrito.component';

export const routes: Routes = [
  { path: 'catalogo', component: CatalogoComponent },
  { path: 'carrito', component: CarritoComponent },
  { path: '', redirectTo: '/catalogo', pathMatch: 'full' }
];
