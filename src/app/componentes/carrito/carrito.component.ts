import { Component, AfterViewInit, inject } from '@angular/core';
import { loadScript, PayPalNamespace } from '@paypal/paypal-js';
import { CarritoService } from '../../servicios/carrito.service';
import { PedidoService } from '../../servicios/pedido.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { lastValueFrom } from 'rxjs'; // Importante para convertir Observable a Promise

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, RouterLink], // Imports limpios
  templateUrl: './carrito.component.html',
  styleUrls: [], // Arreglado (asumiendo que no usas un CSS específico aquí)
  providers: []  // Arreglado (CurrencyPipe no se usa en el TS)
})
export class CarritoComponent implements AfterViewInit {
  
  // Inyecta los servicios
  public carritoService = inject(CarritoService);
  private pedidoService = inject(PedidoService);

  // Crea referencias a los signals del servicio
  carrito = this.carritoService.productos;
  total = this.carritoService.total; // (Esto debe ser un 'computed' en tu servicio)

  constructor() {
    console.log('🛒 Carrito cargado:', this.carrito());
  }

  async ngAfterViewInit() {
    // No renderizar botones de PayPal si el carrito está vacío
    if (this.carritoService.productos().length === 0) {
      return; 
    }

    // Carga el script de PayPal
    const paypal: PayPalNamespace | null = await loadScript({
      clientId: 'AcefLgfUjNVyQsnQQhLt3h3woRX6bBp17ILca7HD0pXkG3tXsAUrEVJyOvkwXmc-LUImYiOTF1faH6vV',
      currency: 'MXN'
    });

    if (!paypal || typeof paypal.Buttons !== 'function') {
      console.error('❌ No se pudo inicializar PayPal.');
      return;
    }

    // Renderiza los botones
    paypal.Buttons({
      
      // --- 1. CREAR LA ORDEN ---
      createOrder: (data: any, actions: any) => {
        return actions.order.create({
          intent: 'CAPTURE',
          purchase_units: [
            {
              amount: {
                currency_code: 'MXN',
                // CORRECCIÓN: Llama a total() directamente desde el servicio
                // para evitar problemas de contexto 'this'.
                value: this.carritoService.total().toString() 
              }
            }
          ]
        });
      },

      // --- 2. APROBAR LA ORDEN ---
      onApprove: (data: any, actions: any) => {
        // Primero, captura el pago en PayPal
        return actions.order.capture().then((detalles: any) => {
          console.log('✅ Pago completado:', detalles);

          // Convierte el Observable de guardarPedido en una Promise
          const guardarPedidoPromise = lastValueFrom(
            // CORRECCIÓN: Llama a guardarPedido solo con 2 argumentos
            this.pedidoService.guardarPedido(
              this.carrito(), 
              this.carritoService.total()
            )
          );

          // Devuelve la promesa para que PayPal sepa que estamos procesando
          return guardarPedidoPromise.then(() => {
            alert('Pedido registrado correctamente');
            this.carritoService.vaciar();
          }).catch((err: any) => {
            console.error('Error al registrar pedido en la BD:', err);
            alert('¡Pago exitoso! Pero hubo un error al guardar tu pedido. Contacta a soporte.');
          });

        }).catch((err: any) => {
          console.error('⚠️ Error al capturar el pago con PayPal:', err);
          alert('Hubo un error al procesar tu pago. Por favor, intenta de nuevo.');
        });
      },

      // --- 3. MANEJO DE ERRORES ---
      onError: (err: any) => {
        console.error('⚠️ Error con PayPal (onError):', err);
      }
    }).render('#paypal-button-container');
  }

  // --- Funciones del Carrito ---

  quitar(id: number) {
    this.carritoService.quitar(id);
  }

  vaciar() {
    this.carritoService.vaciar();
  }

  exportarXML() {
    // Obtenemos los 'ItemCarrito[]' del servicio
    const productos = this.carritoService.productos();

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<recibo>\n`;

    // 'p' es un 'ItemCarrito', por lo que accedemos a 'p.producto'
    for (const p of productos) {
      xml += `  <producto>\n`;
      // CORRECCIÓN: Usamos p.producto.id, p.producto.nombre, etc.
      xml += `    <id>${p.producto.id}</id>\n`; 
      xml += `    <nombre>${p.producto.nombre}</nombre>\n`;
      xml += `    <precio>${p.producto.precio}</precio>\n`;
      xml += `    <cantidad>${p.cantidad}</cantidad>\n`;
      if (p.producto.descripcion) {
         xml += `    <descripcion>${p.producto.descripcion}</descripcion>\n`;
      }
      xml += `  </producto>\n`;
    }

    // Llamamos al 'total()' directamente desde el servicio
    xml += `  <total>${this.carritoService.total()}</total>\n`;
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