'use strict';
// 1. Carga las variables de entorno que pusimos en el archivo .env
require('dotenv').config();

// 2. Importa el SDK de PayPal
const checkoutNodeJssdk = require('@paypal/checkout-server-sdk');

// 3. Configura el entorno de PayPal
function environment() {
    let clientId = process.env.PAYPAL_CLIENT_ID;
    let clientSecret = process.env.PAYPAL_CLIENT_SECRET;

    // Usamos SandboxEnvironment para el modo de prueba.
    // Para producción, esto cambiaría a LiveEnvironment.
    return new checkoutNodeJssdk.core.SandboxEnvironment(clientId, clientSecret);
}

// 4. Crea y exporta el "cliente" de PayPal
// Este es el objeto que usaremos para hacer todas las llamadas a la API
function client() {
    return new checkoutNodeJssdk.core.PayPalHttpClient(environment());
}

module.exports = { client: client }; 
