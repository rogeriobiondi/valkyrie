import axios from 'axios';
import { useEffect } from 'react';
import { useState } from "react";
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';
import React from 'react';

const Filter = (props) => {

    const [, updateState] = React.useState();
    const forceUpdate = React.useCallback(() => updateState({}), []);
    const [loading, setLoading] = useState(false);    
    const [error, setError] = useState(null);
    const [options, setOptions] = useState({});
    const [selected, setSelected] = useState([]);
    
    useEffect(() => {
        setLoading(true);        
        let filter = props.filters[0];
        let name = props.name;
        props.filters.map((filter, i) => {
            let url = `http://localhost:8000/domains/${props.name}/${filter}`
            axios.get(url)        
            .then( (response) => {
                var filter_data = ['<select>'].concat(response.data);  
                var options_data = options;
                options_data[filter] = filter_data
                setOptions(options_data);
                setLoading(false);
                console.log('Options', options_data);
            })
            .catch((error) => {
                setError(error);
            });
        });
    }, [props]);
  
    const choice = (filter, e) => {
        var selecionado = selected        
        for (var i = 0; i < selecionado.length; i++) {
            if (selecionado[i].startsWith(filter)) {
                selecionado.splice(i, 1);
            }
        }
        if(e.value !== '<select>') {
            selecionado.push(`${filter}=${e.value}`);
        }
        setSelected(selecionado);
        console.log('Selecionado', selecionado);
        forceUpdate();
    };
    
    if(props.loading) {
        return <div>Loading...</div>;
    }
    if(error) {
        return <div>{error.message}</div>;
    } else {
        return (
                <div>
                    {selected}
                    <div>
                    {
                        props.filters.map((filter, i) => {                            
                            if(options !== undefined){    
                            if (options[filter] !== undefined ) {
                                    if(options[filter].length > 0) {
                                    return (<div key={i}><Dropdown className="combobox" options={options[filter]} onChange={(e) => {choice(filter, e)}}/></div>)
                                    }
                                }
                            }
                        })
                    }
                    </div>
                    <div>
                        {
                            React.Children.map(props.children, (child) => {
                                // checking isValidElement is the safe way and avoids a typescript error too
                                if (React.isValidElement(child)) {
                                        let cloned = React.cloneElement(child, { name: props.name, measurement: props.measurement, filters: props.filters, selected: selected });
                                        // console.log('Cloning element', cloned);
                                        return cloned;
                                };
                            })
                        }                  
                    </div>
                </div>            
        )
    }
}

export default Filter;