import React from 'react';
import { SearchBar } from './SearchBar';

export default {
  title: 'Molecules/SearchBar',
  component: SearchBar,
  argTypes: {
    placeholder: { control: 'text' },
    onChange: { action: 'changed' },
  },
};

const Template = (args) => <SearchBar {...args} />;

export const Default = Template.bind({});
Default.args = {
  placeholder: 'Search ranches, blocks, or sensors...',
};
