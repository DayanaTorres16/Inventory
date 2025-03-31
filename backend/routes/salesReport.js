const express = require('express');
const router = express.Router();
const db = require('../db');

// Middleware para validar fechas y storeId
function validateDateParams(req, res, next) {
    const { storeId, startDate, endDate } = req.query;

    if (!storeId || !startDate || !endDate) {
        return res.status(400).json({ error: 'Se requieren storeId, startDate y endDate' });
    }

    if (isNaN(Number(storeId))) {
        return res.status(400).json({ error: 'El parámetro storeId debe ser un número válido' });
    }

    // Validación de formato de fecha (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
        return res.status(400).json({ error: 'Formato de fecha inválido. Use YYYY-MM-DD' });
    }

    req.storeId = Number(storeId);
    req.startDate = startDate;
    req.endDate = endDate;
    next();
}

//Ventas por período
router.get('/period', validateDateParams, (req, res) => {
    db.query(`
        SELECT DATE(FECHA_VENTA) AS fecha, COALESCE(SUM(TOTAL), 0) AS total_ventas
        FROM venta
        WHERE ID_TIENDA = ? AND DATE(FECHA_VENTA) BETWEEN ? AND ?
        GROUP BY DATE(FECHA_VENTA)
        ORDER BY fecha;
    `, [req.storeId, req.startDate, req.endDate], (err, results) => {
        if (err) {
            console.error('Error en la consulta SQL:', err);
            return res.status(500).json({ error: 'Error en la consulta SQL' });
        }
        res.json(results);
    });
});
//Reporte general
//Ventas por producto
router.get('/product', validateDateParams, (req, res) => {
    db.query(`
        SELECT p.ID_PRODUCTO, p.NOMBRE, SUM(dv.CANTIDAD) AS total_vendido
        FROM productos p
        JOIN detalle_venta dv ON p.ID_PRODUCTO = dv.ID_PRODUCTO
        JOIN venta v ON dv.ID_VENTA = v.ID_VENTA
        WHERE p.ID_TIENDA = ? AND DATE(v.FECHA_VENTA) BETWEEN ? AND ?
        GROUP BY p.ID_PRODUCTO, p.NOMBRE
        ORDER BY total_vendido DESC
        LIMIT 10;
    `, [req.storeId, req.startDate, req.endDate], (err, results) => {
        if (err) {
            console.error('Error en la consulta SQL:', err);
            return res.status(500).json({ error: 'Error en la base de datos' });
        }
        res.json(results);
    });
});
router.get('/low-rotation', validateDateParams, (req, res) => { // Corregido aquí
    db.query(`
        SELECT p.NOMBRE AS nombre_producto, SUM(dv.CANTIDAD) AS cantidad_vendida
        FROM productos p
        JOIN detalle_venta dv ON p.ID_PRODUCTO = dv.ID_PRODUCTO
        JOIN venta v ON dv.ID_VENTA = v.ID_VENTA
        WHERE p.ID_TIENDA = ? AND DATE(v.FECHA_VENTA) BETWEEN ? AND ?
        GROUP BY p.NOMBRE
        ORDER BY cantidad_vendida ASC
        LIMIT 10;
    `, [req.storeId, req.startDate, req.endDate], (err, results) => {
        if (err) {
            console.error('Error:', err);
            return res.status(500).json({ error: 'Error en la base de datos' });
        }
        res.json(results);
    });
});

//Productos con alta rotación
router.get('/high-rotation', validateDateParams, (req, res) => { // Corregido aquí
    db.query(`
        SELECT p.NOMBRE AS nombre_producto, SUM(dv.CANTIDAD) AS cantidad_vendida
        FROM productos p
        JOIN detalle_venta dv ON p.ID_PRODUCTO = dv.ID_PRODUCTO
        JOIN venta v ON dv.ID_VENTA = v.ID_VENTA
        WHERE p.ID_TIENDA = ? AND DATE(v.FECHA_VENTA) BETWEEN ? AND ?
        GROUP BY p.NOMBRE
        ORDER BY cantidad_vendida DESC
        LIMIT 10;
    `, [req.storeId, req.startDate, req.endDate], (err, results) => {
        if (err) {
            console.error('Error:', err);
            return res.status(500).json({ error: 'Error en la base de datos' });
        }
        res.json(results);
    });
});

//Reporte ventas
router.get('/sales/total', validateDateParams, (req, res) => {
    db.query(
        `
      SELECT COALESCE(SUM(TOTAL), 0) AS total_ingresos
      FROM venta
      WHERE ID_TIENDA = ? AND DATE(FECHA_VENTA) BETWEEN ? AND ?;
      `,
        [req.storeId, req.startDate, req.endDate],
        (err, results) => {
            if (err) {
                console.error('Error en la consulta SQL:', err);
                return res.status(500).json({ error: 'Error en la consulta SQL' });
            }
            res.json(results[0]);
        }
    );
});

