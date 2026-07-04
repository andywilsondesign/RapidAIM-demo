import React from 'react';
import PropTypes from 'prop-types';
import { Typography } from '../../atoms/Typography/Typography';
import styles from './StatCard.module.css';

export const StatCard = ({
  label,
  value,
  trend,
  className = '',
}) => {
  const isPositive = trend > 0;
  const isNegative = trend < 0;
  
  return (
    <div className={`${styles.card} ${className}`}>
      <Typography variant="body-sm" color="secondary" className={styles.label}>
        {label}
      </Typography>
      
      <div className={styles.valueRow}>
        <Typography variant="h3">{value}</Typography>
        
        {trend !== undefined && trend !== 0 && (
          <div className={`${styles.trend} ${isPositive ? styles['trend--positive'] : styles['trend--negative']}`}>
            <span className={`material-symbols-rounded ${styles.trendIcon}`}>
              {isPositive ? 'trending_up' : 'trending_down'}
            </span>
            <Typography variant="caption" weight="semibold">
              {Math.abs(trend)}%
            </Typography>
          </div>
        )}
      </div>
    </div>
  );
};

StatCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  trend: PropTypes.number,
  className: PropTypes.string,
};
