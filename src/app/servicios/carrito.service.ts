import { Injectable, signal, computed, WritableSignal } from '@angular/core';
import { Producto } from '../modelos/producto';

// 1. Definimos una nueva interfaz para el item del carrito
export interface ItemCarrito {
  producto: Producto;
  cantidad: number;
}

@Injectable({ providedIn: 'root' })
export class CarritoService {

  // 2. El signal ahora guarda un array de 'ItemCarrito'
  private productosSignal = signal<ItemCarrito[]>([]);
  public productos = this.productosSignal.asReadonly(); 

  // 3. El 'total' ahora multiplica precio * cantidad
  public total = computed(() => {
    return this.productosSignal().reduce((acc, item) => 
      acc + (Number(item.producto.precio) * item.cantidad)
    , 0);
  });

  constructor() {}

  // 4. LÓGICA DE 'AGREGAR' MODIFICADA
  agregar(producto: Producto) {
    const listaActual = this.productosSignal();
    const itemExistente = listaActual.find(item => item.producto.id === producto.id);

    if (itemExistente) {
      // Si ya existe, solo incrementa la cantidad
      this.productosSignal.update(lista => 
        lista.map(item => 
          item.producto.id === producto.id 
            ? { ...item, cantidad: item.cantidad + 1 } 
            : item
        )
      );
    } else {
      // Si es nuevo, lo añade a la lista con cantidad 1
      this.productosSignal.update(lista => [...lista, { producto: producto, cantidad: 1 }]);
    }
    console.log('Producto añadido:', producto.nombre);
  }

  // 5. LÓGICA DE 'QUITAR' MODIFICADA (para quitar uno por uno)
  quitar(id: number) {
    const itemExistente = this.productosSignal().find(item => item.producto.id === id);

    if (itemExistente && itemExistente.cantidad > 1) {
      // Si hay más de uno, reduce la cantidad
      this.productosSignal.update(lista => 
        lista.map(item => 
          item.producto.id === id 
            ? { ...item, cantidad: item.cantidad - 1 } 
            : item
        )
      );
    } else {
      // Si solo queda uno (o no existe), lo elimina de la lista
      this.productosSignal.update(lista => lista.filter(item => item.producto.id !== id));
    }
  }

  vaciar() {
    this.productosSignal.set([]);
  }

  exportarXML() {
    const productos = this.productosSignal(); // Esto es ItemCarrito[]

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<recibo>\n`;

    for (const item of productos) {
      xml += `  <producto>\n`;
      // Accedemos a las propiedades a través de 'item.producto'
      xml += `    <id>${item.producto.id}</id>\n`; 
      xml += `    <nombre>${item.producto.nombre}</nombre>\n`;
      xml += `    <precio>${item.producto.precio}</precio>\n`;
      xml += `    <cantidad>${item.cantidad}</cantidad>\n`; // <-- Añadimos la cantidad
      if (item.producto.descripcion) {
        xml += `    <descripcion>${item.producto.descripcion}</descripcion>\n`;
      }
      xml += `  </producto>\n`;
    }
    // --- FIN DE LA CORRECCIÓN ---

    xml += `  <total>${this.total()}</total>\n`;
    xml += `</recibo>`;

    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'recibo.xml';
    a.click();

    URL.revokeObjectURL(url);
  }
}