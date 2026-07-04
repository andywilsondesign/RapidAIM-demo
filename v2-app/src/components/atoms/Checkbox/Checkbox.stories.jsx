import React from 'react';
import { Checkbox } from './Checkbox';

export default {
  title: 'Atoms/Checkbox',
  component: Checkbox,
};

const Template = (args) => <Checkbox {...args} />;

export const Default = Template.bind({});
Default.args = {
  label: 'Accept Terms and Conditions',
};

export const Checked = Template.bind({});
Checked.args = {
  label: 'Remember Me',
  checked: true,
};
