import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Producto } from '../modelos/producto'; // Asumo que tu modelo está en esta ruta

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private http = inject(HttpClient);
  // La URL base de tu API
  private apiUrl = 'http://localhost:4000/api'; 

  constructor() { }

  /**
   * Llama al backend para obtener la lista de todos los productos
   */
  getProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.apiUrl}/productos`);
  }
}