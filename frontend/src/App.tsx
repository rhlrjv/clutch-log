import React, { useState, useEffect } from 'react';
import './App.css';
import { Motorcycle } from './types/api';
import { motorcycleApi } from './services/api';
import Navigation from './components/Navigation';
import Garage from './components/Garage';
import ServiceTasks from './components/ServiceTasks';
import ServiceRecords from './components/ServiceRecords';
import TodoTasks from './components/TodoTasks';

type ActiveView = 'garage' | 'service-tasks' | 'service-records' | 'todo-tasks';

function App() {
  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>([]);
  const [selectedMotorcycle, setSelectedMotorcycle] = useState<Motorcycle | null>(null);
  const [activeView, setActiveView] = useState<ActiveView>('garage');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMotorcycles();
  }, []);

  const loadMotorcycles = async () => {
    try {
      setLoading(true);
      const data = await motorcycleApi.getMotorcycles();
      setMotorcycles(data);
      
      // Auto-select the first motorcycle if available
      if (data.length > 0 && !selectedMotorcycle) {
        setSelectedMotorcycle(data[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load motorcycles');
    } finally {
      setLoading(false);
    }
  };

  const handleMotorcycleAdded = (motorcycle: Motorcycle) => {
    setMotorcycles(prev => [...prev, motorcycle]);
    setSelectedMotorcycle(motorcycle);
    setActiveView('service-tasks'); // Switch to service tasks to see the newly created schedule
  };

  const handleMotorcycleUpdated = (updatedMotorcycle: Motorcycle) => {
    setMotorcycles(prev => 
      prev.map(m => m.id === updatedMotorcycle.id ? updatedMotorcycle : m)
    );
    if (selectedMotorcycle?.id === updatedMotorcycle.id) {
      setSelectedMotorcycle(updatedMotorcycle);
    }
  };

  const handleMotorcycleSelected = (motorcycle: Motorcycle) => {
    setSelectedMotorcycle(motorcycle);
  };

  const renderActiveView = () => {
    if (loading) {
      return (
        <div className="app-loading">
          <div className="loading-spinner"></div>
          <p>Loading your garage...</p>
        </div>
      );
    }

    switch (activeView) {
      case 'garage':
        return (
          <Garage
            motorcycles={motorcycles}
            selectedMotorcycle={selectedMotorcycle}
            onMotorcycleSelect={handleMotorcycleSelected}
            onMotorcycleAdded={handleMotorcycleAdded}
            onMotorcycleUpdated={handleMotorcycleUpdated}
          />
        );
      case 'service-tasks':
        if (!selectedMotorcycle) {
          return (
            <div className="no-motorcycle-selected">
              <h2>No Motorcycle Selected</h2>
              <p>Select a motorcycle from your garage to view service tasks.</p>
              <button 
                className="btn-primary"
                onClick={() => setActiveView('garage')}
              >
                Go to Garage
              </button>
            </div>
          );
        }
        return <ServiceTasks motorcycle={selectedMotorcycle} />;
      case 'service-records':
        if (!selectedMotorcycle) {
          return (
            <div className="no-motorcycle-selected">
              <h2>No Motorcycle Selected</h2>
              <p>Select a motorcycle from your garage to view service records.</p>
              <button 
                className="btn-primary"
                onClick={() => setActiveView('garage')}
              >
                Go to Garage
              </button>
            </div>
          );
        }
        return <ServiceRecords motorcycle={selectedMotorcycle} />;
      case 'todo-tasks':
        if (!selectedMotorcycle) {
          return (
            <div className="no-motorcycle-selected">
              <h2>No Motorcycle Selected</h2>
              <p>Select a motorcycle from your garage to view todo tasks.</p>
              <button 
                className="btn-primary"
                onClick={() => setActiveView('garage')}
              >
                Go to Garage
              </button>
            </div>
          );
        }
        return <TodoTasks motorcycle={selectedMotorcycle} />;
      default:
        return <div>Unknown view</div>;
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🏍️ Clutch Log</h1>
        <p>Motorcycle Maintenance Tracker</p>
      </header>

      {error && (
        <div className="error-banner">
          <p>{error}</p>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      <Navigation
        selectedMotorcycle={selectedMotorcycle}
        activeView={activeView}
        onViewChange={setActiveView}
      />

      <main className="app-main">
        {renderActiveView()}
      </main>
    </div>
  );
}

export default App;