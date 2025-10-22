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
    const sql = 'SELECT * FROM productos'; 
    
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


// --- 4. Encender el Servidor (Debe ser lo último) ---
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
});