import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import '../Diagramas.css';

Chart.register(...registerables);

const HighRotationProductsChart = ({ storeId, dateRange }) => {
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

  const data = {
    labels: productosAltaRotacion.map((producto) => producto.nombre_producto),
    datasets: [
      {
        label: 'Cantidad Vendida',
        data: productosAltaRotacion.map((producto) => producto.cantidad_vendida),
        backgroundColor: 'rgba(205, 193, 255, 0.7)',
        borderColor: 'rgba(165, 148, 249',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="high-rotation-products-chart-container">
      <h2>Productos de Alta Rotación</h2>
      <Bar data={data} options={options} />
    </div>
  );
};

export default HighRotationProductsChart;