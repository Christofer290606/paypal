import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import mysql from 'mysql2';
// import catalogoRoutes from './routes/catalogoRoute.js'; // No estás usando esto, lo comento

dotenv.config();
const app = express();
const PORT = process.env.PORT || 4000;

// --- 1. Middlewares (¡Correcto!) ---
app.use(cors());
app.use(express.json());

// --- 2. Conexión a la Base de Datos ---
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// (Es buena idea mover la conexión aquí, fuera del listen)
db.connect(err => {
    if (err) {
      console.error('Error al conectar a la base de datos:', err);
      return;
    }
    console.log(`Conectado a la base de datos MySQL.`);
});


// --- 3. Definición de Rutas (Endpoints) ---

// GET /api/productos - Devuelve todos los productos del catálogo
app.get('/api/productos', (req, res) => {
    const sql = 'SELECT id_producto AS id, nombre, precio, descripcion, url_imagen FROM productos'; 
    
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error en la consulta de productos:', err);
            return res.status(500).json({ error: 'Error al consultar la base de datos' });
        }
        res.json(results);
    });
});

// POST /api/registro - Registra un nuevo usuario
app.post('/api/registro', async (req, res) => {
    // Usamos 'nombre' para que coincida con tu base de datos
    const { nombre, contrasena } = req.body; 

    if (!nombre || !contrasena) {
        return res.status(400).json({ error: 'El nombre de usuario y la contraseña son obligatorios' });
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const contrasenaHasheada = await bcrypt.hash(contrasena, salt);

        // Usamos 'usuario' (singular) como en tu código
        const sql = "INSERT INTO usuario (nombre, contrasena) VALUES (?, ?)";
        
        db.query(sql, [nombre, contrasenaHasheada], (err, result) => {
            if (err) {
                console.error('Error al registrar usuario:', err);
                return res.status(500).json({ error: 'Error al registrar el usuario. ¿Quizás el usuario ya existe?' });
            }
            console.log('Usuario registrado con ID:', result.insertId);
            res.status(201).json({ message: 'Usuario registrado con éxito', userId: result.insertId });
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// POST /api/login - Inicia sesión
app.post('/api/login', (req, res) => {
    const { nombre, contrasena } = req.body;

    if (!nombre || !contrasena) {
        return res.status(400).json({ error: 'El nombre de usuario y la contraseña son obligatorios' });
    }

    const sql = "SELECT * FROM usuario WHERE nombre = ?";
    
    db.query(sql, [nombre], async (err, results) => {
        if (err) {
            console.error('Error en la consulta de login:', err);
            return res.status(500).json({ error: 'Error en el servidor' });
        }

        if (results.length === 0) {
            // Arreglé la variable aquí (era nombre_usuario pero debe ser nombre)
            console.log('Intento de login fallido (Usuario no encontrado):', nombre);
            return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
        }

        const usuario = results[0];

        try {
            const esMatch = await bcrypt.compare(contrasena, usuario.contrasena);

            if (esMatch) {
                console.log('Login exitoso para:', usuario.nombre);
                res.status(200).json({ 
                    message: 'Login exitoso', 
                    id_usuario: usuario.id_usuario,
                    nombre: usuario.nombre
                });
            } else {
                console.log('Intento de login fallido (Contraseña incorrecta):', nombre);
                res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
            }
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Error en el servidor' });
        }
    });
});

/**
 * Endpoint para GUARDAR UN NUEVO PEDIDO
 * (Actualizado para la estructura Pedido/Detalle_Pedido y con inventario)
 */
app.post('/api/pedidos', (req, res) => {
    // 1. Obtenemos los datos del frontend
    const { id_usuario, productos, total } = req.body; // 'productos' es ItemCarrito[]

    if (!id_usuario || !productos || productos.length === 0 || total === undefined) {
        return res.status(400).json({ error: 'Datos del pedido incompletos' });
    }

    // 2. Iniciamos la transacción
    db.beginTransaction(async (err) => {
        if (err) {
            console.error('Error al iniciar transacción:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }

        try {
            // --- 3. LÓGICA DE INVENTARIO ---
            const productIds = productos.map(item => item.producto.id);
            const cantidadPedidaMap = new Map(productos.map(item => [item.producto.id, item.cantidad]));

            const sqlSelect = 'SELECT * FROM productos WHERE id_producto IN (?) FOR UPDATE';
            db.query(sqlSelect, [productIds], (err, results) => {
                if (err) {
                    console.error('Error al bloquear productos:', err);
                    return db.rollback(() => res.status(500).json({ error: 'Error al consultar productos' }));
                }

                // Verificar si hay stock suficiente
                let sinStock = null;
                for (const productoBD of results) {
                    const cantidadPedida = cantidadPedidaMap.get(productoBD.id);
                    if (productoBD.stock < cantidadPedida) {
                        sinStock = productoBD.nombre;
                        break;
                    }
                }

                if (sinStock) {
                    return db.rollback(() => {
                        res.status(400).json({ error: `Lo sentimos, no hay suficiente stock de: ${sinStock}` });
                    });
                }

                // 4. Si hay stock, ACTUALIZAR el stock
                let sqlUpdate = 'UPDATE productos SET stock = CASE id_producto ';
                const updateParams = [];
                productos.forEach(item => {
                    sqlUpdate += 'WHEN ? THEN stock - ? ';
                    updateParams.push(item.producto.id, item.cantidad);
                });
                sqlUpdate += 'END WHERE id_producto IN (?)';
                updateParams.push(productIds);

                db.query(sqlUpdate, updateParams, (err, updateResult) => {
                    if (err) {
                        console.error('Error al actualizar stock:', err);
                        return db.rollback(() => res.status(500).json({ error: 'Error al actualizar el stock' }));
                    }

                    // --- 5. LÓGICA DEL PEDIDO (MAESTRO) ---
                    // Insertamos en la tabla 'pedido' (singular)
                    const sqlPedido = "INSERT INTO pedido (id_usuario, total, estado, fecha_pedido) VALUES (?, ?, ?, NOW())";
                    
                    db.query(sqlPedido, [id_usuario, total, 'Pagado'], (err, resultPedido) => {
                        if (err) {
                            console.error('Error al crear pedido maestro:', err);
                            return db.rollback(() => res.status(500).json({ error: 'Error al guardar el pedido' }));
                        }

                        const newPedidoId = resultPedido.insertId;

                        // --- 6. LÓGICA DEL DETALLE_PEDIDO ---
                        const sqlDetalle = "INSERT INTO detalle_pedido (id_pedido, id_producto, cantidad, subtotal) VALUES ?";
                        
                        const detalleValues = productos.map(item => [
                            newPedidoId,
                            item.producto.id,
                            item.cantidad,
                            Number(item.producto.precio) * item.cantidad
                        ]);

                        db.query(sqlDetalle, [detalleValues], (err, resultDetalle) => {
                            if (err) {
                                console.error('Error al crear detalle de pedido:', err);
                                return db.rollback(() => res.status(500).json({ error: 'Error al guardar los detalles del pedido' }));
                            }

                            // --- 7. ÉXITO: Confirmar todo ---
                            db.commit((err) => {
                                if (err) {
                                    return db.rollback(() => res.status(500).json({ error: 'Error al confirmar la transacción' }));
                                }
                                console.log('¡Pedido completo guardado con ID:', newPedidoId);
                                res.status(201).json({ message: 'Pedido guardado con éxito', pedidoId: newPedidoId });
                            });
                        });
                    });
                });
            });
        } catch (error) {
            console.error('Error inesperado:', error);
            db.rollback(() => {
                res.status(500).json({ error: 'Error inesperado en la transacción' });
            });
        }
    });
});

// --- 4. Encender el Servidor (Debe ser lo último) ---
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
});