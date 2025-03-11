import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App';

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
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/measurements" element={<Measurements />} />
        <Route path="/admin/datasources" element={<Datasources />} />
        <Route path="/admin/filters" element={<Filters />} />
        <Route path="/admin/charts" element={<Charts />} />
        <Route path="/admin/dashboards" element={<Dashboards />} />
        <Route path="*" element={<App />} />
      </Routes>
    </Router>
  </React.StrictMode>
);
