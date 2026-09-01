import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '../../atoms/Button/Button';
import { Typography } from '../../atoms/Typography/Typography';
import styles from './OffscreenBlockAwareness.module.css';

const defaultClusters = [
  { id: 'north', count: 4, risk: 'high', x: 50, y: 22 },
  { id: 'south', count: 3, risk: 'medium', x: 48, y: 74 },
  { id: 'east', count: 5, risk: 'high', x: 70, y: 48 },
  { id: 'west', count: 2, risk: 'medium', x: 31, y: 49 },
  { id: 'central', count: 1, risk: 'low', x: 52, y: 49 },
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

const getDirectionLabel = (indicator) => indicator.directionLabel || ({
  top: 'north',
  right: 'east',
  bottom: 'south',
  left: 'west',
  topLeft: 'north west',
  topRight: 'north east',
  bottomLeft: 'south west',
  bottomRight: 'south east',
}[indicator.edge] || 'outside');

export const OffscreenBlockAwareness = ({
  focusMode = 'overview',
  clusters = defaultClusters,
  indicators = [],
  activeClusterId = '',
  previewClusterId = '',
  onFocusModeChange,
  indicatorMode = 'edge',
  mobileMode = 'panel',
  className = '',
}) => {
  const isOverview = focusMode === 'overview';
  const highlightedClusterId = previewClusterId || activeClusterId;
  const hiddenBlockCount = indicators.reduce((total, indicator) => total + indicator.count, 0);
  const modeClassName = indicatorMode === 'pinned' ? styles.pinnedMode : styles.edgeMode;

  return (
    <section
      className={`${styles.overlay} ${modeClassName} ${mobileMode === 'overlay' ? styles.mobileOverlayMode : ''} ${className}`}
      aria-label="Distributed block awareness"
    >
      {isOverview && (
        <div className={styles.clusterLayer} aria-label="Zoomed-out block clusters">
          {clusters.map((cluster) => (
            <button
              className={`${styles.clusterMarker} ${styles[`cluster-${cluster.risk}`]} ${highlightedClusterId === cluster.id ? styles.activeClusterMarker : ''}`}
              key={cluster.id}
              style={{
                '--cluster-x': `${cluster.x}%`,
                '--cluster-y': `${cluster.y}%`,
                '--cluster-mobile-x': `${cluster.mobileX ?? cluster.x}%`,
                '--cluster-mobile-y': `${cluster.mobileY ?? cluster.y}%`,
              }}
              type="button"
              onClick={() => onFocusModeChange?.(cluster.id)}
              aria-label={`${cluster.count} ${cluster.count === 1 ? 'block' : 'blocks'} in this area. Select to zoom in.`}
            >
              <span className={styles.clusterCount}>{cluster.count}</span>
            </button>
          ))}
        </div>
      )}

      {!isOverview && indicators.map((indicator) => {
        const directionLabel = getDirectionLabel(indicator);
        return (
          <button
            className={`${styles.offscreenIndicator} ${styles[indicator.edge]} ${styles[`cluster-${indicator.risk}`]} ${indicator.clusterIds?.includes(highlightedClusterId) ? styles.activeClusterMarker : ''}`}
            key={indicator.id}
            style={{
              '--indicator-x': `${indicator.x ?? 50}%`,
              '--indicator-y': `${indicator.y ?? 50}%`,
              '--indicator-mobile-x': `${indicator.mobileX ?? indicator.x ?? 50}%`,
              '--indicator-mobile-y': `${indicator.mobileY ?? indicator.y ?? 50}%`,
            }}
            type="button"
            onClick={() => onFocusModeChange?.(indicator.targetId || indicator.id)}
            aria-label={`${indicator.count} ${indicator.count === 1 ? 'block is' : 'blocks are'} ${directionLabel} of this view. Select to move ${directionLabel}.`}
          >
            {indicatorMode === 'edge' && (
              <span className="material-symbols-rounded" aria-hidden="true">{getIndicatorIcon(indicator.edge)}</span>
            )}
            <span className={styles.clusterCount}>{indicator.count}</span>
          </button>
        );
      })}

      {!isOverview && indicators.length > 0 && (
        <footer className={styles.mapFooter} aria-live="polite">
          <Typography variant="body-sm">
            {hiddenBlockCount} {hiddenBlockCount === 1 ? 'block is' : 'blocks are'} outside this view.
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
  name: PropTypes.string,
  count: PropTypes.number.isRequired,
  risk: PropTypes.oneOf(['high', 'medium', 'low']).isRequired,
  x: PropTypes.number,
  y: PropTypes.number,
  mobileX: PropTypes.number,
  mobileY: PropTypes.number,
  edge: PropTypes.string,
  targetId: PropTypes.string,
  directionLabel: PropTypes.string,
  clusterIds: PropTypes.arrayOf(PropTypes.string),
});

OffscreenBlockAwareness.propTypes = {
  focusMode: PropTypes.string,
  clusters: PropTypes.arrayOf(clusterShape),
  indicators: PropTypes.arrayOf(clusterShape),
  activeClusterId: PropTypes.string,
  previewClusterId: PropTypes.string,
  onFocusModeChange: PropTypes.func,
  indicatorMode: PropTypes.oneOf(['edge', 'pinned']),
  mobileMode: PropTypes.oneOf(['panel', 'overlay']),
  className: PropTypes.string,
};
