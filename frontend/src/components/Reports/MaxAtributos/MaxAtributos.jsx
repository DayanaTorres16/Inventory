import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCube } from '@fortawesome/free-solid-svg-icons';
import '../Tablas.css'; 

const MaxAtributos = ({ storeId }) => {
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

    const columnas = ['NOMBRE_PRODUCTO', 'CANTIDAD_ATRIBUTOS'];

    return (
        <div className="table-container">
            <div className="title-section">
               <h3> <FontAwesomeIcon icon={faCube} style={{ color: 'blue' }} /> Productos con más Atributos </h3>
            </div>
            <p className="table-description">
                Los productos con la mayor cantidad de atributos o características
            </p>

            <table className="tabla-max-attributes">
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

export default MaxAtributos;