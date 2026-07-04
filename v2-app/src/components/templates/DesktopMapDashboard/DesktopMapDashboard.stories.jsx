import React from 'react';
import { DesktopMapDashboard } from './DesktopMapDashboard';

export default {
  title: 'Templates/DesktopMapDashboard',
  component: DesktopMapDashboard,
  parameters: {
    layout: 'fullscreen',
  },
};

const Template = (args) => <DesktopMapDashboard {...args} />;

export const Default = Template.bind({});
Default.args = {};
