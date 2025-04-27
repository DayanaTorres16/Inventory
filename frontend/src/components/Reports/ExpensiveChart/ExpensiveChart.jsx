import React, { useEffect, useState } from 'react';
import { Scatter } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDollarSign } from '@fortawesome/free-solid-svg-icons';
import '../Diagramas.css';

Chart.register(...registerables);

const ExpensiveChart = ({ storeId }) => {
    const [datos, setDatos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await axios.get(`https://inventorybackend-cv1q.onrender.com/api/productsReport/expensive?storeId=${storeId}`);
                setDatos(res.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [storeId]);

    if (loading) return <div>Cargando...</div>;
    if (error) return <div>Error: {error}</div>;

    const chartData = {
        datasets: [
            {
                label: 'Precio',
                data: datos.map((producto, index) => ({
                    x: index, 
                    y: producto.PRECIO,
                })),
                backgroundColor: 'rgba(211, 235, 205, 0.8)',
                borderColor: 'rgba(172, 230, 192)', 
                pointRadius: 5,
                pointHoverRadius: 8, 
            },
        ],
    };

    const chartOptions = {
        scales: {
            x: {
                type: 'linear',
                position: 'bottom',
                ticks: {
                    callback: function(value) { 
                        return datos[value] ? datos[value].NOMBRE : '';
                    }
                }
            },
            y: {
                beginAtZero: true,
            },
        },
    };

    return (
        <div className="expensive-chart-container">
            <FontAwesomeIcon icon={faDollarSign} style={{ color: 'red' }} />Productos más Caros
            <Scatter data={chartData} options={chartOptions} />
        </div>
    );
};

export default ExpensiveChart;