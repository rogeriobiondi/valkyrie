import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Config from '../Config';

const Dashboards = () => {
  const url = `${Config.serverBaseUrl}/dashboards`;
  const urlCharts = `${Config.serverBaseUrl}/charts`;
  const urlFilters = `${Config.serverBaseUrl}/filters`;

  const [dashboards, setDashboards] = useState([]);
  const [selectedDashboard, setSelectedDashboard] = useState(null);
  const [showDashboardPopup, setShowDashboardPopup] = useState(false);
  const [showChartsPopup, setShowChartsPopup] = useState(false);
  const [showFiltersPopup, setShowFiltersPopup] = useState(false);
  const [tempChart, setTempChart] = useState('');
  const [tempFilter, setTempFilter] = useState('');
  const [chartsList, setChartsList] = useState([]);
  const [filtersList, setFiltersList] = useState([]);
  const [alertVisible, setAlertVisible] = useState(false);

  // Fetch all dashboards
  const fetchDashboards = async () => {
    try {
      const response = await axios.get(url);
      setDashboards(response.data || []);
    } catch (error) {
      console.error('Error fetching dashboards:', error);
    }
  };

  // Fetch available charts
  const fetchCharts = async () => {
    try {
      const response = await axios.get(urlCharts);
      setChartsList(response.data || []);
    } catch (error) {
      console.error('Error fetching charts:', error);
    }
  };

  // Fetch available filters
  const fetchFilters = async () => {
    try {
      const response = await axios.get(urlFilters);
      setFiltersList(response.data || []);
    } catch (error) {
      console.error('Error fetching filters:', error);
    }
  };

  useEffect(() => {
    fetchDashboards();
    fetchCharts();
    fetchFilters();
  }, []);

  const showAlert = () => {
    setAlertVisible(true);
    setTimeout(() => setAlertVisible(false), 2000);
  };

  // Create a new dashboard
  const addDashboard = () => {
    setSelectedDashboard({
      name: '',
      config: {
        title: '',
        charts: [],
        filters: []
      }
    });
    setShowDashboardPopup(true);
  };

  // Edit an existing dashboard
  const editDashboard = (index) => {
    setSelectedDashboard(dashboards[index]);
    setShowDashboardPopup(true);
  };

  // Delete a dashboard
  const deleteDashboard = async (name) => {
    try {
      await axios.delete(`${url}/${name}`);
      await fetchDashboards();
      showAlert();
    } catch (error) {
      console.error('Error deleting dashboard:', error);
    }
  };

  // Save or update the dashboard
  const saveDashboard = async (dashboardData) => {
    try {
      if (dashboards.find((d) => d.name === dashboardData.name)) {
        await axios.put(`${url}/${dashboardData.name}`, dashboardData);
      } else {
        await axios.post(url, dashboardData);
      }
      await fetchDashboards();
      setShowDashboardPopup(false);
      showAlert();
    } catch (error) {
      console.error('Error saving dashboard:', error);
    }
  };

  // Add a chart to the current dashboard
  const addChartToDashboard = () => {
    const updated = { ...selectedDashboard };
    updated.config.charts.push(tempChart);
    setSelectedDashboard(updated);
    setShowChartsPopup(false);
    setTempChart('');
  };

  // Add a filter to the current dashboard
  const addFilterToDashboard = () => {
    const updated = { ...selectedDashboard };
    updated.config.filters.push(tempFilter);
    setSelectedDashboard(updated);
    setShowFiltersPopup(false);
    setTempFilter('');
  };

  return (
    <div className="container mt-5">
      {alertVisible && <div className="alert alert-success">Changes applied to database</div>}
      <h1 className="container-fluid">Dashboards</h1>
      <ul className="container-fluid">
        <button className="btn btn-primary" onClick={() => window.location.href = '/admin'}>Menu</button>
        <span> </span>
        <button className="btn btn-primary" onClick={addDashboard}>New Dashboard</button>
      </ul>
      <ul className="container-fluid list-group">
        {dashboards.map((dashboard, index) => (
          <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <a href="#" onClick={() => editDashboard(index)}>
                {dashboard.name}
              </a>
            </div>
            <div>
              <button
                className="btn btn-info btn-function-square btn-sm mr-2"
                onClick={() => window.open(`http://localhost:3000/${dashboard.name}`, "_blank")}
              >
                <i className="bi bi-eye"></i>
              </button>
              <button className="btn btn-danger btn-sm btn-function-square" onClick={() => deleteDashboard(dashboard.name)}>
                -
              </button>
            </div>
          </li>
        ))}
      </ul>

      {showDashboardPopup && selectedDashboard && (
        <DashboardPopup
          dashboard={selectedDashboard}
          onSave={saveDashboard}
          onCancel={() => setShowDashboardPopup(false)}
          onShowChartsPopup={() => setShowChartsPopup(true)}
          onShowFiltersPopup={() => setShowFiltersPopup(true)}
          setDashboard={setSelectedDashboard}
        />
      )}

      {showChartsPopup && (
        <ChartsPopup
          charts={chartsList}
          selectedChart={tempChart}
          setSelectedChart={setTempChart}
          onSave={addChartToDashboard}
          onCancel={() => setShowChartsPopup(false)}
        />
      )}

      {showFiltersPopup && (
        <FiltersPopup
          filters={filtersList}
          selectedFilter={tempFilter}
          setSelectedFilter={setTempFilter}
          onSave={addFilterToDashboard}
          onCancel={() => setShowFiltersPopup(false)}
        />
      )}
    </div>
  );
};

