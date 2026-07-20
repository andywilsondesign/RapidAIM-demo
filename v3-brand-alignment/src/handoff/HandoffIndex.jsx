import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Badge } from '../components/atoms/Badge/Badge';
import { Button } from '../components/atoms/Button/Button';
import { Select } from '../components/atoms/Select/Select';
import { Typography } from '../components/atoms/Typography/Typography';
import { FormField } from '../components/molecules/FormField/FormField';
import { RankingListItem } from '../components/molecules/RankingListItem/RankingListItem';
import { StatCard } from '../components/molecules/StatCard/StatCard';
import { DetectionGrid } from '../components/molecules/DetectionGrid/DetectionGrid';
import { SensorMetaGrid } from '../components/molecules/SensorMetaGrid/SensorMetaGrid';
import { InfoDisclosure } from '../components/molecules/InfoDisclosure/InfoDisclosure';
import { ScopeNavigation as ScopeNavigationControl } from '../components/molecules/ScopeNavigation/ScopeNavigation';
import { TaskListItem } from '../components/molecules/TaskListItem/TaskListItem';
import { TopNavigationBar } from '../components/organisms/TopNavigationBar/TopNavigationBar';
import { ControlCenter } from '../components/organisms/ControlCenter/ControlCenter';
import { DetailPanel } from '../components/organisms/DetailPanel/DetailPanel';
import { InteractiveMap } from '../components/organisms/InteractiveMap/InteractiveMap';
import { MobileBottomSheet } from '../components/organisms/MobileBottomSheet/MobileBottomSheet';
import { TrendChart } from '../components/organisms/TrendChart/TrendChart';
import { WeatherWidget } from '../components/organisms/WeatherWidget/WeatherWidget';
import { TaskDropdown } from '../components/organisms/TaskDropdown/TaskDropdown';
import { ScoutingAssignmentModal } from '../components/organisms/ScoutingAssignmentModal/ScoutingAssignmentModal';
import { ReportModal } from '../components/organisms/ReportModal/ReportModal';
import { AccountSettings } from '../components/pages/AccountSettings/AccountSettings';
import {
  blocks,
  chartSeries,
  detectionGrid,
  ranches,
  report,
  sensorDetectionGrid,
  sensors,
  tasks,
  weather,
} from '../fixtures/rapidAimFixtures';
import styles from './HandoffIndex.module.css';

const selectedBlock = blocks[0];
const selectedRanch = { ...ranches[0], blocks: 12, pestName: 'Female Navel Orangeworm' };
const selectedSensor = { ...sensors[0], pestName: selectedBlock.pestName };
const healthIssueSensor = {
  ...selectedSensor,
  pestName: selectedBlock.pestName,
  battery: 9,
  signal: 'Good',
  status: 'Online',
  lastSync: '18 min ago',
};
const healthExperimentSensors = sensors.map((sensor) => {
  if (sensor.id === healthIssueSensor.id) {
    return { ...sensor, battery: 9, status: 'Online', signal: 'Good', lastSync: '18 min ago' };
  }

  if (sensor.id === 'sensor-sierra-4-c') {
    return { ...sensor, battery: 25, status: 'Online', signal: 'Good', severity: 'low', lastSync: '8 min ago' };
  }

  if (sensor.id === 'sensor-sierra-4-d') {
    return { ...sensor, battery: 68, status: 'Online', signal: 'Excellent', severity: 'low', lastSync: '6 min ago' };
  }

  if (sensor.id === 'sensor-sierra-4-e') {
    return { ...sensor, battery: 7, status: 'Online', signal: 'Good', severity: 'medium', lastSync: '24 min ago' };
  }

  return sensor;
});
const selectedOrganization = {
  name: 'RapidAIM Growers Co.',
  riskLevel: 'high',
  pestName: 'Female Navel Orangeworm',
  ranches: ranches.filter((ranch) => ranch.organization === 'RapidAIM Growers Co.').length,
  blocks: 21,
  currentCount: 182,
  activeSensors: 69,
  totalSensors: 76,
  trend: 18,
};

const pestPressureCards = [
  { label: 'Female Navel Orangeworm', valueKey: 'female-now', value: 124, trend: 18, benchmark: 'Farm average: 45', tone: 'high' },
  { label: 'Male Navel Orangeworm', valueKey: 'male-now', value: 72, trend: 9, benchmark: 'Farm average: 32', tone: 'high' },
  { label: 'Codling Moth', valueKey: 'codling-moth', value: 31, trend: -6, benchmark: 'Farm average: 28', tone: 'low' },
  { label: 'Mites', valueKey: 'mites', value: 48, trend: 12, benchmark: 'Farm average: 35', tone: 'medium' },
];

const pestChartSeries = [
  {
    label: 'Female Navel Orangeworm',
    valueKey: 'female-now',
    color: '#C1121F',
    dayTrend: [12, 18, 21, 24, 29, 35, 44, 52, 65, 72, 84, 96, 112, 124],
    rolling3Day: [17, 19, 21, 25, 29, 36, 44, 54, 63, 74, 84, 97, 111, 124],
    rolling7Day: [14, 16, 18, 21, 25, 30, 36, 43, 52, 62, 72, 83, 94, 106],
    hourlyDistribution: [14, 18, 21, 12, 5, 4, 6, 8, 12, 19, 28, 31],
  },
  {
    label: 'Male Navel Orangeworm',
    valueKey: 'male-now',
    color: '#0F7A4F',
    dayTrend: [8, 10, 13, 18, 21, 24, 31, 34, 40, 48, 56, 62, 66, 72],
    rolling3Day: [9, 11, 14, 17, 21, 25, 30, 35, 41, 48, 55, 61, 67, 72],
    rolling7Day: [7, 9, 11, 14, 17, 21, 25, 29, 34, 40, 47, 54, 60, 66],
    hourlyDistribution: [8, 11, 16, 14, 7, 5, 4, 6, 10, 15, 21, 24],
  },
  {
    label: 'Codling Moth',
    valueKey: 'codling-moth',
    color: '#F59E0B',
    dayTrend: [36, 34, 33, 31, 30, 28, 27, 29, 28, 30, 29, 31, 30, 31],
    rolling3Day: [35, 34, 33, 32, 30, 28, 27, 28, 28, 29, 29, 30, 30, 31],
    rolling7Day: [38, 37, 36, 35, 34, 32, 31, 30, 29, 29, 29, 30, 30, 30],
    hourlyDistribution: [5, 7, 10, 12, 9, 6, 5, 4, 7, 11, 16, 18],
  },
  {
    label: 'Mites',
    valueKey: 'mites',
    color: '#7C3AED',
    dayTrend: [18, 20, 22, 24, 23, 25, 28, 31, 34, 38, 41, 43, 46, 48],
    rolling3Day: [19, 20, 22, 23, 24, 25, 28, 31, 34, 38, 41, 43, 46, 48],
    rolling7Day: [16, 17, 18, 20, 21, 23, 25, 27, 30, 33, 36, 39, 42, 45],
    hourlyDistribution: [4, 6, 9, 13, 17, 20, 22, 18, 14, 10, 7, 5],
  },
];

const getVisiblePestSeries = (pestFocus = 'all', metric) => (
  pestChartSeries
    .filter((pest) => pestFocus === 'all' || pest.valueKey === pestFocus)
    .map((pest) => ({
      label: pest.label,
      data: pest[metric],
      color: pest.color,
    }))
);

