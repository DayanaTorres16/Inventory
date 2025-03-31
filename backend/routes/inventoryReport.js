const express = require('express');
const router = express.Router();
const db = require('../db');

function validateParams(req, res, next) {
    const { storeId } = req.query;

    if (!storeId) {
        return res.status(400).json({ error: 'Se requiere el parámetro storeId' });
    }

    const storeIdNum = Number(storeId);
    if (isNaN(storeIdNum)) {
        return res.status(400).json({ error: 'El parámetro storeId debe ser un número válido' });
    }

    req.storeId = storeIdNum;
    next();
}

router.get('/total-value', (req, res) => {
  const sql = `
      SELECT 
          SUM(p.PRECIO * s.STOCK_FINAL) AS valor_total_inventario
      FROM stock s
      JOIN producto_atributos pa ON s.ID_PRODUCTO_ATRIBUTO = pa.ID_PRODUCTO_ATRIBUTO
      JOIN productos p ON pa.ID_PRODUCTO = p.ID_PRODUCTO
      WHERE p.ID_TIENDA = ?;
  `;

  db.query(sql, [req.query.storeId], (err, results) => {
      if (err) {
          console.error('Error en la consulta del valor total del inventario:', err);
          return res.status(500).json({ error: 'Error en la consulta del valor total del inventario', details: err.message });
      }
      res.json({ valor_total_inventario: results[0]?.valor_total_inventario ?? 0 });
  });
});

router.get('/total-quantity', (req, res) => {
  const sql = `
      SELECT 
          SUM(s.STOCK_FINAL) AS cantidad_total_productos
      FROM stock s
      JOIN producto_atributos pa ON s.ID_PRODUCTO_ATRIBUTO = pa.ID_PRODUCTO_ATRIBUTO
      JOIN productos p ON pa.ID_PRODUCTO = p.ID_PRODUCTO
      WHERE p.ID_TIENDA = ?;
  `;

  db.query(sql, [req.query.storeId], (err, results) => {
      if (err) {
          console.error('Error en la consulta de la cantidad total de productos:', err);
          return res.status(500).json({ error: 'Error en la consulta de la cantidad total de productos', details: err.message });
      }
      res.json({ cantidad_total_productos: results[0]?.cantidad_total_productos ?? 0 });
  });
});

// Productos con stock bajo por tienda
router.get('/minimum', validateParams, (req, res) => {
    const sql = `
        SELECT 
            p.NOMBRE AS nombre_producto,
            JSON_ARRAYAGG(
                JSON_OBJECT(
                    'atributo', a.NOMBRE_ATRIBUTO,
                    'valor', pa.VALOR_ATRIBUTO,
                    'stock_minimo', s.STOCK_FINAL
                )
            ) AS atributos
        FROM stock s
        JOIN producto_atributos pa ON s.ID_PRODUCTO_ATRIBUTO = pa.ID_PRODUCTO_ATRIBUTO
        JOIN atributos a ON pa.ID_ATRIBUTO = a.ID_ATRIBUTO
        JOIN productos p ON pa.ID_PRODUCTO = p.ID_PRODUCTO
        WHERE s.STOCK_FINAL <= 10
        AND p.ID_TIENDA = ?
        GROUP BY p.NOMBRE;
    `;

    db.query(sql, [req.storeId], (err, results) => {
        if (err) {
            console.error('Error en la consulta de stock bajo:', err);
            return res.status(500).json({ error: 'Error en la consulta de stock bajo', details: err.message });
        }
        res.json(results.length ? results : []);
    });
});

// Productos con stock alto por tienda 
router.get('/maximum', validateParams, (req, res) => {
    const sql = `
        SELECT
            p.NOMBRE AS nombre_producto,
            s.STOCK_FINAL AS stock_actual
        FROM stock s
        JOIN producto_atributos pa ON s.ID_PRODUCTO_ATRIBUTO = pa.ID_PRODUCTO_ATRIBUTO
        JOIN productos p ON pa.ID_PRODUCTO = p.ID_PRODUCTO
        WHERE s.STOCK_FINAL >= 100 
        AND p.ID_TIENDA = ?;
    `;

    db.query(sql, [req.storeId], (err, results) => {
        if (err) {
            console.error('Error en la consulta de stock alto:', err);
            return res.status(500).json({ error: 'Error en la consulta de stock alto' });
        }
        res.json(results);
    });
});

module.exports = router;

