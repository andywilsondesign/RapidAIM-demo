import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Badge } from '../../atoms/Badge/Badge';
import { Button } from '../../atoms/Button/Button';
import { Typography } from '../../atoms/Typography/Typography';
import styles from './OffscreenBlockAwareness.module.css';

const focusModes = {
  overview: {
    label: 'All blocks',
    viewportLabel: 'Full farm view',
    visible: ['north', 'central', 'south', 'west', 'east'],
  },
  north: {
    label: 'North cluster',
    viewportLabel: 'Focused on north blocks',
    visible: ['north'],
  },
  south: {
    label: 'South cluster',
    viewportLabel: 'Focused on south blocks',
    visible: ['south'],
  },
  east: {
    label: 'East cluster',
    viewportLabel: 'Focused on east blocks',
    visible: ['east'],
  },
  west: {
    label: 'West cluster',
    viewportLabel: 'Focused on west blocks',
    visible: ['west'],
  },
  central: {
    label: 'Central block',
    viewportLabel: 'Focused on central block',
    visible: ['central'],
  },
};

const clusters = [
  { id: 'north', name: 'North Ridge', count: 4, sensors: 18, x: 47, y: 15, risk: 'high' },
  { id: 'central', name: 'Home Block', count: 1, sensors: 6, x: 50, y: 50, risk: 'low' },
  { id: 'south', name: 'South Basin', count: 3, sensors: 14, x: 42, y: 82, risk: 'medium' },
  { id: 'west', name: 'West Road', count: 2, sensors: 9, x: 31, y: 52, risk: 'medium' },
  { id: 'east', name: 'East Trial', count: 5, sensors: 22, x: 69, y: 44, risk: 'high' },
];

const indicatorPositions = {
  north: {
    south: { edge: 'bottom', icon: 'south' },
    east: { edge: 'right', icon: 'east' },
    west: { edge: 'left', icon: 'west' },
    central: { edge: 'bottomRight', icon: 'south_east' },
  },
  south: {
    north: { edge: 'top', icon: 'north' },
    east: { edge: 'right', icon: 'north_east' },
    west: { edge: 'left', icon: 'north_west' },
    central: { edge: 'topRight', icon: 'north_east' },
  },
  east: {
    north: { edge: 'topLeft', icon: 'north_west' },
    south: { edge: 'bottomLeft', icon: 'south_west' },
    west: { edge: 'left', icon: 'west' },
    central: { edge: 'left', icon: 'west' },
  },
  west: {
    north: { edge: 'topRight', icon: 'north_east' },
    south: { edge: 'bottomRight', icon: 'south_east' },
    east: { edge: 'right', icon: 'east' },
    central: { edge: 'right', icon: 'east' },
  },
  central: {
    north: { edge: 'top', icon: 'north' },
    south: { edge: 'bottom', icon: 'south' },
    east: { edge: 'right', icon: 'east' },
    west: { edge: 'left', icon: 'west' },
  },
};

const getIndicators = (focusMode) => {
  if (focusMode === 'overview') return [];
  const visibleIds = new Set(focusModes[focusMode].visible);
  return clusters
    .filter((cluster) => !visibleIds.has(cluster.id))
    .map((cluster) => ({
      ...cluster,
      ...indicatorPositions[focusMode][cluster.id],
    }));
};

export const OffscreenBlockAwareness = ({ className = '' }) => {
  const [focusMode, setFocusMode] = useState('overview');
  const visibleIds = useMemo(() => new Set(focusModes[focusMode].visible), [focusMode]);
  const indicators = getIndicators(focusMode);

  return (
    <section className={`${styles.shell} ${className}`} aria-label="Distributed block awareness prototype">
      <header className={styles.header}>
        <div>
          <Typography variant="h3">Distributed block awareness</Typography>
          <Typography variant="body-sm" color="secondary">
            Square block clusters stay discoverable when a distant area moves outside the active map view.
          </Typography>
        </div>
        <Badge variant={indicators.length ? 'medium' : 'low'}>
          {indicators.length ? `${indicators.length} offscreen` : 'All visible'}
        </Badge>
      </header>

      <div className={styles.controls} role="group" aria-label="Map focus examples">
        {Object.entries(focusModes).map(([mode, config]) => (
          <button
            className={`${styles.focusButton} ${focusMode === mode ? styles.activeFocusButton : ''}`}
            key={mode}
            type="button"
            onClick={() => setFocusMode(mode)}
          >
            {config.label}
          </button>
        ))}
      </div>

      <div className={styles.mapShell}>
        <aside className={styles.leftPanel} aria-hidden="true">
          <span />
          <span />
          <span />
        </aside>
        <aside className={styles.rightPanel} aria-hidden="true">
          <span />
          <span />
        </aside>
        <div className={styles.mapCanvas} role="img" aria-label={`${focusModes[focusMode].viewportLabel}. ${indicators.length} block clusters are outside the view.`}>
          <div className={styles.mapTexture} aria-hidden="true" />
          {clusters.map((cluster) => {
            const isVisible = visibleIds.has(cluster.id);
            return (
              <button
                className={`${styles.cluster} ${styles[`cluster-${cluster.risk}`]} ${isVisible ? styles.visibleCluster : styles.hiddenCluster}`}
                key={cluster.id}
                style={{ '--cluster-x': `${cluster.x}%`, '--cluster-y': `${cluster.y}%` }}
                type="button"
                aria-label={`${cluster.name}, ${cluster.count} blocks, ${cluster.sensors} sensors`}
                onClick={() => setFocusMode(cluster.id)}
              >
                <span className={styles.clusterCount}>{cluster.count}</span>
                <span className={styles.clusterLabel}>{cluster.name}</span>
              </button>
            );
          })}
          {indicators.map((indicator) => (
            <button
              className={`${styles.offscreenIndicator} ${styles[indicator.edge]} ${styles[`indicator-${indicator.risk}`]}`}
              key={indicator.id}
              type="button"
              onClick={() => setFocusMode(indicator.id)}
              aria-label={`${indicator.name} is outside this view. Select to focus ${indicator.count} blocks.`}
            >
              <span className="material-symbols-rounded" aria-hidden="true">{indicator.icon}</span>
              <span className={styles.indicatorMark}>{indicator.count}</span>
              <span className={styles.indicatorText}>{indicator.name}</span>
            </button>
          ))}
        </div>
        {indicators.length > 0 && (
          <footer className={styles.mapFooter} aria-live="polite">
            <span className="material-symbols-rounded" aria-hidden="true">zoom_out_map</span>
            <Typography variant="body-sm">
              {indicators.length} block {indicators.length === 1 ? 'cluster is' : 'clusters are'} outside this view.
            </Typography>
            <Button variant="secondary" size="sm" type="button" onClick={() => setFocusMode('overview')}>
              Show all blocks
            </Button>
          </footer>
        )}
      </div>
    </section>
  );
};

OffscreenBlockAwareness.propTypes = {
  className: PropTypes.string,
};
