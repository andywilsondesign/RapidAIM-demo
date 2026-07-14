import React from 'react';
import PropTypes from 'prop-types';
import { MapContainer, TileLayer, Polygon, Marker, Tooltip, ZoomControl, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './InteractiveMap.module.css';
import { getRiskMarkerSvgMarkup } from '../../atoms/RiskMarker/RiskMarker.config';

const BLOCK_RISK_COLORS = {
  high: {
    fill: 'var(--color-map-risk-high-fill, #E11932)',
    stroke: 'var(--color-map-risk-high-stroke, #FF2D55)',
  },
  medium: {
    fill: 'var(--color-map-risk-medium-fill, #F9A602)',
    stroke: 'var(--color-map-risk-medium-stroke, #FFB000)',
  },
  low: {
    fill: 'var(--color-map-risk-low-fill, #19B56B)',
    stroke: 'var(--color-map-risk-low-stroke, #66F27A)',
  },
};

// Fix Leaflet's default icon paths issue by creating custom DivIcons
const createMarkerIcon = (severity, selected = false) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<span class="leaflet-risk-marker ${selected ? 'leaflet-risk-marker--selected' : ''}">${getRiskMarkerSvgMarkup(severity, selected)}</span>`,
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

const MapResizer = () => {
  const map = useMap();
  React.useEffect(() => {
    // Re-calculate size after render to fix Leaflet gray/shifted tile issue
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
};

export const InteractiveMap = ({
  center = [36.7378, -119.7871], // Default Fresno, CA
  zoom = 13,
  blockPolygon = [],
  blockOverlays = [],
  sensors = [],
  selectedSensorId = '',
  blockSeverity = 'low', // 'low', 'medium', 'high'
  activeBlockLabel = '',
  mapStyle = 'satellite', // 'satellite' or 'stylized'
  className = '',
}) => {
  const [hoveredBlockId, setHoveredBlockId] = React.useState('');

  const getBlockPathOptions = (severity, state = 'default') => {
    const palette = BLOCK_RISK_COLORS[severity] || BLOCK_RISK_COLORS.low;
    const baseOptions = {
      fillColor: palette.fill,
      lineCap: 'round',
      lineJoin: 'round',
    };

    if (state === 'selected') {
      return {
        ...baseOptions,
        color: '#FFFFFF',
        fillOpacity: 0.46,
        opacity: 1,
        weight: 6,
        dashArray: null,
      };
    }

    if (state === 'hover') {
      return {
        ...baseOptions,
        color: '#FFFFFF',
        fillOpacity: 0.4,
        opacity: 0.96,
        weight: 4,
        dashArray: '8 5',
      };
    }

    return {
      ...baseOptions,
      color: palette.stroke,
      fillOpacity: 0.34,
      opacity: 0.96,
      weight: 3,
      dashArray: null,
    };
  };

  const displayedBlockOverlays = blockOverlays.length > 0
    ? blockOverlays
    : blockPolygon.length > 0
      ? [{ id: 'primary-block', label: activeBlockLabel, positions: blockPolygon, severity: blockSeverity, state: activeBlockLabel ? 'selected' : 'default' }]
      : [];
  const visualBlockOverlays = displayedBlockOverlays.map((block) => ({
    ...block,
    visualState: hoveredBlockId === block.id ? 'hover' : block.state,
  }));
  const activeBlockOverlay = visualBlockOverlays.find((block) => block.visualState === 'hover')
    || visualBlockOverlays.find((block) => block.visualState === 'selected');

  const satelliteUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
  const stylizedUrl = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'; // CartoDB Positron for clean view

  return (
    <div className={`${styles.mapWrapper} ${className}`}>
      <MapContainer center={center} zoom={zoom} zoomControl={false} style={{ height: '100%', width: '100%' }}>
        <MapResizer />
        <ZoomControl position="bottomright" />
        <TileLayer
          url={mapStyle === 'satellite' ? satelliteUrl : stylizedUrl}
          attribution={mapStyle === 'satellite' ? 'Tiles &copy; Esri' : '&copy; OpenStreetMap contributors &copy; CARTO'}
        />

        {visualBlockOverlays.map((block) => (
          <Polygon
            key={block.id}
            positions={block.positions}
            pathOptions={getBlockPathOptions(block.severity, block.visualState)}
            eventHandlers={{
              mouseover: () => setHoveredBlockId(block.id),
              mouseout: () => setHoveredBlockId(''),
            }}
          />
        ))}

        {activeBlockOverlay?.label && (
          <Marker
            position={getBlockLabelPosition(activeBlockOverlay.positions)}
            icon={createBlockLabelIcon(activeBlockOverlay.label)}
            interactive={false}
            zIndexOffset={900}
          />
        )}

        {sensors.map((sensor) => (
          <Marker
            key={sensor.id}
            position={[sensor.lat, sensor.lng]}
            icon={createMarkerIcon(sensor.severity, sensor.id === selectedSensorId)}
            title={`${sensor.name}: ${sensor.count} detections, ${sensor.severity === 'offline' ? 'offline' : `${sensor.severity} risk`}`}
            alt={`${sensor.name} map marker`}
            zIndexOffset={sensor.id === selectedSensorId ? 800 : 0}
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
  selectedSensorId: PropTypes.string,
  blockSeverity: PropTypes.oneOf(['high', 'medium', 'low']),
  mapStyle: PropTypes.oneOf(['satellite', 'stylized']),
  className: PropTypes.string,
};
