import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  // La dirección de nuestro backend
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  /**
   * Llama al backend para crear una orden en PayPal.
   * Le enviamos los datos del carrito.
   */
  createOrder(cart: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/orders`, { cart });
  }

  /**
   * Llama al backend para capturar el pago de una orden.
   * Le enviamos el ID de la orden que fue aprobada.
   */
  captureOrder(orderID: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/orders/${orderID}/capture`, {});
  }
}