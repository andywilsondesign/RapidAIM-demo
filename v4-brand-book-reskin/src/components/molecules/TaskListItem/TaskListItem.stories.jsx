import React from 'react';
import { TaskListItem } from './TaskListItem';
import { tasks } from '../../../fixtures/rapidAimFixtures';

export default {
  title: 'Molecules/TaskListItem',
  component: TaskListItem,
};

export const UrgentTask = {
  args: {
    task: tasks[0],
  },
};
