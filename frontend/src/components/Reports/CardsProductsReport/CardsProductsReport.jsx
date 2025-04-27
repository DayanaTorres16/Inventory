import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDollarSign, faTags, faBox } from '@fortawesome/free-solid-svg-icons'; 
import './CardsProductsReport.css';

const CardsProductsReport = ({ storeId }) => {
    const [expensiveCount, setExpensiveCount] = useState(0);
    const [cheapCount, setCheapCount] = useState(0);
    const [totalQuantity, setTotalQuantity] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const expensiveRes = await axios.get(`https://inventorybackend-cv1q.onrender.com/api/productsReport/expensive/count?storeId=${storeId}`);
                setExpensiveCount(expensiveRes.data.cantidad_productos_mas_caros);

                const cheapRes = await axios.get(`https://inventorybackend-cv1q.onrender.com/api/productsReport/cheap/count?storeId=${storeId}`);
                setCheapCount(cheapRes.data.cantidad_productos_mas_baratos);

                const quantityResponse = await axios.get(`https://inventorybackend-cv1q.onrender.com/api/inventoryReport/total-quantity?storeId=${storeId}`);
                setTotalQuantity(quantityResponse.data.cantidad_total_productos ?? 0);

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

    return (
        <div className="product-cards-container">
            <div className="product-card">
                <div className="card-icon">
                    <FontAwesomeIcon icon={faDollarSign} style={{ color: 'red' }} />
                </div>
                <div className="card-content">
                    <div className="card-title">Productos más Caros</div>
                    <div className="card-value">{expensiveCount}</div>
                    <div className="card-description">Productos con precio superior a $50.000</div>
                </div>
            </div>

            <div className="product-card">
                <div className="card-icon">
                    <FontAwesomeIcon icon={faTags} style={{ color: 'green' }} />
                </div>
                <div className="card-content">
                    <div className="card-title">Productos más Económicos</div>
                    <div className="card-value">{cheapCount}</div>
                    <div className="card-description">Productos con precio inferior a $20.000</div>
                </div>
            </div>

            <div className="product-card">
                <div className="card-icon">
                    <FontAwesomeIcon icon={faBox} style={{ color: 'royalblue' }} />
                </div>
                <div className="card-content">
                    <div className="card-title">Total de Productos</div>
                    <div className="card-value">{totalQuantity}</div>
                    <div className="card-description">Número total de productos en inventario</div>
                </div>
            </div>
        </div>
    );
};

export default CardsProductsReport;