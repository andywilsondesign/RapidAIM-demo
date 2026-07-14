import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Typography } from '../../atoms/Typography/Typography';
import { Select } from '../../atoms/Select/Select';
import { Checkbox } from '../../atoms/Checkbox/Checkbox';
import { FormField } from '../../molecules/FormField/FormField';
import { Button } from '../../atoms/Button/Button';
import { RiskMarker } from '../../atoms/RiskMarker/RiskMarker';
import { InfoDisclosure } from '../../molecules/InfoDisclosure/InfoDisclosure';
import styles from './ControlCenter.module.css';

const pestThresholds = [
  { label: 'Female Navel Orangeworm', value: 'female-now', threshold: 70, recommendation: 25 },
  { label: 'Male Navel Orangeworm', value: 'male-now', threshold: 58, recommendation: 32 },
  { label: 'Codling Moth', value: 'codling-moth', threshold: 44, recommendation: 18 },
  { label: 'Mites', value: 'mites', threshold: 62, recommendation: 40 },
];

export const ControlCenter = ({
  className = '',
  mode = 'default',
  scopePanel = 'both',
  pestFocus,
  onPestFocusChange,
  embedded = false,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isPestViewCollapsed, setIsPestViewCollapsed] = useState(false);
  const [isViewControlsCollapsed, setIsViewControlsCollapsed] = useState(true);
  const [internalPestFocus, setInternalPestFocus] = useState('all');
  const isScopeExperiment = mode === 'scopeExperiment';
  const activePestFocus = pestFocus ?? internalPestFocus;
  const handlePestFocusChange = (nextPestFocus) => {
    setInternalPestFocus(nextPestFocus);
    onPestFocusChange?.(nextPestFocus);
  };
  const visiblePestThresholds = activePestFocus === 'all'
    ? pestThresholds
    : pestThresholds.filter((pest) => pest.value === activePestFocus);

  if (isScopeExperiment) {
    return (
      <div className={`${styles.panelStack} ${embedded ? styles.embeddedPanelStack : ''} ${className}`}>
        {scopePanel !== 'map' && (
          <PestThresholdsPanel
            isCollapsed={scopePanel === 'pest' ? false : isPestViewCollapsed}
            onToggle={() => scopePanel === 'both' && setIsPestViewCollapsed((current) => !current)}
            pestFocus={activePestFocus}
            onPestFocusChange={handlePestFocusChange}
            visiblePestThresholds={visiblePestThresholds}
            embedded={embedded}
          />
        )}
        {scopePanel !== 'pest' && (
          <MapControlsPanel
            isCollapsed={scopePanel === 'map' ? false : isViewControlsCollapsed}
            onToggle={() => scopePanel === 'both' && setIsViewControlsCollapsed((current) => !current)}
            embedded={embedded}
          />
        )}
      </div>
    );
  }

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
        {!isScopeExperiment && (
          <div className={styles.section}>
            <div className={styles.controls}>
              <FormField label="Pest Type">
                <Select options={[
                  { label: 'Female Navel Orangeworm', value: 'female-now' },
                  { label: 'Male Navel Orangeworm', value: 'male-now' },
                ]} />
              </FormField>

              <FormField label="Organisation">
                <Select options={[
                  { label: 'All Organisations', value: 'org-all' },
                  { label: 'RapidAIM Growers Co.', value: 'org-rapid' },
                  { label: 'Apex Agriculture', value: 'org-apex' },
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
                  <input type="range" min="0" max="100" defaultValue="70" className={styles.slider} aria-label="Female Navel Orangeworm threshold" />
                  <Typography variant="body-sm" className={styles.sliderValue}>70</Typography>
                </div>
                <div className={styles.thresholdRec}>
                  <span className="material-symbols-rounded">auto_awesome</span>
                  <div className={styles.thresholdRecText}>
                    <Typography variant="caption" className={styles.thresholdRecommendation}><strong>AI recommends</strong>: 25</Typography>
                  </div>
                  <InfoDisclosure
                    title="AI recommendation"
                    description="AI recommends a threshold of 25 based on recent pest pressure and block history."
                  />
                  <Button variant="ghost" size="sm" className={styles.applyButton}>Apply</Button>
                </div>
              </FormField>
            </div>
          </div>
        )}

        <MapLayerSection />
        <RiskLegendSection />
      </div>}
    </aside>
  );
};

