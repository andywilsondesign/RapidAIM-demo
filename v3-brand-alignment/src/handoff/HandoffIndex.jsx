import React, { useMemo, useState } from 'react';
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
import { TrendChart } from '../components/organisms/TrendChart/TrendChart';
import { WeatherWidget } from '../components/organisms/WeatherWidget/WeatherWidget';
import { TaskDropdown } from '../components/organisms/TaskDropdown/TaskDropdown';
import { ScoutingAssignmentModal } from '../components/organisms/ScoutingAssignmentModal/ScoutingAssignmentModal';
import { ReportModal } from '../components/organisms/ReportModal/ReportModal';
import { AccountSettings } from '../components/pages/AccountSettings/AccountSettings';
import { HierarchyBreadcrumb } from '../components/molecules/HierarchyBreadcrumb/HierarchyBreadcrumb';
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
    color: '#15803D',
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

const rankingBlockMapPolygons = rankingBlocks.reduce((acc, block, index) => {
  const row = Math.floor(index / 2);
  const column = index % 2;
  acc[block.id] = offsetPolygon(rankingBlockBasePolygon, row * -0.0029, column * 0.0048);
  return acc;
}, {});

const buildRankingBlockOverlays = (selectedBlockId, previewBlockId) => rankingBlocks.slice(0, 8).map((block) => {
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
    positions: rankingBlockMapPolygons[block.id],
    severity: block.riskLevel,
    state,
  };
});

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
      { id: 'mobile-ranking', label: 'Ranking Sheet', component: <MobilePage state="ranking" /> },
      { id: 'mobile-detail', label: 'Detail Sheet', component: <MobilePage state="detail" /> },
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

export const HandoffIndex = ({ initialPageId = flatPages[0].id }) => {
  const [activePageId, setActivePageId] = useState(initialPageId);
  const [isNavigatorOpen, setIsNavigatorOpen] = useState(true);
  const activePage = useMemo(
    () => flatPages.find((page) => page.id === activePageId) || flatPages[0],
    [activePageId]
  );

  return (
    <div className={`${styles.shell} ${isNavigatorOpen ? '' : styles.shellCollapsed}`}>
      {isNavigatorOpen ? (
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
      ) : (
        <button
          className={styles.expandButton}
          onClick={() => setIsNavigatorOpen(true)}
          type="button"
          aria-label="Show handoff navigator"
        >
          <span className="material-symbols-rounded">view_sidebar</span>
          <span>Views</span>
        </button>
      )}
      <main className={styles.stage}>
        <div className={styles.viewport}>{activePage.component}</div>
      </main>
    </div>
  );
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
}) {
  const [pestFocus, setPestFocus] = useState('all');
  const [previewBlockId, setPreviewBlockId] = useState('');
  const resolvedDetailPanel = scopeExperiment && React.isValidElement(detailPanel)
    ? React.cloneElement(detailPanel, { pestFocus, onBlockPreviewChange: setPreviewBlockId })
    : detailPanel;
  const selectedMapBlockId = scopeExperiment && scopeLevel === 'block' ? selectedBlock.id : '';
  const resolvedBlockOverlays = scopeExperiment
    ? blockOverlays || buildRankingBlockOverlays(selectedMapBlockId, previewBlockId)
    : blockOverlays;
  const selectedSensorId = scopeExperiment && scopeLevel === 'sensor' ? selectedSensor.id : '';

  return (
    <div className={styles.desktopShell}>
      <TopNavigationBar />
      <div className={styles.desktopMain}>
        {scopeExperiment ? (
          <ScopeNavigation level={scopeLevel} />
        ) : parentContext && (
          <HierarchyBreadcrumb className={styles.parentContextLink} items={parentContext.items} />
        )}
        <aside className={`${styles.leftRail} ${parentContext || scopeExperiment ? styles.leftRailWithContext : ''} ${contentHeightPanel ? styles.leftRailContentHeight : ''}`}>{resolvedDetailPanel}</aside>
        <section className={styles.mapStage}>
          <InteractiveMap
            center={[36.647, -119.8]}
            zoom={15}
            blockPolygon={selectedBlock.polygon}
            blockOverlays={resolvedBlockOverlays}
            activeBlockLabel={activeBlockLabel}
            sensors={sensors}
            selectedSensorId={selectedSensorId}
            blockSeverity={selectedBlock.riskLevel}
            mapStyle="satellite"
          />
          <WeatherWidget weather={weather} className={styles.weather} />
        </section>
        <ControlCenter
          className={`${styles.rightRail} ${scopeExperiment ? styles.rightRailStack : ''}`}
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
  }[type];
  const parentContext = {
    organization: null,
    block: { items: [{ label: selectedRanch.organization }, { label: selectedBlock.ranchName }] },
    ranch: { items: [{ label: selectedRanch.organization }] },
    sensor: { items: [{ label: selectedRanch.organization }, { label: selectedSensor.ranchName }, { label: selectedSensor.blockName }] },
  }[type];

  return <DesktopShell detailPanel={panel} parentContext={parentContext} scopeExperiment={scopeExperiment} scopeLevel={type} />;
}

