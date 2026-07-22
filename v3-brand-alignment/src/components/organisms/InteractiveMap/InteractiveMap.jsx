import React from 'react';
import PropTypes from 'prop-types';
import { MapContainer, TileLayer, Polygon, Marker, Tooltip, ZoomControl, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './InteractiveMap.module.css';
import { getRiskMarkerSvgMarkup, markerConfig } from '../../atoms/RiskMarker/RiskMarker.config';

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

const getSensorHealthState = (sensor) => {
  if (sensor.severity === 'offline' || sensor.status === 'Inactive' || sensor.signal === 'Offline') {
    return 'offline';
  }

  if (sensor.maintenanceState === 'offline' || sensor.maintenanceState === 'warning') {
    return 'warning';
  }

  if (sensor.battery <= 10 || sensor.status === 'Needs Maintenance') {
    return 'warning';
  }

  return 'healthy';
};

const getBatteryLevel = (sensor) => {
  if (getSensorHealthState(sensor) === 'offline') {
    return 0;
  }

  return Math.max(0, Math.min(100, sensor.battery || 0));
};

const getHealthIcon = (healthState) => ({
  healthy: 'M7.8 12.2l2.7 2.7 5.7-6',
  warning: 'M8.2 7.2h7.6v9.6H8.2V7.2ZM10 5.4h4M12 10v2.7M12 15v.1',
  offline: 'M8 12h8',
}[healthState] || 'M7.8 12.2l2.7 2.7 5.7-6');

const getBatteryIconPath = (batteryLevel) => {
  if (batteryLevel === 0) {
    return 'M6.5 9h10v6h-10V9ZM17.5 11h1.2v2h-1.2M8.2 12h6.6';
  }

  if (batteryLevel <= 15) {
    return 'M6.5 9h10v6h-10V9ZM17.5 11h1.2v2h-1.2M8.2 12.2h2.1';
  }

  if (batteryLevel <= 50) {
    return 'M6.5 9h10v6h-10V9ZM17.5 11h1.2v2h-1.2M8.2 12.2h5.2';
  }

  return 'M6.5 9h10v6h-10V9ZM17.5 11h1.2v2h-1.2M8.2 12.2h7';
};

const getBatteryLevelClass = (batteryLevel) => {
  if (batteryLevel === 0) {
    return 'empty';
  }

  if (batteryLevel <= 15) {
    return 'low';
  }

  if (batteryLevel <= 25) {
    return 'mid';
  }

  return 'full';
};

const createHealthLevelSvgMarkup = (healthState, batteryLevel, selected = false) => {
  const fillHeight = batteryLevel === 0 ? 18 : Math.max(2, (batteryLevel / 100) * 18);
  const fillY = 21 - fillHeight;
  const markerClass = `leaflet-health-marker--${healthState}`;
  const strokeWidth = selected ? 2.35 : 1.45;

  return `
    <svg class="${markerClass} leaflet-health-marker--level" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle class="leaflet-health-marker__level-base" cx="12" cy="12" r="9"></circle>
      <rect class="leaflet-health-marker__level-fill" x="3" y="${fillY}" width="18" height="${fillHeight}" clip-path="circle(9px at 12px 12px)"></rect>
      <line class="leaflet-health-marker__level-line" x1="4.6" y1="${fillY}" x2="19.4" y2="${fillY}"></line>
      <circle class="leaflet-health-marker__shape" cx="12" cy="12" r="9" fill="none" stroke="#fff" stroke-width="${strokeWidth}"></circle>
      ${healthState === 'offline'
        ? `<path class="leaflet-health-marker__icon" d="${getHealthIcon('offline')}" fill="none" stroke="#fff" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"></path>`
        : ''}
    </svg>
  `;
};

const createHealthBatterySvgMarkup = (healthState, batteryLevel, selected = false, bare = false) => {
  const markerClass = `leaflet-health-marker--${healthState}`;
  const strokeWidth = selected ? 2.35 : 1.45;
  const batteryLevelClass = getBatteryLevelClass(batteryLevel);
  const batteryFillWidth = Math.max(0.8, (batteryLevel / 100) * 12.2);

  if (bare) {
    if (healthState === 'offline') {
      return getRiskMarkerSvgMarkup('offline', selected);
    }

    return `
      <svg class="${markerClass} leaflet-health-marker--battery-bare leaflet-health-marker--battery-${batteryLevelClass}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <rect class="leaflet-health-marker__battery-base" x="5.15" y="8.25" width="12.2" height="7.5" rx="0.95"></rect>
        <rect class="leaflet-health-marker__battery-fill" x="5.15" y="8.25" width="${batteryFillWidth}" height="7.5" rx="0.95"></rect>
        <path class="leaflet-health-marker__battery-shell" d="M3.35 6.45h16.1v11.1H3.35V6.45Z"></path>
        <path class="leaflet-health-marker__battery-cap" d="M20.45 9.05h1.55v4.9h-1.55"></path>
      </svg>
    `;
  }

  return `
    <svg class="${markerClass} leaflet-health-marker--battery leaflet-health-marker--battery-${batteryLevelClass}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle class="leaflet-health-marker__shape" cx="12" cy="12" r="9" stroke="#fff" stroke-width="${strokeWidth}"></circle>
      <path class="leaflet-health-marker__icon" d="${getBatteryIconPath(batteryLevel)}" fill="none" stroke="#fff" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round"></path>
    </svg>
  `;
};

const createHealthMarkerSvgMarkup = (sensor, selected = false, variant = 'number') => {
  const healthState = getSensorHealthState(sensor);
  const batteryLevel = getBatteryLevel(sensor);
  if (variant === 'level') {
    return createHealthLevelSvgMarkup(healthState, batteryLevel, selected);
  }

  if (variant === 'battery') {
    return createHealthBatterySvgMarkup(healthState, batteryLevel, selected);
  }

  if (variant === 'batteryBare') {
    return createHealthBatterySvgMarkup(healthState, batteryLevel, selected, true);
  }

  const healthClass = `leaflet-health-marker--${healthState}`;
  const strokeWidth = selected ? 2.3 : 1.45;
  const batteryLabel = healthState === 'warning' && batteryLevel > 0 ? `${batteryLevel}` : '';

  return `
    <svg class="${healthClass}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path class="leaflet-health-marker__shape" d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" stroke="#fff" stroke-width="${strokeWidth}" stroke-linejoin="round"></path>
      ${batteryLabel
        ? `<text class="leaflet-health-marker__text" x="12" y="15" text-anchor="middle">${batteryLabel}</text>`
        : `<path class="leaflet-health-marker__icon" d="${getHealthIcon(healthState)}" fill="none" stroke="#fff" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"></path>`}
    </svg>
  `;
};

const MAINTENANCE_MARKER_STYLES = {
  offline: {
    severity: 'offline',
    fill: '#08081A',
    iconStroke: '#FFFFFF',
  },
  warning: {
    severity: 'medium',
    fill: '#666666',
    iconStroke: '#FFFFFF',
  },
  healthy: {
    severity: 'low',
    fill: 'rgba(255, 255, 255, 0.92)',
    iconStroke: '#08081A',
  },
};

const getMaintenanceMarkerState = (sensor) => {
  if (sensor.severity === 'offline' || sensor.status === 'Inactive' || sensor.signal === 'Offline') {
    return 'offline';
  }

  return sensor.maintenanceState || 'healthy';
};

const createMaintenanceMarkerSvgMarkup = (sensor, selected = false) => {
  const markerState = getMaintenanceMarkerState(sensor);
  const markerStyle = MAINTENANCE_MARKER_STYLES[markerState] || MAINTENANCE_MARKER_STYLES.healthy;
  const marker = markerConfig[markerStyle.severity] || markerConfig.low;
  const strokeWidth = selected ? 2.7 : 1.6;

  return `
    <svg class="leaflet-maintenance-marker leaflet-maintenance-marker--${markerState}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="${marker.shape}" fill="${markerStyle.fill}" stroke="#fff" stroke-width="${strokeWidth}" stroke-linejoin="round"></path>
      <path d="${marker.icon}" fill="none" stroke="${markerStyle.iconStroke}" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"></path>
    </svg>
  `;
};

const createSensorIcon = (sensor, selected = false, sensorDisplayMode = 'pest') => {
  const healthState = getSensorHealthState(sensor);
  const badgeVariantByMode = {
    combined: 'number',
    combinedLevel: 'level',
    combinedBattery: 'battery',
  };
  const healthBadgeVariant = badgeVariantByMode[sensorDisplayMode];
  const showHealthBadge = Boolean(healthBadgeVariant) && healthState !== 'healthy';
  const isDedicatedHealthMode = sensorDisplayMode === 'health'
    || sensorDisplayMode === 'healthLevel'
    || sensorDisplayMode === 'healthBattery'
    || sensorDisplayMode === 'healthBatteryBare'
    || sensorDisplayMode === 'maintenance';
  const healthVariantByMode = {
    health: 'number',
    healthLevel: 'level',
    healthBattery: 'battery',
    healthBatteryBare: 'batteryBare',
  };
  const healthVariant = healthVariantByMode[sensorDisplayMode];
  const html = sensorDisplayMode === 'maintenance'
    ? `<span class="leaflet-risk-marker ${selected ? 'leaflet-risk-marker--selected' : ''}">${createMaintenanceMarkerSvgMarkup(sensor, selected)}</span>`
    : healthVariant
    ? `<span class="leaflet-risk-marker ${selected ? 'leaflet-risk-marker--selected' : ''}">${createHealthMarkerSvgMarkup(sensor, selected, healthVariant)}</span>`
    : `<span class="leaflet-risk-marker ${selected ? 'leaflet-risk-marker--selected' : ''}">
        ${getRiskMarkerSvgMarkup(sensor.severity, selected)}
        ${showHealthBadge ? `<span class="leaflet-health-badge leaflet-health-badge--${healthState}">${createHealthMarkerSvgMarkup(sensor, false, healthBadgeVariant)}</span>` : ''}
      </span>`;

  return L.divIcon({
    className: 'custom-marker',
    html,
    iconSize: isDedicatedHealthMode ? [30, 30] : [24, 24],
    iconAnchor: isDedicatedHealthMode ? [15, 15] : [12, 12],
  });
};

const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const getSensorConnectivityLabel = (sensor) => {
  if (sensor.signal === 'Offline') {
    return 'Offline';
  }

  if (sensor.signal === 'Poor' || sensor.signal === 'Intermittent') {
    return 'Intermittent';
  }

  return sensor.signal || 'Unknown';
};

const getSensorDeviceHealthLabel = (sensor) => {
  if (sensor.faultStatus) {
    return sensor.faultStatus.includes('No') ? 'Healthy' : 'Fault';
  }

  if (sensor.status === 'Inactive' || sensor.signal === 'Offline') {
    return 'Fault';
  }

  return 'Healthy';
};

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
  sensorDisplayMode = 'pest',
  onBlockSelect,
  onSensorSelect,
  className = '',
}) => {
  const [hoveredBlockId, setHoveredBlockId] = React.useState('');

  const getBlockPathOptions = (severity, state = 'default', visualStyle = 'risk') => {
    if (visualStyle === 'boundary') {
      const boundaryBase = {
        fillColor: '#FFFFFF',
        lineCap: 'round',
        lineJoin: 'round',
      };

      if (state === 'selected') {
        return {
          ...boundaryBase,
          color: '#FFFFFF',
          fillOpacity: 0.08,
          opacity: 1,
          weight: 4,
          dashArray: null,
        };
      }

      if (state === 'hover') {
        return {
          ...boundaryBase,
          color: '#FFFFFF',
          fillOpacity: 0.1,
          opacity: 0.96,
          weight: 3,
          dashArray: '8 5',
        };
      }

      return {
        ...boundaryBase,
        color: 'rgba(255, 255, 255, 0.98)',
        fillOpacity: 0.035,
        opacity: 0.98,
        weight: 2.4,
        dashArray: null,
      };
    }

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
            pathOptions={getBlockPathOptions(block.severity, block.visualState, block.visualStyle)}
            eventHandlers={{
              mouseover: () => setHoveredBlockId(block.id),
              mouseout: () => setHoveredBlockId(''),
              click: () => onBlockSelect?.(block),
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
            icon={createSensorIcon(sensor, sensor.id === selectedSensorId, sensorDisplayMode)}
            title={sensorDisplayMode !== 'pest' && sensorDisplayMode !== 'combined'
              ? `${sensor.name}: battery ${sensor.battery}%, connectivity ${getSensorConnectivityLabel(sensor)}, device health ${getSensorDeviceHealthLabel(sensor)}, lure ${sensor.lureStatus || 'not recorded'}, last sync ${sensor.lastSync}`
              : `${sensor.name}: ${sensor.count} detections, ${sensor.severity === 'offline' ? 'offline' : `${sensor.severity} risk`}`}
            alt={`${sensor.name} map marker`}
            zIndexOffset={sensor.id === selectedSensorId ? 800 : 0}
            eventHandlers={{
              click: () => onSensorSelect?.(sensor),
            }}
          >
            <Tooltip className={styles.sensorTooltip} direction="top" offset={[0, -14]} opacity={1}>
              <strong>{sensor.name}</strong><br />
              {sensorDisplayMode !== 'pest' && sensorDisplayMode !== 'combined' ? (
                <>
                  Battery: {sensor.battery}%<br />
                  Connectivity: {getSensorConnectivityLabel(sensor)}<br />
                  Device health: {getSensorDeviceHealthLabel(sensor)}<br />
                  Lure: {sensor.lureStatus || 'Not recorded'}<br />
                  Last sync: {sensor.lastSync}
                </>
              ) : (
                <>
                  Detections: {sensor.count}<br />
                  Status: {sensor.severity === 'offline' ? 'offline' : `${sensor.severity} risk`}
                </>
              )}
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
    visualStyle: PropTypes.oneOf(['risk', 'boundary']),
  })),
  activeBlockLabel: PropTypes.string,
  sensors: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
    name: PropTypes.string,
    count: PropTypes.number,
    severity: PropTypes.oneOf(['high', 'medium', 'low', 'offline']).isRequired,
    maintenanceState: PropTypes.oneOf(['offline', 'warning', 'healthy']),
    maintenanceReason: PropTypes.string,
  })),
  selectedSensorId: PropTypes.string,
  blockSeverity: PropTypes.oneOf(['high', 'medium', 'low']),
  mapStyle: PropTypes.oneOf(['satellite', 'stylized']),
  sensorDisplayMode: PropTypes.oneOf(['pest', 'combined', 'combinedLevel', 'combinedBattery', 'health', 'healthLevel', 'healthBattery', 'healthBatteryBare']),
  onBlockSelect: PropTypes.func,
  onSensorSelect: PropTypes.func,
  className: PropTypes.string,
};
