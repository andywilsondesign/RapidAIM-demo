import React from 'react';
import { ScopeNavigation } from './ScopeNavigation';

export default {
  title: 'Molecules/ScopeNavigation',
  component: ScopeNavigation,
  parameters: {
    layout: 'centered',
  },
};

const locationOptions = {
  organizations: [
    { label: 'RapidAIM Growers Co.' },
    { label: 'Apex Agriculture' },
    { label: 'Very Long Agricultural Organisation Name With Multiple Regions' },
  ],
  ranches: [
    { label: 'All ranches' },
    { label: 'Sierra Orchards' },
    { label: 'Sunshine Valley Ranch' },
  ],
  blocks: [
    { label: 'All blocks' },
    { label: 'Block 1 West' },
    { label: 'Block 4' },
    { label: 'Northwest Boundary Block With A Very Long Name' },
  ],
};

export const OrganizationScope = {
  args: {
    segments: [
      { label: 'RapidAIM Growers Co.', options: locationOptions.organizations },
      { label: 'All ranches', options: locationOptions.ranches },
      { label: 'All blocks', options: locationOptions.blocks },
    ],
  },
};

export const RanchScope = {
  args: {
    segments: [
      { label: 'RapidAIM Growers Co.', options: locationOptions.organizations },
      { label: 'Sierra Orchards', options: locationOptions.ranches },
      { label: 'All blocks', options: locationOptions.blocks },
    ],
  },
};

export const BlockScope = {
  args: {
    segments: [
      { label: 'RapidAIM Growers Co.', options: locationOptions.organizations },
      { label: 'Sierra Orchards', options: locationOptions.ranches },
      { label: 'Block 4', options: locationOptions.blocks },
    ],
  },
};

export const LongNames = {
  args: {
    segments: [
      { label: 'Very Long Agricultural Organisation Name With Multiple Regions', options: locationOptions.organizations },
      { label: 'Sunshine Valley Ranch', options: locationOptions.ranches },
      { label: 'Northwest Boundary Block With A Very Long Name', options: locationOptions.blocks },
    ],
  },
};
