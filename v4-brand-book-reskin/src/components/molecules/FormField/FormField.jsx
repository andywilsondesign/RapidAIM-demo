import React, { useId } from 'react';
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
  const generatedId = useId();
  const fieldId = children?.props?.id || `field-${generatedId}`;
  const descriptionId = helpText ? `${fieldId}-help` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const describedBy = [children?.props?.['aria-describedby'], errorId, descriptionId].filter(Boolean).join(' ') || undefined;
  const labelledChild = React.isValidElement(children)
    ? React.cloneElement(children, {
        id: fieldId,
        'aria-invalid': error ? true : children.props['aria-invalid'],
        'aria-describedby': describedBy,
      })
    : children;

  return (
    <div className={`${styles.field} ${className}`}>
      {label && (
        <label className={styles.label} htmlFor={fieldId}>
          <Typography variant="body-sm" weight="medium">{label}</Typography>
        </label>
      )}
      
      <div className={styles.inputWrapper}>
        {labelledChild}
      </div>

      {error && (
        <div className={styles.error} id={errorId}>
          <span className="material-symbols-rounded" style={{ fontSize: '14px' }}>error</span>
          <Typography variant="caption" color="error">{error}</Typography>
        </div>
      )}
      
      {!error && helpText && (
        <div className={styles.helpText} id={descriptionId}>
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
