import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '../../atoms/Button/Button';
import { Typography } from '../../atoms/Typography/Typography';
import styles from './OffscreenBlockAwareness.module.css';

const defaultFocusModes = [
  { value: 'overview', label: 'Clustered view' },
  { value: 'north', label: 'North blocks' },
  { value: 'south', label: 'South blocks' },
  { value: 'east', label: 'East blocks' },
  { value: 'west', label: 'West blocks' },
  { value: 'central', label: 'Central blocks' },
];

const defaultClusters = [
  { id: 'north', name: 'North Ridge', count: 4, risk: 'high', x: 50, y: 22 },
  { id: 'south', name: 'South Basin', count: 3, risk: 'medium', x: 48, y: 74 },
  { id: 'east', name: 'East Trial', count: 5, risk: 'high', x: 70, y: 48 },
  { id: 'west', name: 'West Road', count: 2, risk: 'medium', x: 31, y: 49 },
  { id: 'central', name: 'Home Block', count: 1, risk: 'low', x: 52, y: 49 },
];

const getIndicatorIcon = (edge) => ({
  top: 'north',
  right: 'east',
  bottom: 'south',
  left: 'west',
  topLeft: 'north_west',
  topRight: 'north_east',
  bottomLeft: 'south_west',
  bottomRight: 'south_east',
}[edge] || 'near_me');

export const OffscreenBlockAwareness = ({
  focusMode = 'overview',
  focusModes = defaultFocusModes,
  clusters = defaultClusters,
  indicators = [],
  onFocusModeChange,
  className = '',
}) => {
  const isOverview = focusMode === 'overview';

  return (
    <section className={`${styles.overlay} ${className}`} aria-label="Distributed block awareness controls">
      <div className={styles.focusControls} role="group" aria-label="Distributed block map examples">
        {focusModes.map((mode) => (
          <button
            className={`${styles.focusButton} ${focusMode === mode.value ? styles.activeFocusButton : ''}`}
            key={mode.value}
            type="button"
            onClick={() => onFocusModeChange?.(mode.value)}
          >
            {mode.label}
          </button>
        ))}
      </div>

      {isOverview && (
        <div className={styles.clusterLayer} aria-label="Zoomed-out block clusters">
          {clusters.map((cluster) => (
            <button
              className={`${styles.clusterMarker} ${styles[`cluster-${cluster.risk}`]}`}
              key={cluster.id}
              style={{ '--cluster-x': `${cluster.x}%`, '--cluster-y': `${cluster.y}%` }}
              type="button"
              onClick={() => onFocusModeChange?.(cluster.id)}
              aria-label={`${cluster.name}, ${cluster.count} block cluster`}
            >
              <span className={styles.clusterCount}>{cluster.count}</span>
              <span className={styles.clusterLabel}>{cluster.name}</span>
            </button>
          ))}
        </div>
      )}

      {!isOverview && indicators.map((indicator) => (
        <button
          className={`${styles.offscreenIndicator} ${styles[indicator.edge]} ${styles[`cluster-${indicator.risk}`]}`}
          key={indicator.id}
          type="button"
          onClick={() => onFocusModeChange?.(indicator.id)}
          aria-label={`${indicator.name} is outside this view. Select to focus ${indicator.count} blocks.`}
        >
          <span className="material-symbols-rounded" aria-hidden="true">{getIndicatorIcon(indicator.edge)}</span>
          <span className={styles.clusterCount}>{indicator.count}</span>
          <span className={styles.clusterLabel}>{indicator.name}</span>
        </button>
      ))}

      {!isOverview && indicators.length > 0 && (
        <footer className={styles.mapFooter} aria-live="polite">
          <span className="material-symbols-rounded" aria-hidden="true">zoom_out_map</span>
          <Typography variant="body-sm">
            {indicators.length} block {indicators.length === 1 ? 'cluster is' : 'clusters are'} outside this view.
          </Typography>
          <Button variant="secondary" size="sm" type="button" onClick={() => onFocusModeChange?.('overview')}>
            Show all blocks
          </Button>
        </footer>
      )}
    </section>
  );
};

const clusterShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  count: PropTypes.number.isRequired,
  risk: PropTypes.oneOf(['high', 'medium', 'low']).isRequired,
  x: PropTypes.number,
  y: PropTypes.number,
  edge: PropTypes.string,
});

OffscreenBlockAwareness.propTypes = {
  focusMode: PropTypes.string,
  focusModes: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
  })),
  clusters: PropTypes.arrayOf(clusterShape),
  indicators: PropTypes.arrayOf(clusterShape),
  onFocusModeChange: PropTypes.func,
  className: PropTypes.string,
};