const scopeOrganizations = [
  { label: 'RapidAIM Growers Co.', riskLevel: 'high' },
  { label: 'Apex Agriculture', riskLevel: 'low' },
];

const scopeRanches = [
  { label: 'Sierra Orchards', riskLevel: 'high' },
  { label: 'Sunshine Valley Ranch', riskLevel: 'medium' },
];

const scopeBlocks = [
  { label: 'Block 1 West', riskLevel: 'low' },
  { label: 'Block 2', riskLevel: 'medium' },
  { label: 'Block 3', riskLevel: 'medium' },
  { label: 'Block 4', riskLevel: 'high' },
  { label: 'Block 5', riskLevel: 'medium' },
];

const selectedRanchBlocks = [
  selectedBlock,
  { ...blocks[1], id: 'block-sierra-2', ranchId: selectedRanch.id, ranchName: selectedRanch.name },
  { ...blocks[2], id: 'block-sierra-1-west', ranchId: selectedRanch.id, ranchName: selectedRanch.name, name: 'Block 1 West' },
  { ...blocks[1], id: 'block-sierra-3', name: 'Block 3', ranchId: selectedRanch.id, ranchName: selectedRanch.name, currentCount: 47, activeSensors: 8, totalSensors: 9 },
  { ...blocks[2], id: 'block-sierra-5', name: 'Block 5', ranchId: selectedRanch.id, ranchName: selectedRanch.name, currentCount: 34, activeSensors: 10, totalSensors: 10, riskLevel: 'medium' },
  { ...blocks[2], id: 'block-sierra-6', name: 'Block 6', ranchId: selectedRanch.id, ranchName: selectedRanch.name, currentCount: 29, activeSensors: 7, totalSensors: 8, riskLevel: 'medium' },
  { ...blocks[2], id: 'block-sierra-7', name: 'Block 7', ranchId: selectedRanch.id, ranchName: selectedRanch.name, currentCount: 21, activeSensors: 6, totalSensors: 6 },
  { ...blocks[2], id: 'block-sierra-8', name: 'Block 8', ranchId: selectedRanch.id, ranchName: selectedRanch.name, currentCount: 18, activeSensors: 5, totalSensors: 5 },
  { ...blocks[2], id: 'block-sierra-9', name: 'Block 9', ranchId: selectedRanch.id, ranchName: selectedRanch.name, currentCount: 14, activeSensors: 6, totalSensors: 7 },
  { ...blocks[2], id: 'block-sierra-10', name: 'Block 10', ranchId: selectedRanch.id, ranchName: selectedRanch.name, currentCount: 12, activeSensors: 4, totalSensors: 5 },
  { ...blocks[2], id: 'block-sierra-11', name: 'Block 11', ranchId: selectedRanch.id, ranchName: selectedRanch.name, currentCount: 9, activeSensors: 4, totalSensors: 4 },
  { ...blocks[2], id: 'block-sierra-12', name: 'Block 12', ranchId: selectedRanch.id, ranchName: selectedRanch.name, currentCount: 7, activeSensors: 3, totalSensors: 4 },
].sort((a, b) => b.currentCount - a.currentCount);

const ranchDetectionRows = detectionGrid.map((row) => ({
  ...row,
  status: row.block === selectedBlock.name
    ? 'high'
    : row.days.some((count) => count >= 25)
      ? 'medium'
      : 'low',
}));

const rankingBlocks = [
  { ...selectedBlock, pestName: 'Female Navel Orangeworm', taskStatus: 'Pending scouting', threshold: 25 },
  { ...selectedRanchBlocks[1], pestName: 'Female Navel Orangeworm', taskStatus: 'Unassigned', threshold: 25, currentCount: 96, riskLevel: 'high' },
  { ...selectedRanchBlocks[3], pestName: 'Male Navel Orangeworm', taskStatus: 'In progress', threshold: 32, currentCount: 68, riskLevel: 'high' },
  { ...selectedRanchBlocks[4], pestName: 'Mites', taskStatus: 'Unassigned', threshold: 40, currentCount: 48, riskLevel: 'medium' },
  { ...selectedRanchBlocks[5], pestName: 'Codling Moth', taskStatus: 'Unassigned', threshold: 18, currentCount: 37, riskLevel: 'medium' },
  { ...selectedRanchBlocks[6], pestName: 'Female Navel Orangeworm', taskStatus: 'Scheduled', threshold: 25, currentCount: 31, riskLevel: 'medium' },
  { ...selectedRanchBlocks[7], pestName: 'Male Navel Orangeworm', taskStatus: 'Unassigned', threshold: 32, currentCount: 22, riskLevel: 'low' },
  { ...selectedRanchBlocks[8], pestName: 'Codling Moth', taskStatus: 'Unassigned', threshold: 18, currentCount: 17, riskLevel: 'low' },
].sort((a, b) => {
  const riskRank = { high: 3, medium: 2, low: 1 };
  return riskRank[b.riskLevel] - riskRank[a.riskLevel] || b.currentCount - a.currentCount;
});

const offsetPolygon = (polygon, latOffset, lngOffset) => (
  polygon.map(([lat, lng]) => [lat + latOffset, lng + lngOffset])
);

const scalePolygon = (polygon, scale) => {
  const centerLat = polygon.reduce((sum, [lat]) => sum + lat, 0) / polygon.length;
  const centerLng = polygon.reduce((sum, [, lng]) => sum + lng, 0) / polygon.length;

  return polygon.map(([lat, lng]) => [
    centerLat + ((lat - centerLat) * scale),
    centerLng + ((lng - centerLng) * scale),
  ]);
};

const rankingBlockBasePolygon = scalePolygon(selectedBlock.polygon, 0.32);

const buildBlockMapPolygons = (blockList) => blockList.reduce((acc, block, index) => {
  const row = Math.floor(index / 2);
  const column = index % 2;
  acc[block.id] = offsetPolygon(rankingBlockBasePolygon, row * -0.0029, column * 0.0048);
  return acc;
}, {});

const buildBlockOverlays = (blockList, selectedBlockId, previewBlockId) => {
  const blockMapPolygons = buildBlockMapPolygons(blockList);

  return blockList.map((block) => {
    let state = 'default';

    if (block.id === selectedBlockId) {
      state = 'selected';
    }

    if (block.id === previewBlockId && block.id !== selectedBlockId) {
      state = 'hover';
    }

    return {
      id: block.id,
      label: block.name,
      positions: blockMapPolygons[block.id],
      severity: block.riskLevel,
      state,
    };
  });
};

const buildRankingBlockOverlays = (selectedBlockId, previewBlockId) => (
  buildBlockOverlays(rankingBlocks.slice(0, 8), selectedBlockId, previewBlockId)
);

const buildRanchBlockOverlays = (selectedBlockId, previewBlockId) => (
  buildBlockOverlays(selectedRanchBlocks.slice(0, 10), selectedBlockId, previewBlockId)
);

const rankedRanches = ranches
  .filter((ranch) => ranch.organization === selectedOrganization.name)
  .sort((a, b) => b.currentCount - a.currentCount);

