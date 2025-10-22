import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CarritoService } from '../../servicios/carrito.service';
import { Producto } from '../../modelos/producto'; 
import { ProductoService } from '../../servicios/producto.service';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [CommonModule, RouterLink], 
  templateUrl: './catalogo.component.html',
  // Quitamos la referencia al CSS que daba error
  styleUrls: [] 
})
export class CatalogoComponent implements OnInit { 
  
  private carritoService = inject(CarritoService);
  private productoService = inject(ProductoService); 

  public listaDeProductos: WritableSignal<Producto[]> = signal([]);

  constructor() { }

  // ESTA ES LA PARTE CORREGIDA
  ngOnInit() {
    // 1. Llamamos al servicio, que nos da un Observable
    this.productoService.getProductos().subscribe({
      
      // 2. El bloque 'next' se ejecuta cuando los datos llegan
      next: (data: Producto[]) => {
        // 'data' aquí SÍ es el array de Producto[]
        
        // 3. Guardamos el array (data) en el Signal.
        // Esta es la línea que te daba error.
        this.listaDeProductos.set(data); 
        console.log('Productos cargados desde la API:', data);
      },
      error: (err: any) => {
        console.error('Error al cargar productos desde la API:', err);
        alert('No se pudieron cargar los productos. ¿Iniciaste el servidor del backend?');
      }
    });
  }

  public onAgregarAlCarrito(producto: Producto) {
    this.carritoService.agregar(producto);
  }
}