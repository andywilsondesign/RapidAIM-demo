import React from 'react';
import { HandoffIndex } from '../../../handoff/HandoffIndex';

export default {
  title: 'Organisms/MaintenanceNoteModal',
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
    initialPageId: 'maintenance-note-modal',
  },
};

export const Mobile = {
  args: {
    initialPageId: 'maintenance-note-modal-mobile',
  },
};
