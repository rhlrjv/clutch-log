import React, { useState, useEffect } from 'react';
import { Motorcycle, ServiceRecord, ServiceRecordCreate } from '../types/api';
import { motorcycleApi } from '../services/api';
import { formatDate, formatMileage, formatCurrency } from '../utils/formatters';

interface ServiceRecordsProps {
  motorcycle: Motorcycle;
}

const ServiceRecords: React.FC<ServiceRecordsProps> = ({ motorcycle }) => {
  const [records, setRecords] = useState<ServiceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<ServiceRecordCreate>({
    motorcycle_id: motorcycle.id,
    name: '',
    description: '',
    service_date: new Date().toISOString().split('T')[0],
    mileage_at_service: motorcycle.current_mileage,
  });

  useEffect(() => {
    loadServiceRecords();
  }, [motorcycle.id]);

  useEffect(() => {
    setFormData(prev => ({ 
      ...prev, 
      motorcycle_id: motorcycle.id,
      mileage_at_service: motorcycle.current_mileage 
    }));
  }, [motorcycle.id, motorcycle.current_mileage]);

  const loadServiceRecords = async () => {
    try {
      setLoading(true);
      const data = await motorcycleApi.getServiceRecords(motorcycle.id);
      setRecords(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load service records');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const newRecord = await motorcycleApi.createServiceRecord(formData);
      setRecords(prev => [newRecord, ...prev]);
      setShowAddForm(false);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create service record');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      motorcycle_id: motorcycle.id,
      name: '',
      description: '',
      service_date: new Date().toISOString().split('T')[0],
      mileage_at_service: motorcycle.current_mileage,
    });
    setError(null);
  };

  const handleFormChange = (field: keyof ServiceRecordCreate, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePartsChange = (partsString: string) => {
    const parts = partsString.split(',').map(part => part.trim()).filter(part => part.length > 0);
    setFormData(prev => ({ ...prev, parts_used: parts.length > 0 ? parts : undefined }));
  };

  if (loading) {
    return (
      <div className="service-records-loading">
        <div className="loading-spinner"></div>
        <p>Loading service records...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="service-records-error">
        <p>{error}</p>
        <button onClick={loadServiceRecords}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="service-records">
      <div className="service-records-header">
        <div className="page-heading">
          <span className="eyebrow">Maintenance history</span>
          <h2>Service Records</h2>
          <p>A complete paper trail for {motorcycle.name}.</p>
        </div>
        <button 
          className="btn-primary"
          onClick={() => setShowAddForm(true)}
          disabled={showAddForm}
        >
          <span aria-hidden="true">＋</span> Add Service Record
        </button>
      </div>

      {showAddForm && (
        <div className="add-service-record-form">
          <h3>Add Service Record</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Service Name *</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  required
                  placeholder="e.g., Oil Change, Chain Maintenance"
                />
              </div>
              <div className="form-group">
                <label htmlFor="service_date">Service Date *</label>
                <input
                  type="date"
                  id="service_date"
                  value={formData.service_date}
                  onChange={(e) => handleFormChange('service_date', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="mileage_at_service">Mileage at Service *</label>
                <input
                  type="number"
                  id="mileage_at_service"
                  value={formData.mileage_at_service}
                  onChange={(e) => handleFormChange('mileage_at_service', parseInt(e.target.value) || 0)}
                  required
                  min="0"
                />
              </div>
              <div className="form-group">
                <label htmlFor="cost">Cost</label>
                <input
                  type="number"
                  id="cost"
                  value={formData.cost || ''}
                  onChange={(e) => handleFormChange('cost', e.target.value ? parseFloat(e.target.value) : undefined)}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
                required
                placeholder="Describe the service performed..."
                rows={3}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="service_provider">Service Provider</label>
                <input
                  type="text"
                  id="service_provider"
                  value={formData.service_provider || ''}
                  onChange={(e) => handleFormChange('service_provider', e.target.value)}
                  placeholder="e.g., Joe's Motorcycle Shop"
                />
              </div>
              <div className="form-group">
                <label htmlFor="parts_used">Parts Used (comma-separated)</label>
                <input
                  type="text"
                  id="parts_used"
                  value={formData.parts_used?.join(', ') || ''}
                  onChange={(e) => handlePartsChange(e.target.value)}
                  placeholder="e.g., Oil filter, Engine oil, Spark plugs"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                value={formData.notes || ''}
                onChange={(e) => handleFormChange('notes', e.target.value)}
                placeholder="Additional notes..."
                rows={2}
              />
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                onClick={() => {
                  setShowAddForm(false);
                  resetForm();
                }}
                disabled={submitting}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn-primary"
                disabled={submitting}
              >
                {submitting ? 'Adding...' : 'Add Record'}
              </button>
            </div>
          </form>
        </div>
      )}

      {records.length === 0 ? (
        <div className="empty-tasks">
          <h3>No service records yet</h3>
          <p>Add service records to track your maintenance history.</p>
        </div>
      ) : (
        <div className="service-records-list">
          {records.map(record => (
            <ServiceRecordCard key={record.id} record={record} />
          ))}
        </div>
      )}
    </div>
  );
};

interface ServiceRecordCardProps {
  record: ServiceRecord;
}

const ServiceRecordCard: React.FC<ServiceRecordCardProps> = ({ record }) => {
  return (
    <div className="service-record-card">
      <div className="record-header">
        <div className="task-title">
          <h3>{record.name}</h3>
          <div className="record-date">{formatDate(record.service_date)}</div>
        </div>
        <div className="task-badges">
          {record.cost && (
            <span className="cost-badge">{formatCurrency(record.cost)}</span>
          )}
        </div>
      </div>

      <div className="record-details">
        {record.description}
      </div>

      <div className="record-info">
        <div className="info-item">
          <label>Mileage:</label>
          <span>{formatMileage(record.mileage_at_service)}</span>
        </div>
        
        {record.service_provider && (
          <div className="info-item">
            <label>Provider:</label>
            <span>{record.service_provider}</span>
          </div>
        )}
        
        {record.cost && (
          <div className="info-item">
            <label>Cost:</label>
            <span>{formatCurrency(record.cost)}</span>
          </div>
        )}
      </div>

      {record.parts_used && record.parts_used.length > 0 && (
        <div className="parts-used">
          <label>Parts Used:</label>
          <div className="parts-list">
            {record.parts_used.map((part, index) => (
              <span key={index} className="part-tag">{part}</span>
            ))}
          </div>
        </div>
      )}

      {record.notes && (
        <div className="record-notes">
          <label>Notes:</label>
          <p>{record.notes}</p>
        </div>
      )}
    </div>
  );
};

export default ServiceRecords;
