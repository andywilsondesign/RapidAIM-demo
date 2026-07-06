import React from 'react';
import { Typography } from '../components/atoms/Typography/Typography';
import styles from './HandoffIndex.module.css';

export const HierarchyBreadcrumb = ({ items, className = '' }) => {
  if (!items?.length) return null;

  const label = items.map((item) => item.label).join(' > ');

  return (
    <nav className={`${styles.parentContextLink} ${className}`} aria-label={`Parent hierarchy: ${label}`} title={label}>
      {items.map((item, index) => {
        const isLeaf = index === items.length - 1;

        return (
          <React.Fragment key={`${item.label}-${index}`}>
            {index > 0 && <span className={styles.breadcrumbSeparator} aria-hidden="true">›</span>}
            <button
              className={`${styles.breadcrumbItem} ${isLeaf ? styles.breadcrumbLeaf : styles.breadcrumbAncestor}`}
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
