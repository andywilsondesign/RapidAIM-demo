import React from 'react';
import { RankingListItem } from './RankingListItem';

export default {
  title: 'Molecules/RankingListItem',
  component: RankingListItem,
  argTypes: {
    rank: { control: 'number' },
    title: { control: 'text' },
    subtitle: { control: 'text' },
    riskLevel: {
      control: { type: 'select' },
      options: ['high', 'medium', 'low'],
    },
    onClick: { action: 'clicked' },
  },
};

const Template = (args) => <RankingListItem {...args} />;

export const HighRisk = Template.bind({});
HighRisk.args = {
  rank: 1,
  title: 'Ranch Alpha - Block 4',
  subtitle: '124 Detections',
  riskLevel: 'high',
};

export const MediumRisk = Template.bind({});
MediumRisk.args = {
  rank: 2,
  title: 'Ranch Beta - Block 2',
  subtitle: '45 Detections',
  riskLevel: 'medium',
};

export const LowRisk = Template.bind({});
LowRisk.args = {
  rank: 3,
  title: 'Ranch Gamma - Block 1',
  subtitle: '12 Detections',
  riskLevel: 'low',
};
