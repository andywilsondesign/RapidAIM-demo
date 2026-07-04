import React, { useState, useMemo } from 'react';

// --- MOCK DATA ---
const RANCH_LIST = [
  {
    id: 'R1',
    name: 'Sunshine Valley Ranch',
    urgency: 'CRITICAL',
    badgeStyle: 'bg-red-50 text-red-700 border-red-200',
    dotStyle: 'bg-red-600 animate-pulse',
    count: 98,
    blocks: 12,
    activeSensors: 144,
    uptime: '99.2%',
    trend: '+24%',
    desc: 'Spike detected in Block 4 & Block 8. Pheromone trap thresholds exceeded.',
    color: '#E03131'
  },
  {
    id: 'R2',
    name: 'Golden Harvest Farms',
    urgency: 'WARNING',
    badgeStyle: 'bg-amber-50 text-amber-700 border-amber-200',
    dotStyle: 'bg-amber-500',
    count: 52,
    blocks: 14,
    activeSensors: 180,
    uptime: '98.8%',
    trend: '+5%',
    desc: 'Mild fluctuation in walnut orchards. Traps approaching monitor limits.',
    color: '#F08C00'
  },
  {
    id: 'R3',
    name: 'Sierra Orchards',
    urgency: 'STABLE',
    badgeStyle: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dotStyle: 'bg-emerald-600',
    count: 18,
    blocks: 10,
    activeSensors: 126,
    uptime: '99.5%',
    trend: '-3%',
    desc: 'No major surge. Pest activity remains below the standard grid threshold.',
    color: '#0F5A47'
  },
  {
    id: 'R4',
    name: 'Pacific Ag Vineyards',
    urgency: 'STABLE',
    badgeStyle: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dotStyle: 'bg-emerald-600',
    count: 8,
    blocks: 12,
    activeSensors: 170,
    uptime: '97.4%',
    trend: 'Flat',
    desc: 'Stable pressure level. Standard field scouting intervals maintained.',
    color: '#2BA082'
  }
];

