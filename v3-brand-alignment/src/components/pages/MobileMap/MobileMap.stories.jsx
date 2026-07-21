import React from 'react';
import { HandoffIndex } from '../../../handoff/HandoffIndex';

export default {
  title: 'Pages/Mobile Map',
  component: HandoffIndex,
  args: {
    showNavigator: false,
  },
  parameters: {
    layout: 'fullscreen',
  },
};

export const PestPressureRanking = {
  args: {
    initialPageId: 'mobile-pest-pressure-ranking',
  },
};

export const OrganizationDetail = {
  args: {
    initialPageId: 'mobile-organization',
  },
};

export const RanchDetail = {
  args: {
    initialPageId: 'mobile-ranch',
  },
};

export const BlockDetail = {
  args: {
    initialPageId: 'mobile-block',
  },
};

export const SensorDetail = {
  args: {
    initialPageId: 'mobile-sensor',
  },
};

export const Overlays = {
  args: {
    initialPageId: 'mobile-overlays',
  },
};