const rankedSensors = [
  ...sensors,
  { ...sensors[0], id: 'sensor-sierra-4-f', name: 'Sensor S4-F', pestName: 'Female Navel Orangeworm', count: 41, battery: 74, severity: 'high', status: 'Online', lastSync: '14 min ago' },
  { ...sensors[0], id: 'sensor-sierra-4-g', name: 'Sensor S4-G', pestName: 'Male Navel Orangeworm', count: 33, battery: 71, severity: 'high', status: 'Online', lastSync: '16 min ago' },
  { ...sensors[1], id: 'sensor-sierra-4-h', name: 'Sensor S4-H', pestName: 'Mites', count: 24, battery: 68, severity: 'medium', status: 'Online', lastSync: '22 min ago' },
  { ...sensors[1], id: 'sensor-sierra-4-i', name: 'Sensor S4-I', pestName: 'Codling Moth', count: 19, battery: 59, severity: 'medium', status: 'Online', lastSync: '28 min ago' },
  { ...sensors[2], id: 'sensor-sierra-4-j', name: 'Sensor S4-J', pestName: 'Female Navel Orangeworm', count: 11, battery: 46, severity: 'low', status: 'Online', lastSync: '41 min ago' },
  { ...sensors[2], id: 'sensor-sierra-4-k', name: 'Sensor S4-K', pestName: 'Male Navel Orangeworm', count: 6, battery: 37, severity: 'low', status: 'Online', lastSync: '55 min ago' },
  { ...sensors[2], id: 'sensor-sierra-4-l', name: 'Sensor S4-L', pestName: 'Codling Moth', count: 5, battery: 34, severity: 'low', status: 'Online', lastSync: '1 hour ago' },
  { ...sensors[2], id: 'sensor-sierra-4-m', name: 'Sensor S4-M', pestName: 'Mites', count: 3, battery: 22, severity: 'low', status: 'Online', lastSync: '1 hour ago' },
  { ...sensors[2], id: 'sensor-sierra-4-n', name: 'Sensor S4-N', pestName: 'Codling Moth', count: 2, battery: 19, severity: 'low', status: 'Online', lastSync: '2 hours ago' },
].sort((a, b) => {
  const severityRank = { high: 4, medium: 3, offline: 2, low: 1 };
  return severityRank[b.severity] - severityRank[a.severity] || b.count - a.count;
});

const taskStreams = [
  {
    title: 'Scouting Assignments',
    summary: '5 active assignments',
    stats: [
      { label: 'Requested', value: 2 },
      { label: 'In Progress', value: 2 },
      { label: 'Completed', value: 1 },
    ],
    items: [
      { title: 'Northeast block inspection', subtitle: 'Sierra Orchards / Block 4', riskLevel: 'high' },
      { title: 'Trap density confirmation', subtitle: 'Sunshine Valley / Block 2', riskLevel: 'medium' },
    ],
  },
  {
    title: 'Spraying Work Orders',
    summary: '6 work orders tracked',
    stats: [
      { label: 'Requested', value: 1 },
      { label: 'Scheduled', value: 2 },
      { label: 'Approved', value: 3 },
    ],
    items: [
      { title: 'Edge-row treatment review', subtitle: 'Requested approval', riskLevel: 'medium' },
      { title: 'Night application window', subtitle: 'Scheduled for review', riskLevel: 'low' },
    ],
  },
];

const pageGroups = [
  {
    title: 'Desktop',
    pages: [
      { id: 'consolidated-pest-pressure-ranking', label: 'Pest Pressure Ranking', component: <PestPressureRankingPage /> },
      { id: 'consolidated-organization', label: 'Organization Detail', component: <DesktopDetailPage type="organization" scopeExperiment /> },
      { id: 'consolidated-ranch', label: 'Ranch Detail', component: <DesktopDetailPage type="ranch" scopeExperiment /> },
      { id: 'consolidated-block', label: 'Block Detail', component: <DesktopDetailPage type="block" scopeExperiment /> },
      { id: 'consolidated-sensor', label: 'Sensor Detail', component: <DesktopDetailPage type="sensor" scopeExperiment /> },
      { id: 'consolidated-sensor-health', label: 'Sensor Detail (Health)', component: <DesktopDetailPage type="sensor-health" scopeExperiment /> },
    ],
  },
  {
    title: 'Overlays',
    pages: [
      { id: 'tasks', label: 'Tasks Dropdown', component: <TasksPage /> },
      { id: 'scouting', label: 'Scouting Modal', component: <ScoutingPage /> },
      { id: 'report', label: 'AI Report Modal', component: <ReportPage /> },
    ],
  },
  {
    title: 'Mobile',
    pages: [
      { id: 'mobile-pest-pressure-ranking', label: 'Pest Pressure Ranking', component: <MobileMapPage type="ranking" /> },
      { id: 'mobile-organization', label: 'Organization Detail', component: <MobileMapPage type="organization" /> },
      { id: 'mobile-ranch', label: 'Ranch Detail', component: <MobileMapPage type="ranch" /> },
      { id: 'mobile-block', label: 'Block Detail', component: <MobileMapPage type="block" /> },
      { id: 'mobile-sensor', label: 'Sensor Detail', component: <MobileMapPage type="sensor" /> },
      { id: 'mobile-sensor-health', label: 'Sensor Detail (Health)', component: <MobileMapPage type="sensor-health" /> },
      { id: 'mobile-overlays', label: 'Mobile Overlays', component: <MobileOverlaysPage /> },
    ],
  },
  {
    title: 'Enterprise',
    pages: [
      { id: 'account', label: 'Account Settings', component: <AccountPage /> },
    ],
  },
];

const flatPages = pageGroups.flatMap((group) => group.pages);

const desktopToMobileType = {
  'consolidated-pest-pressure-ranking': 'ranking',
  'consolidated-organization': 'organization',
  'consolidated-ranch': 'ranch',
  'consolidated-block': 'block',
  'consolidated-sensor': 'sensor',
  'consolidated-sensor-health': 'sensor-health',
};

function useResponsiveMobileView() {
  const [isMobile, setIsMobile] = useState(() => (
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 900px)').matches : false
  ));

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 900px)');
    const handleChange = (event) => setIsMobile(event.matches);
    setIsMobile(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return isMobile;
}

export const HandoffIndex = ({ initialPageId = flatPages[0].id, showNavigator = true }) => {
  const [activePageId, setActivePageId] = useState(initialPageId);
  const [isNavigatorOpen, setIsNavigatorOpen] = useState(true);
  const isResponsiveMobile = useResponsiveMobileView();
  const activePage = useMemo(
    () => flatPages.find((page) => page.id === activePageId) || flatPages[0],
    [activePageId]
  );
  const responsiveMobileType = isResponsiveMobile ? desktopToMobileType[activePageId] : null;
  const shouldShowNavigator = showNavigator && !isResponsiveMobile;
  const renderedPage = responsiveMobileType
    ? <ResponsiveMobilePage type={responsiveMobileType} />
    : activePage.component;

  useEffect(() => {
    const handleNavigateHome = () => setActivePageId('consolidated-pest-pressure-ranking');
    document.addEventListener('rapidaim:navigate-home', handleNavigateHome);
    return () => document.removeEventListener('rapidaim:navigate-home', handleNavigateHome);
  }, []);

  return (
    <div className={`${styles.shell} ${!shouldShowNavigator || !isNavigatorOpen ? styles.shellCollapsed : ''}`}>
      {shouldShowNavigator && isNavigatorOpen ? (
      <aside className={styles.sidebar} aria-label="Handoff page navigator">
        <div className={styles.brand}>
          <span className="material-symbols-rounded">view_sidebar</span>
          <div>
            <Typography variant="h4">Handoff Navigator</Typography>
            <Typography variant="caption">Not part of the prototype UI</Typography>
          </div>
        </div>
        <button
          className={styles.collapseButton}
          onClick={() => setIsNavigatorOpen(false)}
          type="button"
        >
          <span className="material-symbols-rounded">left_panel_close</span>
          Hide navigator
        </button>
        <div className={styles.navGroups}>
          {pageGroups.map((group) => (
            <div className={styles.navGroup} key={group.title}>
              <Typography variant="h6">{group.title}</Typography>
              {group.pages.map((page) => (
                <button
                  className={`${styles.navItem} ${page.id === activePageId ? styles.activeNavItem : ''}`}
                  key={page.id}
                  onClick={() => setActivePageId(page.id)}
                  type="button"
                >
                  {page.label}
                </button>
              ))}
            </div>
          ))}
        </div>
      </aside>
      ) : shouldShowNavigator ? (
        <button
          className={styles.expandButton}
          onClick={() => setIsNavigatorOpen(true)}
          type="button"
          aria-label="Show handoff navigator"
        >
          <span className="material-symbols-rounded">view_sidebar</span>
          <span>Views</span>
        </button>
      ) : null}
      <main className={styles.stage}>
        <div className={styles.viewport}>{renderedPage}</div>
      </main>
    </div>
  );
};