const DAILY_LABELS = Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`);

// Mock daily trajectories for each ranch (30 data points)
const TRAJECTORY_DATA = {
  R1: [45, 42, 40, 38, 35, 30, 28, 29, 32, 35, 38, 41, 48, 55, 62, 70, 82, 95, 105, 110, 108, 102, 99, 98, 97, 95, 96, 94, 95, 98],
  R2: [30, 32, 31, 33, 35, 34, 37, 40, 42, 41, 44, 46, 45, 48, 51, 53, 52, 50, 48, 49, 52, 54, 53, 51, 53, 55, 54, 52, 53, 52],
  R3: [15, 16, 18, 15, 17, 19, 18, 20, 22, 21, 20, 22, 24, 25, 23, 22, 21, 19, 20, 22, 24, 23, 21, 20, 18, 19, 21, 20, 19, 18],
  R4: [10, 11, 9, 8, 10, 12, 11, 10, 9, 8, 7, 9, 11, 10, 9, 8, 8, 9, 11, 12, 10, 9, 8, 8, 7, 8, 9, 8, 8, 8]
};

export default function OrganizationDashboard() {
  const [selectedRanchId, setSelectedRanchId] = useState('R1');
  const [hoveredDayIndex, setHoveredDayIndex] = useState(null);

  const selectedRanch = useMemo(() => {
    return RANCH_LIST.find((r) => r.id === selectedRanchId);
  }, [selectedRanchId]);

  // --- SVG Line Chart Math ---
  const chartHeight = 220;
  const chartWidth = 700;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const pointsForRanch = (ranchId) => {
    const data = TRAJECTORY_DATA[ranchId];
    const points = [];
    const usableWidth = chartWidth - paddingLeft - paddingRight;
    const usableHeight = chartHeight - paddingTop - paddingBottom;
    const maxVal = 120;

    for (let i = 0; i < data.length; i++) {
      const x = paddingLeft + (i / (data.length - 1)) * usableWidth;
      const y = paddingTop + usableHeight - (data[i] / maxVal) * usableHeight;
      points.push({ x, y, value: data[i] });
    }
    return points;
  };

  const createSvgPath = (points) => {
    return points.reduce((pathStr, pt, i) => {
      if (i === 0) return `M ${pt.x} ${pt.y}`;
      // Midpoint for smooth bezier curves
      const prev = points[i - 1];
      const cpX1 = prev.x + (pt.x - prev.x) / 2;
      const cpY1 = prev.y;
      const cpX2 = prev.x + (pt.x - prev.x) / 2;
      const cpY2 = pt.y;
      return `${pathStr} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${pt.x} ${pt.y}`;
    }, '');
  };

  const activePaths = useMemo(() => {
    return RANCH_LIST.map((r) => {
      const pts = pointsForRanch(r.id);
      return {
        ranchId: r.id,
        color: r.color,
        name: r.name,
        points: pts,
        pathData: createSvgPath(pts)
      };
    });
  }, []);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPos = e.clientX - rect.left - paddingLeft;
    const usableWidth = rect.width - paddingLeft - paddingRight;
    if (xPos >= 0 && xPos <= usableWidth) {
      const dayPct = xPos / usableWidth;
      const index = Math.min(29, Math.max(0, Math.round(dayPct * 29)));
      setHoveredDayIndex(index);
    }
  };

  const handleMouseLeave = () => {
    setHoveredDayIndex(null);
  };

  return (
    <div className="h-screen w-full bg-[#f4f7f6] flex flex-col overflow-hidden font-sans text-[#111815]">
      
      {/* 1. TOP HEADER BAR */}
      <header className="flex-none bg-white/70 backdrop-blur-md border-b border-black/5 px-6 py-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-[#0F5A47] flex items-center justify-center p-1.5 shadow-sm shadow-[#0f5a47]/20">
            <span className="material-symbols-rounded text-white text-xl">corporate_fare</span>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-[#111815]">RapidAIM</h1>
            <p className="text-xs text-[#4A5B53] font-medium tracking-wide uppercase">Organization Dashboard</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-[#0F5A47]/5 border border-[#0F5A47]/10 px-3 py-1.5 rounded-full text-xs font-semibold text-[#0F5A47]">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Live Enterprise Sync
          </div>
          <div className="h-8 w-px bg-black/10"></div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-[#2BA082]/10 border border-[#2BA082]/30 flex items-center justify-center font-bold text-[#0F5A47] text-sm">
              YH
            </div>
            <span className="text-xs font-semibold text-[#4A5B53] hidden md:inline">Yuechen Hu</span>
          </div>
        </div>
      </header>

      {/* 2. TOP HERO METRICS ROW (Full Width) */}
      <section className="flex-none p-6 pb-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1 */}
        <div className="bg-white/80 backdrop-blur-sm border border-black/5 rounded-xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="h-12 w-12 rounded-lg bg-[#0F5A47]/5 text-[#0F5A47] flex items-center justify-center border border-[#0f5a47]/10">
            <span className="material-symbols-rounded text-2xl">grid_view</span>
          </div>
          <div>
            <p className="text-xs font-bold text-[#4A5B53] uppercase tracking-wide">Group Asset Scale</p>
            <h3 className="text-xl font-bold mt-0.5">4 Ranches / 48 Blocks</h3>
            <p className="text-xs text-[#4A5B53]/80 mt-0.5">2,800 Total Managed Acres</p>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white/80 backdrop-blur-sm border border-black/5 rounded-xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="h-12 w-12 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
            <span className="material-symbols-rounded text-2xl">sensors</span>
          </div>
          <div>
            <p className="text-xs font-bold text-[#4A5B53] uppercase tracking-wide">Active Grid Health</p>
            <h3 className="text-xl font-bold mt-0.5">620 Sensors Connected</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              <span className="text-xs text-emerald-700 font-medium">98.5% Uptime</span>
            </div>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white/80 backdrop-blur-sm border border-black/5 rounded-xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="h-12 w-12 rounded-lg bg-red-50 text-red-600 flex items-center justify-center border border-red-100">
            <span className="material-symbols-rounded text-2xl">report_problem</span>
          </div>
          <div>
            <p className="text-xs font-bold text-[#4A5B53] uppercase tracking-wide">Current Risk Status</p>
            <h3 className="text-xl font-bold mt-0.5 text-red-600">🚨 8 Blocks Breached</h3>
            <p className="text-xs text-red-500/95 font-medium mt-0.5">Urgent Response Triggered</p>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white/80 backdrop-blur-sm border border-black/5 rounded-xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="h-12 w-12 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center border border-sky-100">
            <span className="material-symbols-rounded text-2xl">assignment</span>
          </div>
          <div>
            <p className="text-xs font-bold text-[#4A5B53] uppercase tracking-wide">Active Field Logistics</p>
            <h3 className="text-xl font-bold mt-0.5">12 Scouting Pending</h3>
            <p className="text-xs text-sky-700 font-medium mt-0.5">3 Work Orders Approved</p>
          </div>
        </div>

      </section>

      {/* 3 & 4. MAIN SPLIT BODY (70% Left, 30% Right) */}
      <main className="flex-1 flex overflow-hidden min-h-0">
        
        {/* LEFT PANEL - ANALYTICS CANVAS (70%) */}
        <section className="w-[70%] h-full overflow-y-auto p-6 pt-2 flex flex-col gap-6">
          
          {/* Top Chart Box: 30-Day Multi-Site Pest Pressure Trajectory */}
          <div className="bg-white/90 backdrop-blur-sm border border-black/5 rounded-2xl p-6 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-[#111815]">30-Day Multi-Site Pest Pressure Trajectory</h2>
                <p className="text-xs text-[#4A5B53]">Daily count aggregated at ranch scale. Multi-track comparison.</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-bold">
                {RANCH_LIST.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setSelectedRanchId(r.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-all duration-150 ${
                      selectedRanchId === r.id
                        ? 'border-black/10 bg-black/5 shadow-inner'
                        : 'border-transparent text-[#4A5B53] hover:text-[#111815]'
                    }`}
                  >
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: r.color }}></span>
                    {r.name.split(' ').slice(0, 2).join(' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom SVG Responsive Line Chart */}
            <div className="relative mt-2 flex justify-center w-full">
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="w-full h-auto select-none overflow-visible"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >
                {/* Horizontal Gridlines */}
                {[0, 20, 40, 60, 80, 100, 120].map((val) => {
                  const usableHeight = chartHeight - paddingTop - paddingBottom;
                  const y = paddingTop + usableHeight - (val / 120) * usableHeight;
                  return (
                    <g key={val} className="opacity-40">
                      <line
                        x1={paddingLeft}
                        y1={y}
                        x2={chartWidth - paddingRight}
                        y2={y}
                        stroke="#4A5B53"
                        strokeWidth="0.75"
                        strokeDasharray="4 4"
                      />
                      <text
                        x={paddingLeft - 8}
                        y={y + 4}
                        textAnchor="end"
                        fill="#4A5B53"
                        fontSize="9"
                        fontWeight="600"
                      >
                        {val}
                      </text>
                    </g>
                  );
                })}

                {/* X-Axis labels (selected days) */}
                {[0, 7, 14, 21, 29].map((idx) => {
                  const usableWidth = chartWidth - paddingLeft - paddingRight;
                  const x = paddingLeft + (idx / 29) * usableWidth;
                  return (
                    <text
                      key={idx}
                      x={x}
                      y={chartHeight - 8}
                      textAnchor="middle"
                      fill="#4A5B53"
                      fontSize="9"
                      fontWeight="600"
                      className="opacity-75"
                    >
                      Day {idx + 1}
                    </text>
                  );
                })}

                {/* Render Ranch Paths */}
                {activePaths.map((path) => {
                  const isSelected = path.ranchId === selectedRanchId;
                  return (
                    <path
                      key={path.ranchId}
                      d={path.pathData}
                      fill="none"
                      stroke={path.color}
                      strokeWidth={isSelected ? '3.5' : '1.5'}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="transition-all duration-200"
                      opacity={isSelected ? 1 : 0.25}
                    />
                  );
                })}

                {/* Vertical Intersect Line on hover */}
                {hoveredDayIndex !== null && (
                  <g>
                    {(() => {
                      const usableWidth = chartWidth - paddingLeft - paddingRight;
                      const x = paddingLeft + (hoveredDayIndex / 29) * usableWidth;
                      return (
                        <>
                          <line
                            x1={x}
                            y1={paddingTop}
                            x2={x}
                            y2={chartHeight - paddingBottom}
                            stroke="#0F5A47"
                            strokeWidth="1.5"
                            strokeDasharray="3 3"
                          />
                          {/* Anchor dots */}
                          {activePaths.map((path) => {
                            const pt = path.points[hoveredDayIndex];
                            const isSelected = path.ranchId === selectedRanchId;
                            return (
                              <circle
                                key={path.ranchId}
                                cx={pt.x}
                                cy={pt.y}
                                r={isSelected ? '5' : '3'}
                                fill={path.color}
                                stroke="#FFF"
                                strokeWidth="1.5"
                                className="transition-all duration-150"
                                opacity={isSelected ? 1 : 0.4}
                              />
                            );
                          })}
                        </>
                      );
                    })()}
                  </g>
                )}
              </svg>

              {/* Floating Tooltip Box */}
              {hoveredDayIndex !== null && (
                <div
                  className="absolute bg-white/95 border border-black/10 rounded-xl p-3 shadow-xl backdrop-blur-sm pointer-events-none text-xs flex flex-col gap-1.5 z-20 transition-all duration-75"
                  style={{
                    left: `${(hoveredDayIndex / 29) * 80 + 8}%`,
                    top: '20px'
                  }}
                >
                  <div className="font-bold text-[#111815] border-b border-black/5 pb-1">
                    Day {hoveredDayIndex + 1} Status
                  </div>
                  {RANCH_LIST.map((r) => {
                    const val = TRAJECTORY_DATA[r.id][hoveredDayIndex];
                    const isSelected = r.id === selectedRanchId;
                    return (
                      <div
                        key={r.id}
                        className={`flex items-center gap-4 justify-between font-medium ${
                          isSelected ? 'text-[#111815] font-bold' : 'text-[#4A5B53]'
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: r.color }}></span>
                          {r.name.split(' ').slice(0, 2).join(' ')}
                        </span>
                        <span>{val} pests</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Bottom Matrix Box: Systemic Portfolio Risk Matrix */}
          <div className="flex flex-col gap-3">
            <div>
              <h2 className="text-base font-bold text-[#111815]">Systemic Portfolio Risk Matrix (By Crop Type)</h2>
              <p className="text-xs text-[#4A5B53]">Crop-level distribution summary and response metrics.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              
              {/* Almonds */}
              <div className="bg-white/90 backdrop-blur-sm border border-black/5 border-l-4 border-l-emerald-600 rounded-xl p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-200">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">STABLE</span>
                    <span className="material-symbols-rounded text-emerald-700 text-sm">eco</span>
                  </div>
                  <h4 className="text-sm font-bold text-[#111815]">Almonds Portfolio</h4>
                  <p className="text-xs text-[#4A5B53] mt-2 font-medium">Stable across 2,200 acres. Pressure index is 12% below historic average.</p>
                </div>
                <div className="mt-4 pt-3 border-t border-black/5 flex items-center justify-between text-[11px] font-semibold text-[#4A5B53]">
                  <span>24 Active Traps</span>
                  <span className="text-emerald-700 font-bold">12 Avg Count</span>
                </div>
              </div>

              {/* Walnuts */}
              <div className="bg-white/90 backdrop-blur-sm border border-black/5 border-l-4 border-l-amber-500 rounded-xl p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-200">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">MONITOR</span>
                    <span className="material-symbols-rounded text-amber-500 text-sm">eco</span>
                  </div>
                  <h4 className="text-sm font-bold text-[#111815]">Walnuts Portfolio</h4>
                  <p className="text-xs text-[#4A5B53] mt-2 font-medium">Moderate variance detected in Sector B. Last night count: 48 (threshold: 70).</p>
                </div>
                <div className="mt-4 pt-3 border-t border-black/5 flex items-center justify-between text-[11px] font-semibold text-[#4A5B53]">
                  <span>14 Active Traps</span>
                  <span className="text-amber-600 font-bold">42 Avg Count</span>
                </div>
              </div>

              {/* Citrus */}
              <div className="bg-white/90 backdrop-blur-sm border-l-4 border-l-red-600 border border-red-200/60 rounded-xl p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-200 animate-pulse-subtle">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-red-800 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full animate-pulse">CRITICAL</span>
                    <span className="material-symbols-rounded text-red-600 text-sm">report</span>
                  </div>
                  <h4 className="text-sm font-bold text-[#111815]">Citrus Portfolio</h4>
                  <p className="text-xs text-red-600 mt-2 font-semibold">CRITICAL: Citrus Gall Wasp surge across 3 properties. Immediate operational spraying advised.</p>
                </div>
                <div className="mt-4 pt-3 border-t border-red-100 flex items-center justify-between text-[11px] font-semibold text-red-600">
                  <span>10 Active Traps</span>
                  <span className="font-bold">98 Avg Count</span>
                </div>
              </div>

            </div>
          </div>

        </section>

        {/* RIGHT PANEL - OPERATIONAL CONTROL SIDEBAR (30%) */}
        <section className="w-[30%] h-full overflow-y-auto p-6 pt-2 bg-white/40 border-l border-black/5 flex flex-col gap-6">
          
          {/* Section A: Ranch Urgency Index */}
          <div className="flex flex-col gap-3">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#4A5B53]">Ranch Urgency Index</h2>
              <p className="text-[11px] text-[#4A5B53]/85">Priority ranked properties overview.</p>
            </div>
            
            <div className="flex flex-col gap-3">
              {RANCH_LIST.map((r) => {
                const isActive = r.id === selectedRanchId;
                return (
                  <div
                    key={r.id}
                    onClick={() => setSelectedRanchId(r.id)}
                    className={`cursor-pointer rounded-xl p-4 bg-white/80 border transition-all duration-150 ${
                      isActive
                        ? 'border-[#0F5A47] ring-1 ring-[#0F5A47] shadow-sm shadow-[#0f5a47]/5'
                        : 'border-black/5 hover:border-black/10 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold tracking-tight">{r.name}</span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${r.badgeStyle}`}>
                        {r.urgency}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between mt-3 text-xs">
                      <span className="text-[#4A5B53] font-medium">{r.blocks} Blocks • {r.activeSensors} Sensors</span>
                      <span className="flex items-center gap-1.5 font-bold">
                        <span className="text-[#4A5B53]/80">Count:</span>
                        <span style={{ color: r.color }}>{r.count}</span>
                      </span>
                    </div>

                    {/* Detailed slide-out stats on active selection */}
                    {isActive && (
                      <div className="mt-3 pt-3 border-t border-black/5 flex flex-col gap-2 animate-fadeIn text-[11px] text-[#4A5B53]">
                        <p className="italic text-[#111815]/90">{r.desc}</p>
                        <div className="grid grid-cols-2 gap-2 mt-1">
                          <div className="bg-[#f4f7f6] p-2 rounded-lg">
                            <p className="text-[9px] font-bold text-[#4A5B53]/70 uppercase">Uptime</p>
                            <p className="text-xs font-extrabold text-[#111815]">{r.uptime}</p>
                          </div>
                          <div className="bg-[#f4f7f6] p-2 rounded-lg">
                            <p className="text-[9px] font-bold text-[#4A5B53]/70 uppercase">30d Trend</p>
                            <p className={`text-xs font-extrabold ${r.trend.startsWith('+') ? 'text-red-600' : 'text-emerald-700'}`}>
                              {r.trend}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section B: Live Task Pipeline */}
          <div className="flex flex-col gap-3">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#4A5B53]">Live Task Pipeline</h2>
              <p className="text-[11px] text-[#4A5B53]/85">Active assignments and task workflows.</p>
            </div>
            
            <div className="bg-white/80 rounded-xl p-4 border border-black/5 shadow-sm flex flex-col gap-4">
              
              {/* Task Tracker 1 */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Scouting Assignments
                  </span>
                  <span className="text-[#0F5A47]">65% Done</span>
                </div>
                <div className="h-2 w-full bg-[#f4f7f6] rounded-full overflow-hidden">
                  <div className="h-full bg-[#0F5A47] rounded-full" style={{ width: '65%' }}></div>
                </div>
                <p className="text-[10px] text-[#4A5B53]/90 mt-1 font-semibold">12 Active Tasks, 8 Scouts Deployed in Field</p>
              </div>

              {/* Task Tracker 2 */}
              <div className="pt-3 border-t border-black/5">
                <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                    Spraying Work Orders
                  </span>
                  <span className="text-amber-600">3 Approved</span>
                </div>
                <p className="text-[10px] text-[#4A5B53]/90 font-semibold">1 In-Progress, 2 Scheduled for Next 48 Hours</p>
              </div>

              {/* Task Tracker 3 */}
              <div className="pt-3 border-t border-black/5">
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-rounded text-emerald-700 text-sm">check_circle</span>
                    Resolved Incidents
                  </span>
                  <span className="text-emerald-700">15 Resolved</span>
                </div>
                <p className="text-[10px] text-[#4A5B53]/80">This week. Click to view historical scout logs.</p>
              </div>

            </div>
          </div>

        </section>

      </main>

      {/* Styled inline keyframes for custom component-level micro-animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
        @keyframes pulseSubtle {
          0%, 100% { border-color: rgba(220, 38, 38, 0.4); box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05); }
          50% { border-color: rgba(220, 38, 38, 0.8); box-shadow: 0 0 8px 0 rgba(220, 38, 38, 0.15); }
        }
        .animate-pulse-subtle {
          animation: pulseSubtle 3s infinite ease-in-out;
        }
      ` }} />

    </div>
  );
}