// Popup for editing/creating a dashboard
const DashboardPopup = ({ dashboard, onSave, onCancel, onShowChartsPopup, onShowFiltersPopup, setDashboard }) => {
  const [name, setName] = useState(dashboard.name || '');
  const [title, setTitle] = useState(dashboard.config?.title || '');

  const handleSave = () => {
    onSave({
      name,
      config: {
        title,
        charts: dashboard.config.charts || [],
        filters: dashboard.config.filters || []
      }
    });
  };

  const removeChart = (index) => {
    const updated = { ...dashboard };
    updated.config.charts.splice(index, 1);
    setDashboard(updated);
  };

  const removeFilter = (index) => {
    const updated = { ...dashboard };
    updated.config.filters.splice(index, 1);
    setDashboard(updated);
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
            <h5 className="modal-title">Edit Dashboard</h5>
          </div>
          <div className="modal-body">
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                className="form-control"
                disabled={!!dashboard.name}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dashboard Name"
              />
            </div>

            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                className="form-control"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Dashboard Title"
              />
            </div>

            <hr />
            <h5>Charts</h5>
            <ul className="list-group mb-3">
              {dashboard.config.charts.map((c, i) => (
                <li key={i} className="list-group-item d-flex justify-content-between align-items-center">
                  {c}
                  <button className="btn btn-danger btn-sm" onClick={() => removeChart(i)}>-</button>
                </li>
              ))}
            </ul>
            <button className="btn btn-primary" onClick={onShowChartsPopup}>+ Add Chart</button>

            <hr />
            <h5>Filters</h5>
            <ul className="list-group mb-3">
              {dashboard.config.filters.map((f, i) => (
                <li key={i} className="list-group-item d-flex justify-content-between align-items-center">
                  {f}
                  <button className="btn btn-danger btn-sm" onClick={() => removeFilter(i)}>-</button>
                </li>
              ))}
            </ul>
            <button className="btn btn-primary" onClick={onShowFiltersPopup}>+ Add Filter</button>

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

// Popup for adding a chart to a dashboard
const ChartsPopup = ({ charts, selectedChart, setSelectedChart, onSave, onCancel }) => {
  return (
    <div className="modal show d-block">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Add Chart</h5>
            <button type="button" className="close" onClick={onCancel}>
              <span>&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <div className="form-group">
              <label>Select Chart</label>
              <select
                className="form-control"
                value={selectedChart}
                onChange={(e) => setSelectedChart(e.target.value)}
              >
                <option value="">Select Chart</option>
                {charts.map((c, idx) => (
                  <option key={idx} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-primary" onClick={onSave} disabled={!selectedChart}>Save</button>
            <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Popup for adding a filter to a dashboard
const FiltersPopup = ({ filters, selectedFilter, setSelectedFilter, onSave, onCancel }) => {
  return (
    <div className="modal show d-block">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Add Filter</h5>
            <button type="button" className="close" onClick={onCancel}>
              <span>&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <div className="form-group">
              <label>Select Filter</label>
              <select
                className="form-control"
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
              >
                <option value="">Select Filter</option>
                {filters.map((f, idx) => (
                  <option key={idx} value={f.name}>{f.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-primary" onClick={onSave} disabled={!selectedFilter}>Save</button>
            <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboards;