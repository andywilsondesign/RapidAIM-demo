import React from 'react';
import { WeatherWidget } from './WeatherWidget';
import { weather } from '../../../fixtures/rapidAimFixtures';

export default {
  title: 'Organisms/WeatherWidget',
  component: WeatherWidget,
};

export const Default = {
  args: {
    weather,
  },
};

export const Compact = {
  args: {
    weather,
    compact: true,
  },
};
