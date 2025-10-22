import db from '../config/db.js';

export const crearPedido = (req, res) => {
  const { productos, total } = req.body;
  const id_usuario = 1; // Por ahora simula un usuario logueado

  const sqlPedido = 'INSERT INTO pedidos (id_usuario, fecha_pedido, total, estado) VALUES (?, NOW(), ?, "pendiente")';

  db.query(sqlPedido, [id_usuario, total], (err, resultado) => {
    if (err) return res.status(500).json({ error: 'Error al crear pedido' });

    const id_pedido = resultado.insertId;
    const detalles = productos.map(p => [id_pedido, p.id, 1, p.precio]);

    const sqlDetalle = 'INSERT INTO detalle_pedido (id_pedido, id_producto, cantidad, subtotal) VALUES ?';
    db.query(sqlDetalle, [detalles], (err) => {
      if (err) return res.status(500).json({ error: 'Error al registrar detalle' });
      res.json({ mensaje: 'Pedido registrado correctamente', id_pedido });
    });
  });
};
