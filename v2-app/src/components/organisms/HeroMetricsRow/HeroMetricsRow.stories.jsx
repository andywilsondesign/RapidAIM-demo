import React from 'react';
import { HeroMetricsRow } from './HeroMetricsRow';

export default {
  title: 'Organisms/HeroMetricsRow',
  component: HeroMetricsRow,
};

const Template = (args) => <HeroMetricsRow {...args} />;

export const Default = Template.bind({});
Default.args = {
  metrics: [
    { label: 'Group Asset Scale', value: '4 Ranches' },
    { label: 'Active Grid Health', value: '98%', trend: 2 },
    { label: 'Current Risk Status', value: 'Elevated' },
    { label: 'Active Field Logistics', value: '12 Tasks' },
  ],
};
