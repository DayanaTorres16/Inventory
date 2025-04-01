import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../Tablas.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartArrowDown } from '@fortawesome/free-solid-svg-icons';

const HighRotationProducts = ({ storeId, dateRange }) => {
  const [productosAltaRotacion, setProductosAltaRotacion] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarProductosAltaRotacion = async () => {
      if (!storeId || !dateRange || !dateRange.startDate || !dateRange.endDate) {
        setLoading(false);
        setError("Fechas inválidas.");
        return;
      }

      try {
        const startDate = dateRange.startDate instanceof Date ? dateRange.startDate : new Date(dateRange.startDate);
        const endDate = dateRange.endDate instanceof Date ? dateRange.endDate : new Date(dateRange.endDate);

        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/salesreport/high-rotation`, {
          params: {
            storeId,
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0]
          },
        });
        setProductosAltaRotacion(response.data);
      } catch (err) {
        setError(err.message || "Error desconocido al cargar los datos.");
      } finally {
        setLoading(false);
      }
    };

    cargarProductosAltaRotacion();
  }, [storeId, dateRange]);

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error al cargar los datos: {error}</div>;

  return (
    <div className="table-container table-high-rotation">
      <div className="table-header">
        <h2>
          <FontAwesomeIcon icon={faCartArrowDown} style={{ color: 'blue', marginRight: '8px' }} />
          Productos Alta Rotación
        </h2>
      </div>
      <p className="table-description">
        Productos que se venden frecuentemente
      </p>
      <table>
        <thead>
          <tr>
          <th></th>
            <th>Producto</th>
            <th>Cantidad Vendida</th>
          </tr>
        </thead>
        <tbody>
          {productosAltaRotacion.map((producto, index) => (
            <tr key={index}>
              <td>
                <FontAwesomeIcon icon={faCartArrowDown} style={{ color: 'blue', marginRight: '8px' }} />
              </td>
              <td>
                {producto.nombre_producto}
              </td>
              <td>{producto.cantidad_vendida}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HighRotationProducts;