HandoffIndex.propTypes = {
  initialPageId: PropTypes.string,
  showNavigator: PropTypes.bool,
};

function DesktopShell({
  children,
  detailPanel,
  parentContext,
  scopeExperiment = false,
  scopeLevel = 'block',
  contentHeightPanel = false,
  blockOverlays,
  activeBlockLabel = selectedBlock.name,
  mapSensors = sensors,
  selectedSensorIdOverride,
  sensorDisplayMode = 'pest',
  controlCenterProps = {},
  mapNotice,
}) {
  const [pestFocus, setPestFocus] = useState('all');
  const [previewBlockId, setPreviewBlockId] = useState('');
  const resolvedDetailPanel = scopeExperiment && React.isValidElement(detailPanel)
    ? React.cloneElement(detailPanel, { pestFocus, onBlockPreviewChange: setPreviewBlockId })
    : detailPanel;
  const selectedMapBlockId = scopeExperiment && scopeLevel === 'block' ? selectedBlock.id : '';
  const resolvedBlockOverlays = scopeExperiment
    ? blockOverlays || (scopeLevel === 'ranch'
      ? buildRanchBlockOverlays('', previewBlockId)
      : buildRankingBlockOverlays(selectedMapBlockId, previewBlockId))
    : blockOverlays;
  const selectedSensorId = selectedSensorIdOverride ?? (scopeExperiment && scopeLevel === 'sensor' ? selectedSensor.id : '');

  return (
    <div className={styles.desktopShell}>
      <TopNavigationBar />
      <div className={styles.desktopMain}>
        <ScopeNavigation level={scopeExperiment ? scopeLevel : 'block'} />
        <aside className={`${styles.leftRail} ${parentContext || scopeExperiment ? styles.leftRailWithContext : ''} ${contentHeightPanel ? styles.leftRailContentHeight : ''}`}>{resolvedDetailPanel}</aside>
        <section className={styles.mapStage}>
          <InteractiveMap
            center={[36.647, -119.8]}
            zoom={15}
            blockPolygon={selectedBlock.polygon}
            blockOverlays={resolvedBlockOverlays}
            activeBlockLabel={activeBlockLabel}
            sensors={mapSensors}
            selectedSensorId={selectedSensorId}
            sensorDisplayMode={sensorDisplayMode}
            blockSeverity={selectedBlock.riskLevel}
            mapStyle="satellite"
          />
          <WeatherWidget weather={weather} className={styles.weather} />
          {mapNotice}
        </section>
        <ControlCenter
          {...controlCenterProps}
          className={`${styles.rightRail} ${scopeExperiment ? styles.rightRailStack : ''} ${controlCenterProps.className || ''}`}
          mode={scopeExperiment ? 'scopeExperiment' : 'default'}
          pestFocus={pestFocus}
          onPestFocusChange={setPestFocus}
        />
      </div>
      {children}
    </div>
  );
}

DesktopShell.propTypes = {};

function PestPressureRankingPage() {
  const [selectedBlockId, setSelectedBlockId] = useState('');
  const [previewBlockId, setPreviewBlockId] = useState('');
  const activeBlockId = previewBlockId || selectedBlockId;
  const activeBlock = rankingBlocks.find((block) => block.id === activeBlockId) || rankingBlocks[0];

  return (
    <DesktopShell
      detailPanel={(
        <PestPressureRankingPanel
          activeBlockId={activeBlockId}
          onPreviewBlockChange={setPreviewBlockId}
          onSelectedBlockChange={setSelectedBlockId}
        />
      )}
      scopeExperiment
      scopeLevel="ranking"
      contentHeightPanel
      blockOverlays={buildRankingBlockOverlays(selectedBlockId, previewBlockId)}
      activeBlockLabel={activeBlock.name}
    />
  );
}

function DesktopDetailPage({ type, scopeExperiment = false }) {
  const panel = {
    organization: <OrganizationDetailPanel scopeExperiment={scopeExperiment} />,
    block: <BlockDetailPanel scopeExperiment={scopeExperiment} />,
    ranch: <RanchDetailPanel scopeExperiment={scopeExperiment} />,
    sensor: <SensorDetailPanel scopeExperiment={scopeExperiment} />,
    'sensor-health': <SensorDetailPanel scopeExperiment={scopeExperiment} healthMode />,
  }[type];
  const parentContext = {
    organization: null,
    block: { items: [{ label: selectedRanch.organization }, { label: selectedBlock.ranchName }] },
    ranch: { items: [{ label: selectedRanch.organization }] },
    sensor: { items: [{ label: selectedRanch.organization }, { label: selectedSensor.ranchName }, { label: selectedSensor.blockName }] },
    'sensor-health': { items: [{ label: selectedRanch.organization }, { label: healthIssueSensor.ranchName }, { label: healthIssueSensor.blockName }] },
  }[type];

  if (type === 'sensor-health') {
    return (
      <DesktopShell
        detailPanel={panel}
        parentContext={parentContext}
        scopeExperiment={scopeExperiment}
        scopeLevel="sensor"
        mapSensors={healthExperimentSensors}
        selectedSensorIdOverride={healthIssueSensor.id}
        sensorDisplayMode="healthBatteryBare"
        controlCenterProps={{
          showSensorHealthControls: true,
          sensorMarkerMode: 'health',
          defaultPestFocusOpen: false,
          defaultMapControlsOpen: true,
        }}
        mapNotice={(
          <div className={styles.sensorHealthToast}>
            <span className="material-symbols-rounded" aria-hidden="true">battery_alert</span>
            <Typography variant="caption">Sensor health view is on</Typography>
            <Button variant="ghost" size="sm">Show pest risk</Button>
          </div>
        )}
      />
    );
  }

  return <DesktopShell detailPanel={panel} parentContext={parentContext} scopeExperiment={scopeExperiment} scopeLevel={type} />;
}

