import React from 'react';
import { Input } from './Input';

export default {
  title: 'Atoms/Input',
  component: Input,
  argTypes: {
    placeholder: { control: 'text' },
    error: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
  },
};

const Template = (args) => <Input {...args} />;

export const Default = Template.bind({});
Default.args = {
  placeholder: 'Enter text...',
};

export const WithError = Template.bind({});
WithError.args = {
  placeholder: 'Enter text...',
  error: true,
};
