import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';
import { useState } from "react";


export function Filter({measurement, children, options, defaultOption, choice}) {

    // [options, setOptions] = useState([ '<select>', 'ali', 'shopee', 'magalu' ]);
    
    options = [ '<select>', 'ali', 'shopee', 'magalu' ];
    
    defaultOption = options[0];
    
    return (
        <div>
            <div>
                <Dropdown className="combobox" options={options} onChange={choice} value={defaultOption} placeholder="<select>" />
            </div>
            <div className="container">
                {children}
            </div>
        </div>
    )
}