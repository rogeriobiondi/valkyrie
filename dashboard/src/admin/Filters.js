import React, { useEffect, useState } from 'react';
import axios from 'axios';
import MeasurementTip from './Tooltip'; // Reuse your tooltip logic
import Config from '../Config'; // Reuse your config logic

const Filters = () => {
  const url = Config.serverBaseUrl + '/filters';
  const urlDatasources = Config.serverBaseUrl + '/datasources';
  const [filters, setFilters] = useState([]);
  const [datasources, setDatasources] = useState([]); // For datasource combobox
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);

  // Fetch existing filters
  const fetchFilters = async () => {
    try {
      const response = await axios.get(url);
      // Assuming response.data is an array of filters
      setFilters(response.data || []);
    } catch (error) {
      console.error('Error fetching filters:', error);
    }
  };

  // Fetch datasources so user can pick from them
  const fetchDatasources = async () => {
    try {
      const response = await axios.get(urlDatasources);
      // Assuming response.data is an array of datasources
      setDatasources(response.data || []);
    } catch (error) {
      console.error('Error fetching datasources:', error);
    }
  };

  useEffect(() => {
    fetchFilters();
    fetchDatasources();
  }, []);

  const showAlert = () => {
    setAlertVisible(true);
    setTimeout(() => setAlertVisible(false), 2000);
  };

  // Create a new filter
  const addFilter = () => {
    setSelectedFilter({ name: '', datasource: '', dimension: '', order: 'asc' });
    setShowFilterPopup(true);
  };

  // Edit an existing filter
  const editFilter = (index) => {
    setSelectedFilter(filters[index]);
    setShowFilterPopup(true);
  };

  // Delete a filter
  const deleteFilter = async (name) => {
    try {
      await axios.delete(`${url}/${name}`);
      await fetchFilters();
      showAlert();
    } catch (error) {
      console.error('Error deleting filter:', error);
    }
  };

  // Save or update the filter
  const saveFilter = async (filterData) => {
    try {
      if (filters.find((f) => f.name === filterData.name)) {
        // If filter exists, we do a PUT (this depends on your backend logic)
        await axios.put(`${url}/${filterData.name}`, filterData);
      } else {
        // If new, we do a POST
        await axios.post(url, filterData);
      }
      await fetchFilters();
      setShowFilterPopup(false);
      showAlert();
    } catch (error) {
      console.error('Error saving filter:', error);
    }
  };

  return (
    <div className="container mt-5">
      {alertVisible && <div className="alert alert-success">Changes applied to database</div>}
      <h1 className="container-fluid">Filters</h1>
      <ul className="container-fluid">
        <button className="btn btn-primary" onClick={() => window.location.href = '/admin'}>Menu</button>
        <span> </span> 
        <button className="btn btn-primary" onClick={addFilter}>New Filter</button>
      </ul>
      <ul className="container-fluid list-group">
        {filters.map((filter, index) => (
          <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
            <a href="#" onClick={() => editFilter(index)}>
              {filter.name}
            </a>
            <button className="btn btn-danger btn-sm" onClick={() => deleteFilter(filter.name)}>
              -
            </button>
          </li>
        ))}
      </ul>

      {showFilterPopup && (
        <FilterPopup
          filter={selectedFilter}
          datasources={datasources}
          onSave={saveFilter}
          onCancel={() => setShowFilterPopup(false)}
        />
      )}
    </div>
  );
};

// Popup for creating/editing a filter
const FilterPopup = ({ filter, datasources, onSave, onCancel }) => {
  const [name, setName] = useState(filter?.name || '');
  const [datasource, setDatasource] = useState(filter?.datasource || '');
  const [dimension, setDimension] = useState(filter?.dimension || '');
  const [order, setOrder] = useState(filter?.order || 'asc');
  const [tooltipVisible, setTooltipVisible] = useState(false);

  // Find the datasource the user selected to get its measurement
  const currentDatasource = datasources.find((ds) => ds.name === datasource);
  const measurement = currentDatasource?.query?.measurement || '';

  const handleSave = () => {
    onSave({
      name,
      datasource,
      dimension,
      order
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
            <h5 className="modal-title">Edit Filter</h5>
          </div>
          <div className="modal-body">

            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Filter Name"
                disabled={!!filter?.name} // read-only if editing
              />
            </div>

            <div className="form-group">
              <label>Datasource</label>
              <select
                className="form-control"
                value={datasource}
                onChange={(e) => {
                  setDatasource(e.target.value); // This must match a ds.name
                }}
              >
                <option value="">Select Datasource</option>
                {datasources.map((ds) => (
                  <option key={ds.name} value={ds.name}>
                    {ds.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Dimension</label>
              <input
                type="text"
                className="form-control"
                value={dimension}
                onChange={(e) => setDimension(e.target.value)}
                onFocus={() => setTooltipVisible(true)}
                onBlur={() => setTooltipVisible(false)}
                placeholder="Dimension"
              />
              {tooltipVisible && measurement && (
                <div className="tooltip-box">
                  <MeasurementTip measurement={measurement} />
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Order</label>
              <select
                className="form-control"
                value={order}
                onChange={(e) => setOrder(e.target.value)}
              >
                <option value="asc">asc</option>
                <option value="desc">desc</option>
              </select>
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

export default Filters;