import React from 'react';
import BarChart from "./BarChart";
import Filter from './Filter';

import './dashboard.css';

const Dashboard = ({name, title, filters}) => {    

    return (
        <div>
          <h1 className="title">{title}</h1>        
          <Filter name={name} filters={filters}>
              <BarChart name={name}/>
          </Filter>       
        </div>
    );
}

export default Dashboard;