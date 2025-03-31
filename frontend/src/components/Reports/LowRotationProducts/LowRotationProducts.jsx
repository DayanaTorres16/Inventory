import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../Tablas.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleExclamation } from '@fortawesome/free-solid-svg-icons'; 

const LowRotationProducts = ({ storeId, dateRange }) => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('ProductosBajaRotacion: useEffect triggered');
    console.log('ProductosBajaRotacion: storeId:', storeId, 'dateRange:', dateRange);

    const cargarProductos = async () => {
      if (!storeId || !dateRange || !dateRange.startDate || !dateRange.endDate) {
        setLoading(false);
        setError("Fechas inválidas.");
        return;
      }

      try {
        const startDate = dateRange.startDate instanceof Date ? dateRange.startDate : new Date(dateRange.startDate);
        const endDate = dateRange.endDate instanceof Date ? dateRange.endDate : new Date(dateRange.endDate);

        console.log('ProductosBajaRotacion: startDate:', startDate, 'typeof startDate:', typeof startDate);
        console.log('ProductosBajaRotacion: endDate:', endDate, 'typeof endDate:', typeof endDate);

        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/salesreport/low-rotation`, {
          params: {
            storeId,
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0]
          },
        });
        setProductos(response.data);
      } catch (err) {
        setError(err.message || "Error desconocido al cargar los datos.");
      } finally {
        setLoading(false);
      }
    };

    cargarProductos();
  }, [storeId, dateRange]);

  useEffect(() => {
    console.log('ProductosBajaRotacion: component mounted or updated');
  });

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error al cargar los datos: {error}</div>;

  return (
    <div className="table-container table-low-rotation">
      <h2>Productos de Baja Rotación</h2>
      {productos.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th></th> 
              <th>Nombre del Producto</th>
              <th>Cantidad Vendida</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((producto, index) => (
              <tr key={index}>
                <td><FontAwesomeIcon icon={faCircleExclamation} /></td> 
                <td>{producto.nombre_producto}</td>
                <td>{producto.cantidad_vendida}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No hay productos de baja rotación</p>
      )}
    </div>
  );
};

export default LowRotationProducts;