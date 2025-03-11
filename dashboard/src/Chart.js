import React from 'react';

import { useEffect, useState } from 'react';

import axios from 'axios';

import ReactECharts from 'echarts-for-react';

import Config from './Config';


export default function Chart({name, selected, config}) {

    const [loading, setLoading] = useState(false);    
    const [error, setError] = useState(null);   
    const [options, setOptions] = useState({});
    const [graph, setGraph] = useState({
        chart: {
            config: {
                title: "",
                subtitle: "",
                width: 500,
                height: 400,
                theme: "light"
            }
        }
    });
    
    useEffect(() => {
        setLoading(true);        
        const url = Config.serverBaseUrl + "/graph/";
        let calc_url = url + name;
        // url encoded props.selected
        if (selected && selected.length !== 0) {
            let pars = selected.join('&');
            calc_url = url + name + "?" + pars;            
        } 
        axios.get(calc_url).then( (response) => {
            let chart = response.data.chart;
            var opts = {}   
            opts.title = {
                text: chart.config.title,
                subtext: chart.config.subtitle,
                textStyle: {
                    fontFamily: 'Arial Rounded MT Bold'
                },
                subtextStyle: {
                    fontFamily: 'Arial Rounded MT Bold'
                }
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
                top: 'bottom',
                textStyle: {
                    fontFamily: 'Arial Rounded MT Bold'
                }
            };
            opts.grid = {
                left: '3%',
                right: '4%',
                bottom: '10%',
                containLabel: true
            };
            opts.xAxis = {
                type: 'value',
                axisLabel: {
                    fontFamily: 'Arial Rounded MT Bold'
                }
            };
            opts.yAxis = {
                type: 'category',
                data: response.data.data[0].data,
                axisLabel: {
                    fontFamily: 'Arial Rounded MT Bold'
                }
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
                            show: true,
                            fontFamily: 'Arial Rounded MT Bold'
                        },
                        emphasis: {
                            focus: 'series'
                        },
                        data: response.data.data[i].data
                    });
                }
            }
            setGraph(response.data);
            setOptions(opts);            
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
    }, [name, selected, config]);

    if(loading) {
        return <div className='container'>Loading...</div>;
    }

    if(error) {
        return <div className='container'>{error}</div>;
    }
    
    return (
            <div key={Date.now()} className='container'>
                <ReactECharts theme={graph.chart.config.theme} style={{ width: graph.chart.config.width, height: graph.chart.config.height }} option={options} />
            </div>
    )
}