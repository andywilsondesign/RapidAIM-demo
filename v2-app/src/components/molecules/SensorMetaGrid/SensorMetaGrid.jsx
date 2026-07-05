import React from 'react';
import PropTypes from 'prop-types';
import { Typography } from '../../atoms/Typography/Typography';
import styles from './SensorMetaGrid.module.css';

export const SensorMetaGrid = ({ items, className = '' }) => (
  <div className={`${styles.grid} ${className}`}>
    {items.map((item) => (
      <div className={styles.item} key={item.label}>
        <Typography variant="caption" color="secondary">{item.label}</Typography>
        <Typography variant="body-sm" weight="semibold">{item.value}</Typography>
      </div>
    ))}
  </div>
);

SensorMetaGrid.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  })).isRequired,
  className: PropTypes.string,
};
