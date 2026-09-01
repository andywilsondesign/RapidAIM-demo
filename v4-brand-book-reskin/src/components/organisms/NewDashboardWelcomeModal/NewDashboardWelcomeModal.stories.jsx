import React from 'react';
import { NewDashboardWelcomeModal } from './NewDashboardWelcomeModal';

export default {
  title: 'Organisms/New Dashboard Welcome Modal',
  component: NewDashboardWelcomeModal,
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['betaPrompt', 'welcome'],
    },
  },
  parameters: {
    layout: 'fullscreen',
  },
};

export const OldDashboardPrompt = {
  args: {
    variant: 'betaPrompt',
  },
};

export const FirstRun = {
  args: {
    variant: 'welcome',
  },
};
