import React, { useState, useEffect } from 'react';
import Chart from "./Chart";
import Filter from './Filter';

import axios from 'axios';
import Config from './Config';

import './styles/Dashboard.css';

const Dashboard = ({name, config}) => {  
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [dashboard, setDashboard] = useState({
        config: {
            title: '',
            charts: []
        }
    });       
    
    useEffect(() => {
        const url = Config.serverBaseUrl + "/dashboards/";
        setLoading(true);
        let calc_url = url + name;
        axios.get(calc_url)
        .then( (response) => {            
            setError(null);
            setLoading(false);              
            setDashboard(response.data);
        })
        .catch((error) => {
            setLoading(false);
            if (error.response.status === 404) {
                setError("No data found for this dashboard.");                
            } else {            
                setError(error.message);
            }
        });
    }, [name, Config.serverBaseUrl]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className='container-fluid'>
            <h1 className="title">{(dashboard.config.title) ? (dashboard.config.title) : ("dashboard.config.title")}</h1>
            <div className="rounded p-2">Powered by Valkyrie</div>
            <br/>
            <div className='container-fluid'>
                <Filter dashboard={dashboard} config={config}>                    
                    {
                        dashboard.config.charts.map((chart, i) => {
                            return (
                                <div key={i} className="chart-container">
                                    <Chart name={chart} config={config}/>
                                </div>
                            );
                        })
                    }                    
                </Filter>
            </div>
        </div>
    );
}

export default Dashboard;