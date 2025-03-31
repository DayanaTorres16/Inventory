import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDollarSign, faLayerGroup } from '@fortawesome/free-solid-svg-icons';
import './CardsInventoryReport.css';

const CardsInventoryReport = ({ storeId }) => {
    const [totalValue, setTotalValue] = useState(0);
    const [totalQuantity, setTotalQuantity] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const valueResponse = await axios.get(`http://localhost:5000/api/inventoryReport/total-value?storeId=${storeId}`);
                setTotalValue(valueResponse.data.valor_total_inventario ?? 0);

                const quantityResponse = await axios.get(`http://localhost:5000/api/inventoryReport/total-quantity?storeId=${storeId}`);
                setTotalQuantity(quantityResponse.data.cantidad_total_productos ?? 0);
            } catch (err) {
                setError(err.message || 'Error al cargar los datos.');
            } finally {
                setLoading(false);
            }
        };

        if (storeId) {
            fetchData();
        } else {
            setError('No se recibió un storeId válido.');
            setLoading(false);
        }
    }, [storeId]);

    if (loading) return <div>Cargando...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="inventory-summary-cards">
            <div className="inventory-card">
                <div className="card-header">
                    Valor Total del Inventario <FontAwesomeIcon icon={faDollarSign} />
                </div>
                <div className="card-value">
                    ${totalValue ? totalValue.toLocaleString('es-CO') : '0'}
                </div>
                <div className="card-description">
                    Valor calculado de todos los productos en inventario
                </div>
            </div>
            <div className="inventory-card">
                <div className="card-header">
                    Cantidad de Productos <FontAwesomeIcon icon={faLayerGroup} />
                </div>
                <div className="card-value">
                    {totalQuantity ? totalQuantity.toLocaleString('es-CO') : '0'}
                </div>
                <div className="card-description">
                    Número total de productos en el inventario
                </div>
            </div>
        </div>
    );
};

export default CardsInventoryReport;
