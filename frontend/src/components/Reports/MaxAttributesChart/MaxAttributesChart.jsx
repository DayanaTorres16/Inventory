import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCube } from '@fortawesome/free-solid-svg-icons';
import '../Diagramas.css';

Chart.register(...registerables);

const MaxAttributesChart = ({ storeId }) => {
    const [datos, setDatos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await axios.get(`http://localhost:5000/api/productsReport/max-attributes?storeId=${storeId}`);
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
        labels: datos.map((producto) => producto.NOMBRE_PRODUCTO),
        datasets: [
            {
                label: 'Cantidad de Atributos',
                data: datos.map((producto) => producto.CANTIDAD_ATRIBUTOS),
                backgroundColor: 'rgba(126, 213, 185, 0.8)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
                borderRadius: 5,
            },
        ],
    };

    const chartOptions = {
        indexAxis: 'y',
        scales: {
            x: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Cantidad de Atributos',
                },
            },
            y: {
                title: {
                    display: true,
                    text: 'Nombre del Producto',
                },
            },
        },
    };

    return (
        <div className="max-attributes-chart-container">
            <div className="titulo-seccion">
                <FontAwesomeIcon icon={faCube} style={{ color: 'blue' }} /> Productos con más Atributos
            </div>
            <Bar data={chartData} options={chartOptions} />
        </div>
    );
};

export default MaxAttributesChart;