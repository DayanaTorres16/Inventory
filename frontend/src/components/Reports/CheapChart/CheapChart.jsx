import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTags } from '@fortawesome/free-solid-svg-icons';
import '../Diagramas.css'; 

Chart.register(...registerables);

const CheapChart = ({ storeId }) => {
    const [datos, setDatos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await axios.get(`http://localhost:5000/api/productsReport/cheap?storeId=${storeId}`);
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
        labels: datos.map((producto) => producto.NOMBRE),
        datasets: [
            {
                label: 'Precio',
                data: datos.map((producto) => producto.PRECIO),
                backgroundColor: 'rgba(255, 197, 197, 0.8)',
                borderColor: 'rgba(213, 126, 155, 1)',
                borderWidth: 1,
                borderRadius: 5, 
            },
        ],
    };

    const chartOptions = {
        scales: {
            y: {
                beginAtZero: true,
            },
        },
    };

    return (
        <div className="cheap-chart-container">
            <div className="titule-seccion">
                <FontAwesomeIcon icon={faTags} style={{ color: 'green' }} /> Productos más Económicos
            </div>
            <Bar data={chartData} options={chartOptions} />
        </div>
    );
};

export default CheapChart;