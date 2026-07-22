import React from 'react';
import { HandoffIndex } from '../../../handoff/HandoffIndex';

export default {
  title: 'Organisms/ScoutingAssignmentModal',
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
    initialPageId: 'scouting',
  },
};

export const Mobile = {
  args: {
    initialPageId: 'scouting-mobile',
  },
};
