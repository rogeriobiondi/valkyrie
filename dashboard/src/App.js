import './dashboard.css';
import { useEffect, useState, useCallback, updateState, useReducer, createRef, Component } from "react";
import BarChart from "./BarChart";
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';

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
        <div className="container2">
          <div>
            <Dropdown className="combobox" options={options} onChange={this.choice} value={defaultOption} placeholder="<select>" />
          </div>
          <div className="container">
            <div className="flex-item">
              <BarChart key={this.state.counter} ref={this.state.ref} width="500" height="400" name="radar_dashboard" filter={this.state.filterCompany} />
            </div>
            <div className="flex-item">
                <BarChart key={this.state.counter} ref={this.state.ref} width="500" height="400" name="etapa_dashboard"   filter={this.state.filterCompany}/>
            </div>
            <div className="flex-item">
                <BarChart key={this.state.counter} ref={this.state.ref} width="500" height="400" name="company_dashboard" filter={this.state.filterCompany}/>
            </div> 
          </div>
        </div>
      </div>
    );
  }
}

export default App;