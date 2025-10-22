import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './registro.html',
  styleUrls: ['./registro.css']
})
export class RegistroComponent {
  nombre_usuario = '';
  contrasena = '';

  constructor(private router: Router) {}

  onRegistro() {
    if (!this.nombre_usuario || !this.contrasena) {
      alert('Por favor, completa todos los campos.');
      return;
    }
    
    fetch('http://localhost:4000/api/registro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: this.nombre_usuario, contrasena: this.contrasena })
    })
    .then(response => {
      if (!response.ok) throw new Error('Error al registrar usuario');
      return response.json();
    })
    .then(data => {
      alert('¡Usuario registrado con éxito!');
      this.router.navigate(['/login']);
    })
    .catch(error => {
      console.error(error);
      alert('Error al registrar usuario');
    });
  }
}