import React from 'react';
import PropTypes from 'prop-types';
import styles from './ScopeNavigation.module.css';

export const ScopeNavigation = ({
  segments,
  className = '',
  ariaLabel = 'Location scope navigation',
}) => {
  if (!segments?.length) return null;

  return (
    <nav className={`${styles.root} ${className}`} aria-label={ariaLabel}>
      <div className={styles.locationScope} aria-label="Location breadcrumb selectors">
        {segments.map((segment, index) => (
          <ScopeDropdown
            key={`${segment.label}-${index}`}
            label={segment.label}
            options={segment.options}
          />
        ))}
      </div>
    </nav>
  );
};

function ScopeDropdown({ label, options }) {
  return (
    <div className={styles.scopeDropdown}>
      <button className={styles.scopeButton} type="button" aria-haspopup="listbox">
        <span className={styles.scopeLabel}>{label}</span>
        <span className="material-symbols-rounded" aria-hidden="true">expand_more</span>
      </button>
      <div className={styles.scopeMenu} role="listbox" aria-label={`${label} options`}>
        {options.map((option) => (
          <button
            className={styles.scopeOption}
            key={option.label}
            type="button"
            role="option"
            aria-selected={option.label === label}
          >
            <span>{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

ScopeDropdown.propTypes = {
  label: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
  })).isRequired,
};

ScopeNavigation.propTypes = {
  segments: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    options: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.string.isRequired,
    })).isRequired,
  })).isRequired,
  className: PropTypes.string,
  ariaLabel: PropTypes.string,
};
