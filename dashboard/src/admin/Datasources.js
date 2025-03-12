import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';
import MeasurementTip from './Tooltip';
import Config from '../Config';

const Datasources = () => {
    const url = Config.serverBaseUrl + '/datasources';
    const urlMeasurements = Config.serverBaseUrl + '/measurements';
    const [datasources, setDatasources] = useState([]);
    const [selectedDatasource, setSelectedDatasource] = useState(null);
    const [showDatasourcePopup, setShowDatasourcePopup] = useState(false);
    const [showFieldPopup, setShowFieldPopup] = useState(false);
    const [showFilterPopup, setShowFilterPopup] = useState(false);
    const [showOrderPopup, setShowOrderPopup] = useState(false);
    const [showGroupPopup, setShowGroupPopup] = useState(false);
    const [editFieldIndex, setEditFieldIndex] = useState(null);
    const [editFilterIndex, setEditFilterIndex] = useState(null);
    const [editOrderIndex, setEditOrderIndex] = useState(null);
    const [editGroupIndex, setEditGroupIndex] = useState(null);
    const [tempField, setTempField] = useState({ alias: '', expression: '' });
    const [tempFilter, setTempFilter] = useState({ op: 'eq', field: '', value: '' });
    const [tempOrder, setTempOrder] = useState({ field: '', order: 'asc' });
    const [tempGroup, setTempGroup] = useState('');
    const [alertVisible, setAlertVisible] = useState(false);
    const [measurements, setMeasurements] = useState([]);
    const [tooltipVisible, setTooltipVisible] = useState(false);

    const fetchDatasources = async () => {
        try {
            const response = await axios.get(url);
            setDatasources(response.data);
        } catch (error) {
            console.error('Error fetching datasources:', error);
        }
    };

    const fetchMeasurements = async () => {
        try {
            const response = await axios.get(urlMeasurements);
            setMeasurements(response.data);
        } catch (error) {
            console.error('Error fetching measurements:', error);
        }
    };

    useEffect(() => {
        fetchDatasources();
        fetchMeasurements();
    }, []);

    const showAlert = () => {
        setAlertVisible(true);
        setTimeout(() => {
            setAlertVisible(false);
        }, 5000);
    };

    const handleSave = async () => {
        try {
            if (selectedDatasource.id) {
                const response = await axios.put(`${url}/${selectedDatasource.name}`, selectedDatasource);
                console.log(response.data);
            } else {
                const response = await axios.post(url, selectedDatasource);
                console.log(response.data);
            }
            setShowDatasourcePopup(false);
            showAlert();
            fetchDatasources(); // Reload the list of datasources
        } catch (error) {
            console.error('Error saving datasource:', error);
        }
    };

    const handleDelete = async (datasourceName) => {
        try {
            const response = await axios.delete(`${url}/${datasourceName}`);
            console.log(response.data);
            setDatasources(datasources.filter(d => d.name !== datasourceName));
            showAlert();
            fetchDatasources(); // Reload the list of datasources
        } catch (error) {
            console.error('Error deleting datasource:', error);
        }
    };

    const addDatasource = () => {
        setSelectedDatasource({
            name: '',
            query: {
                group: [],
                order: [],
                fields: [],
                window: '',
                filters: [],
                measurement: ''
            }
        });
        setShowDatasourcePopup(true);
    };

    const cancelDatasource = () => {
        setSelectedDatasource(null);
        setShowDatasourcePopup(false);
    };

    const handleDatasourceChange = (key, value) => {
        setSelectedDatasource({ ...selectedDatasource, [key]: value });
    };

    const handleQueryChange = (key, value) => {
        setSelectedDatasource({ ...selectedDatasource, query: { ...selectedDatasource.query, [key]: value } });
    };

    const addField = () => {
        setTempField({ alias: '', expression: '' });
        setEditFieldIndex(null);
        setShowFieldPopup(true);
    };

    const editField = (index) => {
        setTempField(selectedDatasource.query.fields[index]);
        setEditFieldIndex(index);
        setShowFieldPopup(true);
    };

    const saveField = (field) => {
        const newFields = [...selectedDatasource.query.fields];
        if (editFieldIndex !== null) {
            newFields[editFieldIndex] = field;
        } else {
            newFields.push(field);
        }
        setSelectedDatasource({ ...selectedDatasource, query: { ...selectedDatasource.query, fields: newFields } });
        setShowFieldPopup(false);
    };

    const removeField = (index) => {
        const newFields = selectedDatasource.query.fields.filter((_, i) => i !== index);
        setSelectedDatasource({ ...selectedDatasource, query: { ...selectedDatasource.query, fields: newFields } });
    };

    const addFilter = () => {
        setTempFilter({ op: 'eq', field: '', value: '' });
        setEditFilterIndex(null);
        setShowFilterPopup(true);
    };

    const editFilter = (index) => {
        setTempFilter(selectedDatasource.query.filters[index]);
        setEditFilterIndex(index);
        setShowFilterPopup(true);
    };

    const saveFilter = (filter) => {
        const newFilters = [...selectedDatasource.query.filters];
        if (editFilterIndex !== null) {
            newFilters[editFilterIndex] = filter;
        } else {
            newFilters.push(filter);
        }
        setSelectedDatasource({ ...selectedDatasource, query: { ...selectedDatasource.query, filters: newFilters } });
        setShowFilterPopup(false);
    };

    const removeFilter = (index) => {
        const newFilters = selectedDatasource.query.filters.filter((_, i) => i !== index);
        setSelectedDatasource({ ...selectedDatasource, query: { ...selectedDatasource.query, filters: newFilters } });
    };

    const addOrder = () => {
        setTempOrder({ field: '', order: 'asc' });
        setEditOrderIndex(null);
        setShowOrderPopup(true);
    };

    const editOrder = (index) => {
        setTempOrder(selectedDatasource.query.order[index]);
        setEditOrderIndex(index);
        setShowOrderPopup(true);
    };

    const saveOrder = (order) => {
        const newOrders = [...selectedDatasource.query.order];
        if (editOrderIndex !== null) {
            newOrders[editOrderIndex] = order;
        } else {
            newOrders.push(order);
        }
        setSelectedDatasource({ ...selectedDatasource, query: { ...selectedDatasource.query, order: newOrders } });
        setShowOrderPopup(false);
    };

    const removeOrder = (index) => {
        const newOrders = selectedDatasource.query.order.filter((_, i) => i !== index);
        setSelectedDatasource({ ...selectedDatasource, query: { ...selectedDatasource.query, order: newOrders } });
    };

    const addGroup = () => {
        setTempGroup('');
        setEditGroupIndex(null);
        setShowGroupPopup(true);
    };

    const editGroup = (index) => {
        setTempGroup(selectedDatasource.query.group[index]);
        setEditGroupIndex(index);
        setShowGroupPopup(true);
    };

    const saveGroup = (group) => {
        const newGroups = [...selectedDatasource.query.group];
        if (editGroupIndex !== null) {
            newGroups[editGroupIndex] = group;
        } else {
            newGroups.push(group);
        }
        setSelectedDatasource({ ...selectedDatasource, query: { ...selectedDatasource.query, group: newGroups } });
        setShowGroupPopup(false);
    };

    const removeGroup = (index) => {
        const newGroups = selectedDatasource.query.group.filter((_, i) => i !== index);
        setSelectedDatasource({ ...selectedDatasource, query: { ...selectedDatasource.query, group: newGroups } });
    };

    return (
        <div className="container mt-5">
            {alertVisible && <div className="alert alert-success">Changes applied to database</div>}
            <h1 className="container-fluid">Datasources</h1>
            <ul className='container-fluid'>
                <button className="btn btn-primary" onClick={() => window.location.href = '/admin'}>Menu</button>
                <span>&nbsp;</span> 
                <button className="btn btn-primary" onClick={addDatasource}>New Datasource</button>
            </ul>
            <ul className="container-fluid">
                <ul className="list-group container-fluid">
                    {datasources.map((datasource, index) => (
                        <li key={index} className={`list-group-item d-flex justify-content-between align-items-center ${index % 2 === 0 ? 'bg-light' : ''}`}>
                            <a href="#" onClick={() => { datasource.id = datasource.name; setSelectedDatasource(datasource); setShowDatasourcePopup(true); }}>
                                {datasource.name}
                            </a>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(datasource.name)}>-</button>
                        </li>
                    ))}
                </ul>
            </ul>

            {showDatasourcePopup && selectedDatasource && (
                <DatasourcePopup
                    datasource={selectedDatasource}
                    onSave={handleSave}
                    onCancel={cancelDatasource}
                    onDatasourceChange={handleDatasourceChange}
                    onQueryChange={handleQueryChange}
                    addField={addField}
                    editField={editField}
                    removeField={removeField}
                    addFilter={addFilter}
                    editFilter={editFilter}
                    removeFilter={removeFilter}
                    addOrder={addOrder}
                    editOrder={editOrder}
                    removeOrder={removeOrder}
                    addGroup={addGroup}
                    editGroup={editGroup}
                    removeGroup={removeGroup}
                    measurements={measurements}
                />
            )}
            {showFieldPopup && selectedDatasource && (
                <FieldPopup
                    field={tempField}
                    measurement={selectedDatasource?.query?.measurement || ''}
                    onSave={saveField}
                    onCancel={() => setShowFieldPopup(false)}
                />
            )}

            {showFilterPopup && (
                <FilterPopup
                    filter={tempFilter}
                    measurement={selectedDatasource?.query?.measurement || ''}
                    onSave={saveFilter}
                    onCancel={() => setShowFilterPopup(false)}
                />
            )}

            {showOrderPopup && (
                <OrderPopup
                    order={tempOrder}
                    onSave={saveOrder}
                    onCancel={() => setShowOrderPopup(false)}
                    measurement={selectedDatasource?.query?.measurement || ''}
                />
            )}

            {showGroupPopup && (
                <GroupPopup
                    group={tempGroup}
                    onSave={saveGroup}
                    onCancel={() => setShowGroupPopup(false)}
                    measurement={selectedDatasource?.query?.measurement || ''}
                />
            )}
        </div>
    );
};

