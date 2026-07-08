import React from 'react';
import PropTypes from 'prop-types';
import { Typography } from '../../atoms/Typography/Typography';
import styles from './HierarchyBreadcrumb.module.css';

export const HierarchyBreadcrumb = ({ items, className = '' }) => {
  if (!items?.length) return null;

  const label = items.map((item) => item.label).join(' > ');

  return (
    <nav className={`${styles.breadcrumb} ${className}`} aria-label={`Parent hierarchy: ${label}`} title={label}>
      {items.map((item, index) => {
        const isLeaf = index === items.length - 1;

        return (
          <React.Fragment key={`${item.label}-${index}`}>
            {index > 0 && <span className={styles.separator} aria-hidden="true">›</span>}
            <button
              className={`${styles.item} ${isLeaf ? styles.leaf : styles.ancestor}`}
              title={item.label}
              type="button"
            >
              <Typography variant="body-sm" weight="semibold">{item.label}</Typography>
            </button>
          </React.Fragment>
        );
      })}
    </nav>
  );
};

HierarchyBreadcrumb.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
  })).isRequired,
  className: PropTypes.string,
};