router.get('/sales/count', validateDateParams, (req, res) => {
    db.query(
        `
        SELECT COUNT(*) AS total_ventas
        FROM venta
        WHERE ID_TIENDA = ? AND DATE(FECHA_VENTA) BETWEEN ? AND ?;
      `,
        [req.storeId, req.startDate, req.endDate],
        (err, results) => {
            if (err) {
                console.error('Error en la consulta SQL:', err);
                return res.status(500).json({ error: 'Error en la consulta SQL' });
            }
            res.json(results[0]);
        }
    );
});

router.get('/products/total', validateDateParams, (req, res) => {
    db.query(
        `
        SELECT SUM(dv.CANTIDAD) AS total_productos_vendidos
        FROM detalle_venta dv
        JOIN venta v ON dv.ID_VENTA = v.ID_VENTA
        WHERE v.ID_TIENDA = ? AND DATE(v.FECHA_VENTA) BETWEEN ? AND ?;
      `,
        [req.storeId, req.startDate, req.endDate],
        (err, results) => {
            if (err) {
                console.error('Error en la consulta SQL:', err);
                return res.status(500).json({ error: 'Error en la consulta SQL' });
            }
            res.json(results[0]);
        }
    );
});

//Venta producto por atributo
router.get('/best-selling-attributes', validateDateParams, (req, res) => {
    db.query(`
        SELECT 
            p.NOMBRE AS nombre_producto, 
            a.NOMBRE_ATRIBUTO AS atributo, 
            pa.VALOR_ATRIBUTO AS valor_atributo, 
            SUM(dv.CANTIDAD) AS cantidad_vendida
        FROM productos p
        JOIN detalle_venta dv ON p.ID_PRODUCTO = dv.ID_PRODUCTO
        JOIN venta v ON dv.ID_VENTA = v.ID_VENTA
        JOIN producto_atributos pa ON p.ID_PRODUCTO = pa.ID_PRODUCTO
        JOIN atributos a ON pa.ID_ATRIBUTO = a.ID_ATRIBUTO
        WHERE p.ID_TIENDA = ? AND DATE(v.FECHA_VENTA) BETWEEN ? AND ?
        GROUP BY p.ID_PRODUCTO, pa.ID_PRODUCTO_ATRIBUTO
        ORDER BY cantidad_vendida DESC
        LIMIT 10;
    `, [req.storeId, req.startDate, req.endDate], (err, results) => {
        if (err) {
            console.error('Error en la consulta SQL:', err);
            return res.status(500).json({ error: 'Error en la base de datos' });
        }
        res.json(results);
    });
});

router.get('/high-rotation-attributes', validateDateParams, (req, res) => {
    db.query(`
        SELECT 
            p.NOMBRE AS nombre_producto, 
            a.NOMBRE_ATRIBUTO AS atributo, 
            pa.VALOR_ATRIBUTO AS valor_atributo, 
            SUM(dv.CANTIDAD) AS cantidad_vendida
        FROM productos p
        JOIN detalle_venta dv ON p.ID_PRODUCTO = dv.ID_PRODUCTO
        JOIN venta v ON dv.ID_VENTA = v.ID_VENTA
        JOIN producto_atributos pa ON p.ID_PRODUCTO = pa.ID_PRODUCTO
        JOIN atributos a ON pa.ID_ATRIBUTO = a.ID_ATRIBUTO
        WHERE p.ID_TIENDA = ? AND DATE(v.FECHA_VENTA) BETWEEN ? AND ?
        GROUP BY p.ID_PRODUCTO, pa.ID_PRODUCTO_ATRIBUTO
        ORDER BY cantidad_vendida DESC
        LIMIT 10;
    `, [req.storeId, req.startDate, req.endDate], (err, results) => {
        if (err) {
            console.error('Error en la consulta SQL:', err);
            return res.status(500).json({ error: 'Error en la base de datos' });
        }
        res.json(results);
    });
});

router.get('/low-rotation-attributes', validateDateParams, (req, res) => {
    db.query(`
        SELECT 
            p.NOMBRE AS nombre_producto, 
            a.NOMBRE_ATRIBUTO AS atributo, 
            pa.VALOR_ATRIBUTO AS valor_atributo, 
            SUM(dv.CANTIDAD) AS cantidad_vendida
        FROM productos p
        JOIN detalle_venta dv ON p.ID_PRODUCTO = dv.ID_PRODUCTO
        JOIN venta v ON dv.ID_VENTA = v.ID_VENTA
        JOIN producto_atributos pa ON p.ID_PRODUCTO = pa.ID_PRODUCTO
        JOIN atributos a ON pa.ID_ATRIBUTO = a.ID_ATRIBUTO
        WHERE p.ID_TIENDA = ? AND DATE(v.FECHA_VENTA) BETWEEN ? AND ?
        GROUP BY p.ID_PRODUCTO, pa.ID_PRODUCTO_ATRIBUTO
        ORDER BY cantidad_vendida ASC
        LIMIT 10;
    `, [req.storeId, req.startDate, req.endDate], (err, results) => {
        if (err) {
            console.error('Error en la consulta SQL:', err);
            return res.status(500).json({ error: 'Error en la base de datos' });
        }
        res.json(results);
    });
});
module.exports = router;