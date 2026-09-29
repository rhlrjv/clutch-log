import React, { useState, useEffect } from 'react';
import { Motorcycle, MotorcycleCreate } from '../types/api';
import { motorcycleApi } from '../services/api';
import { formatMotorcycleName, formatMileage } from '../utils/formatters';

interface GarageProps {
  motorcycles: Motorcycle[];
  selectedMotorcycle: Motorcycle | null;
  onMotorcycleSelect: (motorcycle: Motorcycle) => void;
  onMotorcycleAdded: (motorcycle: Motorcycle) => void;
  onMotorcycleUpdated: (motorcycle: Motorcycle) => void;
}

const Garage: React.FC<GarageProps> = ({
  motorcycles,
  selectedMotorcycle,
  onMotorcycleSelect,
  onMotorcycleAdded,
  onMotorcycleUpdated
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableMakes, setAvailableMakes] = useState<string[]>([]);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [formData, setFormData] = useState<MotorcycleCreate>({
    name: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    current_mileage: 0,
    create_service_schedule: true,
  });

  useEffect(() => {
    loadAvailableMakes();
  }, []);

  useEffect(() => {
    if (formData.make) {
      loadAvailableModels(formData.make);
    } else {
      setAvailableModels([]);
      setFormData(prev => ({ ...prev, model: '' }));
    }
  }, [formData.make]);

  const loadAvailableMakes = async () => {
    try {
      const makes = await motorcycleApi.getAvailableMakes();
      setAvailableMakes(makes);
    } catch (err) {
      console.error('Error loading makes:', err);
    }
  };

  const loadAvailableModels = async (make: string) => {
    try {
      const models = await motorcycleApi.getAvailableModels(make);
      setAvailableModels(models);
    } catch (err) {
      console.error('Error loading models:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const motorcycle = await motorcycleApi.createMotorcycle(formData);
      onMotorcycleAdded(motorcycle);
      setShowAddForm(false);
      setFormData({
        name: '',
        make: '',
        model: '',
        year: new Date().getFullYear(),
        current_mileage: 0,
        create_service_schedule: true,
      });
    } catch (err) {
      setError('Failed to add motorcycle');
      console.error('Error adding motorcycle:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMileage = async (motorcycle: Motorcycle, newMileage: number) => {
    try {
      const updatedMotorcycle = await motorcycleApi.updateMotorcycleMileage(motorcycle.id, newMileage);
      onMotorcycleUpdated(updatedMotorcycle);
    } catch (err) {
      setError('Failed to update mileage');
      console.error('Error updating mileage:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      make: '',
      model: '',
      year: new Date().getFullYear(),
      current_mileage: 0,
      create_service_schedule: true,
    });
    setShowAddForm(false);
    setError(null);
  };

  return (
    <div className="garage">
      <div className="garage-header">
        <div className="page-heading">
          <span className="eyebrow">The stable</span>
          <h2>My Garage</h2>
          <p>{motorcycles.length === 0 ? 'Add your first machine and start its maintenance history.' : `${motorcycles.length} ${motorcycles.length === 1 ? 'machine' : 'machines'} ready for the road.`}</p>
        </div>
        <button 
          className="btn-primary"
          onClick={() => setShowAddForm(true)}
          disabled={showAddForm}
        >
          <span aria-hidden="true">＋</span> Add Motorcycle
        </button>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {showAddForm && (
        <div className="add-motorcycle-form">
          <h3>Add New Motorcycle</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Name *</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  placeholder="e.g., My SV650"
                />
              </div>
              <div className="form-group">
                <label htmlFor="year">Year *</label>
                <input
                  type="number"
                  id="year"
                  value={formData.year}
                  onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                  required
                  min="1900"
                  max={new Date().getFullYear() + 1}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="make">Make *</label>
                <select
                  id="make"
                  value={formData.make}
                  onChange={(e) => setFormData(prev => ({ ...prev, make: e.target.value }))}
                  required
                >
                  <option value="">Select Make</option>
                  {availableMakes.map(make => (
                    <option key={make} value={make}>
                      {make.charAt(0).toUpperCase() + make.slice(1)}
                    </option>
                  ))}
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="model">Model *</label>
                {formData.make && availableModels.length > 0 ? (
                  <select
                    id="model"
                    value={formData.model}
                    onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                    required
                  >
                    <option value="">Select Model</option>
                    {availableModels.map(model => (
                      <option key={model} value={model}>
                        {model.charAt(0).toUpperCase() + model.slice(1)}
                      </option>
                    ))}
                    <option value="other">Other</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    id="model"
                    value={formData.model}
                    onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                    required
                    placeholder="Enter model"
                  />
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="current_mileage">Current Mileage *</label>
                <input
                  type="number"
                  id="current_mileage"
                  value={formData.current_mileage}
                  onChange={(e) => setFormData(prev => ({ ...prev, current_mileage: parseInt(e.target.value) || 0 }))}
                  required
                  min="0"
                />
              </div>
              <div className="form-group">
                <label htmlFor="vin">VIN</label>
                <input
                  type="text"
                  id="vin"
                  value={formData.vin || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, vin: e.target.value }))}
                  maxLength={17}
                  placeholder="17-character VIN"
                />
              </div>
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.create_service_schedule}
                  onChange={(e) => setFormData(prev => ({ ...prev, create_service_schedule: e.target.checked }))}
                />
                Create predefined service schedule (recommended for Suzuki SV650 and Ducati Monster)
              </label>
            </div>

            <div className="form-actions">
              <button type="button" onClick={resetForm} disabled={loading}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Adding...' : 'Add Motorcycle'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="motorcycles-grid">
        {motorcycles.length === 0 ? (
          <div className="empty-garage">
            <h3>Your garage is empty</h3>
            <p>Add your first motorcycle to start tracking maintenance!</p>
          </div>
        ) : (
          motorcycles.map(motorcycle => (
            <MotorcycleCard
              key={motorcycle.id}
              motorcycle={motorcycle}
              isSelected={selectedMotorcycle?.id === motorcycle.id}
              onSelect={() => onMotorcycleSelect(motorcycle)}
              onUpdateMileage={handleUpdateMileage}
            />
          ))
        )}
      </div>
    </div>
  );
};

interface MotorcycleCardProps {
  motorcycle: Motorcycle;
  isSelected: boolean;
  onSelect: () => void;
  onUpdateMileage: (motorcycle: Motorcycle, newMileage: number) => void;
}

const MotorcycleCard: React.FC<MotorcycleCardProps> = ({
  motorcycle,
  isSelected,
  onSelect,
  onUpdateMileage
}) => {
  const [showMileageUpdate, setShowMileageUpdate] = useState(false);
  const [newMileage, setNewMileage] = useState(motorcycle.current_mileage);

  const handleMileageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMileage >= motorcycle.current_mileage) {
      onUpdateMileage(motorcycle, newMileage);
      setShowMileageUpdate(false);
    }
  };

  return (
    <div 
      className={`motorcycle-card ${isSelected ? 'selected' : ''}`}
    >
      <div className="motorcycle-card-accent">
        <span aria-hidden="true">{motorcycle.make.slice(0, 2).toUpperCase()}</span>
        <button
          type="button"
          className="motorcycle-select-control"
          aria-label={`${isSelected ? 'Selected' : 'Select'} ${motorcycle.name}`}
          aria-pressed={isSelected}
          onClick={onSelect}
        >
          {isSelected ? 'Active' : 'Select'}
        </button>
      </div>
      <div className="motorcycle-header">
        <div>
          <span className="card-kicker">{motorcycle.make}</span>
          <h3>{motorcycle.name}</h3>
        </div>
        <span className="motorcycle-year">{motorcycle.year}</span>
      </div>
      
      <div className="motorcycle-details">
        <p className="motorcycle-make-model">
          {formatMotorcycleName(motorcycle.make, motorcycle.model, motorcycle.year)}
        </p>
        
        <div className="motorcycle-stats">
          <div className="stat">
            <label>Odometer</label>
            <span className="mileage-value">{formatMileage(motorcycle.current_mileage)}</span>
            <button 
              className="update-mileage-btn"
              onClick={(e) => {
                e.stopPropagation();
                setShowMileageUpdate(true);
              }}
            >
              Update <span aria-hidden="true">↗</span>
            </button>
          </div>
          
          {motorcycle.vin && (
            <div className="stat">
              <label>VIN:</label>
              <span className="vin">{motorcycle.vin}</span>
            </div>
          )}
          
          {motorcycle.insurance_provider && (
            <div className="stat">
              <label>Insurance:</label>
              <span>{motorcycle.insurance_provider}</span>
            </div>
          )}
        </div>
      </div>

      {showMileageUpdate && (
        <div className="mileage-update-form" onClick={(e) => e.stopPropagation()}>
          <form onSubmit={handleMileageSubmit}>
            <label htmlFor={`mileage-${motorcycle.id}`}>New Mileage:</label>
            <input
              id={`mileage-${motorcycle.id}`}
              type="number"
              value={newMileage}
              onChange={(e) => setNewMileage(parseInt(e.target.value) || 0)}
              min={motorcycle.current_mileage}
              required
              autoFocus
            />
            <div className="form-actions">
              <button type="button" onClick={() => setShowMileageUpdate(false)}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Update
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Garage;
