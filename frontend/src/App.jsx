import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/authContext';
import ProtectedRoute from './components/ProtectedRoute';
// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Clients from './pages/Clients';
import Produits from './pages/Produits';
import Factures2 from './pages/Factures2';
import Proformas from './pages/Proformas';
import DashboardHome from './pages/DashboardHome';
import Settings from './pages/Settings';
import Categories from './pages/Categories';
import Depenses from './pages/Depenses';

import ClientsWithFactures from './pages/ClientsWithFactures';
import Fournisseurs from './pages/Fournisseurs';




function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Route protégée pour Dashboard */}
          <Route path="/dashboard/*" element={<ProtectedRoute element={<Dashboard />} />}>
            <Route index element={<DashboardHome />} />
            <Route path="users" element={<Users />} />
            <Route path="clients" element={<Clients />} />
            <Route path="produits" element={<Produits />} />
            <Route path="factures2" element={<Factures2 />} />
            <Route path="proformas" element={<Proformas />} />
            <Route path="clients-factures" element={<ClientsWithFactures />} />
            <Route path="settings" element={<Settings />} />
            <Route path="categories" element={<Categories />} />
            <Route path="depenses" element={<Depenses />} />
            <Route path="fournisseurs" element={<Fournisseurs />} />


          </Route>

          {/* Redirection des routes non définies */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
