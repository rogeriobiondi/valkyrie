import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';


export function Filter({children, options, defaultOption, choice}) {
    
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