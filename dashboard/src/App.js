import Config from "./admin/Admin";
import DashBoard from "./Dashboard";
import React from "react";

import "./styles/App.css";

const App = () => {
  const path = window.location.pathname;
  const dashboardName = path.substring(path.lastIndexOf('/') + 1);
  console.log("dashboardName", dashboardName);
  if (dashboardName === "") {
    const address = window.location.hostname;
    const port = window.location.port;
    return (
      <div className="App" style={{padding: "20px"}}>
      <h1>Dashboard</h1>
      <hr />
      <h3>No dashboard selected</h3>
      <p>Please select a dashboard from the URL</p>
      <p>e.g. http://{address}:{port}/dashboard_name</p>
      </div>
    );
  }
  return (
    <div className="App">
        <DashBoard name={dashboardName} config={Config} />
    </div>
  );
}

export default App;