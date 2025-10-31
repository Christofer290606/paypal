import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
// 1. Importa la interfaz 'ItemCarrito' desde el carrito.service
import { ItemCarrito } from './carrito.service';

@Injectable({
  providedIn: 'root'
})
export class PedidoService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:4000/api';

  constructor() { }

  // 2. CAMBIA la firma: ahora acepta 'ItemCarrito[]'
  guardarPedido(productos: ItemCarrito[], total: number): Observable<any> {
    
    const id_usuario = localStorage.getItem('id_usuario'); 
    
    if (!id_usuario) {
      return new Observable(observer => observer.error('Usuario no logueado')); 
    }

    const body = {
      id_usuario: parseInt(id_usuario, 10),
      productos: productos, // 3. Ahora enviamos el array de ItemCarrito[]
      total: total
    };

    // Esto ya no falla, porque el backend (api/app.js) SÍ espera esta estructura
    return this.http.post<any>(`${this.apiUrl}/pedidos`, body); 
  }
}