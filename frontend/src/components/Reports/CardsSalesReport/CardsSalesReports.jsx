import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faClipboardList, faBoxes } from '@fortawesome/free-solid-svg-icons';
import { useParams } from 'react-router-dom';

function CardsSalesReports({ dateRange, onDateChange }) { 
    const { storeId } = useParams();
    const [totalIngresos, setTotalIngresos] = useState(null);
    const [totalVentas, setTotalVentas] = useState(null);
    const [totalProductosVendidos, setTotalProductosVendidos] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSalesData = async () => {
            setLoading(true);
            setError(null);

            let ingresosUrl = `https://inventorybackend-cv1q.onrender.com/api/salesReport/sales/total?storeId=${storeId}`;
            let ventasUrl = `https://inventorybackend-cv1q.onrender.com/api/salesReport/sales/count?storeId=${storeId}`;
            let productosUrl = `https://inventorybackend-cv1q.onrender.com/api/salesReport/products/total?storeId=${storeId}`;

            if (dateRange && dateRange.startDate && dateRange.endDate) {
                const startDateStr = dateRange.startDate.toISOString().split('T')[0];
                const endDateStr = dateRange.endDate.toISOString().split('T')[0];

                ingresosUrl += `&startDate=${startDateStr}&endDate=${endDateStr}`;
                ventasUrl += `&startDate=${startDateStr}&endDate=${endDateStr}`;
                productosUrl += `&startDate=${startDateStr}&endDate=${endDateStr}`;
            }

            try {
                const ingresosResponse = await fetch(ingresosUrl);
                if (!ingresosResponse.ok) {
                    throw new Error(`HTTP error! status: ${ingresosResponse.status}`);
                }
                const ingresosData = await ingresosResponse.json();
                setTotalIngresos(ingresosData?.total_ingresos || 0);

                const ventasResponse = await fetch(ventasUrl);
                if (!ventasResponse.ok) {
                    throw new Error(`HTTP error! status: ${ventasResponse.status}`);
                }
                const ventasData = await ventasResponse.json();
                setTotalVentas(ventasData?.total_ventas || 0);

                const productosResponse = await fetch(productosUrl);
                if (!productosResponse.ok) {
                    throw new Error(`HTTP error! status: ${productosResponse.status}`);
                }
                const productosData = await productosResponse.json();
                setTotalProductosVendidos(productosData?.total_productos_vendidos || 0);
            } catch (err) {
                setError(err.message || "Error desconocido al cargar los datos.");
            } finally {
                setLoading(false);
            }
        };

        fetchSalesData();
    }, [storeId, dateRange]);

    return (
        <div className="navegacion-container">
            <div className="navegacion-card card-purple">
                <div className="card-content">
                    <FontAwesomeIcon icon={faChartLine} className="card-icon" />
                    <span className="card-text">
                        Ingreso total: {totalIngresos !== null ? `$${totalIngresos}` : 'No hay datos'}
                    </span>
                </div>
            </div>
            <div className="navegacion-card card-blue">
                <div className="card-content">
                    <FontAwesomeIcon icon={faClipboardList} className="card-icon" />
                    <span className="card-text">
                        Total de Ventas: {totalVentas !== null ? totalVentas : 'No hay datos'}
                    </span>
                </div>
            </div>
            <div className="navegacion-card card-red">
                <div className="card-content">
                    <FontAwesomeIcon icon={faBoxes} className="card-icon" />
                    <span className="card-text">
                        Productos vendidos: {totalProductosVendidos !== null ? totalProductosVendidos : 'No hay datos'}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default CardsSalesReports;