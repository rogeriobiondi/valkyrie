import React, { useState, useEffect } from 'react';
import axios from 'axios';

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
        <div>
            {alertVisible && <div className="alert">Changes applied to database</div>}
            <h1>Measurements</h1>
            <ul>
                {measurements.map((measurement, index) => (
                    <li key={index}>
                        <a href="#" onClick={() => { setSelectedMeasurement(measurement); setShowMeasurementPopup(true); }}>
                            {measurement.name}
                        </a>
                        <button onClick={() => handleDelete(measurement.name)}>-</button>
                    </li>
                ))}
            </ul>
            <button onClick={addMeasurement}>+</button>

            {showMeasurementPopup && selectedMeasurement && (
                <div>
                    <input
                        type="text"
                        value={selectedMeasurement.name}
                        onChange={(e) => setSelectedMeasurement({ ...selectedMeasurement, name: e.target.value })}
                        placeholder="Measurement Name"
                    />
                    <h2>Dimensions</h2>
                    <button onClick={addDimension}>+</button>
                    <ul>
                        {selectedMeasurement.dimensions.map((dimension, index) => (
                            <li key={index}>
                                <a href="#" onClick={() => { setEditDimension(index); setShowDimensionPopup(true); }}>
                                    {dimension.name}
                                </a>
                                <button onClick={() => removeDimension(index)}>-</button>
                            </li>
                        ))}
                    </ul>
                    <h2>Fields</h2>
                    <button onClick={addField}>+</button>
                    <ul>
                        {selectedMeasurement.fields.map((field, index) => (
                            <li key={index}>
                                <a href="#" onClick={() => { setEditField(index); setShowFieldPopup(true); }}>
                                    {field.name}
                                </a>
                                <button onClick={() => removeField(index)}>-</button>
                            </li>
                        ))}
                    </ul>
                    <button onClick={handleSave}>Save</button>
                    <button onClick={cancelMeasurement}>Cancel</button>

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
            )}
        </div>
    );
};

const DimensionPopup = ({ dimension, onSave, onCancel }) => {
    const [name, setName] = useState(dimension?.name || '');
    const [type, setType] = useState(dimension?.type || 'integer');

    return (
        <div className="popup">
            <h2>Edit Dimension</h2>
            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dimension Name"
            />
            <select value={type} onChange={(e) => setType(e.target.value)}>
                <option value="integer">Integer</option>
                <option value="varchar">Varchar</option>
            </select>
            <button onClick={() => onSave({ name, type })}>Save</button>
            <button onClick={onCancel}>Cancel</button>
        </div>
    );
};

const FieldPopup = ({ field, onSave, onCancel }) => {
    const [name, setName] = useState(field?.name || '');
    const [type, setType] = useState(field?.type || 'integer');

    return (
        <div className="popup">
            <h2>Edit Field</h2>
            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Field Name"
            />
            <select value={type} onChange={(e) => setType(e.target.value)}>
                <option value="integer">Integer</option>
                <option value="varchar">Varchar</option>
            </select>
            <button onClick={() => onSave({ name, type })}>Save</button>
            <button onClick={onCancel}>Cancel</button>
        </div>
    );
};

export default Measurements;