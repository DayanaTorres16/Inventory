import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';
import '../Diagramas.css';

const BestSellingProducts = ({ storeId, dateRange }) => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarProductos = async () => {
      if (!storeId || !dateRange?.startDate || !dateRange?.endDate) return;

      setLoading(true);
      try {
        const response = await axios.get(`https://inventorybackend-cv1q.onrender.com/api/salesReport/product`, {
          params: {
            storeId,
            startDate: dateRange.startDate,
            endDate: dateRange.endDate
          },
        });
        setProductos(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    cargarProductos();
  }, [storeId, dateRange]);

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error al cargar los datos: {error}</div>;

  const hasData = productos.length > 0;
  const data = {
    labels: hasData ? productos.map((producto) => producto.NOMBRE) : ['Sin datos'],
    datasets: [
      {
        label: 'Cantidad Vendida',
        data: hasData ? productos.map((producto) => producto.total_vendido) : [0],
        backgroundColor: hasData ? 'rgba(183, 224, 255)' : 'rgba(200, 200, 200, 0.5)',
        borderColor: hasData ? 'rgba(135, 162, 255)' : 'rgba(200, 200, 200, 1)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="best-selling-products-container">
      <h2>📈 Productos Más Vendidos</h2>
      {hasData ? <Bar data={data} /> : <p>No hay productos vendidos en el rango seleccionado.</p>}
    </div>
  );
};

export default BestSellingProducts;



