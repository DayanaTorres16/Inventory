import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import '../Diagramas.css';

function SalesByPeriod({ storeId, dateRange }) {
  const [ventas, setVentas] = useState([]);
  const canvasRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!storeId || !dateRange?.startDate || !dateRange?.endDate) return;

    setLoading(true);
    setError(null);

    const formattedStartDate = new Date(dateRange.startDate).toISOString().split('T')[0];
    const formattedEndDate = new Date(dateRange.endDate).toISOString().split('T')[0];

    fetch(`http://localhost:5000/api/salesReport/period?storeId=${storeId}&startDate=${formattedStartDate}&endDate=${formattedEndDate}`)
      .then(response => response.json())
      .then(data => {
        setVentas(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error al obtener datos:', error);
        setError(error.message);
        setLoading(false);
      });
  }, [storeId, dateRange]);

  useEffect(() => {
    if (ventas.length === 0 || !canvasRef.current) return;

    const chartData = {
      labels: ventas.map(venta => new Date(venta.fecha).toLocaleDateString()),
      datasets: [{
        label: 'Ventas Totales',
        data: ventas.map(venta => parseFloat(venta.total_ventas)),
        fill: false,
        borderColor: 'rgb(247, 168, 196)',
        tension: 0.1,
        pointRadius: 3,
        pointBackgroundColor: 'rgb(172, 23, 84)',
        pointBorderColor: 'rgb(172, 23, 84)'
      }]
    };

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext("2d");
    chartInstanceRef.current = new Chart(ctx, {
      type: 'line',
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: true, 
        layout: {
          padding: 20 
        },
        scales: {
          x: {
            ticks: {
              maxRotation: 45,
              autoSkip: true,
              maxTicksLimit: Math.min(ventas.length, 10) 
            }
          },
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: calculateStepSize(ventas),
              suggestedMax: calculateSuggestedMax(ventas)
            }
          }
        },
        elements: {
          point: {
            radius: 3
          }
        },
        plugins: {
          legend: {
            position: 'top' 
          }
        }
      }
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [ventas]);

  const calculateStepSize = (data) => {
    if (data.length === 0) return 10;
    const maxVenta = Math.max(...data.map(venta => venta.total_ventas));
    if (maxVenta <= 50) return 10;
    if (maxVenta <= 200) return 20;
    return 100;
  };

  const calculateSuggestedMax = (data) => {
    if (data.length === 0) return 50;
    const maxVenta = Math.max(...data.map(venta => venta.total_ventas));
    return Math.ceil(maxVenta * 1.2);
  };

  if (loading) return <div className="loading">Cargando...</div>;
  if (error) return <div className="error">Error al cargar datos: {error}</div>;

  return (
    <div className="sales-by-period-container">
      <h2>Ventas Totales por Período</h2>
      {ventas.length > 0 ? (
        <canvas 
          ref={canvasRef} 
        />
      ) : (
        <p>No hay datos disponibles en el rango seleccionado</p>
      )}
    </div>
  );
}

export default SalesByPeriod;




