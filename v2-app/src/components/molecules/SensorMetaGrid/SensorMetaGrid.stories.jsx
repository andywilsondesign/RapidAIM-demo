import React from 'react';
import { SensorMetaGrid } from './SensorMetaGrid';
import { sensors } from '../../../fixtures/rapidAimFixtures';

export default {
  title: 'Molecules/SensorMetaGrid',
  component: SensorMetaGrid,
};

export const SensorStatus = {
  args: {
    items: [
      { label: 'Status', value: sensors[0].status, tone: 'positive' },
      { label: 'Battery', value: `${sensors[0].battery}%`, tone: 'positive' },
      { label: 'Signal', value: sensors[0].signal, tone: 'positive' },
      { label: 'Last Sync', value: sensors[0].lastSync, tone: 'positive' },
    ],
  },
};
