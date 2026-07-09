import React from 'react';
import { ReportModal } from './ReportModal';
import { report } from '../../../fixtures/rapidAimFixtures';

export default {
  title: 'Organisms/ReportModal',
  component: ReportModal,
};

export const Loading = {
  args: {
    report,
    loading: true,
  },
};

export const Complete = {
  args: {
    report,
  },
};
