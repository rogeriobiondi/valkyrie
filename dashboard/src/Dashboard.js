import React, { useState, useEffect } from 'react';
import Chart from "./Chart";
import Filter from './Filter';

import axios from 'axios';


import './Dashboard.css';

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
        const url = config.serverUrl + "/dashboards/";
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
    }, [name]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div>
            <h1 className="title">{(dashboard.config.title) ? (dashboard.config.title) : ("dashboard.config.title")}</h1>
            <div>
                <Filter dashboard={dashboard} config={config}>                    
                    {
                        dashboard.config.charts.map((chart, i) => {
                            return (<Chart key={i} name={chart} config={config}/>);
                        })
                    }                    
                </Filter>
            </div>
        </div>
    );
}

export default Dashboard;