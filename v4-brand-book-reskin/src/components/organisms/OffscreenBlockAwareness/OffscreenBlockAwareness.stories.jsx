import React from 'react';
import { OffscreenBlockAwareness } from './OffscreenBlockAwareness';

export default {
  title: 'Organisms/Offscreen Block Awareness',
  component: OffscreenBlockAwareness,
  parameters: {
    layout: 'fullscreen',
  },
};

export const Prototype = {
  render: () => (
    <div style={{ position: 'relative', minHeight: '720px', background: '#1f2937', overflow: 'hidden' }}>
      <OffscreenBlockAwareness />
    </div>
  ),
};
