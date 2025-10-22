import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Producto } from '../modelos/producto';

@Injectable({
  providedIn: 'root'
}) 
export class ProductoService {
  constructor(private http: HttpClient) {}

  async getProductos(): Promise<Producto[]> {
    const xmlData = await firstValueFrom(this.http.get('assets/producto.xml', { responseType: 'text' }));
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlData, 'application/xml');

    const productos: Producto[] = [];
    const items = xmlDoc.getElementsByTagName('producto');

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      productos.push({
        id: Number(item.getElementsByTagName('id')[0]?.textContent || 0),
        nombre: item.getElementsByTagName('nombre')[0]?.textContent || '',
        precio: Number(item.getElementsByTagName('precio')[0]?.textContent || 0),
        descripcion: item.getElementsByTagName('descripcion')[0]?.textContent || ''
      });
    }

    return productos;
  }
}
