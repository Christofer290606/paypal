
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { CatalogoService } from '../../servicios/catalogo.service';
import { CheckoutComponent } from '../../components/checkout/checkout';
import { CarritoService, Producto } from '../../servicios/carrito.service';

@Component({
  selector: 'app-catalogo',
  standalone: true, 
  imports: [CommonModule, CurrencyPipe, CheckoutComponent],
  templateUrl: './catalogo.component.html',
  styleUrls: ['./catalogo.css']
})
export class CatalogoComponent implements OnInit {
  private carritoService = inject(CarritoService);

  productos: any[] = [];

  constructor(private catalogoService: CatalogoService) {}

  ngOnInit(): void {
    this.catalogoService.obtenerProductos().subscribe({
      next: (data) => {
        this.productos = data;
        console.log('Productos obtenidos:', this.productos);
      },
      error: (err) => {
        console.error('Error al cargar productos:', err);
      }
    });

  public onAgregarAlCarrito(producto: Producto) {
    this.carritoService.agregar(producto);
  }
  }
}
