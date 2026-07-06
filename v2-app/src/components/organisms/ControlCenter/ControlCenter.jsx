import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Typography } from '../../atoms/Typography/Typography';
import { Select } from '../../atoms/Select/Select';
import { Checkbox } from '../../atoms/Checkbox/Checkbox';
import { FormField } from '../../molecules/FormField/FormField';
import styles from './ControlCenter.module.css';

export const ControlCenter = ({ className = '' }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      className={`${styles.panel} ${isCollapsed ? styles.collapsed : ''} ${className}`}
      style={isCollapsed ? { bottom: 'auto', height: 'auto' } : undefined}
    >
      <button
        className={styles.header}
        type="button"
        aria-expanded={!isCollapsed}
        onClick={() => setIsCollapsed((current) => !current)}
      >
        <span className="material-symbols-rounded">layers</span>
        <Typography variant="h4">Map Controls</Typography>
        <span className={`material-symbols-rounded ${styles.toggleIcon}`}>expand_more</span>
      </button>

      {!isCollapsed && <div className={styles.body}>
        <div className={styles.section}>
          <Typography variant="h6" className={styles.sectionTitle}>Filters</Typography>
          <div className={styles.controls}>
            <FormField label="Organisation">
              <Select options={[
                { label: 'All Organisations', value: 'org-all' },
                { label: 'RapidAIM Growers Co.', value: 'org-rapid' },
                { label: 'Apex Agriculture', value: 'org-apex' },
              ]} />
            </FormField>

            <FormField label="Pest Type">
              <Select options={[
                { label: 'Female Navel Orangeworm', value: 'female-now' },
                { label: 'Male Navel Orangeworm', value: 'male-now' },
              ]} />
            </FormField>

            <FormField label="Ranch">
              <Select options={[
                { label: 'All Ranches', value: 'all' },
                { label: 'Sunshine Valley', value: 'sunshine' },
              ]} />
            </FormField>

            <FormField label="Threshold">
              <div className={styles.sliderContainer}>
                <input type="range" min="0" max="100" defaultValue="70" className={styles.slider} />
                <Typography variant="body-sm" className={styles.sliderValue}>70</Typography>
              </div>
              <div className={styles.thresholdRec}>
                <span className="material-symbols-rounded">psychology</span>
                <Typography variant="caption" color="secondary">Recommended: 25</Typography>
              </div>
            </FormField>
          </div>
        </div>

        <div className={styles.section}>
          <Typography variant="h6" className={styles.sectionTitle}>Map Layers</Typography>
          <div className={styles.controls}>
            <Checkbox label="Heatmap (Pest Pressure)" defaultChecked />
            <Checkbox label="Sensors" defaultChecked />
          </div>
        </div>

        <div className={styles.section}>
          <Typography variant="h6" className={styles.sectionTitle}>Risk Legend</Typography>
          <div className={styles.legend}>
            <div className={styles.legendItem}>
              <div className={styles.dot} style={{ backgroundColor: 'var(--color-status-red)' }} />
              <Typography variant="body-sm">High Risk</Typography>
            </div>
            <div className={styles.legendItem}>
              <div className={styles.dot} style={{ backgroundColor: 'var(--color-status-amber)' }} />
              <Typography variant="body-sm">Medium Risk</Typography>
            </div>
            <div className={styles.legendItem}>
              <div className={styles.dot} style={{ backgroundColor: 'var(--color-status-green)' }} />
              <Typography variant="body-sm">Low Risk</Typography>
            </div>
            <div className={styles.legendItem}>
              <span className="material-symbols-rounded" style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>build</span>
              <Typography variant="body-sm">Offline Sensor</Typography>
            </div>
          </div>
        </div>
      </div>}
    </aside>
  );
};

ControlCenter.propTypes = {
  className: PropTypes.string,
};