function ScopeNavigation({ level = 'block' }) {
  const blockLabel = level === 'organization' || level === 'ranch' || level === 'ranking' ? 'All blocks' : selectedBlock.name;
  const ranchLabel = level === 'organization' || level === 'ranking' ? 'All ranches' : selectedRanch.name;
  const sensorLabel = level === 'sensor' ? selectedSensor.name : 'All sensors';
  const activeIndexByLevel = {
    organization: 0,
    ranch: 1,
    block: 2,
    sensor: 3,
  };
  const locationSegments = [
    { label: selectedOrganization.name, options: scopeOrganizations },
    { label: ranchLabel, options: [{ label: 'All ranches', riskLevel: 'low' }, ...scopeRanches] },
    { label: blockLabel, options: [{ label: 'All blocks', riskLevel: 'low' }, ...scopeBlocks] },
    {
      label: sensorLabel,
      options: [{ label: 'All sensors', riskLevel: 'low' }, ...rankedSensors.slice(0, 5).map((sensor) => ({
        label: sensor.name,
        riskLevel: sensor.severity,
      }))],
    },
  ];

  return (
    <ScopeNavigationControl
      className={styles.scopeNav}
      ariaLabel="Experimental pest and location scope navigation"
      showHome
      activeHome={level === 'ranking'}
      activeIndex={activeIndexByLevel[level] ?? -1}
      onHomeClick={() => document.dispatchEvent(new CustomEvent('rapidaim:navigate-home'))}
      segments={locationSegments}
    />
  );
}

function PestPressureRankingPanel({ activeBlockId, onPreviewBlockChange, onSelectedBlockChange }) {
  const [activeTaskTab, setActiveTaskTab] = useState('unassigned');
  const assignedCount = rankingBlocks.filter((block) => block.taskStatus !== 'Unassigned').length;
  const unassignedCount = rankingBlocks.length - assignedCount;
  const visibleBlocks = rankingBlocks.filter((block) => (
    activeTaskTab === 'assigned' ? block.taskStatus !== 'Unassigned' : block.taskStatus === 'Unassigned'
  ));

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <div className={styles.panelTitleGroup}>
          <div className={styles.panelTitleRow}>
            <div className={styles.panelTitleCluster}>
              <Typography variant="h3">Pest Pressure Ranking</Typography>
            </div>
            <InfoDisclosure
              title="Pest pressure ranking"
              description="Blocks are ranked by active pest pressure under the current pest and threshold lens."
            />
          </div>
          <div className={styles.rankingFilters}>
            <FormField label="Organisation">
              <Select options={[
                { label: 'Show all', value: 'all' },
                { label: 'RapidAIM Growers Co.', value: 'rapid' },
                { label: 'Apex Agriculture', value: 'apex' },
              ]} />
            </FormField>
            <FormField label="Ranch">
              <Select options={[
                { label: 'Show all', value: 'all' },
                { label: 'Sierra Orchards', value: 'sierra' },
                { label: 'Sunshine Valley Ranch', value: 'sunshine' },
              ]} />
            </FormField>
          </div>
        </div>
      </div>
      <div className={styles.anchorTabs} style={{ '--tab-count': 2 }}>
        <button
          className={activeTaskTab === 'unassigned' ? styles.activeAnchorTab : ''}
          type="button"
          onClick={() => {
            setActiveTaskTab('unassigned');
            onPreviewBlockChange('');
            onSelectedBlockChange('');
          }}
        >
          Unassigned ({unassignedCount})
        </button>
        <button
          className={activeTaskTab === 'assigned' ? styles.activeAnchorTab : ''}
          type="button"
          onClick={() => {
            setActiveTaskTab('assigned');
            onPreviewBlockChange('');
            onSelectedBlockChange('');
          }}
        >
          Assigned ({assignedCount})
        </button>
      </div>
      <div className={`${styles.panelBody} ${styles.rankingPanelBody}`}>
        <section className={styles.childList}>
          {visibleBlocks.map((block, index) => (
            <RankingListItem
              className={block.id === activeBlockId ? styles.activeRankingListItem : ''}
              key={block.id}
              rank={index + 1}
              title={block.name}
              subtitle={`${block.ranchName} • ${block.pestName} • ${block.currentCount} detections • ${block.activeSensors}/${block.totalSensors} sensors active`}
              riskLevel={block.riskLevel}
              statusLabel={activeTaskTab === 'assigned' ? `Task: ${block.taskStatus}` : undefined}
              onBlur={() => onPreviewBlockChange('')}
              onClick={() => onSelectedBlockChange(block.id)}
              onFocus={() => onPreviewBlockChange(block.id)}
              onMouseEnter={() => onPreviewBlockChange(block.id)}
              onMouseLeave={() => onPreviewBlockChange('')}
            />
          ))}
        </section>
      </div>
    </div>
  );
}

function PestPressureGrid({ pestFocus = 'all' }) {
  const visiblePests = pestPressureCards.filter((pest) => (
    pestFocus === 'all' || pest.valueKey === pestFocus
  ));

  return (
    <div className={styles.pestPressureGrid}>
      {visiblePests.map((pest) => (
        <StatCard
          key={pest.label}
          label={pest.label}
          value={pest.value}
          trend={pest.trend}
          benchmark={pest.benchmark}
          tone={pest.tone}
        />
      ))}
    </div>
  );
}

function PestWeekComparison({ children }) {
  return (
    <section className={styles.pestComparison}>
      <Typography variant="h5">Pest Overview (vs last week)</Typography>
      {children}
    </section>
  );
}

function OrganizationDetailPanel({ scopeExperiment = false, pestFocus = 'all' }) {
  return (
    <DetailPanel
      title={selectedOrganization.name}
      badge={selectedOrganization.riskLevel}
      backLabel="Pest Pressure Ranking"
      backAriaLabel="Back to pest pressure ranking"
      actions={<BottomActionTray mode="reportOnly" />}
      sections={[
        { label: `Ranches (${selectedOrganization.ranches})`, content: <RanchLinks /> },
        { label: 'Tasks (11)', content: <OrganizationTasks /> },
      ]}
    >
      <PestWeekComparison>
        {scopeExperiment ? <PestPressureGrid pestFocus={pestFocus} /> : <StatCard
          label={selectedOrganization.pestName}
          value={selectedOrganization.currentCount}
          trend={selectedOrganization.trend}
          benchmark="Farm average: 45"
        />}
      </PestWeekComparison>
      {scopeExperiment ? (
        <div className={styles.statsGridFull}>
          <StatCard label="Active Sensors" value={`${selectedOrganization.activeSensors}/${selectedOrganization.totalSensors}`} />
        </div>
      ) : (
        <div className={styles.statsGrid}>
          <StatCard label="Ranches" value={selectedOrganization.ranches} />
          <StatCard label="Active Sensors" value={`${selectedOrganization.activeSensors}/${selectedOrganization.totalSensors}`} tone="positive" />
        </div>
      )}
      <TrendChart title="30-Day Multi-Site Pest Pressure" type="line" labels={chartSeries.organizationLabels} data={chartSeries.organizationTrend} threshold={25} />
      <ChartStack compact scopeExperiment={scopeExperiment} pestFocus={pestFocus} />
    </DetailPanel>
  );
}

