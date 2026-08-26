import React from 'react';
import { TrendChart } from './TrendChart';

export default {
  title: 'Organisms/TrendChart',
  component: TrendChart,
  argTypes: {
    type: {
      control: { type: 'select' },
      options: ['bar', 'line'],
    },
    threshold: { control: 'number' },
  },
};

const Template = (args) => (
  <div style={{ height: '300px', width: '100%', maxWidth: '600px', border: '1px solid #ccc', padding: '16px' }}>
    <TrendChart {...args} />
  </div>
);

const generateLabels = (count, prefix = 'Day') => Array.from({ length: count }, (_, i) => `${prefix} ${i + 1}`);

export const DefaultBar = Template.bind({});
DefaultBar.args = {
  type: 'bar',
  title: '14-Day Detection Trend (Bar)',
  labels: generateLabels(14),
  data: [5, 12, 18, 24, 25, 26, 45, 50, 60, 48, 22, 15, 10, 8],
  threshold: 25, // Above 25 is amber, above 50 is red
};

export const RollingLine = Template.bind({});
RollingLine.args = {
  type: 'line',
  title: '3-Day Avg & 7-Day Rolling',
  labels: generateLabels(14),
  series: [
    {
      label: '3-Day Avg',
      data: [12, 16, 18, 24, 31, 42, 51, 58, 54, 44, 31, 24, 18, 14],
      color: '#2563EB',
    },
    {
      label: '7-Day Rolling',
      data: [10, 13, 16, 20, 25, 32, 39, 45, 47, 42, 36, 30, 24, 20],
      color: '#C2410C',
      dashed: true,
    },
  ],
  threshold: 25,
};

export const HourlyTrend = Template.bind({});
HourlyTrend.args = {
  type: 'bar',
  title: '24-Hour Hourly Detections',
  labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
  data: [6, 8, 12, 14, 16, 9, 5, 4, 6, 12, 18, 24, 28, 32, 30, 26, 21, 18, 14, 12, 10, 16, 20, 18],
  threshold: 25,
};
