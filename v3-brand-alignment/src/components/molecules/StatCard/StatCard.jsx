import React from 'react';
import PropTypes from 'prop-types';
import { Typography } from '../../atoms/Typography/Typography';
import styles from './StatCard.module.css';

export const StatCard = ({
  label,
  value,
  trend,
  trendContext,
  trendLabel,
  benchmark,
  tone = 'neutral',
  className = '',
}) => {
  const isPositive = trend > 0;

  return (
    <div className={`${styles.card} ${styles[`card--${tone}`]} ${className}`}>
      <Typography variant="body-sm" color="secondary" className={styles.label}>
        {label}
      </Typography>
      
      <div className={styles.valueRow}>
        <Typography variant="h3" className="font-metric">{value}</Typography>
        
        {trend !== undefined && trend !== 0 && (
          <div className={`${styles.trend} ${styles[`trend--${tone}`]} ${isPositive ? styles.trendDirectionPositive : styles.trendDirectionNegative}`}>
            <span className={`material-symbols-rounded ${styles.trendIcon}`}>
              {isPositive ? 'trending_up' : 'trending_down'}
            </span>
            <Typography variant="caption" weight="semibold">
              {Math.abs(trend)}%
            </Typography>
          </div>
        )}
      </div>
      {(trendContext || trendLabel || benchmark) && (
        <div className={styles.meta}>
          {trendContext && (
            <Typography variant="caption" color="secondary" className={styles.metaLine}>
              {trendContext}
            </Typography>
          )}
          {trendLabel && (
            <Typography variant="caption" weight="semibold" className={`${styles.metaLine} ${isPositive ? styles['metaLine--negative'] : styles['metaLine--positive']}`}>
              {trendLabel}
            </Typography>
          )}
          {benchmark && (
            <Typography variant="caption" color="secondary" className={styles.metaLine}>
              {benchmark}
            </Typography>
          )}
        </div>
      )}
    </div>
  );
};

StatCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  trend: PropTypes.number,
  trendContext: PropTypes.string,
  trendLabel: PropTypes.string,
  benchmark: PropTypes.string,
  tone: PropTypes.oneOf(['neutral', 'high', 'medium', 'low', 'positive']),
  className: PropTypes.string,
};