function BlockDetailPanel({ scopeExperiment = false, pestFocus = 'all' }) {
  return (
    <DetailPanel
      title={selectedBlock.name}
      badge={selectedBlock.riskLevel}
      backLabel={selectedBlock.ranchName}
      backAriaLabel={`Back to ${selectedBlock.ranchName}`}
      actions={<BottomActionTray mode="default" />}
      sections={[
        { label: `Sensors (${selectedBlock.activeSensors}/${selectedBlock.totalSensors})`, content: <SensorLinks /> },
      ]}
    >
      <PestWeekComparison>
        {scopeExperiment ? <PestPressureGrid pestFocus={pestFocus} /> : <StatCard
          label={selectedBlock.pestName}
          value={selectedBlock.currentCount}
          trend={selectedBlock.trend}
          benchmark={selectedBlock.benchmark}
        />}
      </PestWeekComparison>
      <DetectionGrid
        rows={sensorDetectionGrid}
        title="Last 7 Day Detections"
        firstColumnLabel="Name"
        showStatus
        timezone="America/Los_Angeles"
        description="Sensor data from the last seven days shown in America/Los_Angeles time."
      />
      <ChartStack scopeExperiment={scopeExperiment} pestFocus={pestFocus} />
    </DetailPanel>
  );
}

function RanchDetailPanel({ scopeExperiment = false, pestFocus = 'all', onBlockPreviewChange }) {
  return (
    <DetailPanel
      title={selectedRanch.name}
      badge={selectedRanch.riskLevel}
      backLabel={selectedRanch.organization}
      backAriaLabel={`Back to ${selectedRanch.organization}`}
      actions={<BottomActionTray mode="default" />}
      sections={[
        { label: `Blocks (${selectedRanch.blocks})`, content: <BlockLinks onBlockPreviewChange={onBlockPreviewChange} /> },
      ]}
    >
      <PestWeekComparison>
        {scopeExperiment ? <PestPressureGrid pestFocus={pestFocus} /> : <StatCard
          label={selectedRanch.pestName}
          value={selectedRanch.currentCount}
          trend={selectedRanch.trend}
          benchmark="Farm average: 45"
        />}
      </PestWeekComparison>
      <StatCard label="Active Sensors" value={`${selectedRanch.activeSensors}/${selectedRanch.totalSensors}`} />
      <DetectionGrid
        rows={ranchDetectionRows}
        showStatus
        timezone="America/Los_Angeles"
        description="Block-level detection data from the last seven days shown in America/Los_Angeles time."
      />
      <ChartStack compact scopeExperiment={scopeExperiment} pestFocus={pestFocus} />
    </DetailPanel>
  );
}

function SensorDetailPanel({ scopeExperiment = false, pestFocus = 'all', healthMode = false }) {
  const displaySensor = healthMode ? healthIssueSensor : selectedSensor;

  return (
    <DetailPanel
      title={displaySensor.name}
      badge={displaySensor.severity}
      backLabel={displaySensor.blockName}
      backAriaLabel={`Back to ${displaySensor.blockName}`}
      actions={<BottomActionTray mode="default" />}
      sections={[
        { label: 'Sensor Health', badge: healthMode ? '1' : undefined, content: <SensorMaintenance sensor={displaySensor} healthMode={healthMode} /> },
      ]}
    >
      {healthMode && <HealthIssueAlert sensor={displaySensor} />}
      <PestWeekComparison>
        {scopeExperiment ? <PestPressureGrid pestFocus={pestFocus} /> : <StatCard
          label={displaySensor.pestName}
          value={displaySensor.count}
          trend={18}
          benchmark="Farm average: 45"
        />}
      </PestWeekComparison>
      <ChartStack compact scopeExperiment={scopeExperiment} pestFocus={pestFocus} />
    </DetailPanel>
  );
}

function HealthIssueAlert({ sensor }) {
  return (
    <div className={styles.healthAlert}>
      <span className="material-symbols-rounded" aria-hidden="true">battery_alert</span>
      <div>
        <Typography variant="body-sm" weight="bold">Low battery detected</Typography>
        <Typography variant="caption">
          {sensor.name} is still reporting pest data, but the battery is at {sensor.battery}%. Check or replace the battery during the next field visit.
        </Typography>
        <a href="#sensor-health-section">View sensor health</a>
      </div>
    </div>
  );
}

function SensorMaintenance({ sensor = selectedSensor, healthMode = false }) {
  const batteryTone = sensor.battery <= 10 ? 'error' : sensor.battery <= 25 ? 'warning' : 'positive';

  return (
    <section className={styles.childList} id="sensor-health-section">
      <div className={styles.sectionHeader}>
        <Typography variant="h5">Sensor Health</Typography>
        <Typography variant="caption" color="secondary">
          {healthMode ? 'Battery and device status for field maintenance.' : 'Operational status for this sensor.'}
        </Typography>
      </div>
      <SensorMetaGrid items={[
        { label: 'Status', value: sensor.status, tone: sensor.status === 'Offline' ? 'error' : 'positive' },
        { label: 'Battery', value: `${sensor.battery}%`, tone: batteryTone },
        { label: 'Signal', value: sensor.signal, tone: 'positive' },
        { label: 'Last Sync', value: sensor.lastSync, tone: 'positive' },
      ]} />
    </section>
  );
}

HealthIssueAlert.propTypes = {
  sensor: PropTypes.shape({
    name: PropTypes.string.isRequired,
    battery: PropTypes.number.isRequired,
  }).isRequired,
};

SensorMaintenance.propTypes = {
  sensor: PropTypes.shape({
    status: PropTypes.string.isRequired,
    battery: PropTypes.number.isRequired,
    signal: PropTypes.string.isRequired,
    lastSync: PropTypes.string.isRequired,
  }),
  healthMode: PropTypes.bool,
};

function ActionRow({ mode = 'default' }) {
  if (mode === 'reportOnly') {
    return (
      <div className={styles.actionRow}>
        <Button variant="primary" fullWidth>
          <span className="material-symbols-rounded">auto_awesome</span>
          AI Report
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.actionRow}>
      <Button variant="primary" fullWidth>
        <span className="material-symbols-rounded">person_search</span>
        Assign Scouting
      </Button>
      <Button variant="secondary" fullWidth>
        <span className="material-symbols-rounded">auto_awesome</span>
        AI Report
      </Button>
    </div>
  );
}

function BottomActionTray({ mode = 'default' }) {
  return (
    <div className={`${styles.bottomActionTray} ${mode === 'reportOnly' ? styles.bottomActionTrayCompact : ''}`}>
      <ActionRow mode={mode} />
    </div>
  );
}

function ChartStack({ compact = false, scopeExperiment = false, pestFocus = 'all' }) {
  if (scopeExperiment) {
    const dayTrendSeries = getVisiblePestSeries(pestFocus, 'dayTrend');
    const rolling3DaySeries = getVisiblePestSeries(pestFocus, 'rolling3Day');
    const rolling7DaySeries = getVisiblePestSeries(pestFocus, 'rolling7Day');
    const hourlySeries = getVisiblePestSeries(pestFocus, 'hourlyDistribution');

    return (
      <div className={styles.chartStack}>
        <TrendChart title="Day Trend" type="line" labels={chartSeries.dayLabels} series={dayTrendSeries} threshold={25} />
        <TrendChart title="3-Day Average" type="line" labels={chartSeries.dayLabels} series={rolling3DaySeries} threshold={25} />
        <TrendChart title="7-Day Rolling Average" type="line" labels={chartSeries.dayLabels} series={rolling7DaySeries} threshold={25} />
        {!compact && (
          <TrendChart title="Hourly Distribution" type="line" labels={chartSeries.hourlyLabels} series={hourlySeries} threshold={25} />
        )}
      </div>
    );
  }

  return (
    <div className={styles.chartStack}>
      <TrendChart title="Day Trend" type="bar" labels={chartSeries.dayLabels} data={chartSeries.blockTrend} threshold={25} />
      <TrendChart
        title="3-Day Avg & 7-Day Rolling"
        type="line"
        labels={chartSeries.dayLabels}
        series={[
          { label: '3-Day Avg', data: chartSeries.rolling3Day, color: '#2563EB' },
          { label: '7-Day Rolling', data: chartSeries.rolling7Day, color: '#C2410C', dashed: true },
        ]}
        threshold={25}
      />
      {!compact && (
        <TrendChart title="Hourly Distribution" type="bar" labels={chartSeries.hourlyLabels} data={chartSeries.hourlyDistribution} threshold={25} />
      )}
    </div>
  );
}

