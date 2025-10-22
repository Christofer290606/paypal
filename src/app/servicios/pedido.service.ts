import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Producto } from '../modelos/producto';

@Injectable({ providedIn: 'root' })
export class PedidoService {
  private apiUrl = 'http://localhost:4000/api/pedidos';

  constructor(private http: HttpClient) {}

  guardarPedido(productos: Producto[], total: number): Observable<any> {
    return this.http.post(this.apiUrl, { productos, total });
  }
}
