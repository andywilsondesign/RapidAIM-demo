import React from 'react';
import PropTypes from 'prop-types';
import styles from './Typography.module.css';

export const Typography = ({
  variant = 'body',
  component,
  weight,
  color,
  className = '',
  children,
  ...props
}) => {
  const Component = component || (
    ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(variant) ? variant : 'p'
  );

  const typographyClass = [
    styles.typography,
    styles[`typography--${variant}`],
    weight ? styles[`weight--${weight}`] : '',
    color ? styles[`color--${color}`] : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <Component className={typographyClass} {...props}>
      {children}
    </Component>
  );
};

Typography.propTypes = {
  variant: PropTypes.oneOf(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'body', 'body-sm', 'caption']),
  component: PropTypes.elementType,
  weight: PropTypes.oneOf(['regular', 'medium', 'semibold', 'bold']),
  color: PropTypes.oneOf(['primary', 'secondary', 'error', 'brand']),
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};