function RanchLinks() {
  return (
    <section className={styles.childList}>
      <div className={styles.sectionHeader}>
        <Typography variant="h5">Ranches</Typography>
        <Typography variant="caption" color="secondary">Ranked highest risk to lowest</Typography>
      </div>
      {rankedRanches.map((ranch, index) => (
        <RankingListItem
          key={ranch.id}
          rank={index + 1}
          title={ranch.name}
          subtitle={`${ranch.currentCount} detections • ${ranch.blocks} blocks • ${ranch.activeSensors}/${ranch.totalSensors} sensors active`}
          riskLevel={ranch.riskLevel}
        />
      ))}
    </section>
  );
}

function BlockLinks({ onBlockPreviewChange }) {
  return (
    <section className={styles.childList}>
      <div className={styles.sectionHeader}>
        <Typography variant="h5">Blocks</Typography>
        <Typography variant="caption" color="secondary">Ranked highest risk to lowest</Typography>
      </div>
      {selectedRanchBlocks.slice(0, 10).map((block, index) => (
        <RankingListItem
          key={block.id}
          rank={index + 1}
          title={block.name}
          subtitle={`${block.currentCount} detections • ${block.activeSensors}/${block.totalSensors} sensors active`}
          riskLevel={block.riskLevel}
          onBlur={() => onBlockPreviewChange?.('')}
          onFocus={() => onBlockPreviewChange?.(block.id)}
          onMouseEnter={() => onBlockPreviewChange?.(block.id)}
          onMouseLeave={() => onBlockPreviewChange?.('')}
        />
      ))}
      <Button variant="secondary" fullWidth>View all blocks</Button>
    </section>
  );
}

function SensorLinks() {
  return (
    <section className={styles.childList}>
      <div className={styles.sectionHeader}>
        <Typography variant="h5">Sensors</Typography>
        <Typography variant="caption" color="secondary">Ranked highest risk to lowest</Typography>
      </div>
      {rankedSensors.slice(0, 10).map((sensor, index) => (
        <RankingListItem
          key={sensor.id}
          rank={index + 1}
          title={sensor.name}
          subtitle={`${sensor.pestName || selectedBlock.pestName} • ${sensor.count} detections • ${sensor.status} • ${sensor.battery}% battery`}
          riskLevel={sensor.severity}
          disabled={sensor.severity === 'offline'}
        />
      ))}
      <Button variant="secondary" fullWidth>View all sensors</Button>
    </section>
  );
}

function OrganizationTasks() {
  return (
    <section className={styles.childList}>
      <div className={styles.sectionHeader}>
        <Typography variant="h5">Tasks</Typography>
        <Typography variant="caption" color="secondary">High-level operational snapshot</Typography>
      </div>
      {taskStreams.map((stream) => (
        <div className={styles.taskStream} key={stream.title}>
          <div className={styles.sectionHeader}>
            <Typography variant="body" weight="semibold">{stream.title}</Typography>
            <Typography variant="caption" color="secondary">{stream.summary}</Typography>
          </div>
          <div className={styles.taskStats}>
            {stream.stats.map((stat) => (
              <div className={styles.taskStat} key={`${stream.title}-${stat.label}`}>
                <Typography variant="caption" color="secondary">{stat.label}</Typography>
                <Typography variant="h5">{stat.value}</Typography>
              </div>
            ))}
          </div>
          {stream.items.map((item) => {
            const task = {
              entityName: item.subtitle,
              type: stream.title === 'Scouting Assignments' ? 'Scouting' : 'Work Order',
              assignee: 'Unassigned',
              priority: item.riskLevel === 'high' ? 'Urgent' : item.riskLevel === 'medium' ? 'Medium' : 'Low',
              status: 'Requested',
              notes: item.title,
            };

            return (
              <TaskListItem
                key={`${stream.title}-${item.title}`}
                task={task}
              />
            );
          })}
        </div>
      ))}
    </section>
  );
}

function TasksPage() {
  return (
    <SplitPreview
      left={<TaskDropdown tasks={[]} />}
      right={<TaskDropdown tasks={tasks} />}
      leftLabel="Empty state"
      rightLabel="Populated state"
    />
  );
}

function ScoutingPage() {
  return (
    <CenteredPreview>
      <ScoutingAssignmentModal
        entityName={`${selectedBlock.ranchName} / ${selectedBlock.name}`}
        riskLevel={selectedBlock.riskLevel}
        pestName={selectedBlock.pestName}
      />
    </CenteredPreview>
  );
}

function ReportPage() {
  return (
    <SplitPreview
      left={<ReportModal report={report} loading />}
      right={<ReportModal report={report} />}
      leftLabel="Loading"
      rightLabel="Complete"
    />
  );
}

function MobileMapPage({ type = 'ranking' }) {
  return (
    <CenteredPreview className={styles.mobilePreview}>
      <MobileDeviceFrame type={type} />
    </CenteredPreview>
  );
}

function ResponsiveMobilePage({ type = 'ranking' }) {
  return (
    <div className={styles.responsiveMobileFrame}>
      <MobileDeviceFrame type={type} />
    </div>
  );
}

