import React from 'react';
import PropTypes from 'prop-types';
import { Typography } from '../../atoms/Typography/Typography';
import styles from './SensorMetaGrid.module.css';

export const SensorMetaGrid = ({ items, className = '' }) => (
  <div className={`${styles.grid} ${className}`}>
    {items.map((item) => (
      <div className={`${styles.item} ${styles[`item--${item.tone || 'positive'}`]}`} key={item.label}>
        <Typography variant="body-sm" color="secondary" className={styles.label}>
          {item.label}
        </Typography>
        <div className={styles.valueRow}>
          <Typography variant="h4" className="font-metric">{item.value}</Typography>
          <div className={styles.indicator}>
            <span className={`material-symbols-rounded ${styles.indicatorIcon}`}>check_circle</span>
          </div>
        </div>
      </div>
    ))}
  </div>
);

SensorMetaGrid.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    tone: PropTypes.oneOf(['positive']),
  })).isRequired,
  className: PropTypes.string,
};
