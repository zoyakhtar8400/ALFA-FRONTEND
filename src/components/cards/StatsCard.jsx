import React from 'react';

const StatsCard = ({ title, value, icon: Icon, change, changeType = 'increase' }) => {
  return (
    <div className="stats-card">
      <div className="stats-info">
        <span className="stats-label">{title}</span>
        <h3 className="stats-value">{value}</h3>
        {change && (
          <div className={`stats-trend ${changeType === 'increase' ? 'up' : 'down'}`}>
            <span>{change}</span>
          </div>
        )}
      </div>
      {Icon && (
        <div className="stats-icon-wrapper">
          <Icon />
        </div>
      )}
    </div>
  );
};

export default StatsCard;
