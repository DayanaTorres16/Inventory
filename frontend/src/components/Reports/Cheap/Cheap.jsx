import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTags } from '@fortawesome/free-solid-svg-icons';
import '../Tablas.css'; // Asegúrate de crear este archivo CSS

const Cheap = ({ storeId }) => {
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

    const columnas = ['NOMBRE', 'PRECIO']; 

    return (
        <div className="table-container">
            <div className="title-sectionn">
                <h3><FontAwesomeIcon icon={faTags} style={{ color: 'green' }} /> Productos más Económicos </h3>
            </div>
            <p className="table-description">
                Los productos con los precios más bajos en el inventario
            </p>

            <table className="table-cheap">
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

export default Cheap;