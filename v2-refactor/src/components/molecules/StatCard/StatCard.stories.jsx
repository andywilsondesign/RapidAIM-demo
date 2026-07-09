import React from 'react';
import { StatCard } from './StatCard';

export default {
  title: 'Molecules/StatCard',
  component: StatCard,
  argTypes: {
    label: { control: 'text' },
    value: { control: 'text' },
    trend: { control: 'number' },
    trendContext: { control: 'text' },
    trendLabel: { control: 'text' },
    benchmark: { control: 'text' },
  },
};

const Template = (args) => <StatCard {...args} />;

export const Default = Template.bind({});
Default.args = {
  label: 'Active Sensors',
  value: '24',
};

export const WithPositiveTrend = Template.bind({});
WithPositiveTrend.args = {
  label: 'Pest Detections',
  value: '1,024',
  trend: 12,
  trendContext: 'vs last week',
  benchmark: 'Farm average: 45',
};

export const WithNegativeTrend = Template.bind({});
WithNegativeTrend.args = {
  label: 'Pest Detections',
  value: '840',
  trend: -5,
};
