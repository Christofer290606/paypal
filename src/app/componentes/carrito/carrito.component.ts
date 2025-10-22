import { Component, OnInit, AfterViewInit, computed, inject } from '@angular/core';
import { loadScript, PayPalNamespace } from '@paypal/paypal-js';
import { CarritoService } from '../../servicios/carrito.service';
import { PedidoService } from '../../servicios/pedido.service';
import { CommonModule, CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.css'],
  providers: [CurrencyPipe]
})
export class CarritoComponent implements OnInit, AfterViewInit {
  private carritoService = inject(CarritoService);
  private pedidoService = inject(PedidoService);

  carrito = this.carritoService.productos;
  total = computed(() => Number(this.carritoService.total()));

  ngOnInit() {
    console.log('🛒 Carrito cargado:', this.carrito());
  }

  async ngAfterViewInit() {
    const paypal: PayPalNamespace | null = await loadScript({
      clientId: 'AcefLgfUjNVyQsnQQhLt3h3woRX6bBp17ILca7HD0pXkG3tXsAUrEVJyOvkwXmc-LUImYiOTF1faH6vV',
      currency: 'MXN'
    });

    if (!paypal || typeof paypal.Buttons !== 'function') {
      console.error('❌ No se pudo inicializar PayPal.');
      return;
    }

    paypal.Buttons({
      createOrder: (data: any, actions: any) => {
        return actions.order.create({
          intent: 'CAPTURE',
          purchase_units: [
            {
              amount: {
                currency_code: 'MXN',
                value: this.total().toString()
              }
            }
          ]
        });
      },
      onApprove: async (data: any, actions: any) => {
        const detalles = await actions.order?.capture();
        console.log('✅ Pago completado:', detalles);

        this.pedidoService.guardarPedido(this.carrito(), this.total()).subscribe({
          next: () => {
            alert('Pedido registrado correctamente');
            this.carritoService.vaciar();
          },
          error: (err) => console.error('Error al registrar pedido:', err)
        });
      },
      onError: (err: any) => {
        console.error('⚠️ Error con PayPal:', err);
      }
    }).render('#paypal-button-container');
  }

  quitar(id: number) {
    this.carritoService.quitar(id);
  }

  vaciar() {
    this.carritoService.vaciar();
  }

  exportarXML() {
    this.carritoService.exportarXML();
  }
}
