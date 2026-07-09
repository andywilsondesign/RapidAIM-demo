import React from 'react';
import PropTypes from 'prop-types';
import styles from './RiskMarker.module.css';
import { markerConfig } from './RiskMarker.config';

export const RiskMarker = ({ severity = 'low', size = 'md', selected = false, className = '', label }) => {
  const markerClass = [
    styles.marker,
    styles[`marker--${severity}`],
    styles[`marker--${size}`],
    selected && styles['marker--selected'],
    className,
  ].filter(Boolean).join(' ');

  return (
    <span className={markerClass} aria-label={label || `${severity} risk marker`} role="img">
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path className={styles.shape} d={markerConfig[severity].shape} />
        <path className={styles.icon} d={markerConfig[severity].icon} />
      </svg>
    </span>
  );
};

RiskMarker.propTypes = {
  severity: PropTypes.oneOf(['high', 'medium', 'low', 'offline']),
  size: PropTypes.oneOf(['sm', 'md']),
  selected: PropTypes.bool,
  className: PropTypes.string,
  label: PropTypes.string,
};
