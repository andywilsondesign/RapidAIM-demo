import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import styles from './Input.module.css';

export const Input = forwardRef(({
  type = 'text',
  placeholder = '',
  error = false,
  fullWidth = true,
  className = '',
  ...props
}, ref) => {
  const inputClass = [
    styles.input,
    error ? styles['input--error'] : '',
    fullWidth ? styles['input--full'] : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <input
      type={type}
      placeholder={placeholder}
      className={inputClass}
      ref={ref}
      {...props}
    />
  );
});

Input.displayName = 'Input';

Input.propTypes = {
  type: PropTypes.string,
  placeholder: PropTypes.string,
  error: PropTypes.bool,
  fullWidth: PropTypes.bool,
  className: PropTypes.string,
};
