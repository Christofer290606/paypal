import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms'; // Necesario para ngModel

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink], // Añade FormsModule y RouterLink
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  nombre_usuario = '';
  contrasena = '';

  constructor(private router: Router) {} // Inyecta el Router

  onLogin() {
    if (!this.nombre_usuario || !this.contrasena) {
      alert('Por favor, completa todos los campos.');
      return;
    }

    fetch('http://localhost:4000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: this.nombre_usuario, contrasena: this.contrasena })
    })
    .then(response => {
      if (!response.ok) throw new Error('Usuario o contraseña incorrectos');
      return response.json();
    })
    .then(data => {
      alert('¡Bienvenido, ' + data.nombre_usuario + '!');
      localStorage.setItem('id_usuario', data.id_usuario);
      this.router.navigate(['/bienvenida']); // Usa el Router de Angular
    })
    .catch(error => {
      console.error(error);
      alert('Usuario o contraseña incorrectos');
    });
  }
}