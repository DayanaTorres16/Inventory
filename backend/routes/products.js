const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/:storeId', (req, res) => {
  const storeId = req.params.storeId;
  const query = `
    SELECT 
      p.ID_PRODUCTO,
      p.NOMBRE,
      p.DESCRIPCION,
      p.PRECIO,
      a.NOMBRE_ATRIBUTO,
      pa.VALOR_ATRIBUTO,
      s.STOCK_FINAL AS stock,
      pa.ID_PRODUCTO_ATRIBUTO
    FROM productos p
    LEFT JOIN producto_atributos pa ON p.ID_PRODUCTO = pa.ID_PRODUCTO
    LEFT JOIN atributos a ON pa.ID_ATRIBUTO = a.ID_ATRIBUTO
    LEFT JOIN stock s ON pa.ID_PRODUCTO_ATRIBUTO = s.ID_PRODUCTO_ATRIBUTO 
    WHERE p.ID_TIENDA = ?
    ORDER BY p.ID_PRODUCTO, a.NOMBRE_ATRIBUTO, pa.VALOR_ATRIBUTO;
  `;

  db.query(query, [storeId], (err, results) => {
    if (err) {
      console.error('Error al obtener productos:', err);
      res.status(500).json({ error: 'Error al obtener productos' });
      return;
    }

    const productosAgrupados = results.reduce((acc, producto) => {
      const productoExistente = acc.find(p => p.ID_PRODUCTO === producto.ID_PRODUCTO);
      if (productoExistente) {
        productoExistente.atributos.push({
          NOMBRE_ATRIBUTO: producto.NOMBRE_ATRIBUTO,
          VALOR_ATRIBUTO: producto.VALOR_ATRIBUTO,
          stock: producto.stock,
          ID_PRODUCTO_ATRIBUTO: producto.ID_PRODUCTO_ATRIBUTO,
        });
      } else {
        acc.push({
          ID_PRODUCTO: producto.ID_PRODUCTO,
          NOMBRE: producto.NOMBRE,
          DESCRIPCION: producto.DESCRIPCION,
          PRECIO: producto.PRECIO,
          atributos: [{
            NOMBRE_ATRIBUTO: producto.NOMBRE_ATRIBUTO,
            VALOR_ATRIBUTO: producto.VALOR_ATRIBUTO,
            stock: producto.stock,
            ID_PRODUCTO_ATRIBUTO: producto.ID_PRODUCTO_ATRIBUTO,
          }],
        });
      }
      return acc;
    }, []);

    res.json(productosAgrupados);
  });
});

router.delete('/:id', (req, res) => {
  const id = req.params.id;

  db.getConnection((err, connection) => {
    if (err) {
      console.error('Error al obtener conexión:', err);
      return res.status(500).json({ error: 'Error al obtener conexión' });
    }

    connection.beginTransaction((err) => {
      if (err) {
        connection.release();
        console.error('Error al iniciar transacción:', err);
        return res.status(500).json({ error: 'Error al iniciar transacción' });
      }

      // Eliminar registros de stock
      connection.query('DELETE FROM stock WHERE ID_PRODUCTO_ATRIBUTO IN (SELECT ID_PRODUCTO_ATRIBUTO FROM producto_atributos WHERE ID_PRODUCTO = ?)', [id], (errStock) => {
        if (errStock) {
          return connection.rollback(() => {
            connection.release();
            console.error('Error al eliminar stock:', errStock);
            return res.status(500).json({ error: 'Error al eliminar stock' });
          });
        }

        // Eliminar registros de producto_atributos
        connection.query('DELETE FROM producto_atributos WHERE ID_PRODUCTO = ?', [id], (errAtributos) => {
          if (errAtributos) {
            return connection.rollback(() => {
              connection.release();
              console.error('Error al eliminar atributos:', errAtributos);
              return res.status(500).json({ error: 'Error al eliminar atributos' });
            });
          }

          // Eliminar registro de productos
          connection.query('DELETE FROM productos WHERE ID_PRODUCTO = ?', [id], (errProducto) => {
            if (errProducto) {
              return connection.rollback(() => {
                connection.release();
                console.error('Error al eliminar producto:', errProducto);
                return res.status(500).json({ error: 'Error al eliminar producto' });
              });
            }

            connection.commit((err) => {
              if (err) {
                return connection.rollback(() => {
                  connection.release();
                  console.error('Error al confirmar transacción:', err);
                  return res.status(500).json({ error: 'Error al confirmar transacción' });
                });
              } else {
                connection.release();
                res.json({ message: 'Producto y sus atributos/stock eliminados' });
              }
            });
          });
        });
      });
    });
  });
});

