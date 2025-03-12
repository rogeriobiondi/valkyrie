import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './AuthContext';
import ProtectedRoute from './ProtectedRoute';

import Admin from './admin/Admin';
import Measurements from './admin/Measurements';
import Datasources from './admin/Datasources';
import Filters from './admin/Filters';
import Charts from './admin/Charts';
import Dashboards from './admin/Dashboards';
import Login from './admin/Login';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
          <Route path="/admin/measurements" element={<ProtectedRoute><Measurements /></ProtectedRoute>} />
          <Route path="/admin/datasources" element={<ProtectedRoute><Datasources /></ProtectedRoute>} />
          <Route path="/admin/filters" element={<ProtectedRoute><Filters /></ProtectedRoute>} />
          <Route path="/admin/charts" element={<ProtectedRoute><Charts /></ProtectedRoute>} />
          <Route path="/admin/dashboards" element={<ProtectedRoute><Dashboards /></ProtectedRoute>} />
          <Route path="*" element={<App />} />
        </Routes>
      </Router>
    </AuthProvider>
  </React.StrictMode>
);
