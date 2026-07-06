import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Typography } from '../../atoms/Typography/Typography';
import { Select } from '../../atoms/Select/Select';
import { Checkbox } from '../../atoms/Checkbox/Checkbox';
import { FormField } from '../../molecules/FormField/FormField';
import { Button } from '../../atoms/Button/Button';
import { RiskMarker } from '../../atoms/RiskMarker/RiskMarker';
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
                <span className="material-symbols-rounded">auto_awesome</span>
                <div className={styles.thresholdRecText}>
                  <Typography variant="caption" weight="bold">AI recommendation: 25</Typography>
                </div>
                <button className={styles.infoButton} type="button" aria-label="About AI threshold recommendation" title="AI recommends a threshold of 25 based on recent pest pressure and block history.">
                  <span className="material-symbols-rounded">info</span>
                </button>
                <Button variant="ghost" size="sm" className={styles.applyButton}>Apply</Button>
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
              <RiskMarker severity="high" size="md" />
              <Typography variant="body-sm">High Risk</Typography>
            </div>
            <div className={styles.legendItem}>
              <RiskMarker severity="medium" size="md" />
              <Typography variant="body-sm">Medium Risk</Typography>
            </div>
            <div className={styles.legendItem}>
              <RiskMarker severity="low" size="md" />
              <Typography variant="body-sm">Low Risk</Typography>
            </div>
            <div className={styles.legendItem}>
              <RiskMarker severity="offline" size="md" />
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
