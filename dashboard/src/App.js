import DashBoard from "./Dashboard";

const App = () => {

  return (
      <div className="App">
          <DashBoard name="radar_dashboard" 
                     title="Dashboards" 
                     filters={["company", "etapa"]}/>
      </div>
  );
}

export default App;