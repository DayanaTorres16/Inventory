import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDollarSign } from '@fortawesome/free-solid-svg-icons';
import '../Tablas.css';

const Expensive = ({ storeId }) => {
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

    const columnas = ['ID_PRODUCTO', 'NOMBRE', 'PRECIO']; 

    return (
        <div className="table-container">
            <div className="titule-seccion">
            <h3> <FontAwesomeIcon icon={faDollarSign} style={{ color: 'red' }} />Productos más Caros</h3>
            </div>
            <p className="table-description">
                Los productos con los precios más elevados en el inventario
            </p>

            <table className="table-expensive">
                <thead>
                    <tr>
                        {columnas.map((columna) => (
                            <th key={columna}>{columna}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {datos.map((fila, index) => (
                        <tr key={index}>
                            {columnas.map((columna) => (
                                <td key={`${index}-${columna}`}>{fila[columna]}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Expensive;