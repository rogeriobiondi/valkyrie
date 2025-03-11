import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Config from '../Config';

const Charts = () => {
  const url = `${Config.serverBaseUrl}/charts`;
  const urlDatasources = `${Config.serverBaseUrl}/datasources`;
  const [charts, setCharts] = useState([]);
  const [datasources, setDatasources] = useState([]);
  const [selectedChart, setSelectedChart] = useState(null);
  const [showChartPopup, setShowChartPopup] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);

  // Fetch charts
  const fetchCharts = async () => {
    try {
      const response = await axios.get(url);
      setCharts(response.data || []);
    } catch (error) {
      console.error('Error fetching charts:', error);
    }
  };

  // Fetch datasources for combobox
  const fetchDatasources = async () => {
    try {
      const response = await axios.get(urlDatasources);
      setDatasources(response.data || []);
    } catch (error) {
      console.error('Error fetching datasources:', error);
    }
  };

  useEffect(() => {
    fetchCharts();
    fetchDatasources();
  }, []);

  const showAlert = () => {
    setAlertVisible(true);
    setTimeout(() => setAlertVisible(false), 2000);
  };

  // Create a new chart
  const addChart = () => {
    setSelectedChart({
      name: '',
      datasource: '',
      categories: 0,
      config: { type: 'stackedbar-horizontal', width: 500, height: 400, theme: 'light', title: '' }
    });
    setShowChartPopup(true);
  };

  // Edit an existing chart
  const editChart = (index) => {
    setSelectedChart(charts[index]);
    setShowChartPopup(true);
  };

  // Delete a chart
  const deleteChart = async (name) => {
    try {
      await axios.delete(`${url}/${name}`);
      await fetchCharts();
      showAlert();
    } catch (error) {
      console.error('Error deleting chart:', error);
    }
  };

  // Save or update the chart
  const saveChart = async (chartData) => {
    try {
      if (charts.find((c) => c.name === chartData.name)) {
        await axios.put(`${url}/${chartData.name}`, chartData);
      } else {
        await axios.post(url, chartData);
      }
      await fetchCharts();
      setShowChartPopup(false);
      showAlert();
    } catch (error) {
      console.error('Error saving chart:', error);
    }
  };

  return (
    <div className="container mt-5">
      {alertVisible && <div className="alert alert-success">Changes applied to database</div>}
      <h1 className="container-fluid">Charts</h1>
      <ul className="container-fluid">
        <button className="btn btn-primary" onClick={() => window.location.href = '/admin'}>Menu</button>
        <span> </span>
        <button className="btn btn-primary" onClick={addChart}>New Chart</button>
      </ul>
      <ul className="container-fluid list-group">
        {charts.map((chart, index) => (
          <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
            <a href="#" onClick={() => editChart(index)}>
              {chart.name}
            </a>
            <button className="btn btn-danger btn-sm" onClick={() => deleteChart(chart.name)}>
              -
            </button>
          </li>
        ))}
      </ul>

      {showChartPopup && (
        <ChartPopup
          chart={selectedChart}
          datasources={datasources}
          onSave={saveChart}
          onCancel={() => setShowChartPopup(false)}
        />
      )}
    </div>
  );
};

// Popup for creating/editing a chart
const ChartPopup = ({ chart, datasources, onSave, onCancel }) => {
  const [name, setName] = useState(chart?.name || '');
  const [datasource, setDatasource] = useState(chart?.datasource || '');
  const [categories] = useState(chart?.categories || 0); // Not exposed for editing in specs
  const [config, setConfig] = useState(chart?.config || {
    type: 'stackedbar-horizontal',
    width: 500,
    height: 400,
    theme: 'light',
    title: ''
  });

  const handleSave = () => {
    onSave({
      name,
      datasource,
      categories,
      config
    });
  };

  return (
    <div className="modal show d-block">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <button type="button" className="close" onClick={onCancel}>
              <span>&times;</span>
            </button>
            <span>&nbsp;&nbsp;&nbsp;</span>
            <h5 className="modal-title">Edit Chart</h5>
          </div>
          <div className="modal-body">

            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                className="form-control"
                disabled={!!chart?.name} // read-only if editing
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Chart Name"
              />
            </div>

            <div className="form-group">
              <label>Datasource</label>
              <select
                className="form-control"
                value={datasource}
                onChange={(e) => setDatasource(e.target.value)}
              >
                <option value="">Select Datasource</option>
                {datasources.map((ds) => (
                  <option key={ds.name} value={ds.name}>
                    {ds.name}
                  </option>
                ))}
              </select>
            </div>

            <hr />
            <h5>Chart Config</h5>

            <div className="form-group">
              <label>Type</label>
              <select
                className="form-control"
                value={config.type}
                onChange={(e) => setConfig({ ...config, type: e.target.value })}
              >
                <option value="stackedbar-horizontal">stackedbar-horizontal</option>
                <option value="stackedbar-vertical">stackedbar-vertical</option>
              </select>
            </div>

            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                className="form-control"
                value={config.title}
                onChange={(e) => setConfig({ ...config, title: e.target.value })}
                placeholder="Chart Title"
              />
            </div>

            <div className="form-group">
              <label>Theme</label>
              <select
                className="form-control"
                value={config.theme}
                onChange={(e) => setConfig({ ...config, theme: e.target.value })}
              >
                <option value="light">light</option>
                <option value="dark">dark</option>
              </select>
            </div>

            <div className="form-group">
              <label>Width</label>
              <input
                type="number"
                className="form-control"
                value={config.width}
                onChange={(e) => setConfig({ ...config, width: parseInt(e.target.value || '0', 10) })}
              />
            </div>

            <div className="form-group">
              <label>Height</label>
              <input
                type="number"
                className="form-control"
                value={config.height}
                onChange={(e) => setConfig({ ...config, height: parseInt(e.target.value || '0', 10) })}
              />
            </div>

          </div>
          <div className="modal-footer">
            <button className="btn btn-primary" onClick={handleSave}>Save</button>
            <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Charts;