export const ranches = [
  {
    id: 'ranch-sierra',
    name: 'Sierra Orchards',
    organization: 'RapidAIM Growers Co.',
    riskLevel: 'high',
    currentCount: 124,
    activeSensors: 38,
    totalSensors: 42,
    blocks: 8,
    acreage: 520,
    trend: 24,
    summary: 'Elevated navel orangeworm pressure around the northeast block boundary.',
  },
  {
    id: 'ranch-sunshine',
    name: 'Sunshine Valley Ranch',
    organization: 'RapidAIM Growers Co.',
    riskLevel: 'medium',
    currentCount: 58,
    activeSensors: 31,
    totalSensors: 34,
    blocks: 7,
    acreage: 460,
    trend: 8,
    summary: 'Monitoring recommended as counts approach the field threshold.',
  },
  {
    id: 'ranch-golden',
    name: 'Golden Harvest Farms',
    organization: 'Apex Agriculture',
    riskLevel: 'low',
    currentCount: 18,
    activeSensors: 29,
    totalSensors: 30,
    blocks: 6,
    acreage: 390,
    trend: -5,
    summary: 'Stable pressure and normal scouting cadence.',
  },
];

export const blocks = [
  {
    id: 'block-sierra-4',
    name: 'Block 4',
    ranchId: 'ranch-sierra',
    ranchName: 'Sierra Orchards',
    crop: 'Almonds',
    riskLevel: 'high',
    currentCount: 124,
    activeSensors: 12,
    totalSensors: 14,
    pestName: 'Female Navel Orangeworm',
    trend: 18,
    trendLabel: 'up 18% since last week',
    benchmark: 'Farm average: 45',
    polygon: [
      [36.650, -119.804],
      [36.650, -119.795],
      [36.643, -119.795],
      [36.643, -119.804],
    ],
  },
  {
    id: 'block-sunshine-2',
    name: 'Block 2',
    ranchId: 'ranch-sunshine',
    ranchName: 'Sunshine Valley Ranch',
    crop: 'Pistachios',
    riskLevel: 'medium',
    currentCount: 58,
    activeSensors: 9,
    totalSensors: 10,
    pestName: 'Male Navel Orangeworm',
    trend: 8,
    benchmark: '11% above 14-day ranch average',
    polygon: [
      [36.625, -119.832],
      [36.625, -119.824],
      [36.619, -119.824],
      [36.619, -119.832],
    ],
  },
  {
    id: 'block-golden-1',
    name: 'Block 1',
    ranchId: 'ranch-golden',
    ranchName: 'Golden Harvest Farms',
    crop: 'Walnuts',
    riskLevel: 'low',
    currentCount: 18,
    activeSensors: 8,
    totalSensors: 8,
    pestName: 'Female Navel Orangeworm',
    trend: -5,
    benchmark: 'Below action threshold',
    polygon: [
      [36.604, -119.783],
      [36.604, -119.776],
      [36.598, -119.776],
      [36.598, -119.783],
    ],
  },
];

export const sensors = [
  {
    id: 'sensor-sierra-4-a',
    name: 'Sensor S4-A',
    blockId: 'block-sierra-4',
    blockName: 'Block 4',
    ranchName: 'Sierra Orchards',
    lat: 36.648,
    lng: -119.801,
    severity: 'high',
    count: 45,
    battery: 82,
    signal: 'Excellent',
    status: 'Online',
    lastSync: '12 min ago',
  },
  {
    id: 'sensor-sierra-4-b',
    name: 'Sensor S4-B',
    blockId: 'block-sierra-4',
    blockName: 'Block 4',
    ranchName: 'Sierra Orchards',
    lat: 36.646,
    lng: -119.798,
    severity: 'medium',
    count: 27,
    battery: 64,
    signal: 'Good',
    status: 'Online',
    lastSync: '18 min ago',
  },
  {
    id: 'sensor-sierra-4-c',
    name: 'Sensor S4-C',
    blockId: 'block-sierra-4',
    blockName: 'Block 4',
    ranchName: 'Sierra Orchards',
    lat: 36.644,
    lng: -119.802,
    severity: 'low',
    count: 8,
    battery: 0,
    signal: 'Offline',
    status: 'Needs Maintenance',
    lastSync: '2 days ago',
  },
];

export const chartSeries = {
  dayLabels: ['Jun 22', 'Jun 23', 'Jun 24', 'Jun 25', 'Jun 26', 'Jun 27', 'Jun 28', 'Jun 29', 'Jun 30', 'Jul 1', 'Jul 2', 'Jul 3', 'Jul 4', 'Jul 5'],
  blockTrend: [12, 18, 21, 24, 29, 35, 44, 52, 65, 72, 84, 96, 112, 124],
  rolling3Day: [17, 19, 21, 25, 29, 36, 44, 54, 63, 74, 84, 97, 111, 124],
  rolling7Day: [14, 16, 18, 21, 25, 30, 36, 43, 52, 62, 72, 83, 94, 106],
  hourlyLabels: ['0:00', '2:00', '4:00', '6:00', '8:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
  hourlyDistribution: [14, 18, 21, 12, 5, 4, 6, 8, 12, 19, 28, 31],
  organizationLabels: ['Day 1', 'Day 5', 'Day 10', 'Day 15', 'Day 20', 'Day 25', 'Day 30'],
  organizationTrend: [36, 42, 47, 58, 74, 92, 118],
};

export const detectionGrid = [
  { block: 'Block 1', days: [8, 10, 9, 12, 16, 18, 21] },
  { block: 'Block 2', days: [18, 22, 20, 24, 30, 34, 38] },
  { block: 'Block 3', days: [5, 6, 8, 8, 9, 10, 12] },
  { block: 'Block 4', days: [45, 52, 65, 72, 84, 96, 124] },
];

export const sensorDetectionGrid = [
  { block: 'Sensor S4-A', status: 'high', days: [18, 21, 24, 31, 42, 55, 68] },
  { block: 'Sensor S4-B', status: 'medium', days: [12, 14, 18, 28, 36, 44, 52] },
  { block: 'Sensor S4-C', status: 'low', days: [4, 6, 8, 8, 8, 8, 8] },
];

export const tasks = [
  {
    id: 'task-001',
    entityName: 'Sierra Orchards / Block 4',
    type: 'Pest Scouting',
    assignee: 'John Doe',
    priority: 'Urgent',
    status: 'Todo',
    notes: 'Inspect northeast perimeter and verify trap thresholds.',
  },
  {
    id: 'task-002',
    entityName: 'Sensor S4-C',
    type: 'Sensor Repair',
    assignee: 'Jane Smith',
    priority: 'Medium',
    status: 'In progress',
    notes: 'Battery offline for more than 48 hours.',
  },
];

export const report = {
  title: 'AI Insights Report',
  context: 'Sierra Orchards / Block 4',
  generatedAt: 'July 5, 2026, 09:42',
  summary: 'Pest pressure is rising quickly and is concentrated near the northeast edge of the block.',
  observations: [
    'Detection counts have increased for six consecutive recorded periods.',
    'One sensor in the selected block requires maintenance review.',
    'The latest count is above the recommended threshold of 25.',
  ],
  recommendations: [
    'Dispatch an urgent scouting task for Block 4.',
    'Prioritize trap inspection near the northeast perimeter.',
    'Review sensor S4-C before relying on the next field reading.',
  ],
};

export const weather = {
  location: 'Fresno, CA',
  condition: 'Partly Cloudy',
  temperature: '72°F',
};

export const users = {
  current: {
    initials: 'YH',
    name: 'Yuechen Hu',
  },
};