router.delete('/producto_atributos/:id_producto_atributo', (req, res) => {
  const { id_producto_atributo } = req.params;

  db.getConnection((err, connection) => {
    if (err) {
      console.error('Error al obtener conexión:', err);
      return res.status(500).json({ error: 'Error al obtener conexión' });
    }

    connection.beginTransaction((err) => {
      if (err) {
        connection.release();
        console.error('Error al iniciar transacción:', err);
        return res.status(500).json({ error: 'Error al iniciar transacción' });
      }

      // Eliminar registros de stock
      connection.query('DELETE FROM stock WHERE ID_PRODUCTO_ATRIBUTO = ?', [id_producto_atributo], (errStock) => {
        if (errStock) {
          return connection.rollback(() => {
            connection.release();
            console.error('Error al eliminar stock:', errStock);
            return res.status(500).json({ error: 'Error al eliminar stock' });
          });
        }

        // Eliminar registro de producto_atributos
        connection.query('DELETE FROM producto_atributos WHERE ID_PRODUCTO_ATRIBUTO = ?', [id_producto_atributo], (errAtributos) => {
          if (errAtributos) {
            return connection.rollback(() => {
              connection.release();
              console.error('Error al eliminar atributo:', errAtributos);
              return res.status(500).json({ error: 'Error al eliminar atributo' });
            });
          }

          connection.commit((err) => {
            if (err) {
              return connection.rollback(() => {
                connection.release();
                console.error('Error al confirmar transacción:', err);
                return res.status(500).json({ error: 'Error al confirmar transacción' });
              });
            } else {
              connection.release();
              res.json({ message: 'Atributo eliminado' });
            }
          });
        });
      });
    });
  });
});

router.put('/:id/update', (req, res) => {
  const id = req.params.id;
  const { nombre, precio, stock } = req.body;

  let updatePromises = [];

  // Actualizar nombre y precio 
  if (nombre || precio) {
    let updateQuery = 'UPDATE productos SET ';
    let updateParams = [];
    let updates = [];

    if (nombre) {
      updates.push('NOMBRE = ?');
      updateParams.push(nombre);
    }

    if (precio) {
      updates.push('PRECIO = ?');
      updateParams.push(precio);
    }

    updateQuery += updates.join(', ') + ' WHERE ID_PRODUCTO = ?';
    updateParams.push(id);

    updatePromises.push(new Promise((resolve, reject) => {
      db.query(updateQuery, updateParams, (err, result) => {
        if (err) {
          reject({ error: 'Error al actualizar información del producto', details: err });
        } else {
          resolve();
        }
      });
    }));
  }

  // Actualizar stock 
  if (stock) {
    updatePromises.push(new Promise((resolve, reject) => {
      db.query('UPDATE stock SET STOCK_FINAL = STOCK_FINAL + ? WHERE ID_PRODUCTO_ATRIBUTO IN (SELECT ID_PRODUCTO_ATRIBUTO FROM producto_atributos WHERE ID_PRODUCTO = ?)',
        [stock, id],
        (err, result) => {
          if (err) {
            reject({ error: 'Error al actualizar stock del producto', details: err });
          } else {
            resolve();
          }
        }
      );
    }));
  }

  Promise.all(updatePromises)
    .then(() => {
      res.json({ message:'Producto actualizado correctamente' });
    })
    .catch(err => {
      res.status(500).json(err);
    });
});

router.put('/producto_atributos/:id_producto_atributo/stock', (req, res) => {
  const { id_producto_atributo } = req.params;
  const { stock } = req.body;

  db.query('UPDATE stock SET STOCK_FINAL = STOCK_FINAL + ? WHERE ID_PRODUCTO_ATRIBUTO = ?', [stock, id_producto_atributo], (err, result) => {
    if (err) {
      console.error('Error al actualizar stock del atributo:', err);
      return res.status(500).json({ error: 'Error al actualizar stock del atributo' });
    }
    res.json({ message: 'Stock del atributo actualizado (sumado)' });
  });
});

router.post('/', async (req, res) => {
  const { nombre, descripcion, precio, id_tienda, atributos } = req.body;

  try {
    const [productoResult] = await db.promise().query(
      'INSERT INTO productos (NOMBRE, DESCRIPCION, PRECIO, ID_TIENDA) VALUES (?, ?, ?, ?)',
      [nombre, descripcion, precio, id_tienda]
    );

    const idProducto = productoResult.insertId;

    if (!atributos || atributos.length === 0) {
      return res.json({ message: 'Producto agregado sin atributos', id_producto: idProducto });
    }

    await Promise.all(atributos.map(async (atributo) => {
      let idAtributo;

      // Verificar si el atributo ya existe
      const [resultado] = await db.promise().query(
        'SELECT ID_ATRIBUTO FROM atributos WHERE NOMBRE_ATRIBUTO = ?',
        [atributo.nombre]
      );

      if (resultado.length > 0) {
        idAtributo = resultado[0].ID_ATRIBUTO;
      } else {
        // Insertar nuevo atributo si no existe
        const [nuevoAtributo] = await db.promise().query(
          'INSERT INTO atributos (NOMBRE_ATRIBUTO) VALUES (?)',
          [atributo.nombre]
        );
        idAtributo = nuevoAtributo.insertId;
      }

      // Insertar en producto_atributos
      const [productoAtributoResult] = await db.promise().query(
        'INSERT INTO producto_atributos (ID_PRODUCTO, ID_ATRIBUTO, VALOR_ATRIBUTO) VALUES (?, ?, ?)',
        [idProducto, idAtributo, atributo.valor]
      );

      const idProductoAtributo = productoAtributoResult.insertId;

      // Insertar en stock
      await db.promise().query(
        'INSERT INTO stock (ID_PRODUCTO_ATRIBUTO, STOCK_INICIAL, STOCK_FINAL) VALUES (?, ?, ?)',
        [idProductoAtributo, atributo.stock, atributo.stock]
      );
    }));

    res.json({ message: 'Producto agregado con éxito', id_producto: idProducto });

  } catch (error) {
    console.error('Error al agregar producto:', error);
    res.status(500).json({ error: 'Error al agregar producto', message: error.message });
  }
});

