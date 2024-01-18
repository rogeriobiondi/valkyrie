import axios from 'axios';
import ReactECharts from 'echarts-for-react';

import { useEffect } from 'react';
import { useState } from "react";

export default function BarChart(props) {

    const [loading, setLoading] = useState(false);    
    const [error, setError] = useState(null);
    const [loaded, setLoaded] = useState({});
    const [options, setOptions] = useState({});
    const url = "http://localhost:8000/graph/";

    useEffect(() => {
        setLoading(true);
        let calc_url = url + props.name;
        // url encoded props.selected
        if (props.selected.length !== 0) {
            let pars = props.selected.join('&');
            calc_url = url + props.name + "?" + pars;            
        } 
        console.log('Loading data for', calc_url);
        axios.get(calc_url)
        .then( (response) => {
            console.log('Response', response.data);         
            var opts = {}   
            opts.title = {
                text: response.data.dashboard.config.title,
                subtext: response.data.dashboard.config.subtitle
            }
            opts.tooltip = {
                trigger: 'axis',
                axisPointer: {
                  // Use axis to trigger tooltip
                  type: 'shadow' // 'shadow' as default; can also be 'line' or 'shadow'
                }
            }
            opts.legend = {
                orient: 'horizontal',
                top: 'bottom'
            };
            opts.grid = {
                left: '3%',
                right: '4%',
                bottom: '10%',
                containLabel: true
            };
            opts.xAxis = {
                type: 'value'
            };
            opts.yAxis = {
                type: 'category',
                data: response.data.data[0].data
            };
            opts.series = [];
            for (var i = 0; i < response.data.data.length; i++) {
                if (i > 0) {
                    opts.series.push({                                            
                        name: response.data.data[i].name,
                        type: "bar",
                        stack: 'total',
                        barWidth: "60%",
                        label: {
                            show: true
                        },
                        emphasis: {
                            focus: 'series'
                        },
                        data: response.data.data[i].data
                    });
                }
            }
            setError(null);
            setOptions(opts);            
            setLoading(false);              
            console.log('opts', opts);          
        })
        .catch((error) => {
            setLoading(false);
            if (error.response.status === 404) {
                setError("No data found for this dashboard.");                
            } else {            
                setError(error.message);
            }
        });
    }, [props]);

    if(loading) {
        return <div>Loading...</div>;
    }
    if(error) {
        return <div>{error}</div>;
    } else {
        return (
            <div>
                <ReactECharts 
                            theme="light"
                            key={Date.now()}
                            style={
                                {
                                    width: 500, 
                                    height: 400
                                }
                            }
                            option={options} 
                        />
            </div>
        )
    }
}        

// export default BarChart;