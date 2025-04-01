import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../Tablas.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleExclamation } from '@fortawesome/free-solid-svg-icons';

const LowRotationAttributes = ({ storeId, dateRange }) => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarProductos = async () => {
      if (!storeId || !dateRange || !dateRange.startDate || !dateRange.endDate) {
        setLoading(false);
        setError('Fechas inválidas.');
        return;
      }

      try {
        const startDate = dateRange.startDate instanceof Date ? dateRange.startDate : new Date(dateRange.startDate);
        const endDate = dateRange.endDate instanceof Date ? dateRange.endDate : new Date(dateRange.endDate);

        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/salesreport/low-rotation-attributes`, {
          params: {
            storeId,
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
          },
        });
        setProductos(response.data);
      } catch (err) {
        setError(err.message || 'Error desconocido al cargar los datos.');
      } finally {
        setLoading(false);
      }
    };

    cargarProductos();
  }, [storeId, dateRange]);

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error al cargar los datos: {error}</div>;

  return (
    <div className="table-container table-low-rotation">
      <div className="table-header">
        <h2><FontAwesomeIcon icon={faCircleExclamation} style={{ color: 'Hotpink' }} /> Productos Baja Rotación</h2>
      </div>
      <p className="table-description">
        Productos que no se estan vendiendo casi
      </p>
      {productos.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th></th>
              <th>Nombre del Producto</th>
              <th>Atributo</th>
              <th>Cantidad Vendida</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((producto, index) => (
              <tr key={index}>
                <td>
                  <FontAwesomeIcon icon={faCircleExclamation} style={{ color: 'Hotpink' }}  />
                </td>
                <td>{producto.nombre_producto}</td>
                <td>
                  {producto.atributo && producto.valor_atributo ? (
                    `${producto.atributo}: ${producto.valor_atributo}`
                  ) : (
                    'N/A'
                  )}
                </td>
                <td>{producto.cantidad_vendida}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No hay productos de baja rotación con atributos</p>
      )}
    </div>
  );
};

export default LowRotationAttributes;