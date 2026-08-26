import React from 'react';
import { AccountForm } from './AccountForm';

export default {
  title: 'Organisms/AccountForm',
  component: AccountForm,
  argTypes: {
    onSubmit: { action: 'submitted' },
  },
};

const Template = (args) => <AccountForm {...args} />;

export const Default = Template.bind({});
Default.args = {};

export const WithError = Template.bind({});
WithError.args = {
  globalError: 'Failed to connect to the server. Please try again later.',
};

export const WithSuccess = Template.bind({});
WithSuccess.args = {
  successMessage: 'Your account settings have been saved successfully.',
};

export const SavingState = Template.bind({});
SavingState.args = {
  isSaving: true,
};
