import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import styles from './Select.module.css';

export const Select = forwardRef(({
  options = [],
  error = false,
  fullWidth = true,
  className = '',
  ...props
}, ref) => {
  const selectClass = [
    styles.select,
    error ? styles['select--error'] : '',
    fullWidth ? styles['select--full'] : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={styles.wrapper}>
      <select className={selectClass} ref={ref} {...props}>
        {options.map((opt, i) => (
          <option key={i} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <span className={`material-symbols-rounded ${styles.icon}`}>
        expand_more
      </span>
    </div>
  );
});

Select.displayName = 'Select';

Select.propTypes = {
  options: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  })).isRequired,
  error: PropTypes.bool,
  fullWidth: PropTypes.bool,
  className: PropTypes.string,
};
