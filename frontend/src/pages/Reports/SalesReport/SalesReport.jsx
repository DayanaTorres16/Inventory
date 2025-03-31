import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../../../components/Navbar/Navbar';
import Footer from '../../../components/Footer/Footer';
import HighRotationAttributesChart from '../../../components/Reports/HighRotationProducts/HighRotationAttributesChart';
import CardsSalesReports from '../../../components/Reports/CardsSalesReport/CardsSalesReports';
import DateRangePicker from '../../../components/Reports/Calendary/DateRangePicker';
import SalesByPeriod from '../../../components/Reports/SalesByPeriod/SalesByPeriod';
import BestSellingAttributes from '../../../components/Reports/BestSellingProducts/BestSellingAttributes';
import LowRotationAttributes from '../../../components/Reports/LowRotationProducts/LowRotationAttributes';
import LowRotationAttributesChart from '../../../components/Reports/LowRotationProducts/LowRotationAttributesChart';
import HighRotationAttributes from '../../../components/Reports/HighRotationProducts/HighRotationAttributes';

import './SalesReport.css';

function SalesReport() {
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
            <div className="sales-report-container">
                <CardsSalesReports
                    dateRange={dateRange}
                    onDateChange={setDateRange}
                />
                <div className="sales-reports-grid">
                    <DateRangePicker onFilterChange={handleFilterChange} />
                    <SalesByPeriod
                        storeId={storeId}
                        dateRange={{
                            startDate: formatDate(dateRange.startDate),
                            endDate: formatDate(dateRange.endDate),
                        }}
                    />
                    <BestSellingAttributes
                        storeId={storeId}
                        dateRange={{
                            startDate: formatDate(dateRange.startDate),
                            endDate: formatDate(dateRange.endDate),
                        }}
                    />
                </div>
                <div className="charts-grid">
                    <LowRotationAttributesChart
                        storeId={storeId}
                        dateRange={{
                            startDate: formatDate(dateRange.startDate),
                            endDate: formatDate(dateRange.endDate),
                        }}
                    />
                    <HighRotationAttributesChart
                        storeId={storeId}
                        dateRange={{
                            startDate: formatDate(dateRange.startDate),
                            endDate: formatDate(dateRange.endDate),
                        }}
                    />
                </div>
                <div className="attributes-grid">
                    <LowRotationAttributes
                        storeId={storeId}
                        dateRange={{
                            startDate: formatDate(dateRange.startDate),
                            endDate: formatDate(dateRange.endDate),
                        }}
                    />
                    <HighRotationAttributes
                        storeId={storeId}
                        dateRange={{
                            startDate: formatDate(dateRange.startDate),
                            endDate: formatDate(dateRange.endDate),
                        }}
                    />
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default SalesReport;