const DatasourcePopup = ({
    datasource,
    onSave,
    onCancel,
    onDatasourceChange,
    onQueryChange,
    addField,
    editField,
    removeField,
    addFilter,
    editFilter,
    removeFilter,
    addOrder,
    editOrder,
    removeOrder,
    addGroup,
    editGroup,
    removeGroup,
    measurements
}) => {
    return (
        <div className="modal show d-block">
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        
                        <button type="button" className="close" onClick={onCancel}>
                            <span>&times;</span>
                        </button>
                        <span>&nbsp;&nbsp;&nbsp;</span>
                        <h5 className="modal-title">Edit Datasource</h5>
                    </div>
                    <div className="modal-body">
                        <div className="form-group">
                            <label>Datasource Name</label>
                            <input
                                type="text"
                                className="form-control"
                                value={datasource.name}
                                onChange={(e) => onDatasourceChange('name', e.target.value)}
                                placeholder="Datasource Name"
                                disabled={!!datasource.id} // Disable the input if the datasource has an id (i.e., it's being edited)
                            />
                        </div>
                        <div className="form-group">
                            <label>Measurement</label>
                            <select
                                className="form-control"
                                value={datasource.query.measurement}
                                onChange={(e) => onQueryChange('measurement', e.target.value)}
                            >
                                <option id="measurement-cb" value="">Select Measurement</option>
                                {measurements.map((measurement) => (
                                    <option key={measurement.name} value={measurement.name}>
                                        {measurement.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Window</label>
                            <input
                                type="text"
                                className="form-control"
                                value={datasource.query.window}
                                onChange={(e) => onQueryChange('window', e.target.value)}
                                placeholder="Window"
                            />
                        </div>
                        <div className="form-group">
                            <button className="btn btn-secondary mb-2" onClick={addField}>+</button>
                            <label>&nbsp;&nbsp;Fields</label>
                            <ul className="list-group mb-4">
                                {datasource.query.fields.map((field, index) => (
                                    <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                                        <a href="#" onClick={() => editField(index)}>
                                            {`${field.expression} [${field.alias}]`}
                                        </a>
                                        <button className="btn btn-danger btn-sm" onClick={() => removeField(index)}>-</button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="form-group">
                            <button className="btn btn-secondary mb-2" onClick={addFilter}>+</button>
                            <label>&nbsp;&nbsp;Filters</label>
                            <ul className="list-group mb-4">
                                {datasource.query.filters.map((filter, index) => (
                                    <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                                        <a href="#" onClick={() => editFilter(index)}>
                                            {`${filter.field}:${filter.op}:${filter.value}`}
                                        </a>
                                        <button className="btn btn-danger btn-sm" onClick={() => removeFilter(index)}>-</button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="form-group">
                            <button className="btn btn-secondary mb-2" onClick={addOrder}>+</button>
                            <label>&nbsp;&nbsp;Order</label>
                            <ul className="list-group mb-4">
                                {datasource.query.order.map((order, index) => (
                                    <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                                        <a href="#" onClick={() => editOrder(index)}>
                                            {`${order.field}:${order.order}`}
                                        </a>
                                        <button className="btn btn-danger btn-sm" onClick={() => removeOrder(index)}>-</button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="form-group">
                            <button className="btn btn-secondary mb-2" onClick={addGroup}>+</button>
                            <label>&nbsp;&nbsp;Group</label>
                            <ul className="list-group mb-4">
                                {datasource.query.group.map((group, index) => (
                                    <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                                        <a href="#" onClick={() => editGroup(index)}>
                                            {group}
                                        </a>
                                        <button className="btn btn-danger btn-sm" onClick={() => removeGroup(index)}>-</button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button className="btn btn-primary" onClick={onSave}>Save</button>
                        <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const FieldPopup = ({ field, onSave, onCancel, measurement }) => {
    const [alias, setAlias] = useState(field?.alias || '');
    const [expression, setExpression] = useState(field?.expression || '');
    const [tooltipVisible, setTooltipVisible] = useState(false);

    return (
        <div className="modal show d-block">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <button type="button" className="close" onClick={onCancel}>
                            <span>&times;</span>
                        </button>
                        <span>&nbsp;&nbsp;&nbsp;</span>
                        <h5 className="modal-title">Edit Field</h5>
                    </div>
                    <div className="modal-body">
                        <div className="form-group">
                            <label>Alias</label>
                            <input
                                type="text"
                                className="form-control"
                                value={alias}
                                onChange={(e) => setAlias(e.target.value)}
                                placeholder="Alias"
                            />
                        </div>
                        <div className="form-group">
                            <label>Expression</label>
                            <input
                                type="text"
                                className="form-control"
                                value={expression}
                                onChange={(e) => setExpression(e.target.value)}
                                placeholder="Expression"
                                onFocus={() => setTooltipVisible(true)}
                                onBlur={() => setTooltipVisible(false)}
                            />
                            {tooltipVisible && measurement && (
                                <div className="tooltip-box">
                                    <MeasurementTip measurement={measurement} />
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button className="btn btn-primary" onClick={() => onSave({ alias, expression })}>Save</button>
                        <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const FilterPopup = ({ filter, onSave, onCancel, measurement }) => {
    const [op, setOp] = useState(filter?.op || 'eq');
    const [field, setField] = useState(filter?.field || '');
    const [value, setValue] = useState(filter?.value || '');
    const [tooltipVisibleField, setTooltipVisibleField] = useState(false);
    const [tooltipVisibleValue, setTooltipVisibleValue] = useState(false);

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
                            <label>Field</label>
                            <input
                                type="text"
                                className="form-control"
                                value={field}
                                onChange={(e) => setField(e.target.value)}
                                placeholder="Field"
                                onFocus={() => setTooltipVisibleField(true)}
                                onBlur={() => setTooltipVisibleField(false)}
                            />
                            {tooltipVisibleField && measurement && (
                                <div className="tooltip-box">
                                    <MeasurementTip measurement={measurement} />
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label>Operation</label>
                            <select className="form-control" value={op} onChange={(e) => setOp(e.target.value)}>
                                <option value="eq">eq</option>
                                <option value="neq">neq</option>
                                <option value="lt">lt</option>
                                <option value="gt">gt</option>
                                <option value="lte">lte</option>
                                <option value="gte">gte</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Value</label>
                            <input
                                type="text"
                                className="form-control"
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                onFocus={() => setTooltipVisibleValue(true)}
                                onBlur={() => setTooltipVisibleValue(false)}
                                placeholder="Value"
                            />
                            {tooltipVisibleValue && measurement && (
                                <div className="tooltip-box">
                                    <MeasurementTip measurement={measurement} />
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button className="btn btn-primary" onClick={() => onSave({ op, field, value })}>
                            Save
                        </button>
                        <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const OrderPopup = ({ order, onSave, onCancel, measurement }) => {
    const [field, setField] = useState(order?.field || '');
    const [orderType, setOrderType] = useState(order?.order || 'asc');
    const [tooltipVisible, setTooltipVisible] = useState(false);

    return (
        <div className="modal show d-block">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <button type="button" className="close" onClick={onCancel}>
                            <span>&times;</span>
                        </button>
                        <span>&nbsp;&nbsp;&nbsp;</span>
                        <h5 className="modal-title">Edit Order</h5>
                    </div>
                    <div className="modal-body">
                        <div className="form-group">
                            <label>Field</label>
                            <input
                                type="text"
                                className="form-control"
                                value={field}
                                onChange={(e) => setField(e.target.value)}
                                onFocus={() => setTooltipVisible(true)}
                                onBlur={() => setTooltipVisible(false)}
                                placeholder="Field"
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
                                value={orderType}
                                onChange={(e) => setOrderType(e.target.value)}
                            >
                                <option value="asc">asc</option>
                                <option value="desc">desc</option>
                            </select>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button className="btn btn-primary" onClick={() => onSave({ field, order: orderType })}>
                            Save
                        </button>
                        <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const GroupPopup = ({ group, onSave, onCancel, measurement }) => {
    const [field, setField] = useState(group || '');
    const [tooltipVisible, setTooltipVisible] = useState(false);

    return (
        <div className="modal show d-block">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <button type="button" className="close" onClick={onCancel}>
                            <span>&times;</span>
                        </button>
                        <span>&nbsp;&nbsp;&nbsp;</span>
                        <h5 className="modal-title">Edit Group</h5>
                    </div>
                    <div className="modal-body">
                        <div className="form-group">
                            <label>Field</label>
                            <input
                                type="text"
                                className="form-control"
                                value={field}
                                onChange={(e) => setField(e.target.value)}
                                onFocus={() => setTooltipVisible(true)}
                                onBlur={() => setTooltipVisible(false)}
                                placeholder="Field"
                            />
                            {tooltipVisible && measurement && (
                                <div className="tooltip-box">
                                    <MeasurementTip measurement={measurement} />
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button className="btn btn-primary" onClick={() => onSave(field)}>Save</button>
                        <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Datasources;