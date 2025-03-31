import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import DateRangePicker from '../../components/Reports/Calendary/DateRangePicker';
import Navegacion from '../../components/Reports/NavegationReport/Navegacion';
import VentasPorPeriodo from '../../components/Reports/SalesByPeriod/SalesByPeriod';
import ProductosMasVendidos from '../../components/Reports/BestSellingProducts/BestSellingProducts';
import StockActualCritico from '../../components/Reports/LowStock/LowStock';
import ProductosBajaRotacion from '../../components/Reports/LowRotationProducts/LowRotationProducts';
import ProductosAltaRotacion from '../../components/Reports/HighRotationProducts/HighRotationProducts';
import ProductosAltaRotacionGrafico from '../../components/Reports/HighRotationProducts/HighRotationProductsChart';
import './Report.css';

function Report() {
  const { storeId } = useParams();
  const [dateRange, setDateRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
  });

  const formatDate = (date) => {
    if (date instanceof Date) {
      return date.toISOString().split('T')[0];
    }
    return '';
  };

  const handleFilterChange = (startDate, endDate) => {
    setDateRange({
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : new Date(),
    });
  };

  return (
    <div>
      <Navbar />
      <div className="report-container">
      <Navegacion />
          <div className="reports-grid">
            <DateRangePicker onFilterChange={handleFilterChange} />
            <VentasPorPeriodo
              storeId={storeId}
              dateRange={{
                startDate: formatDate(dateRange.startDate),
                endDate: formatDate(dateRange.endDate),
              }}
            />
            <ProductosMasVendidos
              storeId={storeId}
              dateRange={{
                startDate: formatDate(dateRange.startDate),
                endDate: formatDate(dateRange.endDate),
              }}
            />
          </div>
       
        <div className="report-content">
          <div className="stock-critico-baja-rotacion">
            <div className="stock-critico">
              <StockActualCritico
                storeId={storeId}
                dateRange={{
                  startDate: formatDate(dateRange.startDate),
                  endDate: formatDate(dateRange.endDate),
                }}
              />
            </div>
            <div className="productos-baja-rotacion">
              <ProductosBajaRotacion
                storeId={storeId}
                dateRange={{
                  startDate: formatDate(dateRange.startDate),
                  endDate: formatDate(dateRange.endDate),
                }}
              />
            </div>
          </div>
          <div className="productos-alta-rotacion-container">
            <div className="productos-alta-rotacion">
              <ProductosAltaRotacion
                storeId={storeId}
                dateRange={{
                  startDate: formatDate(dateRange.startDate),
                  endDate: formatDate(dateRange.endDate),
                }}
              />
            </div>
            <div className="productos-alta-rotacion-grafico">
              <ProductosAltaRotacionGrafico
                storeId={storeId}
                dateRange={{
                  startDate: formatDate(dateRange.startDate),
                  endDate: formatDate(dateRange.endDate),
                }}
              />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
export default Report;