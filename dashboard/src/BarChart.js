import React, { Component, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import axios from 'axios';

class BarChart extends Component {

    url = "http://localhost:8000/graph/" + this.props.name;

    // initialize state
    state = {
        loading: false,
        option: {},
        config: {},
        filter: this.props.filter
    };

    /**
     * Loads data from a specified URL.
     * @returns {Promise<any>} The response data.
     */
    loadData() {
        var calc_url = this.url;
        if (this.props.filter && this.props.filter != '<select>') {
            calc_url = this.url + "?company=" + this.props.filter;
        } else {
            calc_url = this.url;
        }
        return axios.get(calc_url)
        .then( (response) => {
            this.loaded = response.data;
        });        
    }
  
    componentDidMount(previousProps, previousState) {
        if (previousState !== this.state || previousProps !== this.props) {
            this.setState({ loading: true });
            this.loadData().then((loaded) => {
                this.setState({
                    loading: false,
                    option: this.getOption(),
                    config: this.getConfig(),
                    filter: this.props.filter
                });
            });
        }
    }
    
    getConfig() {        
        if (this.loaded) {
            return this.loaded.dashboard.config;
        } else {
            return {};
        }
    }

    getOption() {
        if (this.loaded) {
            const option = {
                title: {
                    text: this.loaded.dashboard.config.title,
                    subtext: this.loaded.dashboard.config.subtitle
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                      // Use axis to trigger tooltip
                      type: 'shadow' // 'shadow' as default; can also be 'line' or 'shadow'
                    }
                },
                legend: {
                    orient: 'horizontal',
                    top: 'bottom'
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '10%',
                    containLabel: true
                },
                xAxis: {
                    type: 'value'
                },
                yAxis: {
                    type: 'category',
                    data: this.loaded.data[this.loaded.dashboard.categories].data
                },
                series: this.loaded.data.map((e, index) => {
                    if(index != this.loaded.dashboard.categories) {
                        return {                                            
                            name: e.name,
                            type: "bar",
                            stack: 'total',
                            barWidth: "60%",
                            label: {
                                show: true
                            },
                            emphasis: {
                                focus: 'series'
                            },
                            data: e.data
                        }
                    }
                })
            };
            return option;
        } else {
            return {
                color: ["#3398DB"],
                title: {
                    text: 'Title'
                },
                tooltip: {
                    trigger: "axis",
                    axisPointer: {
                        type: "shadow"
                    }
                },
                grid: {},
                xAxis: [{
                    type: "category",
                    data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
                }],
                yAxis: [{
                    type: "value"
                }],
                series: [{
                    name: "nome",
                    type: "bar",
                    barWidth: "60%",
                    data: [10, 52, 200, 334, 390, 330, 220]
                }]            
            };
        }
    }

    constructor(props) {
        super(props);            
    }

    render() {
        return (
            <div>                
                <div>
                    <ReactECharts 
                        theme="light"
                        key={Date.now()}
                        style={
                            {
                                width: this.state.config.width ? this.state.config.width : 500, 
                                height: this.state.config.height ? this.state.config.height : 400
                            }
                        }
                        option={this.state.option} 
                    />                
                </div>
            </div>
        )
    }
}

export default BarChart;