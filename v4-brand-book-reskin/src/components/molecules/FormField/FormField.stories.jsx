import React from 'react';
import { FormField } from './FormField';
import { Input } from '../../atoms/Input/Input';

export default {
  title: 'Molecules/FormField',
  component: FormField,
  argTypes: {
    label: { control: 'text' },
    error: { control: 'text' },
    helpText: { control: 'text' },
  },
};

const Template = (args) => (
  <FormField {...args}>
    <Input placeholder="Enter value..." error={!!args.error} />
  </FormField>
);

export const Default = Template.bind({});
Default.args = {
  label: 'Email Address',
  helpText: 'We will never share your email.',
};

export const WithError = Template.bind({});
WithError.args = {
  label: 'Email Address',
  error: 'Please enter a valid email address.',
};
