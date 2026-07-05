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
      { label: 'Status', value: sensors[0].status },
      { label: 'Battery', value: `${sensors[0].battery}%` },
      { label: 'Signal', value: sensors[0].signal },
      { label: 'Last Sync', value: sensors[0].lastSync },
    ],
  },
};
