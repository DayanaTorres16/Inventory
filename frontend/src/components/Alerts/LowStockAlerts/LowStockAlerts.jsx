import React, { useState, useEffect } from 'react';
import './LowStockAlerts.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons';

function LowStockAlerts() {
  const [lowStockByStore, setLowStockByStore] = useState({});
  const [storeInfo, setStoreInfo] = useState({});
  const [showBanner, setShowBanner] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStoresAndLowStock = async () => {
      try {
        setLoading(true);

        const storesResponse = await fetch('https://inventorybackend-cv1q.onrender.com/api/stores');
        if (!storesResponse.ok) {
          throw new Error(`HTTP error! status: ${storesResponse.status}`);
        }

        const storesData = await storesResponse.json();

        const storesObject = {};
        storesData.forEach(store => {
          storesObject[store.ID_TIENDA] = {
            id: store.ID_TIENDA,
            nombre: store.NOMBRE_TIENDA,
          };
        });

        setStoreInfo(storesObject);
        const lowStockData = {};

        await Promise.all(
          storesData.map(async store => {
            try {
              const response = await fetch(
                `https://inventorybackend-cv1q.onrender.com/api/inventoryReport/minimum?storeId=${store.ID_TIENDA}`
              );
              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }

              const data = await response.json();
              if (data.length > 0) {
                lowStockData[store.ID_TIENDA] = data;
              }
            } catch (error) {
              console.error(
                `Error obteniendo stock bajo para tienda ${store.ID_TIENDA}:`,
                error
              );
            }
          })
        );

        setLowStockByStore(lowStockData);
      } catch (error) {
        console.error('Error al obtener datos de tiendas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStoresAndLowStock();
  }, []);

  if (loading) {
    return <div className="loading-state">Cargando alertas de stock...</div>;
  }

  if (Object.keys(lowStockByStore).length === 0 || !showBanner) {
    return null;
  }

  const getTotalProductsByStore = storeId => {
    return lowStockByStore[storeId]?.length || 0;
  };

  const totalLowStockProducts = Object.values(lowStockByStore).reduce(
    (total, storeProducts) => total + storeProducts.length,
    0
  );

  return (
    <div className="stock-alert-container">
      <div className="stock-alert-banner">
        <div className="stock-alert-header">
          <div className="stock-alert-title">
            <FontAwesomeIcon icon={faExclamationCircle} className="stock-alert-icon" /> {/* Usa el icono de Font Awesome */}
            <span>
              <strong>¡Alerta de stock bajo!</strong> Hay {totalLowStockProducts} productos con 10 o menos unidades disponibles en total.
            </span>
          </div>
          <button onClick={() => setShowBanner(false)} className="stock-alert-close">
            ×
          </button>
        </div>

        <div className="stock-alert-stores">
          {Object.keys(lowStockByStore).map(storeId => {
            const count = getTotalProductsByStore(storeId);
            if (count === 0) return null;

            const storeName = storeInfo[storeId]?.nombre || `Tienda ${storeId}`;

            return (
              <div key={storeId} className="stock-alert-store-item">
                <strong>{storeName}:</strong> {count} productos con stock bajo
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default LowStockAlerts;