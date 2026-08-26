import React, { useState } from 'react';
import { Badge } from '../../atoms/Badge/Badge';
import { Button } from '../../atoms/Button/Button';
import { Typography } from '../../atoms/Typography/Typography';
import { MobileBottomSheet } from './MobileBottomSheet';

export default {
  title: 'Organisms/MobileBottomSheet',
  component: MobileBottomSheet,
  parameters: {
    layout: 'centered',
  },
};

const DemoContent = () => (
  <div style={{
    display: 'flex',
    minHeight: 0,
    flex: 1,
    flexDirection: 'column',
    gap: '16px',
    overflow: 'auto',
    padding: '0 16px 16px',
    background: 'var(--color-bg-panel)',
  }}>
    <div style={{
      margin: '0 -16px',
      padding: '16px',
      background: 'var(--color-panel-header-bg)',
      color: 'var(--color-panel-header-text)',
    }}>
      <Typography variant="h4" style={{ color: 'var(--color-panel-header-text)' }}>Block 4</Typography>
      <Typography variant="caption" style={{ color: 'var(--color-panel-header-text)' }}>Sierra Orchards</Typography>
    </div>
    <Typography variant="body-sm">Full sheet content scrolls independently from the map beneath it.</Typography>
    <Button variant="primary">Assign Scouting</Button>
  </div>
);

const DockedSummary = () => (
  <div style={{
    display: 'flex',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    padding: '0 16px 12px',
    background: 'var(--color-panel-header-bg)',
    color: 'var(--color-panel-header-text)',
  }}>
    <div>
      <Typography variant="h4" style={{ color: 'var(--color-panel-header-text)' }}>Block 4</Typography>
      <Typography variant="caption" style={{ color: 'var(--color-panel-header-text)' }}>Sierra Orchards</Typography>
    </div>
    <Badge variant="high">high risk</Badge>
  </div>
);

function DockedAndFullDemo() {
  const [state, setState] = useState('half');
  const toggle = () => setState((current) => current === 'full' ? 'half' : 'full');

  return (
    <div style={{
      position: 'relative',
      width: 390,
      height: 760,
      overflow: 'hidden',
      borderRadius: 24,
      background: '#d9e2d7',
      boxShadow: 'var(--shadow-lg)',
    }}>
      <MobileBottomSheet
        state={state}
        label="Block detail"
        onToggle={toggle}
        dockedSummary={<DockedSummary />}
      >
        <DemoContent />
      </MobileBottomSheet>
    </div>
  );
}

export const DockedAndFull = {
  render: () => <DockedAndFullDemo />,
};
