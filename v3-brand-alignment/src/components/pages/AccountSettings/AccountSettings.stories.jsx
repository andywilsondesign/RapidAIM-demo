import React from 'react';
import { AccountSettings } from './AccountSettings';

export default {
  title: 'Pages/AccountSettings',
  component: AccountSettings,
  parameters: {
    layout: 'fullscreen',
  },
};

const Template = (args) => <AccountSettings {...args} />;

export const Default = Template.bind({});
Default.args = {};
