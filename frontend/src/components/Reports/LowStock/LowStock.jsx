import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../Tablas.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

const LowStock = ({ storeId }) => {
    const [stockCritico, setStockCritico] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!storeId) return;

        setStockCritico([]);
        setLoading(true);
        setError(null);

        axios
            .get(`http://localhost:5000/api/inventoryReport/minimum?storeId=${storeId}`)
            .then((response) => {
                console.log('Datos recibidos:', response.data);
                setStockCritico(response.data.length ? response.data : []);
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
        <div className="table-container tabla-low-stock">
            <div className="table-header">
                <FontAwesomeIcon icon={faExclamationTriangle} style={{ color: 'orange' }} />
                <h2>Productos Bajos de Stock</h2>
            </div>
            <p className="table-description">
                Productos que están por debajo del nivel mínimo recomendado
            </p>
            {stockCritico.length === 0 ? (
                <p>No hay productos con stock mínimo crítico</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th></th>
                            <th>Nombre del Producto</th>
                            <th>Atributos</th>
                            <th>Cantidad</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stockCritico.map((p, i) => {
                            const atributos = p.atributos;
                            return (
                                <tr key={i}>
                                    <td>
                                        <FontAwesomeIcon icon={faExclamationTriangle} style={{ color: 'red' }} />
                                    </td>
                                    <td>{p.nombre_producto}</td>
                                    <td>
                                        {atributos.map((atributo, j) => (
                                            <div key={j}>
                                                {atributo.atributo}: {atributo.valor}
                                            </div>
                                        ))}
                                    </td>
                                    <td>
                                        {atributos.map((atributo, j) => (
                                            <div key={j}>{atributo.stock_minimo}</div>
                                        ))}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default LowStock;