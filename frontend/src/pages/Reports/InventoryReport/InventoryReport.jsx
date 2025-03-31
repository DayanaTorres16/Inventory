import React from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../../../components/Navbar/Navbar';
import Footer from '../../../components/Footer/Footer';
import CardsInventoryReport from '../../../components/Reports/CardsInventoryReport/CardsInventoryReport';
import LowStock from '../../../components/Reports/LowStock/LowStock';
import HighStock from '../../../components/Reports/HighStock/HighStock';
import './InventoryReport.css';

function InventoryReport() {
    const { storeId } = useParams();

    return (
        <div>
            <Navbar />
            <div className="inventory-report-container">
                <div className='inventory-report-titule'>
                    <h2>Reporte Inventario</h2>
                </div>
                <CardsInventoryReport storeId={storeId} />
                <div className="inventory-reports-grid">
                    <LowStock storeId={storeId} />
                    <HighStock storeId={storeId} />
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default InventoryReport;
