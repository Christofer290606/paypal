 const express = require('express');
const cors = require('cors');
require('dotenv').config(); // Carga las variables de .env

// Importamos nuestro cliente de PayPal ya configurado
const paypal = require('./paypal-config'); 
const checkoutNodeJssdk = require('@paypal/checkout-server-sdk');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares: "plugins" para nuestro servidor
app.use(cors()); // Permite peticiones desde Angular
app.use(express.json()); // Permite que el servidor entienda JSON

// --- ENDPOINT PARA CREAR LA ORDEN ---
app.post('/api/orders', async (req, res) => {

    
    // 1. Creamos una solicitud de orden de pago a PayPal
    const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
        intent: 'CAPTURE',
        purchase_units: [{
            amount: {
                currency_code: 'MXN', // La moneda
                value: '180.00'      // IMPORTANTE: Este es un valor de ejemplo.
                                     // Más adelante, lo tomaremos del carrito de compras.
            }
        }]
    });

    try {
        // 2. Ejecutamos la solicitud y esperamos la respuesta de PayPal
        const order = await paypal.client().execute(request);
        console.log(`Orden Creada:`, order.result);

        // 3. Si todo sale bien, enviamos de vuelta solo el ID de la orden
        res.status(201).json({ id: order.result.id });

    } catch (err) {
        console.error("Error al crear la orden:", err);
        res.status(500).send(err.message);
    }
});

// --- ENDPOINT PARA CAPTURAR EL PAGO ---
app.post('/api/orders/:orderID/capture', async (req, res) => {
    const { orderID } = req.params;
    const request = new checkoutNodeJssdk.orders.OrdersCaptureRequest(orderID);
    request.requestBody({});

    try {
        // 1. Ejecutamos la captura del pago y esperamos la respuesta
        const capture = await paypal.client().execute(request);
        const captureData = capture.result;
        console.log('¡Pago Capturado Exitosamente!:', captureData);

        // 2. Aquí es donde guardarías los detalles en tu base de datos
        // Por ejemplo: guardar el ID de la transacción, el estado "completado", etc.
        // Esto confirma que el pedido se pagó en tu sistema.
        
        // 3. Devolvemos la confirmación al frontend
        res.status(200).json(captureData);

    } catch (err) {
        console.error("Error al capturar la orden:", err);
        res.status(500).send(err.message);
    }
});

// Ponemos el servidor a escuchar peticiones
app.listen(PORT, () => {
    console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
});
