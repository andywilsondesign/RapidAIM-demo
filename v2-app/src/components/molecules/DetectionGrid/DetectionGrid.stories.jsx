import React from 'react';
import { DetectionGrid } from './DetectionGrid';
import { detectionGrid, sensorDetectionGrid } from '../../../fixtures/rapidAimFixtures';

export default {
  title: 'Molecules/DetectionGrid',
  component: DetectionGrid,
};

export const RanchDetections = {
  args: {
    rows: detectionGrid,
  },
};

export const SensorDetections = {
  args: {
    rows: sensorDetectionGrid,
    firstColumnLabel: 'Name',
    showStatus: true,
    timezone: 'America/Los_Angeles',
  },
};
