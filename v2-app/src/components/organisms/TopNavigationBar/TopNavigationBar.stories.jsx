import React from 'react';
import { TopNavigationBar } from './TopNavigationBar';

export default {
  title: 'Organisms/TopNavigationBar',
  component: TopNavigationBar,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    onSearch: { action: 'searched' },
    onMenuClick: { action: 'menuClicked' },
    onTasksClick: { action: 'tasksClicked' },
    onProfileClick: { action: 'profileClicked' },
  },
};

const Template = (args) => <TopNavigationBar {...args} />;

export const Default = Template.bind({});
Default.args = {
  organizationName: 'RapidAIM',
};
