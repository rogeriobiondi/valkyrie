import axios from 'axios';
import { useEffect } from 'react';
import { useState } from "react";
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';
import React from 'react';
import Config from './Config';

const Filter = (props) => {
    
    const [options, setOptions] = useState([]);
    const [selected, setSelected] = useState([]);
    const [key, setKey] = useState(0);
    
    const [, updateState] = React.useState();
    const forceUpdate = React.useCallback(() => updateState({}), []);
    
    useEffect(() => {
        if (props.dashboard.config.filters) {
            // Wait all map promises to be resolved
            // Map each filter to a promise
            const promises = props.dashboard.config.filters.map((filter, i) => {
                let url = Config.serverBaseUrl + "/filters/data/" + filter;
                return axios.get(url).then((response) => response.data);
            });
            // Wait all promises to be resolved
            Promise.all(promises).then((results) => {
                for(var i = 0; i < results.length; i++) {
                    results[i].data.unshift('[ALL]');
                }
                setOptions(results);
            });
        }        
        
    }, [props]);

    const choice = (filter, e) => {
        var selecionado = selected        
        for (var i = 0; i < selecionado.length; i++) {
            if (selecionado[i].startsWith(filter)) {
                selecionado.splice(i, 1);
            }
        }
        if(e.value !== '[ALL]') {
            selecionado.push(`${filter}=${e.value}`);
        }
        setSelected(selecionado);
        setKey(key + 1);
    };
  
    return (
        <div>
            <div className="filter_container">
            { 
                (options !== undefined && options.length > 0) &&    
                     options.map( (option, i) => {
                        let dimension = option.dimension;
                        let data = option.data;                        
                        return (
                            <div key={i}>
                                <div className='filter_caption'>{dimension}</div>
                                <div>
                                    <Dropdown 
                                        className='dropdown' 
                                        options={data} 
                                        onChange={(e) => choice(dimension, e)}
                                    />
                                </div>
                            </div>
                        );
                    })
            }
            </div>
            <div className="container" key={Date.now()}>
            {
                (React.Children.map(props.children, (child) => {
                    if (React.isValidElement(child)) {
                            return React.cloneElement(child, { selected: selected });
                    };
                }))
            }                  
            </div>
        </div>
    );
}

export default Filter;