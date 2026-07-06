import React, { useMemo, useRef, useState } from 'react';
import { Badge } from '../components/atoms/Badge/Badge';
import { Button } from '../components/atoms/Button/Button';
import { Typography } from '../components/atoms/Typography/Typography';
import { RankingListItem } from '../components/molecules/RankingListItem/RankingListItem';
import { StatCard } from '../components/molecules/StatCard/StatCard';
import { DetectionGrid } from '../components/molecules/DetectionGrid/DetectionGrid';
import { SensorMetaGrid } from '../components/molecules/SensorMetaGrid/SensorMetaGrid';
import { TopNavigationBar } from '../components/organisms/TopNavigationBar/TopNavigationBar';
import { ControlCenter } from '../components/organisms/ControlCenter/ControlCenter';
import { InteractiveMap } from '../components/organisms/InteractiveMap/InteractiveMap';
import { TrendChart } from '../components/organisms/TrendChart/TrendChart';
import { WeatherWidget } from '../components/organisms/WeatherWidget/WeatherWidget';
import { TaskDropdown } from '../components/organisms/TaskDropdown/TaskDropdown';
import { ScoutingAssignmentModal } from '../components/organisms/ScoutingAssignmentModal/ScoutingAssignmentModal';
import { ReportModal } from '../components/organisms/ReportModal/ReportModal';
import { AccountSettings } from '../components/pages/AccountSettings/AccountSettings';
import { HierarchyBreadcrumb } from './HandoffBreadcrumb';
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
const selectedRanch = { ...ranches[0], blocks: 12 };
const selectedSensor = { ...sensors[0], pestName: selectedBlock.pestName };
const selectedOrganization = {
  name: 'RapidAIM Growers Co.',
  riskLevel: 'high',
  ranches: ranches.filter((ranch) => ranch.organization === 'RapidAIM Growers Co.').length,
  blocks: 21,
  currentCount: 182,
  activeSensors: 69,
  totalSensors: 76,
  trend: 18,
};

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

const rankedRanches = ranches
  .filter((ranch) => ranch.organization === selectedOrganization.name)
  .sort((a, b) => b.currentCount - a.currentCount);

