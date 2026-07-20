import React from 'react';
import { HandoffIndex } from '../../../handoff/HandoffIndex';

export default {
  title: 'Pages/Desktop Map',
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
    initialPageId: 'consolidated-pest-pressure-ranking',
  },
};

export const OrganizationDetail = {
  args: {
    initialPageId: 'consolidated-organization',
  },
};

export const RanchDetail = {
  args: {
    initialPageId: 'consolidated-ranch',
  },
};

export const BlockDetail = {
  args: {
    initialPageId: 'consolidated-block',
  },
};

export const SensorDetail = {
  args: {
    initialPageId: 'consolidated-sensor',
  },
};

export const SensorDetailHealth = {
  args: {
    initialPageId: 'consolidated-sensor-health',
  },
};
