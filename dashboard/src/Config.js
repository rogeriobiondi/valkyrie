import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';

/**
 * Represents a configuration object.
 * @returns {Object} The configuration object.
 */
     

// Create an Admin object with serverUrl and serverPort properties
// and export it as default
const Config = {
    serverUrl: process.env.REACT_APP_SERVER_URL || 'http://localhost',
    serverPort: process.env.REACT_APP_SERVER_PORT || 8000,
    frontUrl: process.env.REACT_APP_SERVER_URL || 'http://localhost',
    frontPort: process.env.REACT_APP_SERVER_PORT || 3000
};

Config.serverBaseUrl = `${Config.serverUrl}:${Config.serverPort}`;
Config.frontBaseUrl = `${Config.frontUrl}:${Config.frontPort}`;

export default Config;