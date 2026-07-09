import React from 'react';
import PropTypes from 'prop-types';
import { StatCard } from '../../molecules/StatCard/StatCard';
import styles from './HeroMetricsRow.module.css';

export const HeroMetricsRow = ({ metrics = [], className = '' }) => {
  return (
    <div className={`${styles.row} ${className}`}>
      {metrics.map((metric, index) => (
        <StatCard
          key={index}
          label={metric.label}
          value={metric.value}
          trend={metric.trend}
          className={styles.card}
        />
      ))}
    </div>
  );
};

HeroMetricsRow.propTypes = {
  metrics: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    trend: PropTypes.number,
  })).isRequired,
  className: PropTypes.string,
};
