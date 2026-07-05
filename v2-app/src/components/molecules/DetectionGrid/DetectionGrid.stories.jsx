import React from 'react';
import { DetectionGrid } from './DetectionGrid';
import { detectionGrid } from '../../../fixtures/rapidAimFixtures';

export default {
  title: 'Molecules/DetectionGrid',
  component: DetectionGrid,
};

export const RanchDetections = {
  args: {
    rows: detectionGrid,
  },
};
