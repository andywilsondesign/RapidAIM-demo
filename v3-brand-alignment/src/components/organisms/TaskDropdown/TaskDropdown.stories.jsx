import React from 'react';
import { HandoffIndex } from '../../../handoff/HandoffIndex';

export default {
  title: 'Organisms/TaskDropdown',
  component: HandoffIndex,
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
