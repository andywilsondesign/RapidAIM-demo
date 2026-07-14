import React from 'react';
import { HandoffIndex } from '../../../handoff/HandoffIndex';

export default {
  title: 'Organisms/TaskDropdown',
  component: HandoffIndex,
  args: {
    showNavigator: false,
  },
  parameters: {
    layout: 'fullscreen',
  },
};

export const Desktop = {
  args: {
    initialPageId: 'tasks',
  },
};

export const Mobile = {
  args: {
    initialPageId: 'mobile-overlays',
  },
};
