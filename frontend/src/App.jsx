import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import Inventory from './pages/Inventory/Inventory';
import AccountAdmin from './pages/AccountAdminPage/AccountAdmin';
import Register from './pages/Register/Register';
import SalesForm from './pages/Inventory/SalesForm';
import Report from './pages/Reports/Reports';
import PasswordReset from './pages/PasswordReset/PasswordReset';
import NewPassword from './pages/NewPassword/NewPassword';
import SalesReport from './pages/Reports/SalesReport/SalesReport';
import InventoryReport  from './pages/Reports/InventoryReport/InventoryReport';
import ProductsReport from './pages/Reports/ProductsReport/ProductsReport';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/passwordreset" element={<PasswordReset/>}/>
        <Route path="/reset-password" element={<NewPassword/>}/>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/inventory/:storeId" element={<Inventory />} />
        <Route path="/sales/new/:storeId" element={<SalesForm />} />
        <Route path="/report/:storeId" element={<Report />} />
        <Route path="/salesreport/:storeId" element={<SalesReport/>}/>
        <Route path="/inventoryreport/:storeId" element={<InventoryReport/>}/>
        <Route path="/productsreport/:storeId" element={<ProductsReport/>}/>
        <Route path="/accountadmin" element={<AccountAdmin />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
};

export default App;
