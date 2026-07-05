import React from 'react';
import { TaskDropdown } from './TaskDropdown';
import { tasks } from '../../../fixtures/rapidAimFixtures';

export default {
  title: 'Organisms/TaskDropdown',
  component: TaskDropdown,
};

export const Empty = {
  args: {
    tasks: [],
  },
};

export const Populated = {
  args: {
    tasks,
  },
};
