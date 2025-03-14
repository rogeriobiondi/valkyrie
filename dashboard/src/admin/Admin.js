import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import Config from '../Config';
import '../styles/index.css';

/**
 * Represents a configuration object.
 * @returns {Object} The configuration object.
 */
const Menu = () => {
    const baseUrl = `${Config.frontBaseUrl}/admin`;
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        // Perform any logout logic here (e.g., clearing tokens, etc.)
        logout();
        navigate('/login');
    };

    return (
        <div className="container">
            <div className="container-fluid">
                <h1 className="title-rounded">Valkyrie</h1>
                <div className="container-fluid"></div>
                <h2 className="title-rounded">Admin Menu</h2>
            </div>
            <br />
            <div className="btn-group-horizontal" role="group" aria-label="Admin Menu">
                <Link to={`${baseUrl}/measurements`} className="btn btn-primary btn-square">
                    <i className="glyphicon glyphicon-stats"></i>
                    <span>Measurements</span>
                </Link>
                <Link to={`${baseUrl}/datasources`} className="btn btn-primary btn-square">
                    <i className="glyphicon glyphicon-hdd"></i>
                    <span>Datasources</span>
                </Link>
                <Link to={`${baseUrl}/filters`} className="btn btn-primary btn-square">
                    <i className="glyphicon glyphicon-filter"></i>
                    <span>Filters</span>
                </Link>
                <Link to={`${baseUrl}/charts`} className="btn btn-primary btn-square">
                    <i className="glyphicon glyphicon-signal"></i>
                    <span>Charts</span>
                </Link>
                <Link to={`${baseUrl}/dashboards`} className="btn btn-primary btn-square">
                    <i className="glyphicon glyphicon-dashboard"></i>
                    <span>Dashboards</span>
                </Link>
                <button className="btn btn-danger btn-square" onClick={handleLogout}>
                    <i className="glyphicon glyphicon-log-out"></i>
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Menu;