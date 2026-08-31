import React from 'react';
import { MapUnavailableState } from './MapUnavailableState';

export default {
  title: 'Organisms/Map Unavailable State',
  component: MapUnavailableState,
  parameters: {
    layout: 'fullscreen',
  },
};

export const ConnectionIssue = {
  args: {
    variant: 'connection',
  },
};

export const OnboardingSetup = {
  args: {
    variant: 'onboarding',
  },
};

export const WaitingForData = {
  args: {
    variant: 'waitingForData',
  },
};

export const SubscriptionPaused = {
  args: {
    variant: 'paused',
  },
};
