import React from 'react';
import PropTypes from 'prop-types';
import styles from './SegmentedControl.module.css';

export const SegmentedControl = ({
  options,
  value,
  ariaLabel,
  className = '',
}) => (
  <div className={`${styles.control} ${className}`} role="group" aria-label={ariaLabel}>
    {options.map((option) => (
      <button
        className={`${styles.option} ${option.value === value ? styles.active : ''}`}
        key={option.value}
        type="button"
      >
        {option.label}
      </button>
    ))}
  </div>
);

SegmentedControl.propTypes = {
  options: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
  })).isRequired,
  value: PropTypes.string.isRequired,
  ariaLabel: PropTypes.string.isRequired,
  className: PropTypes.string,
};