function ScopeNavigation({ level = 'block' }) {
  const blockLabel = level === 'organization' || level === 'ranch' || level === 'ranking' ? 'All blocks' : selectedBlock.name;
  const ranchLabel = level === 'organization' || level === 'ranking' ? 'All ranches' : selectedRanch.name;
  const locationSegments = [
    { label: selectedOrganization.name, options: scopeOrganizations },
    { label: ranchLabel, options: [{ label: 'All ranches', riskLevel: 'low' }, ...scopeRanches] },
    { label: blockLabel, options: [{ label: 'All blocks', riskLevel: 'low' }, ...scopeBlocks] },
  ];

  return (
    <ScopeNavigationControl
      className={styles.scopeNav}
      ariaLabel="Experimental pest and location scope navigation"
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
                { label: 'Show all organisations', value: 'all' },
                { label: 'RapidAIM Growers Co.', value: 'rapid' },
                { label: 'Apex Agriculture', value: 'apex' },
              ]} />
            </FormField>
            <FormField label="Ranch">
              <Select options={[
                { label: 'Show all ranches', value: 'all' },
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
            <button
              className={`${styles.rankingBlockItem} ${block.id === activeBlockId ? styles.activeRankingBlockItem : ''}`}
              key={block.id}
              type="button"
              onBlur={() => onPreviewBlockChange('')}
              onClick={() => onSelectedBlockChange(block.id)}
              onFocus={() => onPreviewBlockChange(block.id)}
              onMouseEnter={() => onPreviewBlockChange(block.id)}
              onMouseLeave={() => onPreviewBlockChange('')}
              onPointerEnter={() => onPreviewBlockChange(block.id)}
              onPointerLeave={() => onPreviewBlockChange('')}
            >
              <div className={styles.rankBadge}>{index + 1}</div>
              <div className={styles.rankingBlockContent}>
                <div className={styles.rankingBlockTitleRow}>
                  <Typography variant="body-sm" weight="semibold">{block.name}</Typography>
                  <Badge variant={block.riskLevel}>{`${block.riskLevel} risk`}</Badge>
                </div>
                <Typography variant="caption" color="secondary">
                  {block.ranchName} • {block.pestName} • {block.currentCount} detections • {block.activeSensors}/{block.totalSensors} sensors active
                </Typography>
                {activeTaskTab === 'assigned' && (
                  <div className={styles.rankingBlockMetaRow}>
                    <Badge variant="neutral">{`Task: ${block.taskStatus}`}</Badge>
                  </div>
                )}
              </div>
            </button>
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

function SensorDetailPanel({ scopeExperiment = false, pestFocus = 'all' }) {
  return (
    <DetailPanel
      title={selectedSensor.name}
      badge={selectedSensor.severity}
      backLabel={selectedSensor.blockName}
      backAriaLabel={`Back to ${selectedSensor.blockName}`}
      actions={<BottomActionTray mode="default" />}
      sections={[
        { label: 'Maintenance', content: <SensorMaintenance /> },
      ]}
    >
      <PestWeekComparison>
        {scopeExperiment ? <PestPressureGrid pestFocus={pestFocus} /> : <StatCard
          label={selectedSensor.pestName}
          value={selectedSensor.count}
          trend={18}
          benchmark="Farm average: 45"
        />}
      </PestWeekComparison>
      <ChartStack compact scopeExperiment={scopeExperiment} pestFocus={pestFocus} />
    </DetailPanel>
  );
}

function SensorMaintenance() {
  return (
    <section className={styles.childList}>
      <div className={styles.sectionHeader}>
        <Typography variant="h5">Maintenance</Typography>
        <Typography variant="caption" color="secondary">Operational status for this sensor</Typography>
      </div>
      <SensorMetaGrid items={[
        { label: 'Status', value: selectedSensor.status, tone: 'positive' },
        { label: 'Battery', value: `${selectedSensor.battery}%`, tone: 'positive' },
        { label: 'Signal', value: selectedSensor.signal, tone: 'positive' },
        { label: 'Last Sync', value: selectedSensor.lastSync, tone: 'positive' },
      ]} />
    </section>
  );
}

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

function MobilePage({ state }) {
  const isDetail = state === 'detail';

  return (
    <CenteredPreview>
      <div className={styles.mobileDevice}>
        <TopNavigationBar />
        <div className={styles.mobileMap}>
          <InteractiveMap
            center={[36.647, -119.8]}
            zoom={15}
            blockPolygon={selectedBlock.polygon}
            sensors={sensors.slice(0, 2)}
            blockSeverity={selectedBlock.riskLevel}
          />
          <div className={styles.fabs}>
            <Button variant="secondary" className={styles.fab} aria-label="Layers"><span className="material-symbols-rounded">layers</span></Button>
            <Button variant="secondary" className={styles.fab} aria-label="Pest"><span className="material-symbols-rounded">pest_control</span></Button>
            <Button variant="secondary" className={styles.fab} aria-label="GPS"><span className="material-symbols-rounded">my_location</span></Button>
          </div>
        </div>
        <div className={styles.bottomSheet}>
          <div className={styles.sheetHandle} />
          {isDetail ? <MobileDetailSheet /> : <MobileRankingSheet />}
        </div>
      </div>
    </CenteredPreview>
  );
}

function MobileRankingSheet() {
  return (
    <div className={styles.sheetContent}>
      <div className={styles.panelHeader}>
        <Typography variant="h5">Pest Pressure Ranking</Typography>
        <Badge variant="neutral">3 Blocks</Badge>
      </div>
      {blocks.map((block, index) => (
        <RankingListItem
          key={block.id}
          rank={index + 1}
          title={block.name}
          subtitle={`${block.ranchName} / ${block.currentCount} detections`}
          riskLevel={block.riskLevel}
        />
      ))}
    </div>
  );
}

function MobileDetailSheet() {
  return (
    <div className={styles.sheetContent}>
      <Button variant="ghost" size="sm"><span className="material-symbols-rounded">chevron_left</span>Back</Button>
      <div className={styles.panelHeader}>
        <div>
          <Typography variant="h4">{selectedBlock.name}</Typography>
          <Typography variant="caption" color="secondary">{selectedBlock.ranchName}</Typography>
        </div>
        <Badge variant={selectedBlock.riskLevel}>{selectedBlock.riskLevel} Risk</Badge>
      </div>
      <StatCard label={selectedBlock.pestName} value={selectedBlock.currentCount} trend={selectedBlock.trend} />
      <ActionRow />
      <ChartStack compact />
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

function CenteredPreview({ children }) {
  return <div className={styles.centeredPreview}>{children}</div>;
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
