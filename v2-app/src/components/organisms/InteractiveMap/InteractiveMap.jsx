import React from 'react';
import PropTypes from 'prop-types';
import { MapContainer, TileLayer, Polygon, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './InteractiveMap.module.css';

// Fix Leaflet's default icon paths issue by creating custom DivIcons
const createMarkerIcon = (severity) => {
  let color = 'var(--color-status-green)';
  if (severity === 'high') color = 'var(--color-status-red)';
  if (severity === 'medium') color = 'var(--color-status-amber)';

  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
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
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
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
            <Popup>
              <strong>{sensor.name}</strong><br />
              Detections: {sensor.count}<br />
              Status: {sensor.severity} risk
            </Popup>
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
    severity: PropTypes.oneOf(['high', 'medium', 'low']).isRequired,
  })),
  blockSeverity: PropTypes.oneOf(['high', 'medium', 'low']),
  mapStyle: PropTypes.oneOf(['satellite', 'stylized']),
  className: PropTypes.string,
};
