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
    showStatus: true,
    timezone: 'America/Los_Angeles',
    description: 'Block-level detection data from the last seven days shown in America/Los_Angeles time.',
  },
};

export const SensorDetections = {
  args: {
    rows: sensorDetectionGrid,
    firstColumnLabel: 'Name',
    showStatus: true,
    timezone: 'America/Los_Angeles',
    description: 'Sensor data from the last seven days shown in America/Los_Angeles time.',
  },
};
