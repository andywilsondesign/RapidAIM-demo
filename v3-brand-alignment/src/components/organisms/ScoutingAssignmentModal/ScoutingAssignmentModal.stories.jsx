import React from 'react';
import { HandoffIndex } from '../../../brand-alignment/handoff/BrandHandoffIndex';

export default {
  title: 'Organisms/ScoutingAssignmentModal',
  component: HandoffIndex,
  parameters: {
    layout: 'fullscreen',
  },
};

export const Desktop = {
  args: {
    initialPageId: 'scouting',
  },
};

export const Mobile = {
  args: {
    initialPageId: 'mobile-overlays',
  },
};
