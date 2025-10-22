import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { LoginComponent } from './pages/login/login';
import { RegistroComponent } from './pages/registro/registro';
import { BienvenidaComponent } from './pages/bienvenida/bienvenida';
import { ContactComponent } from './pages/contact/contact';
import { CatalogoComponent } from './componentes/catalogo/catalogo.component';
import { CarritoComponent } from './componentes/carrito/carrito.component';

export const routes: Routes = [
  // Rutas del flujo principal
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'bienvenida', component: BienvenidaComponent },
  { path: 'contact', component: ContactComponent },

  // Tus rutas funcionales (antes llamadas 'catalogo' y 'carrito')
  // Las renombraremos para que coincidan con el maquetado
  { path: 'pan', component: CatalogoComponent },
  { path: 'finalizar', component: CarritoComponent },

  // Redirección por si alguien usa la ruta antigua
  { path: 'catalogo', redirectTo: '/pan' },
  { path: 'carrito', redirectTo: '/finalizar' }
];