const rankedSensors = [
  ...sensors,
  { ...sensors[0], id: 'sensor-sierra-4-f', name: 'Sensor S4-F', count: 41, battery: 74, severity: 'high', status: 'Online', lastSync: '14 min ago' },
  { ...sensors[0], id: 'sensor-sierra-4-g', name: 'Sensor S4-G', count: 33, battery: 71, severity: 'high', status: 'Online', lastSync: '16 min ago' },
  { ...sensors[1], id: 'sensor-sierra-4-h', name: 'Sensor S4-H', count: 24, battery: 68, severity: 'medium', status: 'Online', lastSync: '22 min ago' },
  { ...sensors[1], id: 'sensor-sierra-4-i', name: 'Sensor S4-I', count: 19, battery: 59, severity: 'medium', status: 'Online', lastSync: '28 min ago' },
  { ...sensors[2], id: 'sensor-sierra-4-j', name: 'Sensor S4-J', count: 11, battery: 46, severity: 'low', status: 'Online', lastSync: '41 min ago' },
  { ...sensors[2], id: 'sensor-sierra-4-k', name: 'Sensor S4-K', count: 6, battery: 37, severity: 'low', status: 'Online', lastSync: '55 min ago' },
  { ...sensors[2], id: 'sensor-sierra-4-l', name: 'Sensor S4-L', count: 5, battery: 34, severity: 'low', status: 'Online', lastSync: '1 hour ago' },
  { ...sensors[2], id: 'sensor-sierra-4-m', name: 'Sensor S4-M', count: 3, battery: 22, severity: 'low', status: 'Online', lastSync: '1 hour ago' },
  { ...sensors[2], id: 'sensor-sierra-4-n', name: 'Sensor S4-N', count: 2, battery: 19, severity: 'low', status: 'Online', lastSync: '2 hours ago' },
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
      { id: 'desktop-organization', label: 'Organization Detail', component: <DesktopDetailPage type="organization" /> },
      { id: 'desktop-ranch', label: 'Ranch Detail', component: <DesktopDetailPage type="ranch" /> },
      { id: 'desktop-block', label: 'Block Detail', component: <DesktopDetailPage type="block" /> },
      { id: 'desktop-sensor', label: 'Sensor Detail', component: <DesktopDetailPage type="sensor" /> },
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

const DesktopShell = ({ children, detailPanel, parentContext }) => (
  <div className={styles.desktopShell}>
    <TopNavigationBar />
    <div className={styles.desktopMain}>
      {parentContext && (
        <HierarchyBreadcrumb items={parentContext.items} />
      )}
      <aside className={`${styles.leftRail} ${parentContext ? styles.leftRailWithContext : ''}`}>{detailPanel}</aside>
      <section className={styles.mapStage}>
        <InteractiveMap
          center={[36.647, -119.8]}
          zoom={15}
          blockPolygon={selectedBlock.polygon}
          sensors={sensors}
          blockSeverity={selectedBlock.riskLevel}
          mapStyle="satellite"
        />
        <WeatherWidget weather={weather} className={styles.weather} />
      </section>
      <ControlCenter className={styles.rightRail} />
    </div>
    {children}
  </div>
);

DesktopShell.propTypes = {};

function DesktopDetailPage({ type }) {
  const panel = {
    organization: <OrganizationDetailPanel />,
    block: <BlockDetailPanel />,
    ranch: <RanchDetailPanel />,
    sensor: <SensorDetailPanel />,
  }[type];
  const parentContext = {
    organization: null,
    block: { items: [{ label: selectedRanch.organization }, { label: selectedBlock.ranchName }] },
    ranch: { items: [{ label: selectedRanch.organization }] },
    sensor: { items: [{ label: selectedRanch.organization }, { label: selectedSensor.ranchName }, { label: selectedSensor.blockName }] },
  }[type];

  return <DesktopShell detailPanel={panel} parentContext={parentContext} />;
}

function OrganizationDetailPanel() {
  return (
    <Panel
      title={selectedOrganization.name}
      eyebrow={`${selectedOrganization.ranches} ranches • ${selectedOrganization.activeSensors}/${selectedOrganization.totalSensors} active sensors`}
      badge={selectedOrganization.riskLevel}
      actionMode="reportOnly"
      sections={[
        { label: `Ranches (${selectedOrganization.ranches})`, content: <RanchLinks /> },
        { label: 'Tasks (11)', content: <OrganizationTasks /> },
      ]}
    >
      <TrendChart title="30-Day Multi-Site Pest Pressure" type="line" labels={chartSeries.organizationLabels} data={chartSeries.organizationTrend} threshold={25} />
      <ChartStack compact />
    </Panel>
  );
}

function BlockDetailPanel() {
  return (
    <Panel
      title={selectedBlock.name}
      badge={selectedBlock.riskLevel}
      backLabel={selectedBlock.ranchName}
      backAriaLabel={`Back to ${selectedBlock.ranchName}`}
      sections={[
        { label: `Sensors (${selectedBlock.activeSensors}/${selectedBlock.totalSensors})`, content: <SensorLinks /> },
      ]}
    >
      <StatCard
        label={selectedBlock.pestName}
        value={selectedBlock.currentCount}
        trend={selectedBlock.trend}
        trendLabel={selectedBlock.trendLabel}
        benchmark={selectedBlock.benchmark}
      />
      <DetectionGrid
        rows={sensorDetectionGrid}
        title="Last 7 Day Detections"
        firstColumnLabel="Name"
        showStatus
        timezone="America/Los_Angeles"
      />
      <ChartStack />
    </Panel>
  );
}

function RanchDetailPanel() {
  return (
    <Panel
      title={selectedRanch.name}
      badge={selectedRanch.riskLevel}
      backLabel={selectedRanch.organization}
      backAriaLabel={`Back to ${selectedRanch.organization}`}
      sections={[
        { label: `Blocks (${selectedRanch.blocks})`, content: <BlockLinks /> },
      ]}
    >
      <div className={styles.statsGrid}>
        <StatCard label="Total Detections" value={selectedRanch.currentCount} trend={selectedRanch.trend} />
        <StatCard label="Active Sensors" value={`${selectedRanch.activeSensors}/${selectedRanch.totalSensors}`} />
      </div>
      <DetectionGrid rows={detectionGrid} />
      <ChartStack compact />
    </Panel>
  );
}

function SensorDetailPanel() {
  return (
    <Panel
      title={selectedSensor.name}
      badge={selectedSensor.severity}
      backLabel={selectedSensor.blockName}
      backAriaLabel={`Back to ${selectedSensor.blockName}`}
    >
      <StatCard label={selectedSensor.pestName} value={selectedSensor.count} trend={18} />
      <SensorMetaGrid items={[
        { label: 'Status', value: selectedSensor.status, tone: 'positive' },
        { label: 'Battery', value: `${selectedSensor.battery}%`, tone: 'positive' },
        { label: 'Signal', value: selectedSensor.signal, tone: 'positive' },
        { label: 'Last Sync', value: selectedSensor.lastSync, tone: 'positive' },
      ]} />
      <ChartStack compact />
    </Panel>
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
    <div className={styles.bottomActionTray}>
      <ActionRow mode={mode} />
    </div>
  );
}

function ChartStack({ compact = false }) {
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

function BlockLinks() {
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
          subtitle={`${sensor.count} detections • ${sensor.status} • ${sensor.battery}% battery`}
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
          {stream.items.map((item, index) => (
            <RankingListItem
              key={`${stream.title}-${item.title}`}
              rank={index + 1}
              title={item.title}
              subtitle={item.subtitle}
              riskLevel={item.riskLevel}
            />
          ))}
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

function Panel({ title, eyebrow, badge, backLabel, backAriaLabel, sections = [], actionMode = 'default', children }) {
  const [activeSection, setActiveSection] = useState('overview');
  const overviewRef = useRef(null);
  const sectionRefs = useRef({});
  const hasSections = sections.length > 0;

  const scrollToSection = (section) => {
    const target = section === 'overview' ? overviewRef.current : sectionRefs.current[section];
    target?.scrollIntoView({ block: 'start', behavior: 'smooth' });
    setActiveSection(section);
  };

  const handlePanelScroll = (event) => {
    if (!hasSections) return;
    const bodyTop = event.currentTarget.getBoundingClientRect().top;
    const visibleSection = sections.reduce((current, section) => {
      const node = sectionRefs.current[section.label];
      if (!node) return current;
      const sectionTop = node.getBoundingClientRect().top - bodyTop;
      return sectionTop <= 128 ? section.label : current;
    }, 'overview');
    setActiveSection(visibleSection);
  };

  return (
    <section className={styles.panel}>
      <div className={styles.panelHeader}>
        <div className={styles.panelTitleGroup}>
          <div className={styles.panelTitleRow}>
            <div className={styles.panelTitleCluster}>
              {backLabel && (
                <button className={styles.backButton} type="button" aria-label={backAriaLabel || `Back to ${backLabel}`}>
                  <span className="material-symbols-rounded">arrow_back</span>
                </button>
              )}
              <Typography variant="h3">{title}</Typography>
            </div>
            {badge && <Badge variant={badge} className={styles.panelBadge}>{badge} Risk</Badge>}
          </div>
          <div className={styles.panelMetaRow}>
            {eyebrow && <Typography variant="caption" color="secondary" className={styles.panelSubtitle}>{eyebrow}</Typography>}
          </div>
        </div>
      </div>
      {hasSections && (
        <nav className={styles.anchorTabs} aria-label={`${title} panel sections`} style={{ '--tab-count': sections.length + 1 }}>
          <button
            className={activeSection === 'overview' ? styles.activeAnchorTab : ''}
            type="button"
            onClick={() => scrollToSection('overview')}
          >
            Overview
          </button>
          {sections.map((section) => (
            <button
              className={activeSection === section.label ? styles.activeAnchorTab : ''}
              key={section.label}
              type="button"
              onClick={() => scrollToSection(section.label)}
            >
              {section.label}
            </button>
          ))}
        </nav>
      )}
      <div className={styles.panelBody} onScroll={handlePanelScroll}>
        <section className={styles.panelSection} ref={overviewRef}>
          {children}
        </section>
        {sections.map((section) => (
          <section
            className={styles.panelSection}
            key={section.label}
            ref={(node) => {
              sectionRefs.current[section.label] = node;
            }}
          >
            {section.content}
          </section>
        ))}
      </div>
      <div className={styles.panelBottomFade} />
      <BottomActionTray mode={actionMode} />
    </section>
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
