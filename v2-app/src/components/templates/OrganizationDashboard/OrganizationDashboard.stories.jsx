import React from 'react';
import { OrganizationDashboard } from './OrganizationDashboard';

export default {
  title: 'Templates/OrganizationDashboard',
  component: OrganizationDashboard,
  parameters: {
    layout: 'fullscreen',
  },
};

const Template = (args) => <OrganizationDashboard {...args} />;

export const Default = Template.bind({});
Default.args = {};
