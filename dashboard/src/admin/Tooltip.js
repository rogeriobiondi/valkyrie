import React, { useEffect, useState } from 'react';
import axios from 'axios';

const MeasurementTip = ({ measurement }) => {
  const [fields, setFields] = useState([]);
  const [dimensions, setDimensions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/measurements/${measurement}`);
        setFields(response.data.fields || []);
        setDimensions(response.data.dimensions || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [measurement]);

  return (
    <div>
      <div><br/></div>
      <h6>Fields from <strong>{measurement}</strong></h6>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
          </tr>
        </thead>
        <tbody>
          {fields.map((field, index) => (
            <tr key={index}>
              <td>{field.name}</td>
              <td>{field.type}</td>
            </tr>
          ))}
        </tbody>
      </table>
     <div><br/></div>
      <h6>Dimensions from <strong>{measurement}</strong></h6>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
          </tr>
        </thead>
        <tbody>
          {dimensions.map((dim, index) => (
            <tr key={index}>
              <td>{dim.name}</td>
              <td>{dim.type}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MeasurementTip;