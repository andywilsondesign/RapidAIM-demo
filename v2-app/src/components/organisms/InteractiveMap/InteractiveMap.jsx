import React from 'react';
import PropTypes from 'prop-types';
import { MapContainer, TileLayer, Polygon, Marker, Tooltip, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './InteractiveMap.module.css';
import { getRiskMarkerSvgMarkup } from '../../atoms/RiskMarker/RiskMarker.config';

// Fix Leaflet's default icon paths issue by creating custom DivIcons
const createMarkerIcon = (severity) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<span class="leaflet-risk-marker">${getRiskMarkerSvgMarkup(severity)}</span>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const createBlockLabelIcon = (label) => L.divIcon({
  className: styles.blockLabelMarker,
  html: `<span>${escapeHtml(label)}</span>`,
  iconSize: null,
  iconAnchor: [0, 0],
});

const getBlockLabelPosition = (positions) => {
  const latitudes = positions.map(([lat]) => lat);
  const longitudes = positions.map(([, lng]) => lng);

  return [Math.min(...latitudes), Math.max(...longitudes)];
};

export const InteractiveMap = ({
  center = [36.7378, -119.7871], // Default Fresno, CA
  zoom = 13,
  blockPolygon = [],
  blockOverlays = [],
  sensors = [],
  blockSeverity = 'low', // 'low', 'medium', 'high'
  activeBlockLabel = '',
  mapStyle = 'satellite', // 'satellite' or 'stylized'
  className = '',
}) => {
  // Determine block fill color based on severity (heatmap effect)
  const getBlockFillColor = (severity) => {
    if (severity === 'high') return 'var(--color-status-red)';
    if (severity === 'medium') return 'var(--color-status-amber)';
    return 'var(--color-status-green)';
  };

  const getBlockPathOptions = (severity, state = 'default') => {
    const fillColor = getBlockFillColor(severity);

    if (state === 'selected') {
      return {
        color: '#FFFFFF',
        fillColor,
        fillOpacity: 0.52,
        opacity: 0.98,
        weight: 6,
      };
    }

    if (state === 'hover') {
      return {
        color: '#FFFFFF',
        fillColor,
        fillOpacity: 0.44,
        opacity: 0.9,
        weight: 4,
        dashArray: '8 5',
      };
    }

    return {
      color: fillColor,
      fillColor,
      fillOpacity: 0.3,
      weight: 2,
    };
  };

  const displayedBlockOverlays = blockOverlays.length > 0
    ? blockOverlays
    : blockPolygon.length > 0
      ? [{ id: 'primary-block', label: activeBlockLabel, positions: blockPolygon, severity: blockSeverity, state: activeBlockLabel ? 'selected' : 'default' }]
      : [];
  const selectedBlockOverlay = displayedBlockOverlays.find((block) => block.state === 'selected');

  const satelliteUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
  const stylizedUrl = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'; // CartoDB Positron for clean view

  return (
    <div className={`${styles.mapWrapper} ${className}`}>
      <MapContainer center={center} zoom={zoom} zoomControl={false} style={{ height: '100%', width: '100%' }}>
        <ZoomControl position="bottomright" />
        <TileLayer
          url={mapStyle === 'satellite' ? satelliteUrl : stylizedUrl}
          attribution={mapStyle === 'satellite' ? 'Tiles &copy; Esri' : '&copy; OpenStreetMap contributors &copy; CARTO'}
        />

        {displayedBlockOverlays.map((block) => (
          <Polygon
            key={block.id}
            positions={block.positions}
            pathOptions={getBlockPathOptions(block.severity, block.state)}
          />
        ))}

        {selectedBlockOverlay?.label && (
          <Marker
            position={getBlockLabelPosition(selectedBlockOverlay.positions)}
            icon={createBlockLabelIcon(selectedBlockOverlay.label)}
            interactive={false}
            zIndexOffset={900}
          />
        )}

        {sensors.map((sensor) => (
          <Marker
            key={sensor.id}
            position={[sensor.lat, sensor.lng]}
            icon={createMarkerIcon(sensor.severity)}
          >
            <Tooltip className={styles.sensorTooltip} direction="top" offset={[0, -14]} opacity={1}>
              <strong>{sensor.name}</strong><br />
              Detections: {sensor.count}<br />
              Status: {sensor.severity === 'offline' ? 'offline' : `${sensor.severity} risk`}
            </Tooltip>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

InteractiveMap.propTypes = {
  center: PropTypes.arrayOf(PropTypes.number),
  zoom: PropTypes.number,
  blockPolygon: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
  blockOverlays: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    label: PropTypes.string,
    positions: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)).isRequired,
    severity: PropTypes.oneOf(['high', 'medium', 'low']).isRequired,
    state: PropTypes.oneOf(['default', 'hover', 'selected']),
  })),
  activeBlockLabel: PropTypes.string,
  sensors: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
    name: PropTypes.string,
    count: PropTypes.number,
    severity: PropTypes.oneOf(['high', 'medium', 'low', 'offline']).isRequired,
  })),
  blockSeverity: PropTypes.oneOf(['high', 'medium', 'low']),
  mapStyle: PropTypes.oneOf(['satellite', 'stylized']),
  className: PropTypes.string,
};
