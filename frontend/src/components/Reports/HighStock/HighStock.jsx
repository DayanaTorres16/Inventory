import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../Tablas.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCube, faCheckCircle } from '@fortawesome/free-solid-svg-icons';

const HighStock = ({ storeId }) => {
    const [stockMaximo, setStockMaximo] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!storeId) return;

        setStockMaximo([]);
        setLoading(true);
        setError(null);

        axios
            .get(`http://localhost:5000/api/inventoryReport/maximum?storeId=${storeId}`)
            .then((response) => {
                console.log('Datos recibidos:', response.data);
                setStockMaximo(response.data.length ? response.data : []);
            })
            .catch((err) => {
                console.error('Error en la carga de datos:', err);
                setError('Hubo un problema al obtener los datos.');
            })
            .finally(() => setLoading(false));
    }, [storeId]);

    if (loading) return <div>Cargando...</div>;
    if (error) return <div>Error al cargar datos: {error}</div>;

    return (
        <div className="table-container high-stock">
            <div className="table-header">
                <FontAwesomeIcon icon={faCube} style={{ color: 'royalblue' }} />
                <h2>Productos Altos de Stock</h2>
            </div>
            <p className="table-description">
                Productos que exceden el nivel máximo recomendado
            </p>
            {stockMaximo.length === 0 ? (
                <p>No hay productos con stock máximo.</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th></th>
                            <th>Nombre del Producto</th>
                            <th>Cantidad</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stockMaximo.map((p, i) => (
                            <tr key={i}>
                                <td>
                                    <FontAwesomeIcon icon={faCheckCircle} style={{ color: 'green' }} />
                                </td>
                                <td>{p.nombre_producto}</td>
                                <td>{p.stock_actual}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default HighStock;