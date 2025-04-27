import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Pie } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import '../Diagramas.css';

Chart.register(...registerables);

const HighRotationAttributesChart = ({ storeId, dateRange }) => {
    const [productosAltaRotacion, setProductosAltaRotacion] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const cargarProductosAltaRotacion = async () => {
            if (!storeId || !dateRange || !dateRange.startDate || !dateRange.endDate) {
                setLoading(false);
                setError('Fechas inválidas.');
                return;
            }

            try {
                const startDate = dateRange.startDate instanceof Date ? dateRange.startDate : new Date(dateRange.startDate);
                const endDate = dateRange.endDate instanceof Date ? dateRange.endDate : new Date(dateRange.endDate);

                setLoading(true);
                const response = await axios.get(`https://inventorybackend-cv1q.onrender.com/api/salesreport/high-rotation-attributes`, {
                    params: {
                        storeId,
                        startDate: startDate.toISOString().split('T')[0],
                        endDate: endDate.toISOString().split('T')[0],
                    },
                });
                setProductosAltaRotacion(response.data);
            } catch (err) {
                setError(err.message || 'Error desconocido al cargar los datos.');
            } finally {
                setLoading(false);
            }
        };

        cargarProductosAltaRotacion();
    }, [storeId, dateRange]);

    if (loading) return <div>Cargando...</div>;
    if (error) return <div>Error al cargar los datos: {error}</div>;

    const data = {
        labels: productosAltaRotacion.map(
            (producto) => `${producto.nombre_producto} (${producto.atributo}: ${producto.valor_atributo})`
        ),
        datasets: [
            {
                label: 'Cantidad Vendida',
                data: productosAltaRotacion.map((producto) => producto.cantidad_vendida),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(153, 102, 255, 0.6)',
                    'rgba(255, 159, 64, 0.6)',
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

    const options = {
        plugins: {
            legend: {
                display: true,
                position: 'right', 
            },
            title: {
                display: true,
                text: 'Productos de Alta Rotación con Atributos',
                font: {
                    size: 18,
                },
            },
        },
        responsive: true, 
        maintainAspectRatio: false, 
    };

    return (
        <div className="high-rotaction-chart-container"> 
            <Pie data={data} options={options} />
        </div>
    );
};

export default HighRotationAttributesChart;