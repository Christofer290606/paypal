import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import catalogoRoutes from './routes/catalogoRoute.js';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/catalogo', catalogoRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