function PestThresholdsPanel({
  isCollapsed,
  onToggle,
  pestFocus,
  onPestFocusChange,
  visiblePestThresholds,
  embedded = false,
}) {
  return (
    <aside className={`${styles.panel} ${styles.panelSegment} ${embedded ? styles.embeddedPanel : ''} ${isCollapsed ? styles.collapsed : ''}`}>
      {!embedded && (
        <button
          className={styles.header}
          type="button"
          aria-expanded={!isCollapsed}
          onClick={onToggle}
        >
          <span className="material-symbols-rounded">pest_control</span>
          <Typography variant="h4">Pest Focus</Typography>
          <span className={`material-symbols-rounded ${styles.toggleIcon}`}>expand_more</span>
        </button>
      )}

      {!isCollapsed && (
        <>
          <div className={styles.stickyPestFocus}>
            {embedded && (
              <div className={styles.embeddedHeader}>
                <span className="material-symbols-rounded" aria-hidden="true">pest_control</span>
                <Typography variant="h4">Pest Focus</Typography>
              </div>
            )}
            <FormField>
              <Select
                aria-label="Pest focus"
                value={pestFocus}
                onChange={(event) => onPestFocusChange(event.target.value)}
                options={[
                  { label: 'Show all pests', value: 'all' },
                  ...pestThresholds.map((pest) => ({ label: pest.label, value: pest.value })),
                ]}
              />
            </FormField>
          </div>
          <div className={styles.body}>
            <div className={styles.section}>
              <Typography variant="h6" className={styles.sectionTitle}>Thresholds</Typography>
              <ThresholdList pests={visiblePestThresholds} />
            </div>
          </div>
        </>
      )}
    </aside>
  );
}

function MapControlsPanel({ isCollapsed, onToggle, embedded = false }) {
  return (
    <aside className={`${styles.panel} ${styles.panelSegment} ${embedded ? styles.embeddedPanel : ''} ${isCollapsed ? styles.collapsed : ''}`}>
      {!embedded && (
        <button
          className={styles.header}
          type="button"
          aria-expanded={!isCollapsed}
          onClick={onToggle}
        >
          <span className="material-symbols-rounded">layers</span>
          <Typography variant="h4">Map Controls</Typography>
          <span className={`material-symbols-rounded ${styles.toggleIcon}`}>expand_more</span>
        </button>
      )}

      {!isCollapsed && (
        <div className={styles.body}>
          {embedded && (
            <div className={styles.embeddedHeader}>
              <span className="material-symbols-rounded" aria-hidden="true">layers</span>
              <Typography variant="h4">Map Controls</Typography>
            </div>
          )}
          <MapLayerSection />
          <RiskLegendSection />
        </div>
      )}
    </aside>
  );
}

function ThresholdList({ pests }) {
  return (
    <div className={styles.thresholdList}>
      {pests.map((pest) => (
        <div className={styles.thresholdCard} key={pest.label}>
          <div className={styles.pestThresholdHeader}>
            <Typography variant="body-sm" weight="bold">{pest.label}</Typography>
          </div>
          <div className={styles.sliderContainer}>
            <input
              type="range"
              min="0"
              max="100"
              defaultValue={pest.threshold}
              className={styles.slider}
              aria-label={`${pest.label} threshold`}
            />
            <Typography variant="body-sm" className={styles.sliderValue}>{pest.threshold}</Typography>
          </div>
          <div className={styles.thresholdRec}>
            <span className="material-symbols-rounded">auto_awesome</span>
            <div className={styles.thresholdRecText}>
              <Typography variant="caption" className={styles.thresholdRecommendation}><strong>AI recommends</strong>: {pest.recommendation}</Typography>
            </div>
            <InfoDisclosure
              title={`${pest.label} recommendation`}
              description={`AI recommends a threshold of ${pest.recommendation} based on recent pest pressure and block history.`}
            />
            <Button variant="ghost" size="sm" className={styles.applyButton}>Apply</Button>
          </div>
        </div>
      ))}
    </div>
  );
}

function MapLayerSection() {
  return (
    <div className={styles.section}>
      <Typography variant="h6" className={styles.sectionTitle}>Map Layers</Typography>
      <div className={styles.controls}>
        <Checkbox label="Heatmap (Pest Pressure)" defaultChecked />
        <Checkbox label="Sensors" defaultChecked />
      </div>
    </div>
  );
}

function RiskLegendSection() {
  return (
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
  );
}

ControlCenter.propTypes = {
  className: PropTypes.string,
  mode: PropTypes.oneOf(['default', 'scopeExperiment']),
  scopePanel: PropTypes.oneOf(['both', 'pest', 'map']),
  pestFocus: PropTypes.string,
  onPestFocusChange: PropTypes.func,
  embedded: PropTypes.bool,
};

PestThresholdsPanel.propTypes = {
  isCollapsed: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  pestFocus: PropTypes.string.isRequired,
  onPestFocusChange: PropTypes.func.isRequired,
  visiblePestThresholds: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    threshold: PropTypes.number.isRequired,
    recommendation: PropTypes.number.isRequired,
  })).isRequired,
  embedded: PropTypes.bool,
};

MapControlsPanel.propTypes = {
  isCollapsed: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  embedded: PropTypes.bool,
};

ThresholdList.propTypes = {
  pests: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    threshold: PropTypes.number.isRequired,
    recommendation: PropTypes.number.isRequired,
  })).isRequired,
};
