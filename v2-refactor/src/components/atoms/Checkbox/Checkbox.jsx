import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import styles from './Checkbox.module.css';

export const Checkbox = forwardRef(({
  label,
  className = '',
  ...props
}, ref) => {
  return (
    <label className={`${styles.wrapper} ${className}`}>
      <input type="checkbox" className={styles.input} ref={ref} {...props} />
      <span className={styles.checkmark}>
        <span className={`material-symbols-rounded ${styles.icon}`}>check</span>
      </span>
      {label && <span className={styles.label}>{label}</span>}
    </label>
  );
});

Checkbox.displayName = 'Checkbox';

Checkbox.propTypes = {
  label: PropTypes.string,
  className: PropTypes.string,
};
