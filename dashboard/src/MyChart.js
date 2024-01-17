import React, { Component } from 'react';
import ApexChart from "react-apexcharts";

class MyChart extends Component {

    constructor(props) {

        super(props);

        // var dados = props.data.data;
        var dados = props.data;
        // console.log(dados);

        this.state = {
            options: {
                chart: {
                    id: 'loss_rate',
                    type: "area-datetime",
                    zoom: {
                        type: 'x',
                        enabled: true,
                        autoScaleYaxis: true
                    },
                    toolbar: {
                        autoSelected: 'zoom'
                    },
                    stacked: true
                },
                datalabels: {
                    enabled: false
                },
                markers: {
                    size: 0,
                },
                title: {
                    text: 'Loss Rate - 48 hours',
                    align: 'left'
                },
                fill: {
                    type: 'gradient',
                    gradient: {
                        shadeIntensity: 1,
                        opacityFrom: 0.7,
                        opacityTo: 0.9,
                        stops: [0, 90, 100]
                    }
                },
                xaxis: {
                    type: 'datetime',
                    labels: {
                        format: 'dd/MM/yy HH:mm',
                        datetimeUTC: false
                    },
                    categories: dados[0] ? dados[0] : []
                },
                yaxis: {
                    labels: {
                        formatter: function (val) {
                            return val.toFixed(0);
                        },
                    },
                    title: {
                        text: 'Packages Affected'
                    },
                },
                tooltip: {
                    shared: false,
                    y: {
                        formatter: function (val) {
                            return val.toFixed(0)
                        }
                    }
                }
            },
            series: [
                { 
                    name: 'Loss', 
                    data: dados[1] ? dados[1] : []
                },
                { 
                    name: 'stolen', 
                    data: dados[2] ? dados[2] : []
                },
                { 
                    name: 'damaged', 
                    data: dados[3] ? dados[3] : []
                }
            ],
        }
    }

    render() {
        return (
            <div className="mychart">
                <ApexChart 
                    options={this.state.options}
                    series={this.state.series}
                    type="area"
                    width="500"
                    height="400"
                >
                </ApexChart>
            </div>
        )
    }
}

export default MyChart;