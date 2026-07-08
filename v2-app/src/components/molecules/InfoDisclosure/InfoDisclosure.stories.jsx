import { InfoDisclosure } from './InfoDisclosure';

export default {
  title: 'Molecules/InfoDisclosure',
  component: InfoDisclosure,
  parameters: {
    layout: 'centered',
  },
  args: {
    title: 'AI recommendation',
    description: 'AI recommends a threshold of 25 based on recent pest pressure and block history.',
  },
};

export const Default = {};

export const StartAligned = {
  args: {
    align: 'start',
    title: 'Total detections',
    description: 'The total count compares the selected pest pressure against the previous 7-day period.',
  },
};
