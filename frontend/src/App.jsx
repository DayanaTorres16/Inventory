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
import InventoryReport from './pages/Reports/InventoryReport/InventoryReport';
import ProductsReport from './pages/Reports/ProductsReport/ProductsReport';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/passwordreset" element={<PasswordReset />} />
        <Route path="/reset-password" element={<NewPassword />} />

        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={['admin', 'empleado']}>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/inventory/:storeId" element={
          <ProtectedRoute allowedRoles={['admin', 'empleado']}>
            <Inventory />
          </ProtectedRoute>
        } />
        <Route path="/sales/new/:storeId" element={
          <ProtectedRoute allowedRoles={['admin', 'empleado']}>
            <SalesForm />
          </ProtectedRoute>
        } />

        <Route path="/report/:storeId" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Report />
          </ProtectedRoute>
        } />
        <Route path="/salesreport/:storeId" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <SalesReport />
          </ProtectedRoute>
        } />
        <Route path="/inventoryreport/:storeId" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <InventoryReport />
          </ProtectedRoute>
        } />
        <Route path="/productsreport/:storeId" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ProductsReport />
          </ProtectedRoute>
        } />
        <Route path="/accountadmin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AccountAdmin />
          </ProtectedRoute>
        } />
        <Route path="/register" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Register />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
};

export default App;
