import React, { useState, useEffect } from 'react';
import BarChart from "./BarChart";
import Filter from './Filter';

import axios from 'axios';


import './dashboard.css';

const Dashboard = ({name}) => {  
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [dashboard, setDashboard] = useState({});
    const [title, setTitle] = useState('');
    const [filters, setFilters] = useState([]);
    const [type, setType] = useState('barchart-horizontal');
        
    const url = "http://localhost:8000/dashboard/";

    useEffect(() => {
        setLoading(true);
        let calc_url = url + name;
        axios.get(calc_url)
        .then( (response) => {            
            console.log('Response', response.data);  
            setDashboard(response.data);
            setTitle(response.data.config.title);
            setFilters(response.data.config.filters);
            setType(response.data.config.type);            
            setError(null);
            setLoading(false);              
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
            <h1 className="title">{title}</h1>        
            <Filter name={name} filters={filters}>
                <BarChart name={name} filters={filters}/>
                {/* {(type === 'barchart-horizontal') ? (<div><BarChart name={name} filters={filters}/></div>) : (<div></div>) } */}
            </Filter>       
        </div>
    );
}

export default Dashboard;