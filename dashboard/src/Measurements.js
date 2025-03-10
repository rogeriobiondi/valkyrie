import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const Measurements = () => {
    const [measurements, setMeasurements] = useState([]);
    const [selectedMeasurement, setSelectedMeasurement] = useState(null);
    const [editDimension, setEditDimension] = useState(null);
    const [editField, setEditField] = useState(null);
    const [showDimensionPopup, setShowDimensionPopup] = useState(false);
    const [showFieldPopup, setShowFieldPopup] = useState(false);
    const [showMeasurementPopup, setShowMeasurementPopup] = useState(false);
    const [tempDimension, setTempDimension] = useState({ name: '', type: 'integer' });
    const [tempField, setTempField] = useState({ name: '', type: 'integer' });
    const [alertVisible, setAlertVisible] = useState(false);

    const fetchMeasurements = async () => {
        try {
            const response = await axios.get('http://localhost:8000/measurements');
            setMeasurements(response.data);
        } catch (error) {
            console.error('Error fetching measurements:', error);
        }
    };

    useEffect(() => {
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
            const response = await axios.post('http://localhost:8000/measurements', selectedMeasurement);
            console.log(response.data);
            setShowMeasurementPopup(false);
            showAlert();
            fetchMeasurements(); // Reload the list of measurements
        } catch (error) {
            console.error('Error saving measurement:', error);
        }
    };

    const handleDelete = async (measurementName) => {
        try {
            const response = await axios.delete(`http://localhost:8000/measurements/${measurementName}`);
            console.log(response.data);
            setMeasurements(measurements.filter(m => m.name !== measurementName));
            showAlert();
            fetchMeasurements(); // Reload the list of measurements
        } catch (error) {
            console.error('Error deleting measurement:', error);
        }
    };

    const handleDimensionChange = (index, key, value) => {
        const newDimensions = [...selectedMeasurement.dimensions];
        newDimensions[index][key] = value;
        setSelectedMeasurement({ ...selectedMeasurement, dimensions: newDimensions });
    };

    const handleFieldChange = (index, key, value) => {
        const newFields = [...selectedMeasurement.fields];
        newFields[index][key] = value;
        setSelectedMeasurement({ ...selectedMeasurement, fields: newFields });
    };

    const addDimension = () => {
        setTempDimension({ name: '', type: 'integer' });
        setEditDimension(null);
        setShowDimensionPopup(true);
    };

    const addField = () => {
        setTempField({ name: '', type: 'integer' });
        setEditField(null);
        setShowFieldPopup(true);
    };

    const saveDimension = (updatedDimension) => {
        if (editDimension !== null) {
            const newDimensions = [...selectedMeasurement.dimensions];
            newDimensions[editDimension] = updatedDimension;
            setSelectedMeasurement({ ...selectedMeasurement, dimensions: newDimensions });
        } else {
            setSelectedMeasurement({
                ...selectedMeasurement,
                dimensions: [...selectedMeasurement.dimensions, updatedDimension]
            });
        }
        setShowDimensionPopup(false);
    };

    const saveField = (updatedField) => {
        if (editField !== null) {
            const newFields = [...selectedMeasurement.fields];
            newFields[editField] = updatedField;
            setSelectedMeasurement({ ...selectedMeasurement, fields: newFields });
        } else {
            setSelectedMeasurement({
                ...selectedMeasurement,
                fields: [...selectedMeasurement.fields, updatedField]
            });
        }
        setShowFieldPopup(false);
    };

    const removeDimension = (index) => {
        const newDimensions = selectedMeasurement.dimensions.filter((_, i) => i !== index);
        setSelectedMeasurement({ ...selectedMeasurement, dimensions: newDimensions });
    };

    const removeField = (index) => {
        const newFields = selectedMeasurement.fields.filter((_, i) => i !== index);
        setSelectedMeasurement({ ...selectedMeasurement, fields: newFields });
    };

    const addMeasurement = () => {
        setSelectedMeasurement({ name: '', dimensions: [], fields: [] });
        setShowMeasurementPopup(true);
    };

    const cancelMeasurement = () => {
        setSelectedMeasurement(null);
        setShowMeasurementPopup(false);
    };

    return (
        <div className="container mt-5">
            {alertVisible && <div className="alert alert-success">Changes applied to database</div>}
            <h1 className="container-fluid">Measurements</h1>
            <ul className='container-fluid'>
                <button className="btn btn-primary" onClick={addMeasurement}>New Measurement</button>
            </ul>
            <ul className='container-fluid'>
                <ul className="list-group mb-4">
                    {measurements.map((measurement, index) => (
                        <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                            <a href="#" onClick={() => { setSelectedMeasurement(measurement); setShowMeasurementPopup(true); }}>
                                {measurement.name}
                            </a>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(measurement.name)}>-</button>
                        </li>
                    ))}
                </ul>
            </ul>

            {showMeasurementPopup && selectedMeasurement && (
                <ul className='container-fluid'>
                    <div className="card p-4">
                        <div className="form-group">
                            <h2>Measurement Edit</h2>
                            <label>Measurement Name</label>
                            <input
                                type="text"
                                className="form-control"
                                value={selectedMeasurement.name}
                                onChange={(e) => setSelectedMeasurement({ ...selectedMeasurement, name: e.target.value })}
                                placeholder="Measurement Name"
                            />
                        </div>
                        <h3>Dimensions</h3>
                        <button className="btn btn-secondary mb-2" onClick={addDimension}>+</button>
                        <ul className="list-group mb-4">
                            {selectedMeasurement.dimensions.map((dimension, index) => (
                                <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                                    <a href="#" onClick={() => { setEditDimension(index); setShowDimensionPopup(true); }}>
                                        {dimension.name}
                                    </a>
                                    <button className="btn btn-danger btn-sm" onClick={() => removeDimension(index)}>-</button>
                                </li>
                            ))}
                        </ul>
                        <h3>Fields</h3>
                        <button className="btn btn-secondary mb-2" onClick={addField}>+</button>
                        <ul className="list-group mb-4">
                            {selectedMeasurement.fields.map((field, index) => (
                                <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                                    <a href="#" onClick={() => { setEditField(index); setShowFieldPopup(true); }}>
                                        {field.name}
                                    </a>
                                    <button className="btn btn-danger btn-sm" onClick={() => removeField(index)}>-</button>
                                </li>
                            ))}
                        </ul>

                        <ul className="modal-footer">
                            <button className="btn btn-primary" onClick={handleSave}>Save</button>
                            <button className="btn btn-secondary" onClick={cancelMeasurement}>Cancel</button>
                        </ul>
                        
                        {showDimensionPopup && (
                            <DimensionPopup
                                dimension={editDimension !== null ? selectedMeasurement.dimensions[editDimension] : tempDimension}
                                onSave={saveDimension}
                                onCancel={() => setShowDimensionPopup(false)}
                            />
                        )}

                        {showFieldPopup && (
                            <FieldPopup
                                field={editField !== null ? selectedMeasurement.fields[editField] : tempField}
                                onSave={saveField}
                                onCancel={() => setShowFieldPopup(false)}
                            />
                        )}
                    </div>
                </ul>
            )}
        </div>
    );
};

