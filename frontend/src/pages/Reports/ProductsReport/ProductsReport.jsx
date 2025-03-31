import React from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../../../components/Navbar/Navbar';
import Footer from '../../../components/Footer/Footer';
import CardsProductsReport from '../../../components/Reports/CardsProductsReport/CardsProductsReport';
import Expensive from '../../../components/Reports/Expensive/Expensive;';
import ExpensiveChart from '../../../components/Reports/ExpensiveChart/ExpensiveChart';
import Cheap from '../../../components/Reports/Cheap/Cheap';
import CheapChart from '../../../components/Reports/CheapChart/CheapChart';
import MaxAtributos from '../../../components/Reports/MaxAtributos/MaxAtributos';
import MaxAttributesChart from '../../../components/Reports/MaxAttributesChart/MaxAttributesChart';
import './ProductsReport.css';

const ProductsReport = () => {
    const { storeId } = useParams();

    return (
        <div>
            <Navbar />
            <div className="products-report-container">
                <div className='products-report-titule'>
                    <h2>Reporte Productos</h2>
                </div>
                <CardsProductsReport storeId={storeId} />
                <div className="products-reports-grid">
                    <div className="row-tables">
                        <ExpensiveChart storeId={storeId} />
                        <CheapChart storeId={storeId} />
                        <MaxAttributesChart storeId={storeId} />
                    </div>
                    <div className="row-charts">
                        <Expensive storeId={storeId} />
                        <Cheap storeId={storeId} />
                        <MaxAtributos storeId={storeId} />
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default ProductsReport;
