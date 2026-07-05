import React from 'react';
import { ScoutingAssignmentModal } from './ScoutingAssignmentModal';
import { blocks } from '../../../fixtures/rapidAimFixtures';

export default {
  title: 'Organisms/ScoutingAssignmentModal',
  component: ScoutingAssignmentModal,
};

export const Desktop = {
  args: {
    entityName: `${blocks[0].ranchName} / ${blocks[0].name}`,
    riskLevel: blocks[0].riskLevel,
    pestName: blocks[0].pestName,
  },
};

export const Mobile = {
  args: {
    entityName: blocks[0].name,
    riskLevel: blocks[0].riskLevel,
    pestName: 'Female NOW',
    compact: true,
  },
};
