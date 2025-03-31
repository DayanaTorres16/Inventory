const express = require('express');
const router = express.Router();
const db = require('../db');

function validateParams(req, res, next) {
    const { storeId } = req.query;

    if (!storeId) {
        return res.status(400).json({ error: 'Se requiere el parámetro storeId' });
    }

    if (isNaN(Number(storeId))) {
        return res.status(400).json({ error: 'El parámetro storeId debe ser un número válido' });
    }

    req.storeId = Number(storeId);
    next();
}

router.get('/expensive/count', validateParams, (req, res) => {
    const sql = `
        SELECT COUNT(*) AS cantidad_productos_mas_caros
        FROM productos
        WHERE ID_TIENDA = ?
        AND PRECIO > 50;
    `;

    db.query(sql, [req.storeId], (err, results) => {
        if (err) {
            console.error('Error en la consulta de cantidad de productos caros:', err);
            return res.status(500).json({ error: 'Error en la consulta', details: err.message });
        }
        res.json(results[0]);
    });
});

router.get('/cheap/count', validateParams, (req, res) => {
    const sql = `
        SELECT COUNT(*) AS cantidad_productos_mas_baratos
        FROM productos
        WHERE ID_TIENDA = ?
        AND PRECIO < 20;
    `;

    db.query(sql, [req.storeId], (err, results) => {
        if (err) {
            console.error('Error en la consulta de cantidad de productos baratos:', err);
            return res.status(500).json({ error: 'Error en la consulta', details: err.message });
        }
        res.json(results[0]);
    });
});

router.get('/expensive', validateParams, (req, res) => {
    const sql = `
        SELECT *
        FROM productos
        WHERE ID_TIENDA = ?
        AND PRECIO > 50
        LIMIT 10;
    `;

    db.query(sql, [req.storeId], (err, results) => {
        if (err) {
            console.error('Error en la consulta de productos caros:', err);
            return res.status(500).json({ error: 'Error en la consulta', details: err.message });
        }
        res.json(results);
    });
});


router.get('/cheap', validateParams, (req, res) => {
    const sql = `
        SELECT *
        FROM productos
        WHERE ID_TIENDA = ?
        AND PRECIO < 20
        LIMIT 10;
    `;

    db.query(sql, [req.storeId], (err, results) => {
        if (err) {
            console.error('Error en la consulta de productos baratos:', err);
            return res.status(500).json({ error: 'Error en la consulta', details: err.message });
        }
        res.json(results);
    });
});


router.get('/max-attributes', validateParams, (req, res) => {
    const sql = `
        SELECT
            p.NOMBRE AS NOMBRE_PRODUCTO,
            COUNT(pa.ID_PRODUCTO_ATRIBUTO) AS CANTIDAD_ATRIBUTOS
        FROM
            productos p
        JOIN
            producto_atributos pa ON p.ID_PRODUCTO = pa.ID_PRODUCTO
        WHERE
            p.ID_TIENDA = ?
        GROUP BY
            p.ID_PRODUCTO, p.NOMBRE
        HAVING
            COUNT(pa.ID_PRODUCTO_ATRIBUTO) = (
                SELECT MAX(attr_count)
                FROM (
                    SELECT COUNT(pa2.ID_PRODUCTO_ATRIBUTO) AS attr_count
                    FROM productos p2
                    JOIN producto_atributos pa2 ON p2.ID_PRODUCTO = pa2.ID_PRODUCTO
                    WHERE p2.ID_TIENDA = ?
                    GROUP BY p2.ID_PRODUCTO
                ) AS counts
            )
        ORDER BY
            CANTIDAD_ATRIBUTOS DESC
            LIMIT 10;
    `;

    db.query(sql, [req.storeId, req.storeId], (err, results) => {
        if (err) {
            console.error('Error en la consulta de productos con más atributos:', err);
            return res.status(500).json({ error: 'Error en la consulta', details: err.message });
        }
        res.json(results);
    });
});

module.exports = router;