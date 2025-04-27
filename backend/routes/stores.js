const express = require('express');
const router = express.Router();
const db = require('../db');

// Middleware para verificar parámetros 
const validateStoreParams = (req, res, next) => {
    const storeId = req.params.id;
    if (!storeId || isNaN(Number(storeId))) {
        return res.status(400).json({ error: 'ID de tienda inválido' });
    }
    next();
};
// Obtener todas las tiendas
router.get('/', (req, res) => {
    const sql = 'SELECT ID_TIENDA, NOMBRE_TIENDA FROM tienda';
    
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error al obtener tiendas:', err);
            return res.status(500).json({ error: 'Error al obtener tiendas', details: err.message });
        }
        res.json(results.length ? results : []);
    });
});

// Obtener información de una tienda específica
router.get('/:id', validateStoreParams, (req, res) => {
    const storeId = req.params.id;
    const sql = 'SELECT ID_TIENDA, NOMBRE_TIENDA FROM tienda WHERE ID_TIENDA = ?';
    
    db.query(sql, [storeId], (err, results) => {
        if (err) {
            console.error('Error al obtener información de la tienda:', err);
            return res.status(500).json({ error: 'Error al obtener información de la tienda', details: err.message });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ error: 'Tienda no encontrada' });
        }
        
        res.json(results[0]);
    });
});
module.exports = router;