import { Component, OnInit } from '@angular/core';
import { CheckoutService } from '../../services/checkout';

// Le decimos a TypeScript que no se preocupe, la variable "paypal" existe a nivel global
declare var paypal: any; 

@Component({
  selector: 'app-checkout',
  standalone: true, // Importante para componentes standalone
  imports: [],
  templateUrl: './checkout.html',
  styleUrls: ['./checkout.css']
})
export class CheckoutComponent implements OnInit {

  constructor(private checkoutService: CheckoutService) { }

  ngOnInit(): void {
    // Cuando el componente se inicia, renderizamos los botones
    this.renderPaypalButtons();
  }

  private renderPaypalButtons(): void {
    paypal.Buttons({
        // 1. LLAMA A TU SERVICIO PARA CREAR LA ORDEN EN EL BACKEND
        createOrder: async () => {
          try {
            // El objeto {} puede contener los datos del carrito en un futuro
            const order = await this.checkoutService.createOrder({}).toPromise();
            return order.id;
          } catch (error) {
            console.error('Error al crear la orden:', error);
          }
        },

        // 2. LLAMA A TU SERVICIO PARA CAPTURAR EL PAGO CUANDO EL USUARIO APRUEBA
        onApprove: async (data: any) => {
          try {
            const captureDetails = await this.checkoutService.captureOrder(data.orderID).toPromise();
            console.log('Pago capturado!', captureDetails);
            
            alert(`¡Transacción completada! Gracias, ${captureDetails.payer.name.given_name}.`);
            
            // Aquí puedes redirigir al usuario a una página de agradecimiento
          } catch (error) {
            console.error('Error al capturar el pago:', error);
          }
        },
        
        onError: (err: any) => {
            console.error('Ocurrió un error con el botón de PayPal:', err);
        }
    }).render('#paypal-button-container');
  }
}