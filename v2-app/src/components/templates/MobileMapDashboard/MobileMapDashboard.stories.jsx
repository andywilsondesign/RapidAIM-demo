import React from 'react';
import { MobileMapDashboard } from './MobileMapDashboard';

export default {
  title: 'Templates/MobileMapDashboard',
  component: MobileMapDashboard,
  parameters: {
    layout: 'centered',
  },
};

const Template = (args) => <MobileMapDashboard {...args} />;

export const Default = Template.bind({});
Default.args = {};