function MobileDeviceFrame({ type = 'ranking' }) {
  const [sheetKind, setSheetKind] = useState('content');
  const [sheetState, setSheetState] = useState('docked');
  const selectedMapBlockId = type === 'block' ? selectedBlock.id : '';
  const isHealthMobile = type === 'sensor-health';
  const selectedSensorId = type === 'sensor' || isHealthMobile ? selectedSensor.id : '';
  const sensorDisplayMode = isHealthMobile ? 'healthBatteryBare' : 'pest';
  const mapSensors = isHealthMobile ? healthExperimentSensors : sensors;
  const resolvedSheetKind = sheetKind;
  const isControlSheet = resolvedSheetKind === 'pest' || resolvedSheetKind === 'map';
  const sheetLabel = {
    content: type === 'ranking' ? 'Pest pressure ranking' : `${isHealthMobile ? 'sensor health' : type} detail`,
    pest: 'Pest focus',
    map: 'Map controls',
  }[resolvedSheetKind];

  const openSheet = (nextKind) => {
    setSheetKind(nextKind);
    setSheetState(nextKind === 'content' ? 'docked' : 'full');
  };
  const toggleSheet = () => {
    if (isControlSheet) {
      setSheetKind('content');
      setSheetState('docked');
      return;
    }

    setSheetState((current) => current === 'full' ? 'docked' : 'full');
  };

  return (
    <div className={styles.mobileDevice}>
      <TopNavigationBar className={styles.mobileTopNavigation} />
      <div className={styles.mobileMap}>
        <InteractiveMap
          center={[36.647, -119.8]}
          zoom={15}
          blockPolygon={selectedBlock.polygon}
          blockOverlays={buildRankingBlockOverlays(selectedMapBlockId, '')}
          activeBlockLabel={type === 'block' ? selectedBlock.name : ''}
          sensors={mapSensors}
          selectedSensorId={selectedSensorId}
          sensorDisplayMode={sensorDisplayMode}
          blockSeverity={selectedBlock.riskLevel}
          mapStyle="satellite"
        />
        <div className={styles.mobileScopeDock}>
              <ScopeNavigation level={type === 'ranking' ? 'ranking' : isHealthMobile ? 'sensor' : type} />
        </div>
        <WeatherWidget weather={weather} compact className={styles.mobileWeather} />
        <div className={styles.fabs}>
          <Button
            variant="secondary"
            className={styles.fab}
            aria-label="Open pest focus"
            onClick={() => openSheet('pest')}
          >
            <span className="material-symbols-rounded">pest_control</span>
          </Button>
          <Button
            variant="secondary"
            className={styles.fab}
            aria-label="Open map controls"
            onClick={() => openSheet('map')}
          >
            <span className="material-symbols-rounded">layers</span>
          </Button>
          <Button variant="secondary" className={styles.fab} aria-label="Locate"><span className="material-symbols-rounded">my_location</span></Button>
        </div>
      </div>
      <MobileBottomSheet
        state={sheetState}
        label={sheetLabel}
        onToggle={toggleSheet}
        dismissMode={isControlSheet}
        dockedSummary={<MobileDockSummary type={type} sheetKind={resolvedSheetKind} />}
      >
        <MobileSheet type={type} sheetKind={resolvedSheetKind} healthMode={isHealthMobile} />
      </MobileBottomSheet>
    </div>
  );
}

function MobileDockSummary({ type, sheetKind }) {
  const contentCopy = {
    ranking: { title: 'Pest Pressure Ranking', meta: 'Blocks ranked highest risk to lowest' },
    organization: { title: selectedOrganization.name, meta: 'Organisation detail', badge: selectedOrganization.riskLevel },
    ranch: { title: selectedRanch.name, meta: selectedRanch.organization, badge: selectedRanch.riskLevel },
    block: { title: selectedBlock.name, meta: selectedBlock.ranchName, badge: selectedBlock.riskLevel },
    sensor: { title: selectedSensor.name, meta: selectedSensor.blockName, badge: selectedSensor.severity },
    'sensor-health': { title: healthIssueSensor.name, meta: 'Low battery detected', badge: healthIssueSensor.severity },
  };
  const controlCopy = {
    pest: { title: 'Pest Focus', meta: 'Current thresholds and pest selection' },
    map: { title: 'Map Controls', meta: 'Layers, legend, and map display' },
  };
  const resolved = sheetKind === 'content' ? contentCopy[type] || contentCopy.ranking : controlCopy[sheetKind];

  return (
    <div className={styles.mobileDockSummary}>
      <div>
        <Typography variant="h4">{resolved.title}</Typography>
        <Typography variant="caption">{resolved.meta}</Typography>
      </div>
      {resolved.badge && <Badge variant={resolved.badge}>{`${resolved.badge} risk`}</Badge>}
    </div>
  );
}

function MobileSheet({ type, sheetKind, healthMode = false }) {
  if (sheetKind === 'pest') {
    return <MobileControlsSheet scopePanel="pest" healthMode={healthMode} />;
  }

  if (sheetKind === 'map') {
    return <MobileControlsSheet scopePanel="map" healthMode={healthMode} />;
  }

  if (type === 'ranking') {
    return <MobileRankingSheet />;
  }

  const panelMap = {
    organization: <OrganizationDetailPanel scopeExperiment />,
    ranch: <RanchDetailPanel scopeExperiment />,
    block: <BlockDetailPanel scopeExperiment />,
    sensor: <SensorDetailPanel scopeExperiment />,
    'sensor-health': <SensorDetailPanel scopeExperiment healthMode />,
  };

  return <div className={styles.mobileDetailPanel}>{panelMap[type]}</div>;
}

function MobileRankingSheet() {
  return (
    <div className={styles.sheetContent}>
      <div className={styles.mobileSheetHeader}>
        <div className={styles.mobileSheetHeaderTop}>
          <div>
            <Typography variant="h4">Pest Pressure Ranking</Typography>
            <Typography variant="caption" color="secondary">Blocks ranked highest risk to lowest</Typography>
          </div>
          <InfoDisclosure
            title="Ranking logic"
            description="Blocks are ranked by active pest pressure under the current pest focus and threshold lens."
            align="end"
          />
        </div>
        <div className={styles.mobileFilterRow}>
          <FormField label="Organisation">
            <Select
              options={[
                { label: 'Show all', value: 'all' },
                { label: 'RapidAIM Growers Co.', value: 'rapid' },
                { label: 'Apex Agriculture', value: 'apex' },
              ]}
            />
          </FormField>
          <FormField label="Ranch">
            <Select
              options={[
                { label: 'Show all', value: 'all' },
                { label: 'Sierra Orchards', value: 'sierra' },
                { label: 'Sunshine Valley Ranch', value: 'sunshine' },
              ]}
            />
          </FormField>
        </div>
      </div>
      <PestWeekComparison>
        <PestPressureGrid pestFocus="all" />
      </PestWeekComparison>
      <div className={styles.mobileListSection}>
        {rankingBlocks.slice(0, 6).map((block, index) => (
          <RankingListItem
            key={block.id}
            rank={index + 1}
            title={block.name}
            subtitle={`${block.pestName} • ${block.currentCount} detections • ${block.activeSensors}/${block.totalSensors} sensors active`}
            riskLevel={block.riskLevel}
          />
        ))}
      </div>
    </div>
  );
}

function MobileControlsSheet({ scopePanel = 'pest', healthMode = false }) {
  return (
    <div className={`${styles.sheetContent} ${styles.mobileControlsContent}`}>
      <div className={styles.mobileControlPanel}>
        <ControlCenter
          mode="scopeExperiment"
          scopePanel={scopePanel}
          embedded
          showSensorHealthControls={healthMode}
          sensorMarkerMode={healthMode ? 'health' : 'pest'}
          defaultMapControlsOpen
          defaultPestFocusOpen
        />
      </div>
    </div>
  );
}

function MobileOverlaysPage() {
  return (
    <SplitPreview
      left={<ScoutingAssignmentModal compact entityName={selectedBlock.name} riskLevel={selectedBlock.riskLevel} pestName="Female NOW" />}
      right={<TaskDropdown tasks={tasks} />}
      leftLabel="Mobile scouting modal"
      rightLabel="Mobile tasks overlay"
    />
  );
}

function AccountPage() {
  return (
    <div className={styles.accountFrame}>
      <AccountSettings />
    </div>
  );
}

function CenteredPreview({ children, className = '' }) {
  return <div className={`${styles.centeredPreview} ${className}`}>{children}</div>;
}

function SplitPreview({ left, right, leftLabel, rightLabel }) {
  return (
    <div className={styles.splitPreview}>
      <div className={styles.previewColumn}>
        <Typography variant="h5" color="secondary">{leftLabel}</Typography>
        {left}
      </div>
      <div className={styles.previewColumn}>
        <Typography variant="h5" color="secondary">{rightLabel}</Typography>
        {right}
      </div>
    </div>
  );
}
