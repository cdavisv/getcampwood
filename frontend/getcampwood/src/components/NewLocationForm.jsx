import React, { useState } from 'react';
import { addLocation } from './api.js';

export default function NewLocationForm() {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setStatus('Adding...');
      await addLocation({ 
        name, 
        description, 
        price: parseFloat(price) || null,
        latitude: parseFloat(latitude), 
        longitude: parseFloat(longitude) 
      });
      setStatus('Location added successfully!');
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" required />
      <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price" type="number" step="0.01" />
      <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" />
      <input value={latitude} onChange={(e) => setLatitude(e.target.value)} placeholder="Latitude" required />
      <input value={longitude} onChange={(e) => setLongitude(e.target.value)} placeholder="Longitude" required />
      <button type="submit">Add Location</button>
      <p>{status}</p>
    </form>
  );
}