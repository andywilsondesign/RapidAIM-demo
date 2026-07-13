import React from 'react';
import { HandoffIndex } from '../../../handoff/HandoffIndex';

export default {
  title: 'Pages/Mobile Map (TBC)',
  component: HandoffIndex,
  parameters: {
    layout: 'fullscreen',
  },
};

export const MobileRanking = {
  args: {
    initialPageId: 'mobile-ranking',
  },
};

export const MobileDetail = {
  args: {
    initialPageId: 'mobile-detail',
  },
};
