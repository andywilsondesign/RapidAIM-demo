import React from 'react';
import { Alert } from './Alert';

export default {
  title: 'Molecules/Alert',
  component: Alert,
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['info', 'success', 'warning', 'error'],
    },
    type: {
      control: { type: 'radio' },
      options: ['global', 'inline'],
    },
    onClose: { action: 'closed' },
  },
};

const Template = (args) => <Alert {...args} />;

export const InlineError = Template.bind({});
InlineError.args = {
  type: 'inline',
  variant: 'error',
  title: 'Validation Error',
  message: 'Please ensure all required fields are filled out correctly.',
};

export const GlobalWarning = Template.bind({});
GlobalWarning.args = {
  type: 'global',
  variant: 'warning',
  message: 'Sensor synchronization is currently delayed. Some data may be out of date.',
};
