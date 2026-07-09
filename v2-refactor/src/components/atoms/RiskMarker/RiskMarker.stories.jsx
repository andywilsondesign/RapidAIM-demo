import React from 'react';
import { RiskMarker } from './RiskMarker';

export default {
  title: 'Atoms/RiskMarker',
  component: RiskMarker,
  argTypes: {
    severity: {
      control: { type: 'select' },
      options: ['high', 'medium', 'low', 'offline'],
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md'],
    },
  },
};

const Template = (args) => <RiskMarker {...args} />;

export const High = Template.bind({});
High.args = {
  severity: 'high',
};

export const Medium = Template.bind({});
Medium.args = {
  severity: 'medium',
};

export const Low = Template.bind({});
Low.args = {
  severity: 'low',
};

export const Offline = Template.bind({});
Offline.args = {
  severity: 'offline',
};

export const MarkerSet = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center', padding: 24 }}>
      <RiskMarker severity="high" />
      <RiskMarker severity="medium" />
      <RiskMarker severity="low" />
      <RiskMarker severity="offline" />
    </div>
  ),
};

export const SelectedStates = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center', padding: 24 }}>
      <RiskMarker severity="high" selected />
      <RiskMarker severity="medium" selected />
      <RiskMarker severity="low" selected />
      <RiskMarker severity="offline" selected />
    </div>
  ),
};
