import React from 'react';
import { HandoffIndex } from '../../../handoff/HandoffIndex';

export default {
  title: 'Pages/Account Settings',
  component: HandoffIndex,
  parameters: {
    layout: 'fullscreen',
  },
};

export const Desktop = {
  args: {
    initialPageId: 'account',
  },
};
