import React from 'react';
import { HandoffIndex } from '../../../brand-alignment/handoff/BrandHandoffIndex';

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
