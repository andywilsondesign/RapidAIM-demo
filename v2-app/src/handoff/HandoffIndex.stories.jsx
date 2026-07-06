import React from 'react';
import { HandoffIndex } from './HandoffIndex';
import { HierarchyBreadcrumb } from './HandoffBreadcrumb';

export default {
  title: 'Handoff/StaticPages',
  component: HandoffIndex,
  parameters: {
    layout: 'fullscreen',
  },
};

export const HandoffWorkspace = {};

export const DesktopOrganizationDetail = {
  args: {
    initialPageId: 'desktop-organization',
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

export const AccountSettings = {
  args: {
    initialPageId: 'account',
  },
};

export const LongHierarchyBreadcrumb = {
  render: () => (
    <div style={{
      position: 'relative',
      width: 430,
      height: 92,
      background: '#dce5df',
      padding: 20,
    }}>
      <HierarchyBreadcrumb
        items={[
          { label: 'RapidAim Growers Cooperative International West Coast Division' },
          { label: 'Sierra Orchards North Valley Experimental Ranch' },
          { label: 'Block 4 - Northeast Almond Trial Zone' },
        ]}
      />
    </div>
  ),
};
