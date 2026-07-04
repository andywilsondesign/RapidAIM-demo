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
  <div style={{ height: '600px', width: '320px', borderRight: '1px solid #ccc' }}>
    <ControlCenter {...args} />
  </div>
);

export const Default = Template.bind({});
Default.args = {};
