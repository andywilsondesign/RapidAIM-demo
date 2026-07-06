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
const selectedRanch = ranches[0];
const selectedSensor = sensors[0];
const selectedOrganization = {
  name: 'RapidAIM Growers Co.',
  riskLevel: 'high',
  ranches: ranches.filter((ranch) => ranch.organization === 'RapidAIM Growers Co.').length,
  blocks: 21,
  currentCount: 182,
  activeSensors: 69,
  totalSensors: 76,
  trend: 18,
  summary: 'Group-level pest pressure is concentrated in Sierra Orchards, with active scouting work recommended across the highest-risk ranches.',
};

const selectedRanchBlocks = [
  selectedBlock,
  { ...blocks[1], id: 'block-sierra-2', ranchId: selectedRanch.id, ranchName: selectedRanch.name },
  { ...blocks[2], id: 'block-sierra-1-west', ranchId: selectedRanch.id, ranchName: selectedRanch.name, name: 'Block 1 West' },
].sort((a, b) => b.currentCount - a.currentCount);

const rankedRanches = ranches
  .filter((ranch) => ranch.organization === selectedOrganization.name)
  .sort((a, b) => b.currentCount - a.currentCount);

const rankedSensors = [...sensors].sort((a, b) => b.count - a.count);

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
    block: { items: [{ label: selectedBlock.ranchName }] },
    ranch: { items: [{ label: selectedRanch.organization }] },
    sensor: { items: [{ label: selectedSensor.ranchName }, { label: selectedSensor.blockName }] },
  }[type];

  return <DesktopShell detailPanel={panel} parentContext={parentContext} />;
}

function OrganizationDetailPanel() {
  return (
    <Panel
      title={selectedOrganization.name}
      eyebrow={`${selectedOrganization.ranches} ranches • ${selectedOrganization.activeSensors}/${selectedOrganization.totalSensors} active sensors`}
      badge={selectedOrganization.riskLevel}
      childLabel="Ranches"
      childContent={<RanchLinks />}
    >
      <div className={styles.statsGrid}>
        <StatCard label="Group Asset Scale" value={`${selectedOrganization.ranches}/${selectedOrganization.blocks}`} />
        <StatCard label="Grid Health" value="98.4%" trend={2} />
        <StatCard label="Blocks Breached" value="8" />
        <StatCard label="Active Tasks" value="12" />
      </div>
      <Typography variant="body-sm" color="secondary">{selectedOrganization.summary}</Typography>
      <TrendChart title="30-Day Multi-Site Pest Pressure" type="line" labels={chartSeries.organizationLabels} data={chartSeries.organizationTrend} threshold={25} />
      <ChartStack compact />
    </Panel>
  );
}

function BlockDetailPanel() {
  return (
    <Panel
      title={selectedBlock.name}
      eyebrow={`${selectedBlock.totalSensors} sensors • ${selectedBlock.activeSensors} active`}
      badge={selectedBlock.riskLevel}
      backLabel={selectedBlock.ranchName}
      backAriaLabel={`Back to ${selectedBlock.ranchName}`}
      childLabel="Sensors"
      childContent={<SensorLinks />}
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
      eyebrow={`${selectedRanch.blocks} blocks • ${selectedRanch.activeSensors}/${selectedRanch.totalSensors} active sensors`}
      badge={selectedRanch.riskLevel}
      backLabel={selectedRanch.organization}
      backAriaLabel={`Back to ${selectedRanch.organization}`}
      childLabel="Blocks"
      childContent={<BlockLinks />}
    >
      <div className={styles.statsGrid}>
        <StatCard label="Total Detections" value={selectedRanch.currentCount} trend={selectedRanch.trend} />
        <StatCard label="Active Sensors" value={`${selectedRanch.activeSensors}/${selectedRanch.totalSensors}`} />
      </div>
      <Typography variant="body-sm" color="secondary">{selectedRanch.summary}</Typography>
      <DetectionGrid rows={detectionGrid} />
      <ChartStack compact />
    </Panel>
  );
}

