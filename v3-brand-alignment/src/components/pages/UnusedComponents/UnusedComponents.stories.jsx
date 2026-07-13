import React from 'react';
import { RiskMarker } from '../../atoms/RiskMarker/RiskMarker';
import { Input } from '../../atoms/Input/Input';
import { Checkbox } from '../../atoms/Checkbox/Checkbox';
import { Typography } from '../../atoms/Typography/Typography';
import { Alert } from '../../molecules/Alert/Alert';
import { SegmentedControl } from '../../molecules/SegmentedControl/SegmentedControl';
import { HierarchyBreadcrumb } from '../../molecules/HierarchyBreadcrumb/HierarchyBreadcrumb';
import { AccountForm } from '../../organisms/AccountForm/AccountForm';
import { HeroMetricsRow } from '../../organisms/HeroMetricsRow/HeroMetricsRow';
import { ReportModal } from '../../organisms/ReportModal/ReportModal';
import { ScoutingAssignmentModal } from '../../organisms/ScoutingAssignmentModal/ScoutingAssignmentModal';
import { TaskDropdown } from '../../organisms/TaskDropdown/TaskDropdown';
import { report, tasks } from '../../../fixtures/rapidAimFixtures';

export default {
  title: 'Pages/Unused Components Review',
  parameters: {
    layout: 'fullscreen',
  },
};

const reviewGroups = [
  {
    title: 'Atoms',
    items: [
      {
        name: 'RiskMarker',
        note: 'Rendered inside InteractiveMap, but useful to review as a standalone marker state and selected-state primitive.',
        render: () => (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {['high', 'medium', 'low', 'offline'].map((severity) => (
              <RiskMarker key={severity} severity={severity} selected={severity === 'high'} />
            ))}
          </div>
        ),
      },
      {
        name: 'Input',
        note: 'Currently appears as a sub-component of forms/search rather than a desktop map page primitive.',
        render: () => <Input placeholder="Standalone input state" />,
      },
      {
        name: 'Checkbox',
        note: 'Available for binary controls; map layers currently use related control patterns inside Map Controls.',
        render: () => <Checkbox label="Show sensor overlays" defaultChecked />,
      },
    ],
  },
  {
    title: 'Molecules',
    items: [
      {
        name: 'Alert',
        note: 'Used by account/settings style surfaces, not the desktop map detail templates.',
        render: () => <Alert variant="info" title="Plan status" message="Your organization is currently on the Pro tier." />,
      },
      {
        name: 'SegmentedControl',
        note: 'Useful for compact mode switching; currently more prominent in overlays than desktop map panels.',
        render: () => (
          <SegmentedControl
            ariaLabel="Assignment type"
            value="pest"
            options={[
              { label: 'Pest Scouting', value: 'pest' },
              { label: 'Trap Maintenance', value: 'trap' },
              { label: 'Sensor Repair', value: 'repair' },
            ]}
          />
        ),
      },
      {
        name: 'HierarchyBreadcrumb',
        note: 'Legacy breadcrumb display replaced in the desktop map by ScopeNavigation.',
        render: () => (
          <HierarchyBreadcrumb
            items={[
              { label: 'RapidAIM Growers Co.' },
              { label: 'Sierra Orchards' },
              { label: 'Block 4' },
            ]}
          />
        ),
      },
    ],
  },
  {
    title: 'Organisms',
    items: [
      {
        name: 'HeroMetricsRow',
        note: 'A summary-row pattern not currently used by the consolidated desktop map detail pages.',
        render: () => (
          <HeroMetricsRow
            metrics={[
              { label: 'Group Asset Scale', value: '4 Ranches' },
              { label: 'Active Grid Health', value: '98%', trend: 2 },
              { label: 'Current Risk Status', value: 'Elevated' },
            ]}
          />
        ),
      },
      {
        name: 'AccountForm',
        note: 'Used in Account Settings, but not in the map dashboard templates.',
        render: () => <AccountForm />,
      },
      {
        name: 'ReportModal',
        note: 'Overlay flow rather than a core desktop map page building block.',
        render: () => <ReportModal report={report} />,
      },
      {
        name: 'ScoutingAssignmentModal',
        note: 'Overlay flow launched from panel actions; included here to compare modal design-system alignment.',
        render: () => (
          <ScoutingAssignmentModal
            entityName="Sierra Orchards / Block 4"
            riskLevel="high"
            pestName="Female Navel Orangeworm"
          />
        ),
      },
      {
        name: 'TaskDropdown',
        note: 'Task overlay/dropdown pattern, separate from the desktop map left-panel task stream.',
        render: () => <TaskDropdown tasks={tasks.slice(0, 3)} />,
      },
    ],
  },
];

const ReviewItem = ({ item }) => (
  <section style={{
    display: 'grid',
    gridTemplateColumns: 'minmax(180px, 240px) minmax(0, 1fr)',
    gap: '24px',
    padding: '24px',
    border: '1px solid var(--color-border-subtle)',
    borderRadius: 'var(--radius-lg)',
    background: 'var(--color-bg-panel)',
  }}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <Typography variant="h4">{item.name}</Typography>
      <Typography variant="body-sm" color="secondary">{item.note}</Typography>
    </div>
    <div style={{
      minWidth: 0,
      overflow: 'auto',
      padding: '16px',
      borderRadius: 'var(--radius-md)',
      background: 'var(--color-bg-base)',
    }}>
      {item.render()}
    </div>
  </section>
);

export const ReviewBoard = {
  render: () => (
    <main style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '32px',
      padding: '32px',
      background: 'var(--color-bg-base)',
      color: 'var(--color-text-primary)',
    }}>
      <header style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '880px' }}>
        <Typography variant="h2">Unused Components Review</Typography>
        <Typography variant="body" color="secondary">
          Components not used directly to construct the five consolidated desktop map pages.
        </Typography>
      </header>
      {reviewGroups.map((group) => (
        <section key={group.title} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Typography variant="h3">{group.title}</Typography>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {group.items.map((item) => (
              <ReviewItem item={item} key={item.name} />
            ))}
          </div>
        </section>
      ))}
    </main>
  ),
};
