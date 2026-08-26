import React from 'react';
import { DetailPanel } from './DetailPanel';

export default {
  title: 'Organisms/DetailPanel',
  component: DetailPanel,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    riskLevel: {
      control: { type: 'select' },
      options: ['high', 'medium', 'low'],
    },
    onClose: { action: 'closed' },
    onAssignTask: { action: 'assignTaskClicked' },
  },
};

const Template = (args) => (
  <div style={{ height: '800px', width: '400px', borderRight: '1px solid #ccc' }}>
    <DetailPanel {...args} />
  </div>
);

export const Default = Template.bind({});
Default.args = {
  title: 'Block 4',
  subtitle: 'Sunshine Valley Ranch',
  riskLevel: 'high',
};
