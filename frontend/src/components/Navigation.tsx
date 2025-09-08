import React from 'react';
import { Motorcycle } from '../types/api';
import { formatMotorcycleName, formatMileage } from '../utils/formatters';

type ActiveView = 'garage' | 'service-tasks' | 'service-records' | 'todo-tasks';

interface NavigationProps {
  selectedMotorcycle: Motorcycle | null;
  activeView: ActiveView;
  onViewChange: (view: ActiveView) => void;
}

const Navigation: React.FC<NavigationProps> = ({
  selectedMotorcycle,
  activeView,
  onViewChange
}) => {
  const navItems = [
    {
      id: 'garage' as ActiveView,
      label: 'Garage',
      icon: '🏠'
    },
    {
      id: 'service-tasks' as ActiveView,
      label: 'Service Tasks',
      icon: '🔧'
    },
    {
      id: 'service-records' as ActiveView,
      label: 'Service Records',
      icon: '📋'
    },
    {
      id: 'todo-tasks' as ActiveView,
      label: 'Todo Tasks',
      icon: '✓'
    }
  ];

  return (
    <nav className="navigation">
      {selectedMotorcycle && (
        <div className="nav-header">
          <div className="selected-motorcycle">
            <div className="motorcycle-icon">🏍️</div>
            <div className="motorcycle-info">
              <div className="motorcycle-name">{selectedMotorcycle.name}</div>
              <div className="motorcycle-details">
                {formatMotorcycleName(selectedMotorcycle.make, selectedMotorcycle.model, selectedMotorcycle.year)}
              </div>
              <div className="motorcycle-mileage">
                {formatMileage(selectedMotorcycle.current_mileage)}
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="nav-items">
        {navItems.map(item => (
          <button
            key={item.id}
            className={`nav-item ${activeView === item.id ? 'active' : ''}`}
            onClick={() => onViewChange(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;