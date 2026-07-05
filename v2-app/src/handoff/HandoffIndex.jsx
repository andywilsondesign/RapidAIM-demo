import React, { useMemo, useState } from 'react';
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
import { HeroMetricsRow } from '../components/organisms/HeroMetricsRow/HeroMetricsRow';
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

const pageGroups = [
  {
    title: 'Desktop',
    pages: [
      { id: 'desktop-ranking', label: 'Ranking State', component: <DesktopRankingPage /> },
      { id: 'desktop-block', label: 'Block Detail', component: <DesktopDetailPage type="block" /> },
      { id: 'desktop-ranch', label: 'Ranch Detail', component: <DesktopDetailPage type="ranch" /> },
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
      { id: 'organization', label: 'Organization Dashboard', component: <OrganizationPage /> },
      { id: 'account', label: 'Account Settings', component: <AccountPage /> },
    ],
  },
];

const flatPages = pageGroups.flatMap((group) => group.pages);

export const HandoffIndex = () => {
  const [activePageId, setActivePageId] = useState(flatPages[0].id);
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

const DesktopShell = ({ children, detailPanel }) => (
  <div className={styles.desktopShell}>
    <TopNavigationBar />
    <div className={styles.desktopMain}>
      <aside className={styles.leftRail}>{detailPanel}</aside>
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

function DesktopRankingPage() {
  return (
    <DesktopShell
      detailPanel={(
        <Panel title="Pest Pressure Ranking">
          {blocks.map((block, index) => (
            <RankingListItem
              key={block.id}
              rank={index + 1}
              title={`${block.ranchName} / ${block.name}`}
              subtitle={`${block.currentCount} detections / ${block.activeSensors} active sensors`}
              riskLevel={block.riskLevel}
            />
          ))}
        </Panel>
      )}
    />
  );
}

function DesktopDetailPage({ type }) {
  const panel = {
    block: <BlockDetailPanel />,
    ranch: <RanchDetailPanel />,
    sensor: <SensorDetailPanel />,
  }[type];

  return <DesktopShell detailPanel={panel} />;
}

function BlockDetailPanel() {
  return (
    <Panel
      title={selectedBlock.name}
      eyebrow={selectedBlock.ranchName}
      badge={selectedBlock.riskLevel}
      backLabel="Back to Ranch"
    >
      <StatCard label={selectedBlock.pestName} value={selectedBlock.currentCount} trend={selectedBlock.trend} />
      <Typography variant="caption" color="secondary">{selectedBlock.benchmark}</Typography>
      <DetectionGrid
        rows={sensorDetectionGrid}
        title="Sensor 7 Day Detections"
        firstColumnLabel="Sensor"
      />
      <ActionRow />
      <ChartStack />
    </Panel>
  );
}

function RanchDetailPanel() {
  return (
    <Panel
      title={selectedRanch.name}
      eyebrow={selectedRanch.organization}
      badge={selectedRanch.riskLevel}
      backLabel="Back to Organisation"
    >
      <div className={styles.statsGrid}>
        <StatCard label="Total Detections" value={selectedRanch.currentCount} trend={selectedRanch.trend} />
        <StatCard label="Active Sensors" value={`${selectedRanch.activeSensors}/${selectedRanch.totalSensors}`} />
      </div>
      <Typography variant="body-sm" color="secondary">{selectedRanch.summary}</Typography>
      <ActionRow />
      <DetectionGrid rows={detectionGrid} />
      <ChartStack compact />
    </Panel>
  );
}

function SensorDetailPanel() {
  return (
    <Panel
      title={selectedSensor.name}
      eyebrow={`${selectedSensor.ranchName} / ${selectedSensor.blockName}`}
      badge={selectedSensor.severity}
      backLabel="Back to Block"
    >
      <StatCard label="Current Count" value={selectedSensor.count} trend={18} />
      <SensorMetaGrid items={[
        { label: 'Status', value: selectedSensor.status },
        { label: 'Battery', value: `${selectedSensor.battery}%` },
        { label: 'Signal', value: selectedSensor.signal },
        { label: 'Last Sync', value: selectedSensor.lastSync },
      ]} />
      <ActionRow />
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

function ChartStack({ compact = false }) {
  return (
    <div className={styles.chartStack}>
      <TrendChart title="Day Trend" type="bar" labels={chartSeries.dayLabels} data={chartSeries.blockTrend} threshold={25} />
      {!compact && (
        <TrendChart title="3-Day Avg & 7-Day Rolling" type="line" labels={chartSeries.dayLabels} data={chartSeries.rollingAverage} threshold={25} />
      )}
      <TrendChart title="Hourly Distribution" type="bar" labels={chartSeries.hourlyLabels} data={chartSeries.hourlyDistribution} threshold={25} />
    </div>
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

function OrganizationPage() {
  return (
    <div className={styles.organizationPage}>
      <TopNavigationBar organizationName="RapidAim Corporate" />
      <main className={styles.organizationMain}>
        <HeroMetricsRow metrics={[
          { label: 'Group Asset Scale', value: '3 Ranches / 21 Blocks' },
          { label: 'Active Grid Health', value: '98.4%', trend: 2 },
          { label: 'Current Risk Status', value: '8 Blocks Breached' },
          { label: 'Active Logistics', value: '12 Tasks' },
        ]} />
        <div className={styles.organizationGrid}>
          <section className={styles.cardPanel}>
            <Typography variant="h4">30-Day Multi-Site Pest Pressure</Typography>
            <TrendChart type="line" labels={chartSeries.organizationLabels} data={chartSeries.organizationTrend} threshold={25} />
          </section>
          <section className={styles.cardPanel}>
            <Typography variant="h4">Priority Ranches</Typography>
            {ranches.map((ranch, index) => (
              <RankingListItem
                key={ranch.id}
                rank={index + 1}
                title={ranch.name}
                subtitle={`${ranch.currentCount} detections / ${ranch.blocks} blocks`}
                riskLevel={ranch.riskLevel}
              />
            ))}
          </section>
        </div>
      </main>
    </div>
  );
}

function AccountPage() {
  return (
    <div className={styles.accountFrame}>
      <AccountSettings />
    </div>
  );
}

function Panel({ title, eyebrow, badge, backLabel, children }) {
  return (
    <section className={styles.panel}>
      <div className={styles.panelHeader}>
        <div className={styles.panelTitleGroup}>
          {backLabel && (
            <button className={styles.backButton} type="button" aria-label={backLabel}>
              <span className="material-symbols-rounded">arrow_back</span>
            </button>
          )}
          <div>
            {eyebrow && <Typography variant="caption" color="secondary">{eyebrow}</Typography>}
            <Typography variant="h3">{title}</Typography>
          </div>
        </div>
        {badge && <Badge variant={badge}>{badge} Risk</Badge>}
      </div>
      <div className={styles.panelBody}>{children}</div>
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
