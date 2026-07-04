import React from 'react';
import PropTypes from 'prop-types';
import styles from './Badge.module.css';

export const Badge = ({
  children,
  variant = 'neutral',
  className = '',
  ...props
}) => {
  const badgeClass = [
    styles.badge,
    styles[`badge--${variant}`],
    className
  ].filter(Boolean).join(' ');

  return (
    <span className={badgeClass} {...props}>
      {children}
    </span>
  );
};

Badge.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['high', 'medium', 'low', 'neutral', 'entity']),
  className: PropTypes.string,
};
