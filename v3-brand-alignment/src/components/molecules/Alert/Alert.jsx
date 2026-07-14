import React from 'react';
import PropTypes from 'prop-types';
import styles from './Alert.module.css';

export const Alert = ({
  title,
  message,
  variant = 'info',
  type = 'global', // 'global' or 'inline'
  className = '',
  onClose,
}) => {
  const alertClass = [
    styles.alert,
    styles[`alert--${variant}`],
    styles[`alert--${type}`],
    className
  ].filter(Boolean).join(' ');

  const iconMap = {
    info: 'info',
    success: 'check_circle',
    warning: 'warning',
    error: 'error',
  };

  return (
    <div className={alertClass} role="alert">
      <span className={`material-symbols-rounded ${styles.icon}`} aria-hidden="true">
        {iconMap[variant]}
      </span>
      <div className={styles.content}>
        {title && <div className={styles.title}>{title}</div>}
        <div className={styles.message}>{message}</div>
      </div>
      {onClose && (
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close alert">
          <span className="material-symbols-rounded" aria-hidden="true">close</span>
        </button>
      )}
    </div>
  );
};

Alert.propTypes = {
  title: PropTypes.string,
  message: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['info', 'success', 'warning', 'error']),
  type: PropTypes.oneOf(['global', 'inline']),
  className: PropTypes.string,
  onClose: PropTypes.func,
};
