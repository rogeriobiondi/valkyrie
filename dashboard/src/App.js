import './dashboard.css';
import { createRef, Component } from "react";
import BarChart from "./BarChart";
import 'react-dropdown/style.css';

import { Filter } from './Filter';

const options = [
    '<select>', 'ali', 'shopee', 'magalu'
];

const defaultOption = options[0];

class App extends Component {
  
  state = {
    counter: 0,
    filterCompany: "<select>"
  };

  constructor(props) {
    super(props);
    this.choice = this.choice.bind(this);
  }
  
  childRef = createRef();

  choice(e) {
    console.log(e.value);
    this.setState({filterCompany: e.value});
    this.setState({counter: this.state.counter + 1});
    this.forceUpdate();
  }

  render() {
    return (
      <div className="App">
        <h1 className="title">Dashboards</h1>        
        <Filter name="radar-filter"
                fields={["company"]}
                options={options} 
                defaultOption={defaultOption} 
                choice={this.choice}>
          <div className="flex-item">
            <BarChart key={this.state.counter} ref={this.state.ref} width="500" height="400" name="radar_dashboard" filter={this.state.filterCompany} />
          </div>          
          <div className="flex-item">
              <BarChart key={this.state.counter} ref={this.state.ref} width="500" height="400" name="etapa_dashboard"   filter={this.state.filterCompany}/>
          </div>
          <div className="flex-item">
              <BarChart key={this.state.counter} ref={this.state.ref} width="500" height="400" name="company_dashboard" filter={this.state.filterCompany}/>
          </div>
          <div className="flex-item">
              <BarChart key={this.state.counter} ref={this.state.ref} width="500" height="400" name="looping_dashboard" filter={this.state.filterCompany}/>
          </div>
        </Filter>
      </div>
    );
  }
}

export default App;