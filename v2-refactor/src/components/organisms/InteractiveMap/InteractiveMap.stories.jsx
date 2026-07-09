import React from 'react';
import { InteractiveMap } from './InteractiveMap';

export default {
  title: 'Organisms/InteractiveMap',
  component: InteractiveMap,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    blockSeverity: {
      control: { type: 'select' },
      options: ['high', 'medium', 'low'],
    },
    mapStyle: {
      control: { type: 'select' },
      options: ['satellite', 'stylized'],
    },
  },
};

const Template = (args) => (
  <div style={{ height: '600px', width: '100%' }}>
    <InteractiveMap {...args} />
  </div>
);

const FRESNO_CENTER = [36.7378, -119.7871];

// A dummy polygon for a farming block
const dummyBlockPolygon = [
  [36.740, -119.790],
  [36.740, -119.780],
  [36.730, -119.780],
  [36.730, -119.790],
];

const blockStateOverlays = [
  {
    id: 'block-high-default',
    label: 'Block 1',
    severity: 'high',
    state: 'default',
    positions: [
      [36.742, -119.795],
      [36.742, -119.788],
      [36.736, -119.788],
      [36.736, -119.795],
    ],
  },
  {
    id: 'block-medium-hover',
    label: 'Block 2',
    severity: 'medium',
    state: 'hover',
    positions: [
      [36.742, -119.787],
      [36.742, -119.780],
      [36.736, -119.780],
      [36.736, -119.787],
    ],
  },
  {
    id: 'block-low-selected',
    label: 'Block 3',
    severity: 'low',
    state: 'selected',
    positions: [
      [36.735, -119.795],
      [36.735, -119.788],
      [36.729, -119.788],
      [36.729, -119.795],
    ],
  },
];

// Dummy sensors scattered within the block
const dummySensors = [
  { id: 's1', lat: 36.738, lng: -119.788, name: 'Sensor 1', count: 45, severity: 'high' },
  { id: 's2', lat: 36.732, lng: -119.785, name: 'Sensor 2', count: 12, severity: 'medium' },
  { id: 's3', lat: 36.735, lng: -119.782, name: 'Sensor 3', count: 2, severity: 'low' },
  { id: 's4', lat: 36.739, lng: -119.781, name: 'Sensor 4', count: 58, severity: 'high' },
  { id: 's5', lat: 36.736, lng: -119.786, name: 'Sensor 5', count: 0, severity: 'offline' },
];

export const DefaultSatellite = Template.bind({});
DefaultSatellite.args = {
  center: FRESNO_CENTER,
  zoom: 14,
  blockPolygon: dummyBlockPolygon,
  sensors: dummySensors,
  blockSeverity: 'high',
  mapStyle: 'satellite',
};

export const StylizedMap = Template.bind({});
StylizedMap.args = {
  center: FRESNO_CENTER,
  zoom: 14,
  blockPolygon: dummyBlockPolygon,
  sensors: dummySensors,
  blockSeverity: 'low',
  mapStyle: 'stylized',
};

export const BlockInteractionStates = Template.bind({});
BlockInteractionStates.args = {
  center: FRESNO_CENTER,
  zoom: 15,
  blockOverlays: blockStateOverlays,
  activeBlockLabel: 'Block 3',
  sensors: dummySensors,
  mapStyle: 'satellite',
};