function SensorDetailPanel() {
  return (
    <Panel
      title={selectedSensor.name}
      eyebrow={selectedSensor.ranchName}
      badge={selectedSensor.severity}
      backLabel={selectedSensor.blockName}
      backAriaLabel={`Back to ${selectedSensor.blockName}`}
    >
      <StatCard label="Current Count" value={selectedSensor.count} trend={18} />
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

function ActionRow() {
  return (
    <div className={styles.actionRow}>
      <Button variant="primary" fullWidth>
        <span className="material-symbols-rounded">person_search</span>
        Assign Scouting
      </Button>
      <Button variant="secondary" fullWidth>
        <span className="material-symbols-rounded">summarize</span>
        AI Report
      </Button>
    </div>
  );
}

function BottomActionTray() {
  return (
    <div className={styles.bottomActionTray}>
      <ActionRow />
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
        <Typography variant="caption" color="secondary">Ranked by current detections</Typography>
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
        <Typography variant="caption" color="secondary">Ranked by current detections</Typography>
      </div>
      {selectedRanchBlocks.map((block, index) => (
        <RankingListItem
          key={block.id}
          rank={index + 1}
          title={block.name}
          subtitle={`${block.currentCount} detections • ${block.activeSensors}/${block.totalSensors} sensors active`}
          riskLevel={block.riskLevel}
        />
      ))}
    </section>
  );
}

function SensorLinks() {
  return (
    <section className={styles.childList}>
      <div className={styles.sectionHeader}>
        <Typography variant="h5">Sensors</Typography>
        <Typography variant="caption" color="secondary">Ranked by current detections</Typography>
      </div>
      {rankedSensors.map((sensor, index) => (
        <RankingListItem
          key={sensor.id}
          rank={index + 1}
          title={sensor.name}
          subtitle={`${sensor.count} detections • ${sensor.status} • ${sensor.battery}% battery`}
          riskLevel={sensor.severity}
        />
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

function Panel({ title, eyebrow, badge, backLabel, backAriaLabel, childLabel, childContent, children }) {
  const [activeSection, setActiveSection] = useState('overview');
  const overviewRef = useRef(null);
  const childRef = useRef(null);
  const hasChildSection = Boolean(childLabel && childContent);

  const scrollToSection = (section) => {
    const target = section === 'children' ? childRef.current : overviewRef.current;
    target?.scrollIntoView({ block: 'start', behavior: 'smooth' });
    setActiveSection(section);
  };

  const handlePanelScroll = (event) => {
    if (!hasChildSection || !childRef.current) return;
    const bodyTop = event.currentTarget.getBoundingClientRect().top;
    const childTop = childRef.current.getBoundingClientRect().top;
    setActiveSection(childTop - bodyTop <= 128 ? 'children' : 'overview');
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
          </div>
          <div className={styles.panelMetaRow}>
            {eyebrow && <Typography variant="caption" color="secondary" className={styles.panelSubtitle}>{eyebrow}</Typography>}
            {badge && <Badge variant={badge} className={styles.panelBadge}>{badge} Risk</Badge>}
          </div>
        </div>
      </div>
      <nav className={`${styles.anchorTabs} ${hasChildSection ? '' : styles.singleAnchorTab}`} aria-label={`${title} panel sections`}>
        <button
          className={activeSection === 'overview' ? styles.activeAnchorTab : ''}
          type="button"
          onClick={() => scrollToSection('overview')}
        >
          Overview
        </button>
        {hasChildSection && (
          <button
            className={activeSection === 'children' ? styles.activeAnchorTab : ''}
            type="button"
            onClick={() => scrollToSection('children')}
          >
            {childLabel}
          </button>
        )}
      </nav>
      <div className={styles.panelBody} onScroll={handlePanelScroll}>
        <section className={styles.panelSection} ref={overviewRef}>
          <Typography variant="h5">Overview</Typography>
          {children}
        </section>
        {hasChildSection && (
          <section className={styles.panelSection} ref={childRef}>
            {childContent}
          </section>
        )}
      </div>
      <div className={styles.panelBottomFade} />
      <BottomActionTray />
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
