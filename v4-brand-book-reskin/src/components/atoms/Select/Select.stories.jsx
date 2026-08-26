import React from 'react';
import { Select } from './Select';

export default {
  title: 'Atoms/Select',
  component: Select,
  argTypes: {
    error: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
  },
};

const Template = (args) => <Select {...args} />;

export const Default = Template.bind({});
Default.args = {
  options: [
    { label: 'Option 1', value: '1' },
    { label: 'Option 2', value: '2' },
    { label: 'Option 3', value: '3' },
  ],
};

export const WithError = Template.bind({});
WithError.args = {
  options: [
    { label: 'Select an option', value: '' },
  ],
  error: true,
};
