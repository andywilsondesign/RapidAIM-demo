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
      {
        label: 'Battery',
        value: `${sensors[0].battery}%`,
        tone: 'positive',
        infoTitle: 'Battery',
        infoDescription: 'Battery level remaining on the device. Healthy is 30% or above, warning is below 30%, and critical/offline is 10% or below.',
      },
      {
        label: 'Connectivity',
        value: sensors[0].signal,
        tone: 'positive',
        infoTitle: 'Connectivity',
        infoDescription: 'Current LTE upload state for this sensor. Historical connectivity can be reviewed in the sensor detail chart.',
      },
      {
        label: 'Device Health',
        value: 'Healthy',
        tone: 'positive',
        infoTitle: 'Device health',
        infoDescription: 'Whether the device is responding normally, including reported faults and unusual upload behaviour.',
      },
      {
        label: 'Last Sync',
        value: sensors[0].lastSync,
        tone: 'positive',
        infoTitle: 'Last sync',
        infoDescription: 'How recently the sensor uploaded data. Longer gaps can indicate connectivity or device issues.',
      },
    ],
  },
};
