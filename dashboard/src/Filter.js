import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';
import { useState } from "react";


export function Filter({measurement, children, choice}) {

    const [options, setOptions] = useState([ '<select>', 'ali', 'shopee', 'magalu' ]);      
    const defaultOption = options[0];

    // useEffect(() => {
    //     axios.get("http://localhost:8000/domain?name=" + name)
    //     .then( (response) => {
    //         setOptions(response.data.dashboard.config.options);
    //     });        
    // }, [name]);
    
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