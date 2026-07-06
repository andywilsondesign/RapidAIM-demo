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

export const InteractiveMap = ({
  center = [36.7378, -119.7871], // Default Fresno, CA
  zoom = 13,
  blockPolygon = [],
  sensors = [],
  blockSeverity = 'low', // 'low', 'medium', 'high'
  mapStyle = 'satellite', // 'satellite' or 'stylized'
  className = '',
}) => {
  // Determine block fill color based on severity (heatmap effect)
  let blockFillColor = 'var(--color-status-green)';
  if (blockSeverity === 'high') blockFillColor = 'var(--color-status-red)';
  if (blockSeverity === 'medium') blockFillColor = 'var(--color-status-amber)';

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

        {blockPolygon.length > 0 && (
          <Polygon
            positions={blockPolygon}
            pathOptions={{
              color: blockFillColor,
              fillColor: blockFillColor,
              fillOpacity: 0.4,
              weight: 2,
            }}
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
