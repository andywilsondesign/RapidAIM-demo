import React from 'react';
import { ControlCenter } from './ControlCenter';

export default {
  title: 'Organisms/ControlCenter',
  component: ControlCenter,
  parameters: {
    layout: 'fullscreen',
  },
};

const Template = (args) => (
  <div style={{ height: '600px', width: '320px', padding: '16px', background: 'var(--color-bg-base)' }}>
    <ControlCenter {...args} />
  </div>
);

export const Default = Template.bind({});
Default.args = {};

export const ScopeExperiment = Template.bind({});
ScopeExperiment.args = {
  mode: 'scopeExperiment',
};
