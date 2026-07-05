import React from 'react';
import { HandoffIndex } from './HandoffIndex';

export default {
  title: 'Handoff/StaticPages',
  component: HandoffIndex,
  parameters: {
    layout: 'fullscreen',
  },
};

export const HandoffWorkspace = {};

export const DesktopRanking = {
  args: {
    initialPageId: 'desktop-ranking',
  },
};

export const DesktopBlockDetail = {
  args: {
    initialPageId: 'desktop-block',
  },
};

export const DesktopRanchDetail = {
  args: {
    initialPageId: 'desktop-ranch',
  },
};

export const DesktopSensorDetail = {
  args: {
    initialPageId: 'desktop-sensor',
  },
};

export const TasksDropdown = {
  args: {
    initialPageId: 'tasks',
  },
};

export const ScoutingModal = {
  args: {
    initialPageId: 'scouting',
  },
};

export const AiReportModal = {
  args: {
    initialPageId: 'report',
  },
};

export const MobileRanking = {
  args: {
    initialPageId: 'mobile-ranking',
  },
};

export const MobileDetail = {
  args: {
    initialPageId: 'mobile-detail',
  },
};

export const MobileOverlays = {
  args: {
    initialPageId: 'mobile-overlays',
  },
};

export const OrganizationDashboard = {
  args: {
    initialPageId: 'organization',
  },
};

export const AccountSettings = {
  args: {
    initialPageId: 'account',
  },
};
