import React from 'react';
import { HandoffIndex } from '../../../handoff/HandoffIndex';
import { AccountSettings } from './AccountSettings';

export default {
  title: 'Pages/Account Settings',
  component: HandoffIndex,
  args: {
    showNavigator: false,
  },
  parameters: {
    layout: 'fullscreen',
  },
};

export const Desktop = {
  args: {
    initialPageId: 'account',
  },
};

export const Mobile = {
  render: () => (
    <div style={{ width: 390, minHeight: 760, margin: '0 auto', overflow: 'hidden', border: '1px solid var(--color-border-subtle)', borderRadius: 24 }}>
      <AccountSettings />
    </div>
  ),
};
