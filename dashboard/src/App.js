import Config from "./Config";
import DashBoard from "./Dashboard";

const App = () => {

  return (
      <div className="App">
          <DashBoard name="radar_dashboard" config={Config} />
      </div>
  );
}

export default App;