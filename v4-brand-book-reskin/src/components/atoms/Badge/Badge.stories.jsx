import React from 'react';
import { Badge } from './Badge';

export default {
  title: 'Atoms/Badge',
  component: Badge,
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['high', 'medium', 'low', 'offline', 'neutral', 'entity', 'info', 'success', 'warning', 'error'],
    },
  },
};

const Template = (args) => <Badge {...args} />;

export const HighRisk = Template.bind({});
HighRisk.args = {
  children: 'High Risk',
  variant: 'high',
};

export const MediumRisk = Template.bind({});
MediumRisk.args = {
  children: 'Medium Risk',
  variant: 'medium',
};

export const LowRisk = Template.bind({});
LowRisk.args = {
  children: 'Low Risk',
  variant: 'low',
};

export const Offline = Template.bind({});
Offline.args = {
  children: 'Offline',
  variant: 'offline',
};

export const Entity = Template.bind({});
Entity.args = {
  children: 'Block 1',
  variant: 'entity',
};

export const Info = Template.bind({});
Info.args = {
  children: 'Info',
  variant: 'info',
};

export const Success = Template.bind({});
Success.args = {
  children: 'Success',
  variant: 'success',
};

export const Warning = Template.bind({});
Warning.args = {
  children: 'Warning',
  variant: 'warning',
};

export const Error = Template.bind({});
Error.args = {
  children: 'Error',
  variant: 'error',
};
