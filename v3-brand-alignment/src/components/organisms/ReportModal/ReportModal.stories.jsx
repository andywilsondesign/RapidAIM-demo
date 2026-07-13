import React from 'react';
import { HandoffIndex } from '../../../handoff/HandoffIndex';

export default {
  title: 'Organisms/ReportModal',
  component: HandoffIndex,
  parameters: {
    layout: 'fullscreen',
  },
};

export const AiReportModal = {
  args: {
    initialPageId: 'report',
  },
};
