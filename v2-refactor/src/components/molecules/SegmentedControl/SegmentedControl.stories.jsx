import React from 'react';
import { SegmentedControl } from './SegmentedControl';

export default {
  title: 'Molecules/SegmentedControl',
  component: SegmentedControl,
};

export const AssignmentType = {
  args: {
    ariaLabel: 'Assignment type',
    value: 'pest',
    options: [
      { label: 'Pest Scouting', value: 'pest' },
      { label: 'Trap Maintenance', value: 'trap' },
      { label: 'Sensor Repair', value: 'repair' },
    ],
  },
};
