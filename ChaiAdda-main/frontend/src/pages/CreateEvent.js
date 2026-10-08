import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:8000/api';

const CreateEvent = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    date: '',
    time: '',
    location: '',
    capacity: 50,
    requires_registration: true,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    if (!imageFile) {
      setImagePreview('');
      return undefined;
    }
    const previewUrl = URL.createObjectURL(imageFile);
    setImagePreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [imageFile]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/categories/`)
      .then((response) => response.json())
      .then((data) => setCategories(data))
      .catch(() => setError('Could not load event categories.'));
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const csrfResponse = await fetch(`${API_BASE_URL}/csrf-token/`, {
        credentials: 'include',
      });
      const csrfData = await csrfResponse.json();
      const payload = new FormData();
      Object.entries({
        ...formData,
        category_id: Number(formData.category_id),
        capacity: Number(formData.capacity),
      }).forEach(([key, value]) => payload.append(key, value));
      if (imageFile) payload.append('image', imageFile);

      const response = await fetch(`${API_BASE_URL}/events/create/`, {
        method: 'POST',
        headers: {
          'X-CSRFToken': csrfData.csrfToken,
        },
        credentials: 'include',
        body: payload,
      });
      const data = await response.json();

      if (!response.ok) {
        const firstError = Object.values(data)[0];
        throw new Error(Array.isArray(firstError) ? firstError[0] : firstError || 'Could not create event.');
      }

      navigate('/');
    } catch (requestError) {
      setError(requestError.message || 'Could not create event.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-16">
      <div className="container">
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <div className="card">
            <div className="card-header">
              <h1 className="text-2xl font-bold">Create Event</h1>
              <p className="text-gray-600 mt-2">Add a new event for your campus community.</p>
            </div>
            <div className="card-body">
              {error && <div className="alert alert-error">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Event Title</label>
                  <input name="title" className="form-input" value={formData.title} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea name="description" className="form-input" rows="4" value={formData.description} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="event-image">Event picture</label>
                  <input id="event-image" className="form-input" type="file" accept="image/*" onChange={(event) => setImageFile(event.target.files?.[0] || null)} />
                  {imagePreview && <img className="event-image-preview" src={imagePreview} alt="Selected event preview" />}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select name="category_id" className="form-input" value={formData.category_id} onChange={handleChange} required>
                      <option value="">Select a category</option>
                      {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Capacity</label>
                    <input name="capacity" type="number" min="1" className="form-input" value={formData.capacity} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date</label>
                    <input name="date" type="date" className="form-input" value={formData.date} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Time</label>
                    <input name="time" type="time" className="form-input" value={formData.time} onChange={handleChange} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input name="location" className="form-input" value={formData.location} onChange={handleChange} required />
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <input name="requires_registration" type="checkbox" checked={formData.requires_registration} onChange={handleChange} />
                  Require attendees to register
                </label>
                <button type="submit" className="btn btn-primary" disabled={loading || categories.length === 0} style={{ width: '100%' }}>
                  {loading ? 'Creating Event...' : 'Create Event'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEvent;
