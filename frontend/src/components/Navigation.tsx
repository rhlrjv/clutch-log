import React from 'react';
import { Motorcycle } from '../types/api';
import { formatMotorcycleName, formatMileage } from '../utils/formatters';

type ActiveView = 'garage' | 'service-tasks' | 'service-records' | 'todo-tasks';

interface NavigationProps {
  selectedMotorcycle: Motorcycle | null;
  activeView: ActiveView;
  onViewChange: (view: ActiveView) => void;
}

const NavIcon: React.FC<{ name: ActiveView }> = ({ name }) => {
  const paths: Record<ActiveView, React.ReactNode> = {
    garage: <><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5M8 21v-7h8v7"/></>,
    'service-tasks': <><path d="m14.7 6.3 3-3a4.24 4.24 0 0 1-5.5 5.5l-6.9 6.9a2.12 2.12 0 0 0 3 3l6.9-6.9a4.24 4.24 0 0 1 5.5-5.5l-3 3"/><path d="m6 6 3 3"/></>,
    'service-records': <><path d="M6 3h12a2 2 0 0 1 2 2v16H4V5a2 2 0 0 1 2-2Z"/><path d="M8 7h8M8 11h8M8 15h5"/></>,
    'todo-tasks': <><path d="M9 6h11M9 12h11M9 18h11"/><path d="m3.5 6 1 1 2-2M3.5 12l1 1 2-2M3.5 18l1 1 2-2"/></>
  };

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  );
};

const Navigation: React.FC<NavigationProps> = ({
  selectedMotorcycle,
  activeView,
  onViewChange
}) => {
  const navItems = [
    {
      id: 'garage' as ActiveView,
      label: 'Garage'
    },
    {
      id: 'service-tasks' as ActiveView,
      label: 'Service Tasks'
    },
    {
      id: 'service-records' as ActiveView,
      label: 'Service Records'
    },
    {
      id: 'todo-tasks' as ActiveView,
      label: 'Todo Tasks'
    }
  ];

  return (
    <nav className="navigation">
      {selectedMotorcycle && (
        <div className="nav-header">
          <span className="nav-section-label">Active machine</span>
          <div className="selected-motorcycle">
            <div className="motorcycle-icon" aria-hidden="true">
              {selectedMotorcycle.make.slice(0, 1).toUpperCase()}
            </div>
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

      <span className="nav-section-label">Workspace</span>
      <div className="nav-items">
        {navItems.map(item => (
          <button
            key={item.id}
            className={`nav-item ${activeView === item.id ? 'active' : ''}`}
            onClick={() => onViewChange(item.id)}
          >
            <span className="nav-icon"><NavIcon name={item.id} /></span>
            <span>{item.label}</span>
            <span className="nav-arrow" aria-hidden="true">›</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;