const DimensionPopup = ({ dimension, onSave, onCancel }) => {
    const [name, setName] = useState(dimension?.name || '');
    const [type, setType] = useState(dimension?.type || 'integer');

    return (
        <div className="modal show d-block">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Edit Dimension</h5>
                        <button type="button" className="close" onClick={onCancel}>
                            <span>&times;</span>
                        </button>
                    </div>
                    <div className="modal-body">
                        <div className="form-group">
                            <label>Dimension Name</label>
                            <input
                                type="text"
                                className="form-control"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Dimension Name"
                            />
                        </div>
                        <div className="form-group">
                            <label>Type</label>
                            <select className="form-control" value={type} onChange={(e) => setType(e.target.value)}>
                                <option value="integer">Integer</option>
                                <option value="varchar">Varchar</option>
                            </select>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button className="btn btn-primary" onClick={() => onSave({ name, type })}>Save</button>
                        <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const FieldPopup = ({ field, onSave, onCancel }) => {
    const [name, setName] = useState(field?.name || '');
    const [type, setType] = useState(field?.type || 'integer');

    return (
        <div className="modal show d-block">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Edit Field</h5>
                        <button type="button" className="close" onClick={onCancel}>
                            <span>&times;</span>
                        </button>
                    </div>
                    <div className="modal-body">
                        <div className="form-group">
                            <label>Field Name</label>
                            <input
                                type="text"
                                className="form-control"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Field Name"
                            />
                        </div>
                        <div className="form-group">
                            <label>Type</label>
                            <select className="form-control" value={type} onChange={(e) => setType(e.target.value)}>
                                <option value="integer">Integer</option>
                                <option value="varchar">Varchar</option>
                            </select>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button className="btn btn-primary" onClick={() => onSave({ name, type })}>Save</button>
                        <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Measurements;