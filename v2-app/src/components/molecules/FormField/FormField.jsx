import React from 'react';
import PropTypes from 'prop-types';
import { Typography } from '../../atoms/Typography/Typography';
import styles from './FormField.module.css';

export const FormField = ({
  label,
  error,
  helpText,
  children,
  className = '',
}) => {
  return (
    <div className={`${styles.field} ${className}`}>
      {label && (
        <label className={styles.label}>
          <Typography variant="body-sm" weight="medium">{label}</Typography>
        </label>
      )}
      
      {/* The child input component is passed here */}
      <div className={styles.inputWrapper}>
        {children}
      </div>

      {error && (
        <div className={styles.error}>
          <span className="material-symbols-rounded" style={{ fontSize: '14px' }}>error</span>
          <Typography variant="caption" color="error">{error}</Typography>
        </div>
      )}
      
      {!error && helpText && (
        <div className={styles.helpText}>
          <Typography variant="caption" color="secondary">{helpText}</Typography>
        </div>
      )}
    </div>
  );
};

FormField.propTypes = {
  label: PropTypes.string,
  error: PropTypes.string,
  helpText: PropTypes.string,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};