// Modificación del endpoint de ventas para validar stock
router.post('/sales', (req, res) => {
  const { storeId, userId, items } = req.body;
  console.log("Datos recibidos en backend:", { storeId, userId, items });

  db.getConnection((err, connection) => {
    if (err) {
      console.error("Error de conexión a la base de datos:", err);
      return res.status(500).json({ message: 'Error de conexión a la base de datos', error: err });
    }

    connection.beginTransaction(err => {
      if (err) {
        console.error("Error al iniciar transacción:", err);
        connection.release();
        return res.status(500).json({ message: 'Error al iniciar transacción', error: err });
      }

      const stockChecks = items.map(item => new Promise((resolve, reject) => {
        connection.query(
          'SELECT STOCK_FINAL FROM stock WHERE ID_PRODUCTO_ATRIBUTO = ?',
          [item.atributoId],
          (err, results) => {
            if (err) {
              return reject({ error: err, message: 'Error al verificar stock' });
            }
            
            if (!results || results.length === 0) {
              return reject({ error: 'No stock record', message: 'No existe registro de stock para este producto' });
            }
            
            const stockDisponible = results[0].STOCK_FINAL;
            if (stockDisponible < item.cantidad) {

              const error = {
                stockError: true,
                message: `Stock insuficiente para el producto con ID ${item.atributoId}. Disponible: ${stockDisponible}, Solicitado: ${item.cantidad}`
              };
              return reject(error);
            }
            
            resolve(true);
          }
        );
      }));

      // Verificar todo el stock antes de continuar
      Promise.all(stockChecks)
        .then(() => {
          // Todo el stock está disponible, procedemos con la venta
          const totalVenta = items.reduce((total, item) => total + item.cantidad * item.precioUnitario, 0);
          
          connection.query(
            'INSERT INTO venta (FECHA_VENTA, TOTAL, ID_USUARIO, ID_TIENDA) VALUES (CURDATE(), ?, ?, ?)',
            [totalVenta, userId, storeId],
            (err, ventaResult) => {
              if (err) {
                console.error("Error al registrar venta:", err);
                return connection.rollback(() => {
                  connection.release();
                  res.status(500).json({ message: 'Error al registrar venta', error: err });
                });
              }

              const ventaId = ventaResult.insertId;
              
              const promises = items.map(item => new Promise((resolve, reject) => {
                // Insertar detalle de venta
                connection.query(
                  'INSERT INTO detalle_venta (ID_VENTA, ID_PRODUCTO, ID_PRODUCTO_ATRIBUTO, CANTIDAD, PRECIO_UNITARIO, SUBTOTAL) VALUES (?, ?, ?, ?, ?, ?)',
                  [ventaId, item.productoId, item.atributoId, item.cantidad, item.precioUnitario, item.cantidad * item.precioUnitario],
                  (err) => {
                    if (err) {
                      return reject(err);
                    }
                    resolve();
                  }
                );
              }));

              Promise.all(promises)
                .then(() => {
                  connection.commit(err => {
                    if (err) {
                      console.error("Error al confirmar transacción:", err);
                      return connection.rollback(() => {
                        connection.release();
                        res.status(500).json({ message: 'Error al confirmar transacción', error: err });
                      });
                    }
                    
                    console.log("Venta registrada con éxito");
                    res.json({ message: 'Venta registrada con éxito' });
                    connection.release();
                  });
                })
                .catch(err => {
                  console.error("Error en la transacción:", err);
                  connection.rollback(() => {
                    connection.release();
                    res.status(500).json({ message: 'Error al registrar detalles de venta', error: err });
                  });
                });
            }
          );
        })
        .catch(error => {
          console.error("Error en verificación de stock:", error);
          connection.rollback(() => {
            connection.release();
            if (error.stockError) {
              return res.status(400).json({ stockError: error.message });
            }
            res.status(500).json({ message: 'Error al verificar stock de productos', error: error });
          });
        });
    });
  });
});

module.exports = router;