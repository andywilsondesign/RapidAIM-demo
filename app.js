import { generateMockData } from './mockData.js';

// Application State
const state = {
    data: null,
    pestType: 'female-now', // 'female-now' or 'male-now'
    threshold: 70,
    activeFarmId: 'all',
    selectedItem: null, // { type: 'block' | 'sensor', id: string }
    mapZoom: 13,
    chartOffset: 0,
    layers: {
        heatmap: true,
        boundaries: true,
        sensors: true
    },
    scoutingAssignments: [],
    verificationPending: {}
};

let map;
let blockLayerGroup;
let sensorLayerGroup;
let trendChartInstance = null;
let avgRollingChartInstance = null;
let hourlyChartInstance = null;

// Initialize
function initApp() {
    state.data = generateMockData();
    initMap();
    initUI();
    renderRankingList();
    updateMapVisuals();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

function initMap() {
    map = L.map('map', {
        zoomControl: false // Create custom if needed, or hide
    }).setView([36.625, -119.80], 12);
    
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Using Esri World Imagery for satellite view
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri'
    }).addTo(map);

    blockLayerGroup = L.featureGroup().addTo(map);
    sensorLayerGroup = L.featureGroup().addTo(map);

    // Add map event listeners for zoom
    map.on('zoomend', () => {
        state.mapZoom = map.getZoom();
        updateMapVisuals(); // Toggle sensor visibility based on zoom
    });
}

function initUI() {
    // Populate Farm Filter
    const farmFilter = document.getElementById('filter-farm');
    state.data.ranches.forEach(ranch => {
        const option = document.createElement('option');
        option.value = ranch.id;
        option.textContent = ranch.name;
        farmFilter.appendChild(option);
    });

    // Control Center Toggling
    const controlToggle = document.getElementById('control-toggle');
    const controlCenter = document.querySelector('.control-center');
    controlToggle.addEventListener('click', () => {
        controlCenter.classList.toggle('collapsed');
    });

    // Layers Accordion
    const layersToggle = document.getElementById('layers-toggle');
    const layersList = document.getElementById('layers-list');
    const layersIcon = layersToggle.querySelector('.material-symbols-rounded');
    layersToggle.addEventListener('click', () => {
        layersList.classList.toggle('hidden');
        layersIcon.textContent = layersList.classList.contains('hidden') ? 'chevron_right' : 'expand_more';
    });

    // Threshold Slider
    const slider = document.getElementById('threshold-slider');
    const sliderValue = document.getElementById('threshold-value');
    slider.addEventListener('input', (e) => {
        state.threshold = parseInt(e.target.value);
        sliderValue.textContent = state.threshold;
        renderRankingList();
        updateMapVisuals();
    });

    // Filters
    document.getElementById('filter-pest').addEventListener('change', (e) => {
        state.pestType = e.target.value;
        renderRankingList();
        updateMapVisuals();
        if(state.selectedItem) renderDetailView(state.selectedItem);
    });
    
    // Organisation Filter (Mocked)
    const orgFilter = document.getElementById('filter-organisation');
    if (orgFilter) {
        orgFilter.addEventListener('change', (e) => {
            console.log(`Organisation changed to: ${e.target.value}`);
        });
    }

    farmFilter.addEventListener('change', (e) => {
        state.activeFarmId = e.target.value;
        renderRankingList();
        updateMapVisuals();
    });

    // Layers Checkboxes
    document.getElementById('layer-heatmap').addEventListener('change', e => { state.layers.heatmap = e.target.checked; updateMapVisuals(); });
    document.getElementById('layer-sensors').addEventListener('change', e => { state.layers.sensors = e.target.checked; updateMapVisuals(); });

    // Chart Date Range Navigation (Move to see historic data)
    const btnPrev = document.getElementById('btn-chart-prev');
    const btnNext = document.getElementById('btn-chart-next');
    if (btnPrev && btnNext) {
        btnPrev.addEventListener('click', () => {
            state.chartOffset = Math.min(state.chartOffset + 1, 16);
            if (state.selectedItem) renderDetailView(state.selectedItem);
        });
        btnNext.addEventListener('click', () => {
            state.chartOffset = Math.max(state.chartOffset - 1, 0);
            if (state.selectedItem) renderDetailView(state.selectedItem);
        });
    }

    // Back Panel Navigation
    document.getElementById('btn-back-panel').addEventListener('click', () => {
        if (state.selectedItem && state.selectedItem.type === 'ranch') {
            selectBlock(state.selectedItem.fromBlockId);
        } else if (state.selectedItem && state.selectedItem.type === 'sensor') {
            selectBlock(state.selectedItem.parentId);
        } else if (state.selectedItem && state.selectedItem.type === 'organisation') {
            const firstBlock = state.data.blocks.find(b => b.ranchId === state.selectedItem.fromRanchId);
            const fromBlockId = firstBlock ? firstBlock.id : state.data.blocks[0].id;
            selectRanch(state.selectedItem.fromRanchId, fromBlockId);
        } else {
            state.selectedItem = null;
            document.getElementById('ranking-view').classList.remove('hidden');
            document.getElementById('detail-view').classList.add('hidden');
            updateMapVisuals(); // reset selections
            map.setZoom(12);
        }
    });

    // AI Report Modal Initialization
    const modal = document.getElementById('report-modal');
    const btnClose = document.getElementById('btn-close-modal');
    btnClose.addEventListener('click', () => modal.classList.add('hidden'));
    
    // We bind btn-generate-report dynamically since the button gets recreated.
    initScoutingInteractivity();
}

window.promptReportModal = function() {
    const modal = document.getElementById('report-modal');
    const bodyContent = document.getElementById('modal-body-content');
    modal.classList.remove('hidden');
    bodyContent.innerHTML = `
        <div class="loading-state">
            <span class="material-symbols-rounded rotating">sync</span>
            <p>Synthesizing spatial & temporal data...</p>
        </div>
    `;
    setTimeout(() => {
        let itemName = "Area";
        if (state.selectedItem) {
            if (state.selectedItem.type === 'block') {
                const b = state.data.blocks.find(x => x.id === state.selectedItem.id);
                if (b) itemName = b.name;
            } else {
                itemName = state.selectedItem.id;
            }
        }
        bodyContent.innerHTML = `
            <div style="animation: fadeIn 0.5s ease-out;">
                <h3 style="color: var(--brand-primary); margin-bottom: 12px; font-size: 18px;">Insight Summary for ${itemName}</h3>
                <p style="margin-bottom: 16px; color: var(--text-primary);">
                    Based on the recent 14-day analysis, pressure from <strong style="color: var(--brand-primary);">${state.pestType === 'female-now' ? 'Female' : 'Male'} Navel Orangeworm</strong> 
                    is showing a concentrated outbreak clustering near the northeastern perimeter.
                </p>
                <ul style="padding-left: 20px; margin-bottom: 16px; color: var(--text-secondary);">
                    <li style="margin-bottom: 8px;">Peak activity observed at <strong style="color: var(--text-primary);">03:00 - 05:00</strong>.</li>
                    <li style="margin-bottom: 8px;">Growth rate increased by <strong>18%</strong> compared to the previous week.</li>
                    <li style="margin-bottom: 8px;">Recommendation: Initiate localized spraying in the high-density zones within 48 hours.</li>
                </ul>
                <div style="background: var(--status-red-bg); border: 1px solid rgba(224,49,49,0.3); padding: 12px; border-radius: 8px; color: var(--status-red);">
                    <strong>High Risk Area:</strong> Ensure all offline sensors are checked immediately.
                </div>
            </div>
        `;
    }, 1500);
};



function getPestCount(entity) {
    return state.pestType === 'female-now' ? entity.female_count : entity.male_count;
}

function getStatusClass(count) {
    if (count >= state.threshold * 1.5) return 'status-high';
    if (count >= state.threshold) return 'status-med';
    return 'status-low';
}

function getSensorClass(sensor) {
    if (!sensor.active) return 'sensor-offline';
    const count = getPestCount(sensor);
    const th = state.threshold / 10; // Sensor threshold scaled down for demo
    if (count >= th * 1.5) return 'sensor-high';
    if (count >= th) return 'sensor-med';
    return 'sensor-low';
}

function renderRankingList() {
    const listEl = document.getElementById('ranking-list');
    listEl.innerHTML = '';

    let blocks = state.data.blocks;
    if (state.activeFarmId !== 'all') {
        blocks = blocks.filter(b => b.ranchId === state.activeFarmId);
    }

    blocks.sort((a, b) => getPestCount(b) - getPestCount(a)); // Sort descending

    blocks.forEach(block => {
        const count = getPestCount(block);
        const statusClass = getStatusClass(count);
        let statusText = 'Low';
        if (statusClass === 'status-high') statusText = 'High';
        if (statusClass === 'status-med') statusText = 'Med';

        const item = document.createElement('div');
        item.className = 'ranking-item';
        // highlight selected
        if (state.selectedItem && state.selectedItem.type === 'block' && state.selectedItem.id === block.id) {
            item.style.border = '1px solid var(--brand-light)';
        }

        // Trend calculation
        const currentCount = state.pestType === 'female-now' ? block.trend_female[13] : block.trend_male[13];
        const prevCount = state.pestType === 'female-now' ? block.trend_female[12] : block.trend_male[12];
        let arrowIcon = 'remove';
        if (currentCount > prevCount) arrowIcon = 'trending_up';
        else if (currentCount < prevCount) arrowIcon = 'trending_down';

        // Dynamic status badge or In-Field Verification Pending
        const isPending = state.verificationPending[block.id];
        let statusBadgeHtml = '';
        if (isPending) {
            statusBadgeHtml = `
                <div class="status-badge amber" style="background:#FFF3CD; color:#856404; border:1px solid #FFEEBA; font-size:10px; font-weight:600; display:flex; align-items:center; gap:4px; padding:4px 8px; border-radius:6px; white-space:nowrap;">
                    <span style="font-size:8px;">🟡</span> Pending
                </div>
            `;
        } else {
            statusBadgeHtml = `
                <div class="status-badge ${statusClass}" style="display:flex; align-items:center; gap:2px;">
                    ${statusText}
                    <span class="material-symbols-rounded" style="font-size:14px;">${arrowIcon}</span>
                </div>
            `;
        }

        item.innerHTML = `
            <div class="ranking-item-info">
                <h3>${block.name}</h3>
                <p>${block.ranchName}</p>
                <p style="margin-top:4px;">Count: ${count} | Sensors: ${block.sensors.length}</p>
            </div>
            ${statusBadgeHtml}
        `;
        item.addEventListener('click', () => {
            selectBlock(block.id);
        });
        listEl.appendChild(item);
    });
}

// Color interpolation helper for geospatial overlay gradient (Blue to Purple)
function interpolateColor(color1, color2, factor) {
    const r1 = parseInt(color1.slice(1, 3), 16);
    const g1 = parseInt(color1.slice(3, 5), 16);
    const b1 = parseInt(color1.slice(5, 7), 16);
    
    const r2 = parseInt(color2.slice(1, 3), 16);
    const g2 = parseInt(color2.slice(3, 5), 16);
    const b2 = parseInt(color2.slice(5, 7), 16);
    
    const r = Math.round(r1 + factor * (r2 - r1));
    const g = Math.round(g1 + factor * (g2 - g1));
    const b = Math.round(b1 + factor * (b2 - b1));
    
    const rHex = r.toString(16).padStart(2, '0');
    const gHex = g.toString(16).padStart(2, '0');
    const bHex = b.toString(16).padStart(2, '0');
    
    return `#${rHex}${gHex}${bHex}`;
}

// 3-Day Average and 7-Day Rolling helpers
function get3DayAverageArray(fullData) {
    return fullData.map((val, idx) => {
        if (idx < 2) {
            const slice = fullData.slice(0, idx + 1);
            return Math.round(slice.reduce((a, b) => a + b, 0) / slice.length);
        }
        return Math.round((fullData[idx] + fullData[idx - 1] + fullData[idx - 2]) / 3);
    });
}

function get7DayRollingArray(fullData) {
    return fullData.map((val, idx) => {
        if (idx < 6) {
            const slice = fullData.slice(0, idx + 1);
            return Math.round(slice.reduce((a, b) => a + b, 0));
        }
        return fullData[idx] + fullData[idx - 1] + fullData[idx - 2] + fullData[idx - 3] + fullData[idx - 4] + fullData[idx - 5] + fullData[idx - 6];
    });
}

// Detections Grid styling helpers matching the exact uploaded image
function getDetectionsCellBg(count) {
    if (count === 0) return '#24A148'; // Solid dark green
    if (count <= 2) return '#4BAF50';  // Lighter green
    if (count <= 4) return '#A3E635';  // Yellow-green
    if (count <= 8) return '#F1C21B';  // Orange-yellow
    return '#E03131';                  // Bright Red
}

function getDetectionsCellColor(count) {
    if (count > 2 && count <= 8) return '#111815'; // Dark text for light background cells
    return '#ffffff';
}

function updateMapVisuals() {
    blockLayerGroup.clearLayers();
    sensorLayerGroup.clearLayers();

    const isZoomedIn = state.mapZoom >= 14;

    // Calculate max values to normalize risk and concentration
    const counts = state.data.blocks.map(b => getPestCount(b));
    const maxCount = Math.max(...counts, 1);
    
    const sensorCounts = state.data.blocks.map(b => b.sensors.length);
    const maxSensors = Math.max(...sensorCounts, 1);

    state.data.blocks.forEach(block => {
        if (state.activeFarmId !== 'all' && block.ranchId !== state.activeFarmId) return;

        const count = getPestCount(block);
        const ratioCount = count / maxCount;
        const ratioSensors = block.sensors.length / maxSensors;
        
        // Weight: 60% pest risk, 40% sensor concentration
        const factor = (ratioCount * 0.6) + (ratioSensors * 0.4);
        
        // Multi-stop color gradient: Green (#24A148) -> Yellow (#F1C21B) -> Orange (#FF8303) -> Red (#FA4D56)
        let fillColor;
        if (factor <= 0.33) {
            fillColor = interpolateColor('#24A148', '#F1C21B', factor / 0.33);
        } else if (factor <= 0.66) {
            fillColor = interpolateColor('#F1C21B', '#FF8303', (factor - 0.33) / 0.33);
        } else {
            fillColor = interpolateColor('#FF8303', '#FA4D56', (factor - 0.66) / 0.34);
        }

        const opacity = state.layers.heatmap ? 0.65 : 0.0;
        const weight = state.layers.boundaries ? 2 : 0;
        
        // Highlight stroke if selected
        const isSelected = state.selectedItem && state.selectedItem.type === 'block' && state.selectedItem.id === block.id;
        const strokeColor = isSelected ? '#1FFFE1' : 'rgba(255, 255, 255, 0.45)';

        const polygon = L.polygon(block.polygon, {
            color: strokeColor,
            weight: isSelected ? 3 : weight,
            fillColor: fillColor,
            fillOpacity: opacity
        });

        polygon.bindTooltip(block.name, { permanent: true, direction: "center", className: "block-label", interactive: false });
        // Optional: add a hover popup for count
        polygon.bindPopup(`<b>${block.name}</b><br>Count: ${count}`);
        polygon.on('click', () => { selectBlock(block.id); });
        
        blockLayerGroup.addLayer(polygon);

        // Render Sensors
        if (state.layers.sensors) {
            // Show sensors if zoomed in OR if this block is selected
            if (isZoomedIn || isSelected) {
                block.sensors.forEach(sensor => {
                    const sClass = getSensorClass(sensor);
                    
                    const isSSelected = state.selectedItem && state.selectedItem.type === 'sensor' && state.selectedItem.id === sensor.id;
                    
                    // Create Icon for sensor
                    const iconMarker = L.divIcon({
                        className: `sensor-marker ${sClass} ${isSSelected ? 'pulse' : ''}`,
                        iconSize: [16, 16]
                    });

                    const marker = L.marker([sensor.lat, sensor.lng], { icon: iconMarker });
                    
                    // No reaction (no tooltip) when hovering sensor
                    marker.on('click', (e) => {
                        L.DomEvent.stopPropagation(e);
                        selectSensor(block.id, sensor.id);
                    });
                    
                    sensorLayerGroup.addLayer(marker);
                });
            }
        }
    });
}

function selectBlock(blockId) {
    state.chartOffset = 0;
    state.selectedItem = { type: 'block', id: blockId };
    
    // Zoom to block
    const block = state.data.blocks.find(b => b.id === blockId);
    if(block) {
        map.flyTo(block.center, 15, { duration: 1.5 });
    }

    document.getElementById('ranking-view').classList.add('hidden');
    document.getElementById('detail-view').classList.remove('hidden');
    renderRankingList(); // Update selected border in list
    updateMapVisuals(); // Update selected stroke on map
    renderDetailView(state.selectedItem);
}

function selectSensor(blockId, sensorId) {
    state.chartOffset = 0;
    state.selectedItem = { type: 'sensor', id: sensorId, parentId: blockId };
    
    const block = state.data.blocks.find(b => b.id === blockId);
    const sensor = block.sensors.find(s => s.id === sensorId);
    
    if(sensor) {
        map.flyTo([sensor.lat, sensor.lng], 16, { duration: 1 });
    }

    document.getElementById('ranking-view').classList.add('hidden');
    document.getElementById('detail-view').classList.remove('hidden');
    updateMapVisuals();
    renderDetailView(state.selectedItem);
}

const hexToRgba = (hex, alpha) => {
    const r = parseInt(hex.slice(1, 3), 16),
          g = parseInt(hex.slice(3, 5), 16),
          b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

function selectRanch(ranchId, fromBlockId) {
    state.chartOffset = 0;
    state.selectedItem = { type: 'ranch', id: ranchId, fromBlockId: fromBlockId };
    
    // Zoom out map slightly? Re-center on blocks
    const firstBlock = state.data.blocks.find(b => b.ranchId === ranchId);
    if(firstBlock) {
        map.flyTo(firstBlock.center, 13, { duration: 1.5 });
    }

    document.getElementById('ranking-view').classList.add('hidden');
    document.getElementById('detail-view').classList.remove('hidden');
    updateMapVisuals();
    renderDetailView(state.selectedItem);
}

function selectOrganisation(fromRanchId) {
    state.chartOffset = 0;
    state.activeFarmId = 'all'; // Show all ranches
    state.selectedItem = { type: 'organisation', fromRanchId: fromRanchId };
    
    // Zoom out map to show the whole organization's ranches
    const points = [];
    state.data.blocks.forEach(b => {
        points.push(b.center);
    });
    if (points.length > 0) {
        const bounds = L.latLngBounds(points);
        map.fitBounds(bounds, { padding: [50, 50], duration: 1.5 });
    }
    
    // Update Ranch filter dropdown to "All Ranches"
    const ranchFilter = document.getElementById('filter-farm');
    if (ranchFilter) ranchFilter.value = 'all';

    document.getElementById('ranking-view').classList.add('hidden');
    document.getElementById('detail-view').classList.remove('hidden');
    renderRankingList(); // Update list selections
    updateMapVisuals(); // Update map highlights
    renderDetailView(state.selectedItem);
}

function renderDetailView(selection) {
    const standardContent = document.getElementById('standard-detail-content');
    const orgContent = document.getElementById('organisation-detail-content');

    if (selection.type === 'organisation') {
        if (standardContent) standardContent.classList.add('hidden');
        if (orgContent) orgContent.classList.remove('hidden');
    } else {
        if (standardContent) standardContent.classList.remove('hidden');
        if (orgContent) orgContent.classList.add('hidden');
    }

    let title, subtitle, name, count, trendData, hourlyData, chartHoverType;
    const pestNameLabel = state.pestType === 'female-now' ? 'Female Navel Orangeworm' : 'Male Navel Orangeworm';

    const metaContainer = document.getElementById('sensor-meta');
    const dynamicActions = document.getElementById('dynamic-actions');
    const hourlyContainer = document.getElementById('hourly-chart-container');
    const trendTitle = document.getElementById('trend-chart-title');
    const backBtnText = document.getElementById('back-btn-text');
    const avgRollingContainer = document.getElementById('avg-rolling-chart-container');

    if (selection.type === 'organisation') {
        title = "RapidAIM Enterprise";
        subtitle = "Group Organisation Overview";
        name = "Global Grid Status";
        count = "620 Sensors";
        
        if (backBtnText) backBtnText.textContent = "Back to Ranch Overview";

        if (metaContainer) metaContainer.classList.add('hidden');
        if (hourlyContainer) hourlyContainer.classList.add('hidden');

        const rCount = 4;
        const sCount = 620;
        const tCount = 12; // pending scouting tasks
        
        const ranchesData = [
          { id: 'R2', name: 'Sunshine Valley Ranch', urgency: 'CRITICAL', color: '#E03131', bg: 'rgba(224, 49, 49, 0.08)', border: 'rgba(224, 49, 49, 0.25)' },
          { id: 'R3', name: 'Golden Harvest Farms', urgency: 'WARNING', color: '#F08C00', bg: 'rgba(240, 140, 0, 0.08)', border: 'rgba(240, 140, 0, 0.25)' },
          { id: 'R1', name: 'Sierra Orchards', urgency: 'STABLE', color: '#2B8A3E', bg: 'rgba(43, 138, 62, 0.08)', border: 'rgba(43, 138, 62, 0.25)' },
          { id: 'R4', name: 'Pacific Ag Vineyards', urgency: 'STABLE', color: '#2BA082', bg: 'rgba(43, 160, 130, 0.08)', border: 'rgba(43, 160, 130, 0.25)' }
        ];

        ranchesData.forEach(r => {
            const ranchBlocks = state.data.blocks.filter(b => b.ranchId === r.id);
            let total = 0;
            ranchBlocks.forEach(b => total += getPestCount(b));
            r.count = total;
            r.blocks = ranchBlocks.length;
            r.sensors = ranchBlocks.reduce((acc, b) => acc + b.sensors.length, 0);
        });

        ranchesData.sort((a, b) => b.count - a.count);

        let ranchesHtml = ranchesData.map(r => `
            <div class="org-ranch-card" style="background:#FFF; border:1px solid rgba(0, 0, 0, 0.06); border-radius:10px; padding:12px; cursor:pointer; display:flex; flex-direction:column; gap:6px; box-shadow:0 1px 3px rgba(0,0,0,0.01); transition:border-color 0.2s;" onclick="const firstBlock = state.data.blocks.find(b => b.ranchId === '${r.id}'); selectRanch('${r.id}', firstBlock ? firstBlock.id : 'B1');">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-size:12px; font-weight:800; color:#111815;">${r.name}</span>
                    <span style="font-size:9px; font-weight:800; padding:2px 8px; border-radius:10px; background:${r.bg}; color:${r.color}; border:1px solid ${r.border}; text-transform:uppercase;">${r.urgency}</span>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; font-size:11px; font-weight:600; color:#4A5B53;">
                    <span>${r.blocks} Blocks • ${r.sensors} Sensors</span>
                    <span>Count: <strong style="color:${r.color};">${r.count}</strong></span>
                </div>
            </div>
        `).join('');

        orgContent.innerHTML = `
            <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:8px; margin-bottom:8px;">
                <div style="background:rgba(15, 90, 71, 0.05); border:1px solid rgba(15, 90, 71, 0.1); border-radius:8px; padding:10px 6px; text-align:center;">
                    <p style="font-size:8px; font-weight:800; color:#0F5A47; text-transform:uppercase; margin:0; letter-spacing:0.5px;">Ranches</p>
                    <h4 style="font-size:14px; font-weight:800; margin:2px 0 0 0; color:#0F5A47;">${rCount}</h4>
                </div>
                <div style="background:rgba(43, 138, 62, 0.05); border:1px solid rgba(43, 138, 62, 0.1); border-radius:8px; padding:10px 6px; text-align:center;">
                    <p style="font-size:8px; font-weight:800; color:#2B8A3E; text-transform:uppercase; margin:0; letter-spacing:0.5px;">Sensors</p>
                    <h4 style="font-size:14px; font-weight:800; margin:2px 0 0 0; color:#2B8A3E;">${sCount}</h4>
                </div>
                <div style="background:rgba(224, 49, 49, 0.05); border:1px solid rgba(224, 49, 49, 0.1); border-radius:8px; padding:10px 6px; text-align:center;">
                    <p style="font-size:8px; font-weight:800; color:#E03131; text-transform:uppercase; margin:0; letter-spacing:0.5px;">Pending</p>
                    <h4 style="font-size:14px; font-weight:800; margin:2px 0 0 0; color:#E03131;">${tCount} Tasks</h4>
                </div>
            </div>

            <div style="display:flex; flex-direction:column; gap:8px;">
                <h3 style="font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:0.5px; color:#4A5B53; margin:0;">Ranch Urgency Index</h3>
                <div style="display:flex; flex-direction:column; gap:8px;">
                    ${ranchesHtml}
                </div>
            </div>

            <div style="display:flex; flex-direction:column; gap:8px; margin-top:4px;">
                <h3 style="font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:0.5px; color:#4A5B53; margin:0;">Live Task Pipeline</h3>
                
                <div style="background:rgba(255, 255, 255, 0.9); border:1px solid rgba(0, 0, 0, 0.06); border-radius:12px; padding:12px; display:flex; flex-direction:column; gap:12px; box-shadow:0 1px 3px rgba(0,0,0,0.01);">
                    <div>
                        <div style="display:flex; justify-content:space-between; font-size:11px; font-weight:800; margin-bottom:6px;">
                            <span style="display:flex; align-items:center; gap:6px;">
                                <span style="width:6px; height:6px; border-radius:50%; background:#2B8A3E; display:inline-block;"></span>
                                Scouting Assignments
                            </span>
                            <span style="color:#0F5A47;">65% Done</span>
                        </div>
                        <div style="height:6px; background:#f4f7f6; border-radius:3px; overflow:hidden; width:100%;">
                            <div style="height:100%; background:#0F5A47; border-radius:3px; width:65%;"></div>
                        </div>
                        <p style="font-size:9px; color:#4A5B53; margin:4px 0 0 0; font-weight:600;">12 Active Tasks, 8 Scouts Deployed</p>
                    </div>
                    
                    <div style="padding-top:10px; border-top:1px solid rgba(0,0,0,0.05);">
                        <div style="display:flex; justify-content:space-between; font-size:11px; font-weight:800; margin-bottom:4px;">
                            <span style="display:flex; align-items:center; gap:6px;">
                                <span style="width:6px; height:6px; border-radius:50%; background:#F08C00; display:inline-block;"></span>
                                Spraying Work Orders
                            </span>
                            <span style="color:#F08C00;">3 Approved</span>
                        </div>
                        <p style="font-size:9px; color:#4A5B53; margin:0; font-weight:600;">1 In-Progress, 2 Scheduled Next 48h</p>
                    </div>
                </div>
            </div>

            <div style="margin-top:10px;">
                <button class="btn btn-black" id="btn-org-ai-report" style="width:100%; font-size:14px; padding:12px; border-radius:8px; border:none; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px;">
                    <span class="material-symbols-rounded">summarize</span> Generate AI Organisation Report
                </button>
            </div>
        `;

        document.getElementById('btn-org-ai-report').addEventListener('click', window.promptReportModal);
        
        document.getElementById('detail-title').textContent = title;
        document.getElementById('detail-subtitle').textContent = subtitle;
        document.getElementById('detail-pest-name').textContent = name;
        document.getElementById('detail-count').textContent = count;

        const statusPill = document.getElementById('detail-status-pill');
        if (statusPill) statusPill.className = 'status-pill hidden';

        if (dynamicActions) dynamicActions.innerHTML = '';
        
        const gridContainer = document.getElementById('detections-grid-container');
        if (gridContainer) gridContainer.classList.add('hidden');
        
        const statCard = document.querySelector('.stat-card.primary');
        if (statCard) {
            statCard.style.background = 'linear-gradient(135deg, rgba(15, 90, 71, 0.12), rgba(15, 90, 71, 0.06))';
            statCard.style.borderColor = 'rgba(15, 90, 71, 0.25)';
            const statValue = document.getElementById('detail-count');
            if (statValue) statValue.style.color = '#0F5A47';
        }
        
        if (avgRollingContainer) avgRollingContainer.classList.add('hidden');
        
        return;
    }
    
    chartHoverType = 'line';
    if (avgRollingContainer) {
        if (selection.type === 'block' || selection.type === 'ranch' || selection.type === 'sensor') {
            avgRollingContainer.classList.remove('hidden');
        } else {
            avgRollingContainer.classList.add('hidden');
        }
    }

    // Dynamic 7-Day Detections Table for Ranch and Block views
    const gridContainer = document.getElementById('detections-grid-container');
    if (selection.type === 'ranch' || selection.type === 'block') {
        if (gridContainer) {
            gridContainer.classList.remove('hidden');
            
            // Build headers dynamically based on current date
            const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const today = new Date();
            const cols = [];
            for (let i = 6; i >= 1; i--) {
                const d = new Date(today);
                d.setDate(today.getDate() - i - 1);
                cols.push(daysOfWeek[d.getDay()]);
            }
            
            let rowsHtml = '';
            
            if (selection.type === 'ranch') {
                const ranchBlocks = state.data.blocks.filter(b => b.ranchId === selection.id);
                ranchBlocks.forEach(b => {
                    const trend = state.pestType === 'female-now' ? b.trend_female : b.trend_male;
                    const last7Days = trend.slice(-7);
                    
                    let cellsHtml = '';
                    for (let i = 0; i < 6; i++) {
                        const cellCount = last7Days[i];
                        const bg = getDetectionsCellBg(cellCount);
                        const color = getDetectionsCellColor(cellCount);
                        cellsHtml += `<td><span class="detections-cell-value" style="background:${bg}; color:${color};">${cellCount}</span></td>`;
                    }
                    const lnCount = last7Days[6];
                    const lnBg = getDetectionsCellBg(lnCount);
                    const lnColor = getDetectionsCellColor(lnCount);
                    cellsHtml += `<td><span class="detections-cell-value" style="background:${lnBg}; color:${lnColor}; font-weight: 700;">${lnCount}</span></td>`;
                    
                    // Dynamic block risk color dot
                    const bCount = getPestCount(b);
                    const bStatus = getStatusClass(bCount);
                    let dotColor = '#24A148'; // Low Risk / green
                    if (bStatus === 'status-high') dotColor = '#E03131'; // High Risk / red
                    else if (bStatus === 'status-med') dotColor = '#F08C00'; // Medium Risk / amber

                    rowsHtml += `
                        <tr class="detections-block-row" style="cursor:pointer;" onclick="selectBlock('${b.id}')">
                            <td style="width: 24px;"><span class="status-indicator-dot" style="background-color: ${dotColor};"></span></td>
                            <td class="text-left" style="color: var(--brand-primary);">${b.name}</td>
                            ${cellsHtml}
                        </tr>
                    `;
                });
            } else { // Block selection (display individual sensors)
                const block = state.data.blocks.find(b => b.id === selection.id);
                block.sensors.forEach(s => {
                    const rawTrend = state.pestType === 'female-now' ? s.trend_female : s.trend_male;
                    const trend = (!s.active || !rawTrend || rawTrend.length === 0) ? Array(30).fill(0) : rawTrend;
                    const last7Days = trend.slice(-7);
                    
                    let cellsHtml = '';
                    for (let i = 0; i < 6; i++) {
                        const cellCount = last7Days[i];
                        const bg = getDetectionsCellBg(cellCount);
                        const color = getDetectionsCellColor(cellCount);
                        cellsHtml += `<td><span class="detections-cell-value" style="background:${bg}; color:${color};">${cellCount}</span></td>`;
                    }
                    const lnCount = last7Days[6];
                    const lnBg = getDetectionsCellBg(lnCount);
                    const lnColor = getDetectionsCellColor(lnCount);
                    cellsHtml += `<td><span class="detections-cell-value" style="background:${lnBg}; color:${lnColor}; font-weight: 700;">${lnCount}</span></td>`;
                    
                    // Dynamic sensor risk color dot
                    const sClass = getSensorClass(s);
                    let dotColor = '#24A148'; // Low Risk / green
                    if (sClass === 'sensor-high') dotColor = '#E03131'; // High Risk / red
                    else if (sClass === 'sensor-med') dotColor = '#F08C00'; // Medium Risk / amber
                    else if (sClass === 'sensor-offline') dotColor = '#555555'; // Offline / grey

                    rowsHtml += `
                        <tr class="detections-block-row" style="cursor:pointer;" onclick="selectSensor('${block.id}', '${s.id}')">
                            <td style="width: 24px;"><span class="status-indicator-dot" style="background-color: ${dotColor};"></span></td>
                            <td class="text-left" style="color: var(--brand-primary);">Sensor ${s.id.split('-').pop()}</td>
                            ${cellsHtml}
                        </tr>
                    `;
                });
            }
            
            gridContainer.innerHTML = `
                <div class="detections-grid-header">
                    <h3>Last 7 Day Detections</h3>
                    <span class="timezone-label"><span class="material-symbols-rounded" style="font-size:14px;vertical-align:middle;">info</span> America/Los_Angeles</span>
                </div>
                <div class="detections-table-wrapper">
                    <table class="detections-table">
                        <thead>
                            <tr>
                                <th></th>
                                <th class="text-left">Name</th>
                                <th>${cols[0]}</th>
                                <th>${cols[1]}</th>
                                <th>${cols[2]}</th>
                                <th>${cols[3]}</th>
                                <th>${cols[4]}</th>
                                <th>${cols[5]}</th>
                                <th style="font-weight: 700;">Last Night</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rowsHtml}
                        </tbody>
                    </table>
                </div>
            `;
        }
    } else {
        if (gridContainer) gridContainer.classList.add('hidden');
    }

    if (selection.type === 'block') {
        const block = state.data.blocks.find(b => b.id === selection.id);
        title = block.name;
        const activeSensors = block.sensors.filter(s => s.active).length;
        subtitle = `${block.sensors.length} sensors • ${activeSensors} active`;
        name = pestNameLabel;
        count = getPestCount(block);
        trendData = state.pestType === 'female-now' ? block.trend_female : block.trend_male;
        hourlyData = state.pestType === 'female-now' ? block.hourly_female : block.hourly_male;
        
        backBtnText.textContent = "Back to Ranking";
        metaContainer.classList.add('hidden');
        hourlyContainer.classList.remove('hidden');
        trendTitle.textContent = 'Day Trend';
        chartHoverType = 'line';
        
        dynamicActions.innerHTML = `
            <button class="btn btn-black" style="font-size:15px; padding:14px;">
                <span class="material-symbols-rounded">person_search</span> Assign Scouting
            </button>
            <div class="btn-group">
                <button class="btn btn-secondary" id="btn-generate-report"><span class="material-symbols-rounded">summarize</span> AI Report</button>
                <button class="btn btn-secondary" id="btn-view-ranch"><span class="material-symbols-rounded">visibility</span> View Ranch Details</button>
            </div>
        `;
        document.getElementById('btn-generate-report').addEventListener('click', window.promptReportModal);
        document.getElementById('btn-view-ranch').addEventListener('click', () => selectRanch(block.ranchId, block.id));

    } else if (selection.type === 'ranch') {
        const block = state.data.blocks.find(b => b.id === selection.fromBlockId);
        const ranchId = selection.id;
        
        const ranchBlocks = state.data.blocks.filter(b => b.ranchId === ranchId);
        let activeSensors = 0;
        let totalSensors = 0;
        let tF = Array(30).fill(0), tM = Array(30).fill(0);
        let hF = Array(24).fill(0), hM = Array(24).fill(0);
        let totalVal = 0;

        ranchBlocks.forEach(b => {
             totalSensors += b.sensors.length;
             activeSensors += b.sensors.filter(s => s.active).length;
             totalVal += getPestCount(b);
             for(let i=0;i<30;i++) { tF[i] += b.trend_female[i]; tM[i] += b.trend_male[i]; }
             for(let i=0;i<24;i++) { hF[i] += b.hourly_female[i]; hM[i] += b.hourly_male[i]; }
        });

        title = ranchBlocks[0].ranchName;
        subtitle = `${totalSensors} sensors • ${activeSensors} active`;
        name = pestNameLabel;
        count = totalVal;
        trendData = state.pestType === 'female-now' ? tF : tM;
        hourlyData = state.pestType === 'female-now' ? hF : hM;

        backBtnText.textContent = `Back to ${block.name}`;

        metaContainer.classList.add('hidden');
        hourlyContainer.classList.remove('hidden');
        trendTitle.textContent = 'Day Trend';
        chartHoverType = 'line';

        dynamicActions.innerHTML = `
            <button class="btn btn-black" style="font-size:15px; padding:14px;">
                <span class="material-symbols-rounded">person_search</span> Assign Scouting
            </button>
            <div class="btn-group">
                <button class="btn btn-secondary" id="btn-generate-report"><span class="material-symbols-rounded">summarize</span> AI Report</button>
                <button class="btn btn-secondary" id="btn-view-organisation"><span class="material-symbols-rounded">corporate_fare</span> View Organisation</button>
            </div>
        `;
        document.getElementById('btn-generate-report').addEventListener('click', window.promptReportModal);
        document.getElementById('btn-view-organisation').addEventListener('click', () => {
            selectOrganisation(ranchId);
        });

    } else { // Sensor
        const block = state.data.blocks.find(b => b.id === selection.parentId);
        const sensor = block.sensors.find(s => s.id === selection.id);
        title = `Sensor ${sensor.id.split('-').pop()}`;
        subtitle = `Located in ${block.name}`;
        name = pestNameLabel;
        
        if (!sensor.active) {
            count = 'OFFLINE';
            trendData = Array(30).fill(0);
            hourlyData = Array(24).fill(0);
        } else {
            count = getPestCount(sensor);
            trendData = state.pestType === 'female-now' ? sensor.trend_female : sensor.trend_male;
            hourlyData = state.pestType === 'female-now' ? sensor.hourly_female : sensor.hourly_male;
        }

        backBtnText.textContent = `Back to ${block.name}`;
        metaContainer.classList.add('hidden'); // Hide status/battery/signal meta-grid to match block/ranch details
        hourlyContainer.classList.remove('hidden');
        trendTitle.textContent = 'Day Trend';
        chartHoverType = 'bar'; // Keep bar for sensor to look clean

        dynamicActions.innerHTML = `
            <button class="btn btn-black" style="font-size:15px; padding:14px;">
                <span class="material-symbols-rounded">person_search</span> Assign Scouting
            </button>
            <div class="btn-group">
                <button class="btn btn-secondary" id="btn-generate-report"><span class="material-symbols-rounded">summarize</span> AI Report</button>
                <button class="btn btn-secondary" id="btn-view-block"><span class="material-symbols-rounded">grid_view</span> View Block Details</button>
            </div>
        `;
        document.getElementById('btn-generate-report').addEventListener('click', window.promptReportModal);
        document.getElementById('btn-view-block').addEventListener('click', () => selectBlock(block.id));
    }

    document.getElementById('detail-title').textContent = title;
    document.getElementById('detail-subtitle').textContent = subtitle;
    document.getElementById('detail-pest-name').textContent = name;
    document.getElementById('detail-count').textContent = count;

    const statusPill = document.getElementById('detail-status-pill');
    const trendIndicator = document.getElementById('stat-trend-indicator');
    const benchmarkElement = document.getElementById('stat-benchmark');

    if (trendIndicator) {
        trendIndicator.className = 'stat-trend hidden';
        trendIndicator.innerHTML = '';
    }
    if (benchmarkElement) {
        benchmarkElement.className = 'stat-benchmark hidden';
        benchmarkElement.textContent = '';
    }

    // Determine risk states and chartColor
    let chartColor = '#2B8A3E'; // Default low-risk green
    let isHighRisk = false;
    let isMedRisk = false;
    let isLowRisk = false;

    if (count === 'OFFLINE') {
        chartColor = '#555555';
    } else if (selection.type === 'sensor') {
        const block = state.data.blocks.find(b => b.id === selection.parentId);
        const sensor = block.sensors.find(s => s.id === selection.id);
        const sClass = getSensorClass(sensor);
        if (sClass === 'sensor-offline') {
            chartColor = '#555555';
        } else if (sClass === 'sensor-high') {
            chartColor = '#E03131'; // High risk red
            isHighRisk = true;
        } else if (sClass === 'sensor-med') {
            chartColor = '#F08C00'; // Medium risk amber
            isMedRisk = true;
        } else {
            chartColor = '#2B8A3E'; // Low risk green
            isLowRisk = true;
        }
    } else if (selection.type === 'ranch') {
        const ranchBlocks = state.data.blocks.filter(b => b.ranchId === selection.id);
        const avgCount = count / (ranchBlocks.length || 1);
        const statusClass = getStatusClass(avgCount);
        if (statusClass === 'status-high') {
            chartColor = '#E03131';
            isHighRisk = true;
        } else if (statusClass === 'status-med') {
            chartColor = '#F08C00';
            isMedRisk = true;
        } else {
            chartColor = '#2B8A3E';
            isLowRisk = true;
        }
    } else { // block
        const statusClass = getStatusClass(count);
        if (statusClass === 'status-high') {
            chartColor = '#E03131';
            isHighRisk = true;
        } else if (statusClass === 'status-med') {
            chartColor = '#F08C00';
            isMedRisk = true;
        } else {
            chartColor = '#2B8A3E';
            isLowRisk = true;
        }
    }

    if (statusPill) {
        statusPill.className = 'status-pill';
        
        // Dynamic In-Field Verification Pending check
        const isPending = state.verificationPending[selection.id];
        
        if (isPending) {
            statusPill.textContent = 'STATUS: IN-FIELD VERIFICATION PENDING';
            statusPill.classList.add('amber');
            statusPill.classList.remove('hidden');
        } else if (count === 'OFFLINE') {
            statusPill.textContent = 'STATUS: OFFLINE';
            statusPill.classList.add('red');
        } else {
            statusPill.classList.remove('hidden');
            if (isHighRisk) {
                statusPill.textContent = 'STATUS: URGENT ACTION';
                statusPill.classList.add('red');
            } else if (isMedRisk) {
                statusPill.textContent = 'STATUS: MONITOR';
                statusPill.classList.add('amber');
            } else {
                statusPill.textContent = 'STATUS: STABLE';
                statusPill.classList.add('green');
            }

            if (trendIndicator && (selection.type === 'block' || selection.type === 'ranch' || selection.type === 'sensor')) {
                trendIndicator.classList.remove('hidden');
                if (isHighRisk) {
                    trendIndicator.innerHTML = '<span class="material-symbols-rounded">trending_up</span> (↑ 18% vs Last Week)';
                    trendIndicator.classList.add('trend-up');
                } else if (isLowRisk) {
                    trendIndicator.innerHTML = '<span class="material-symbols-rounded">trending_down</span> (↓ 5% vs Last Week)';
                    trendIndicator.classList.add('trend-down');
                } else {
                    trendIndicator.innerHTML = '<span class="material-symbols-rounded">trending_flat</span> (Flat vs Last Week)';
                    trendIndicator.classList.add('trend-flat');
                }

                if (benchmarkElement) {
                    benchmarkElement.classList.remove('hidden');
                    if (selection.type === 'block') {
                        benchmarkElement.textContent = 'Farm Average: 45';
                    } else if (selection.type === 'sensor') {
                        benchmarkElement.textContent = 'Block Average: 5';
                    }
                }
            }
        }
    }

    const statCard = document.querySelector('.stat-card.primary');
    if (statCard) {
        statCard.style.background = `linear-gradient(135deg, ${hexToRgba(chartColor, 0.12)}, ${hexToRgba(chartColor, 0.06)})`;
        statCard.style.borderColor = hexToRgba(chartColor, 0.25);
        const statValue = document.getElementById('detail-count');
        if (statValue) statValue.style.color = chartColor;
    }

    // Chart Date Range Navigation update
    const btnPrev = document.getElementById('btn-chart-prev');
    const btnNext = document.getElementById('btn-chart-next');
    const navLabel = document.getElementById('chart-nav-label');
    
    if (navLabel) {
        if (state.chartOffset === 0) {
            navLabel.textContent = "Most Recent";
        } else {
            navLabel.textContent = `${state.chartOffset}d Ago`;
        }
    }
    if (btnPrev) btnPrev.disabled = (state.chartOffset >= 16);
    if (btnNext) btnNext.disabled = (state.chartOffset <= 0);

    // Compute visible slices
    const fullTrendData = trendData;
    const startIndex = 16 - state.chartOffset;
    const endIndex = startIndex + 14;
    
    const visibleTrend = fullTrendData.slice(startIndex, endIndex);
    const visible3DayAvg = get3DayAverageArray(fullTrendData).slice(startIndex, endIndex);
    const visible7DayRolling = get7DayRollingArray(fullTrendData).slice(startIndex, endIndex);

    renderCharts(visibleTrend, visible3DayAvg, visible7DayRolling, hourlyData, chartHoverType, chartColor, startIndex);
}

// Chart.js global defaults
Chart.defaults.color = '#9AAEA6';
Chart.defaults.font.family = 'Inter';

function renderCharts(trendData, avg3DayData, rolling7DayData, hourlyData, chartType = 'line', primaryColor = '#2BA082', startIndex = 16) {
    const trendCtx = document.getElementById('trendChart').getContext('2d');
    const avgRollingCtx = document.getElementById('avgRollingChart').getContext('2d');
    const hourlyCtx = document.getElementById('hourlyChart').getContext('2d');

    if (trendChartInstance) trendChartInstance.destroy();
    if (avgRollingChartInstance) avgRollingChartInstance.destroy();
    if (hourlyChartInstance) hourlyChartInstance.destroy();

    // Past 14 days labels relative to startIndex
    const trendLabels = Array.from({length: 14}, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (29 - (startIndex + i)));
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    trendChartInstance = new Chart(trendCtx, {
        type: chartType,
        data: {
            labels: trendLabels,
            datasets: [{
                label: 'Count',
                data: trendData,
                borderColor: primaryColor,
                backgroundColor: chartType === 'bar' ? primaryColor : hexToRgba(primaryColor, 0.1),
                borderWidth: chartType === 'line' ? 2 : 0,
                borderRadius: chartType === 'bar' ? 4 : 0,
                pointBackgroundColor: primaryColor,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' } },
                x: { grid: { display: false }, ticks: { maxTicksLimit: 7 } }
            }
        }
    });

    // Populate dual line rolling average and rolling count chart
    avgRollingChartInstance = new Chart(avgRollingCtx, {
        type: 'line',
        data: {
            labels: trendLabels,
            datasets: [
                {
                    label: '3-Day Avg',
                    data: avg3DayData,
                    borderColor: '#3B82F6',
                    backgroundColor: 'rgba(59, 130, 246, 0.05)',
                    borderWidth: 2,
                    pointBackgroundColor: '#3B82F6',
                    fill: false,
                    tension: 0.4
                },
                {
                    label: '7-Day Rolling',
                    data: rolling7DayData,
                    borderColor: '#8B5CF6',
                    backgroundColor: 'rgba(139, 92, 246, 0.05)',
                    borderWidth: 2,
                    pointBackgroundColor: '#8B5CF6',
                    fill: false,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { 
                legend: { 
                    display: true,
                    labels: {
                        color: '#9AAEA6',
                        font: { size: 10, family: 'Inter', weight: 600 }
                    }
                } 
            },
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' } },
                x: { grid: { display: false }, ticks: { maxTicksLimit: 7 } }
            }
        }
    });

    const hourlyLabels = Array.from({length: 24}, (_, i) => `${i}:00`);

    hourlyChartInstance = new Chart(hourlyCtx, {
        type: 'bar',
        data: {
            labels: hourlyLabels,
            datasets: [{
                label: 'Count',
                data: hourlyData,
                backgroundColor: primaryColor,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' } },
                x: { grid: { display: false }, ticks: { maxTicksLimit: 8 } }
            }
        }
    });
}

// Expose key modular functions to the global scope so they work as inline click event handlers
window.selectBlock = selectBlock;
window.selectSensor = selectSensor;
window.selectRanch = selectRanch;

// scouting feature logic implementation
let currentAssignmentType = 'Pest Scouting';
let currentPriority = 'Urgent';

function initScoutingInteractivity() {
    // Event delegation on dynamic actions container
    const actionsContainer = document.getElementById('dynamic-actions');
    if (actionsContainer) {
        actionsContainer.addEventListener('click', (e) => {
            const btn = e.target.closest('.btn-black');
            if (btn && btn.textContent.includes('Assign Scouting')) {
                openScoutingModal();
            }
        });
    }

    // Segmented control assignment type selection
    const typeButtons = document.querySelectorAll('#scouting-type-segmented .segmented-btn');
    typeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            typeButtons.forEach(b => {
                b.classList.remove('active');
                b.style.background = 'transparent';
                b.style.color = '#4A5B53';
                b.style.fontWeight = '500';
                b.style.boxShadow = 'none';
            });
            btn.classList.add('active');
            btn.style.background = '#FFF';
            btn.style.color = '#1e3f20';
            btn.style.fontWeight = '600';
            btn.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
            currentAssignmentType = btn.getAttribute('data-type');
        });
    });

    // Segmented control priority selection
    const priorityButtons = document.querySelectorAll('#scouting-priority-segmented .priority-btn');
    priorityButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            priorityButtons.forEach(b => {
                b.classList.remove('active');
                b.style.background = 'transparent';
                b.style.color = '#4A5B53';
                b.style.fontWeight = '500';
                b.style.boxShadow = 'none';
                b.style.border = 'none';
            });
            
            btn.classList.add('active');
            btn.style.fontWeight = '600';
            btn.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
            
            const priority = btn.getAttribute('data-priority');
            currentPriority = priority;
            
            if (priority === 'Urgent') {
                btn.style.background = '#F8D7DA';
                btn.style.color = '#721C24';
                btn.style.border = '1px solid #F5C6CB';
            } else if (priority === 'Medium') {
                btn.style.background = '#FFF3CD';
                btn.style.color = '#856404';
                btn.style.border = '1px solid #FFEEBA';
            } else {
                btn.style.background = '#D1ECF1';
                btn.style.color = '#0C5460';
                btn.style.border = '1px solid #BEE5EB';
            }
        });
    });

    // Close modal triggers
    document.getElementById('btn-close-scouting-modal').addEventListener('click', closeScoutingModal);
    document.getElementById('btn-close-scouting-modal-footer').addEventListener('click', closeScoutingModal);

    // Dispatch assignment trigger
    document.getElementById('btn-dispatch-scouting').addEventListener('click', dispatchScoutingTask);

    // Top bar task icon dropdown click toggle
    const btnTasks = document.getElementById('btn-tasks-list');
    const tasksDropdown = document.getElementById('tasks-dropdown');
    
    if (btnTasks && tasksDropdown) {
        btnTasks.addEventListener('click', (e) => {
            e.stopPropagation();
            tasksDropdown.classList.toggle('hidden');
        });

        // Click outside closes dropdown
        document.addEventListener('click', (e) => {
            if (!tasksDropdown.classList.contains('hidden') && !tasksDropdown.contains(e.target) && e.target !== btnTasks && !btnTasks.contains(e.target)) {
                tasksDropdown.classList.add('hidden');
            }
        });
    }
}

function openScoutingModal() {
    if (!state.selectedItem) return;

    let entityName = '';
    let statusText = '';
    let statusColor = '#24A148'; // green
    let pestCategory = state.pestType === 'female-now' ? 'Female Navel Orangeworm' : 'Male Navel Orangeworm';

    if (state.selectedItem.type === 'block') {
        const block = state.data.blocks.find(b => b.id === state.selectedItem.id);
        entityName = block.name;
        const count = getPestCount(block);
        const statusClass = getStatusClass(count);
        statusText = statusClass === 'status-high' ? 'High Risk' : (statusClass === 'status-med' ? 'Medium Risk' : 'Low Risk');
        statusColor = statusClass === 'status-high' ? '#E03131' : (statusClass === 'status-med' ? '#F08C00' : '#24A148');
    } else if (state.selectedItem.type === 'ranch') {
        const ranchId = state.selectedItem.id;
        const ranchBlocks = state.data.blocks.filter(b => b.ranchId === ranchId);
        entityName = ranchBlocks[0].ranchName;

        let totalCount = 0;
        ranchBlocks.forEach(b => totalCount += getPestCount(b));
        const statusClass = getStatusClass(totalCount / ranchBlocks.length);
        statusText = statusClass === 'status-high' ? 'High Risk' : (statusClass === 'status-med' ? 'Medium Risk' : 'Low Risk');
        statusColor = statusClass === 'status-high' ? '#E03131' : (statusClass === 'status-med' ? '#F08C00' : '#24A148');
    } else if (state.selectedItem.type === 'sensor') {
        const block = state.data.blocks.find(b => b.id === state.selectedItem.parentId);
        const sensor = block.sensors.find(s => s.id === state.selectedItem.id);
        entityName = `Sensor ${sensor.id.split('-').pop()} (${block.name})`;

        if (!sensor.active) {
            statusText = 'Offline';
            statusColor = '#555555';
        } else {
            const sClass = getSensorClass(sensor);
            statusText = sClass === 'sensor-high' ? 'High Risk' : (sClass === 'sensor-med' ? 'Medium Risk' : 'Low Risk');
            statusColor = sClass === 'sensor-high' ? '#E03131' : (sClass === 'sensor-med' ? '#F08C00' : '#24A148');
        }
    }

    // Populate badges
    document.getElementById('scouting-badge-entity').textContent = `${state.selectedItem.type === 'sensor' ? '' : (state.selectedItem.type === 'block' ? 'Block: ' : 'Ranch: ')}${entityName}`;
    document.getElementById('scouting-badge-status').textContent = `Status: ${statusText}`;
    document.getElementById('scouting-badge-status').style.backgroundColor = statusColor;
    document.getElementById('scouting-badge-pest').textContent = `Pest Category: ${pestCategory}`;

    // Reset notes
    document.getElementById('scouting-notes').value = '';

    // Reset segmented controllers
    resetSegmentedControls();

    // Show modal
    document.getElementById('scouting-modal').classList.remove('hidden');
}

function resetSegmentedControls() {
    currentAssignmentType = 'Pest Scouting';
    currentPriority = 'Urgent';

    const typeButtons = document.querySelectorAll('#scouting-type-segmented .segmented-btn');
    typeButtons.forEach((btn, idx) => {
        if (idx === 0) {
            btn.classList.add('active');
            btn.style.background = '#FFF';
            btn.style.color = '#1e3f20';
            btn.style.fontWeight = '600';
            btn.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
        } else {
            btn.classList.remove('active');
            btn.style.background = 'transparent';
            btn.style.color = '#4A5B53';
            btn.style.fontWeight = '500';
            btn.style.boxShadow = 'none';
        }
    });

    const priorityButtons = document.querySelectorAll('#scouting-priority-segmented .priority-btn');
    priorityButtons.forEach(btn => {
        if (btn.getAttribute('data-priority') === 'Urgent') {
            btn.classList.add('active');
            btn.style.background = '#F8D7DA';
            btn.style.color = '#721C24';
            btn.style.border = '1px solid #F5C6CB';
            btn.style.fontWeight = '600';
            btn.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
        } else {
            btn.classList.remove('active');
            btn.style.background = 'transparent';
            btn.style.color = '#4A5B53';
            btn.style.fontWeight = '500';
            btn.style.boxShadow = 'none';
            btn.style.border = 'none';
        }
    });
}

function closeScoutingModal() {
    document.getElementById('scouting-modal').classList.add('hidden');
}

function dispatchScoutingTask() {
    if (!state.selectedItem) return;

    const assignee = document.getElementById('scouting-assignee').value;
    const notes = document.getElementById('scouting-notes').value.trim();
    
    let entityName = '';
    if (state.selectedItem.type === 'block') {
        const block = state.data.blocks.find(b => b.id === state.selectedItem.id);
        entityName = block.name;
    } else if (state.selectedItem.type === 'ranch') {
        const ranchId = state.selectedItem.id;
        const ranchBlocks = state.data.blocks.filter(b => b.ranchId === ranchId);
        entityName = ranchBlocks[0].ranchName;
    } else {
        const block = state.data.blocks.find(b => b.id === state.selectedItem.parentId);
        const sensor = block.sensors.find(s => s.id === state.selectedItem.id);
        entityName = `Sensor ${sensor.id.split('-').pop()} (${block.name})`;
    }

    const newTask = {
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        entityName: entityName,
        type: currentAssignmentType,
        assignee: assignee,
        priority: currentPriority,
        notes: notes || 'No special field notes provided.',
        status: 'In-Field Verification Pending'
    };

    // Add to state
    state.scoutingAssignments.unshift(newTask);
    
    // Set In-Field Verification Pending state for loop-closing
    state.verificationPending[state.selectedItem.id] = true;

    // Play dispatch flying animation to the top-right task icon
    playDispatchAnimation();

    // Re-render sidebar details panel to immediately show new Pending status badge
    renderDetailView(state.selectedItem);

    // Re-render ranking list to show yellow verification pending badge
    renderRankingList();

    // Update Top bar Task dot and dropdown container
    updateTasksDropdownUI();

    // Close Modal
    closeScoutingModal();
}

function playDispatchAnimation() {
    const btn = document.getElementById('btn-dispatch-scouting');
    const target = document.getElementById('btn-tasks-list');
    
    if (!btn || !target) return;
    
    const btnRect = btn.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    
    const flyer = document.createElement('div');
    flyer.style.position = 'fixed';
    flyer.style.left = `${btnRect.left + btnRect.width / 2}px`;
    flyer.style.top = `${btnRect.top + btnRect.height / 2}px`;
    flyer.style.width = '20px';
    flyer.style.height = '20px';
    flyer.style.borderRadius = '50%';
    flyer.style.backgroundColor = '#1e3f20';
    flyer.style.zIndex = '100000';
    flyer.style.transition = 'all 0.8s cubic-bezier(0.25, 0.8, 0.25, 1)';
    flyer.style.display = 'flex';
    flyer.style.alignItems = 'center';
    flyer.style.justifyContent = 'center';
    flyer.style.color = '#FFF';
    flyer.innerHTML = '<span class="material-symbols-rounded" style="font-size:12px;">assignment</span>';
    
    document.body.appendChild(flyer);
    
    // Force reflow
    flyer.offsetWidth;
    
    flyer.style.left = `${targetRect.left + targetRect.width / 2}px`;
    flyer.style.top = `${targetRect.top + targetRect.height / 2}px`;
    flyer.style.transform = 'scale(0.3)';
    flyer.style.opacity = '0.5';
    
    setTimeout(() => {
        flyer.remove();
        // Shake/pulse the top bar icon
        target.style.transform = 'scale(1.25)';
        setTimeout(() => target.style.transform = 'none', 300);
        
        // Show Task Sent popup beside icon
        const checkBadge = document.createElement('div');
        checkBadge.style.position = 'fixed';
        checkBadge.style.left = `${targetRect.left - 30}px`;
        checkBadge.style.top = `${targetRect.top + 36}px`;
        checkBadge.style.background = '#2BA082';
        checkBadge.style.color = '#FFF';
        checkBadge.style.padding = '4px 8px';
        checkBadge.style.borderRadius = '4px';
        checkBadge.style.fontSize = '10px';
        checkBadge.style.fontWeight = '600';
        checkBadge.textContent = '🚀 Dispatched!';
        checkBadge.style.zIndex = '100000';
        checkBadge.style.animation = 'fadeOut 1.5s forwards';
        document.body.appendChild(checkBadge);
        setTimeout(() => checkBadge.remove(), 1500);
    }, 800);
}

function updateTasksDropdownUI() {
    const badge = document.getElementById('tasks-badge-dot');
    const container = document.getElementById('tasks-list-container');
    const noTasks = document.getElementById('no-tasks-state');
    const pill = document.getElementById('tasks-count-pill');
    
    const count = state.scoutingAssignments.length;
    
    if (count > 0) {
        badge.classList.remove('hidden');
        if (noTasks) noTasks.style.display = 'none';
        
        pill.textContent = `${count} Pending`;
        pill.style.background = '#FFF3CD';
        pill.style.color = '#856404';
        
        // Render tasks
        container.innerHTML = state.scoutingAssignments.map(task => `
            <div class="tasks-item">
                <div class="tasks-item-header">
                    <span class="tasks-item-title">${task.entityName}</span>
                    <span class="tasks-item-priority ${task.priority}">${task.priority}</span>
                </div>
                <div style="font-size: 11px; font-weight: 600; color: #1e3f20;">
                    ${task.type}
                </div>
                ${task.notes ? `<div class="tasks-item-notes">${task.notes}</div>` : ''}
                <div class="tasks-item-meta" style="margin-top:4px;">
                    <span>Assignee: <strong>${task.assignee}</strong></span>
                    <span>${task.date}</span>
                </div>
            </div>
        `).join('');
    } else {
        badge.classList.add('hidden');
        pill.textContent = '0 Tasks';
        pill.style.background = 'var(--border-subtle)';
        pill.style.color = 'var(--text-secondary)';
        
        if (container) {
            container.innerHTML = `
                <div class="no-tasks-state" id="no-tasks-state" style="text-align:center; padding:24px 8px; color:var(--text-secondary);">
                    <span class="material-symbols-rounded" style="font-size:36px; color:var(--border-subtle); margin-bottom:8px;">task_alt</span>
                    <p style="font-size:12px; margin:0;">No active field assignments</p>
                </div>
            `;
        }
    }
}

// Expose key modular functions to the global scope so they work as inline click event handlers
window.selectBlock = selectBlock;
window.selectSensor = selectSensor;
window.selectRanch = selectRanch;
window.showOrganisationDashboard = showOrganisationDashboard;

// --- ORGANIZATION DASHBOARD OVERVIEW ENGINE ---
function showOrganisationDashboard(initialRanchId) {
    const RANCH_LIST = [
      {
        id: 'R1',
        name: 'Sierra Orchards',
        urgency: 'STABLE',
        badgeClass: 'org-badge-stable',
        dotClass: 'org-dot-stable',
        count: 18,
        blocks: 10,
        activeSensors: 126,
        uptime: '99.5%',
        trend: '-3%',
        desc: 'No major surge. Pest activity remains below the standard grid threshold.',
        color: '#0F5A47'
      },
      {
        id: 'R2',
        name: 'Sunshine Valley Ranch',
        urgency: 'CRITICAL',
        badgeClass: 'org-badge-critical',
        dotClass: 'org-dot-critical animate-pulse',
        count: 98,
        blocks: 12,
        activeSensors: 144,
        uptime: '99.2%',
        trend: '+24%',
        desc: 'Spike detected in Block 4 & Block 8. Pheromone trap thresholds exceeded.',
        color: '#E03131'
      },
      {
        id: 'R3',
        name: 'Golden Harvest Farms',
        urgency: 'WARNING',
        badgeClass: 'org-badge-warning',
        dotClass: 'org-dot-warning',
        count: 52,
        blocks: 14,
        activeSensors: 180,
        uptime: '98.8%',
        trend: '+5%',
        desc: 'Mild fluctuation in walnut orchards. Traps approaching monitor limits.',
        color: '#F08C00'
      },
      {
        id: 'R4',
        name: 'Pacific Ag Vineyards',
        urgency: 'STABLE',
        badgeClass: 'org-badge-stable',
        dotClass: 'org-dot-stable',
        count: 8,
        blocks: 12,
        activeSensors: 170,
        uptime: '97.4%',
        trend: 'Flat',
        desc: 'Stable pressure level. Standard field scouting intervals maintained.',
        color: '#2BA082'
      }
    ];

    const TRAJECTORY_DATA = {
      R1: [15, 16, 18, 15, 17, 19, 18, 20, 22, 21, 20, 22, 24, 25, 23, 22, 21, 19, 20, 22, 24, 23, 21, 20, 18, 19, 21, 20, 19, 18],
      R2: [45, 42, 40, 38, 35, 30, 28, 29, 32, 35, 38, 41, 48, 55, 62, 70, 82, 95, 105, 110, 108, 102, 99, 98, 97, 95, 96, 94, 95, 98],
      R3: [30, 32, 31, 33, 35, 34, 37, 40, 42, 41, 44, 46, 45, 48, 51, 53, 52, 50, 48, 49, 52, 54, 53, 51, 53, 55, 54, 52, 53, 52],
      R4: [10, 11, 9, 8, 10, 12, 11, 10, 9, 8, 7, 9, 11, 10, 9, 8, 8, 9, 11, 12, 10, 9, 8, 8, 7, 8, 9, 8, 8, 8]
    };

    // Match initial selected ranch by ID or Name
    let selectedRanchId = 'R2';
    if (initialRanchId) {
        // If initialRanchId is block/ranch name or ID, find it
        const found = RANCH_LIST.find(r => r.id === initialRanchId || r.name.toLowerCase().includes(initialRanchId.toLowerCase()) || initialRanchId.toLowerCase().includes(r.id.toLowerCase()));
        if (found) selectedRanchId = found.id;
    }

    const chartHeight = 220;
    const chartWidth = 700;
    const paddingLeft = 40;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 30;

    function pointsForRanch(ranchId) {
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
    }

    function createSvgPath(points) {
        return points.reduce((pathStr, pt, i) => {
            if (i === 0) return `M ${pt.x} ${pt.y}`;
            const prev = points[i - 1];
            const cpX1 = prev.x + (pt.x - prev.x) / 2;
            const cpY1 = prev.y;
            const cpX2 = prev.x + (pt.x - prev.x) / 2;
            const cpY2 = pt.y;
            return `${pathStr} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${pt.x} ${pt.y}`;
        }, '');
    }

    const orgView = document.getElementById('organisation-dashboard-view');
    if (!orgView) return;

    orgView.classList.remove('hidden');

    function render() {
        const selectedRanch = RANCH_LIST.find(r => r.id === selectedRanchId);

        // Build SVGs paths
        let pathsHtml = '';
        let anchorDotsHtml = '';
        RANCH_LIST.forEach(r => {
            const pts = pointsForRanch(r.id);
            const pathData = createSvgPath(pts);
            const isSel = r.id === selectedRanchId;
            pathsHtml += `
                <path
                    d="${pathData}"
                    fill="none"
                    stroke="${r.color}"
                    stroke-width="${isSel ? '3.5' : '1.5'}"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    style="transition: all 0.2s;"
                    opacity="${isSel ? 1 : 0.25}"
                />
            `;
            anchorDotsHtml += `
                <circle
                    id="org-chart-dot-${r.id}"
                    cx="0"
                    cy="0"
                    r="${isSel ? '5' : '3'}"
                    fill="${r.color}"
                    stroke="#FFF"
                    stroke-width="1.5"
                    display="none"
                />
            `;
        });

        // Horizontal Gridlines
        let gridlinesHtml = '';
        [0, 20, 40, 60, 80, 100, 120].forEach(val => {
            const usableHeight = chartHeight - paddingTop - paddingBottom;
            const y = paddingTop + usableHeight - (val / 120) * usableHeight;
            gridlinesHtml += `
                <g class="org-grid-g">
                    <line x1="${paddingLeft}" y1="${y}" x2="${chartWidth - paddingRight}" y2="${y}" stroke="#4A5B53" stroke-width="0.75" stroke-dasharray="4 4" opacity="0.15" />
                    <text x="${paddingLeft - 8}" y="${y + 4}" text-anchor="end" fill="#4A5B53" font-size="9" font-weight="600" opacity="0.65">${val}</text>
                </g>
            `;
        });

        // X-Axis labels
        let xAxisHtml = '';
        [0, 7, 14, 21, 29].forEach(idx => {
            const usableWidth = chartWidth - paddingLeft - paddingRight;
            const x = paddingLeft + (idx / 29) * usableWidth;
            xAxisHtml += `
                <text x="${x}" y="${chartHeight - 8}" text-anchor="middle" fill="#4A5B53" font-size="9" font-weight="600" opacity="0.65">Day ${idx + 1}</text>
            `;
        });

        orgView.innerHTML = `
            <style>
                .org-wrapper {
                    display: flex;
                    flex-direction: column;
                    width: 100%;
                    height: 100%;
                    background-color: #f4f7f6;
                    font-family: 'Inter', sans-serif;
                    overflow: hidden;
                }
                .org-header {
                    background: rgba(255, 255, 255, 0.7);
                    backdrop-filter: blur(10px);
                    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
                    padding: 14px 24px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    flex-shrink: 0;
                }
                .org-btn-back {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    background: none;
                    border: none;
                    color: var(--brand-primary);
                    font-weight: 700;
                    font-size: 13px;
                    cursor: pointer;
                    padding: 6px 12px;
                    border-radius: 8px;
                    background: rgba(15, 90, 71, 0.05);
                    transition: all 0.2s;
                }
                .org-btn-back:hover {
                    background: rgba(15, 90, 71, 0.1);
                    color: var(--brand-light);
                }
                .org-metrics-row {
                    padding: 20px 24px;
                    padding-bottom: 4px;
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 16px;
                    flex-shrink: 0;
                }
                .org-kpi-card {
                    background: rgba(255, 255, 255, 0.85);
                    border: 1px solid rgba(0, 0, 0, 0.06);
                    border-radius: 12px;
                    padding: 16px;
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.01);
                }
                .org-kpi-icon {
                    width: 44px;
                    height: 44px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                }
                .org-kpi-info h3 {
                    font-size: 18px;
                    font-weight: 700;
                    margin: 2px 0 0 0;
                    color: #111815;
                }
                .org-kpi-info p {
                    font-size: 10px;
                    font-weight: 700;
                    color: #4A5B53;
                    text-transform: uppercase;
                    margin: 0;
                    letter-spacing: 0.5px;
                }
                .org-kpi-info span {
                    font-size: 11px;
                    color: #4A5B53;
                    opacity: 0.8;
                }
                .org-split-body {
                    flex-grow: 1;
                    display: flex;
                    overflow: hidden;
                    min-height: 0;
                }
                .org-left-canvas {
                    width: 70%;
                    height: 100%;
                    overflow-y: auto;
                    padding: 0 24px 24px 24px;
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }
                .org-right-sidebar {
                    width: 30%;
                    height: 100%;
                    overflow-y: auto;
                    padding: 0 24px 24px 24px;
                    background: rgba(255, 255, 255, 0.35);
                    border-left: 1px solid rgba(0, 0, 0, 0.06);
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }
                .org-card-box {
                    background: rgba(255, 255, 255, 0.9);
                    border: 1px solid rgba(0, 0, 0, 0.06);
                    border-radius: 16px;
                    padding: 20px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.01);
                }
                .org-legend-btn {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 4px 10px;
                    border-radius: 12px;
                    border: 1px solid transparent;
                    font-size: 11px;
                    font-weight: 700;
                    cursor: pointer;
                    background: none;
                    color: #4A5B53;
                    transition: all 0.15s;
                }
                .org-legend-btn.active {
                    background: rgba(0, 0, 0, 0.05);
                    border-color: rgba(0, 0, 0, 0.08);
                    color: #111815;
                }
                .org-badge {
                    font-size: 9px;
                    font-weight: 800;
                    padding: 2px 8px;
                    border-radius: 10px;
                    border: 1px solid;
                    text-transform: uppercase;
                }
                .org-badge-stable { background: bg-emerald-50; color: #2B8A3E; border-color: rgba(43, 138, 98, 0.15); }
                .org-badge-warning { background: #FEF3E6; color: #F08C00; border-color: rgba(240, 140, 0, 0.15); }
                .org-badge-critical { background: #FCE8E6; color: #E03131; border-color: rgba(224, 49, 49, 0.15); }
                
                .org-dot {
                    width: 7px;
                    height: 7px;
                    border-radius: 50%;
                    display: inline-block;
                }
                .org-dot-stable { background-color: #2B8A3E; }
                .org-dot-warning { background-color: #F08C00; }
                .org-dot-critical { background-color: #E03131; }

                .org-ranch-item {
                    border: 1px solid rgba(0, 0, 0, 0.06);
                    background: #FFF;
                    border-radius: 12px;
                    padding: 14px;
                    cursor: pointer;
                    transition: all 0.15s;
                }
                .org-ranch-item.active {
                    border-color: #0F5A47;
                    box-shadow: 0 0 0 1px #0F5A47;
                }
                .org-crop-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 16px;
                }
                .org-crop-card {
                    background: rgba(255, 255, 255, 0.9);
                    border: 1px solid rgba(0, 0, 0, 0.06);
                    border-radius: 12px;
                    padding: 16px;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                }
                .org-progress-bar {
                    height: 8px;
                    background: #f4f7f6;
                    border-radius: 4px;
                    overflow: hidden;
                    width: 100%;
                }
                .org-progress-fill {
                    height: 100%;
                    background: #0F5A47;
                    border-radius: 4px;
                }
                
                @keyframes pulseSubtle {
                    0%, 100% { border-color: rgba(224, 49, 49, 0.4); box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05); }
                    50% { border-color: rgba(224, 49, 49, 0.8); box-shadow: 0 0 8px 0 rgba(224, 49, 49, 0.15); }
                }
                .animate-pulse-subtle {
                    animation: pulseSubtle 3s infinite ease-in-out;
                }
                .animate-fadeIn {
                    animation: orgFadeIn 0.2s ease-out forwards;
                }
                @keyframes orgFadeIn {
                    from { opacity: 0; transform: translateY(4px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            </style>

            <div class="org-wrapper">
                {/* HEADER */}
                <header class="org-header">
                    <div style="display:flex; align-items:center; gap:16px;">
                        <button class="org-btn-back" id="btn-back-to-ranch">
                            <span class="material-symbols-rounded" style="font-size:16px;">chevron_left</span>
                            Back to Ranch
                        </button>
                        <div style="width:1px; height:20px; background:rgba(0,0,0,0.1);"></div>
                        <div style="display:flex; align-items:center; gap:8px;">
                            <span class="material-symbols-rounded" style="font-size:24px; color:#0F5A47;">corporate_fare</span>
                            <div>
                                <h1 style="font-size:15px; font-weight:800; margin:0; line-height:1.2;">RapidAIM</h1>
                                <p style="font-size:9px; font-weight:700; color:#4A5B53; text-transform:uppercase; margin:0; letter-spacing:0.5px;">Organization Dashboard</p>
                            </div>
                        </div>
                    </div>
                    
                    <div style="display:flex; align-items:center; gap:16px;">
                        <div style="display:flex; align-items:center; gap:6px; background:rgba(15, 90, 71, 0.05); border:1px solid rgba(15, 90, 71, 0.1); padding:4px 12px; border-radius:20px; font-size:11px; font-weight:700; color:#0F5A47;">
                            <span class="org-dot org-dot-stable" style="width:6px; height:6px; animation: pulse 2s infinite;"></span>
                            Live Enterprise Sync
                        </div>
                        <div style="display:flex; align-items:center; gap:8px;">
                            <div style="width:28px; height:28px; border-radius:50%; background:rgba(43, 160, 130, 0.1); border:1px solid rgba(43, 160, 130, 0.3); display:flex; align-items:center; justify-content:center; font-weight:700; font-size:12px; color:#0f5a47;">
                                YH
                            </div>
                            <span style="font-size:12px; font-weight:600; color:#4A5B53;">Yuechen Hu</span>
                        </div>
                    </div>
                </header>

                {/* KPI METRICS ROW */}
                <section class="org-metrics-row">
                    <div class="org-kpi-card">
                        <div class="org-kpi-icon" style="background:rgba(15, 90, 71, 0.05); color:#0F5A47; border:1px solid rgba(15, 90, 71, 0.1);">
                            <span class="material-symbols-rounded">grid_view</span>
                        </div>
                        <div class="org-kpi-info">
                            <p>Group Asset Scale</p>
                            <h3>4 Ranches / 48 Blocks</h3>
                            <span>2,800 Total Managed Acres</span>
                        </div>
                    </div>
                    
                    <div class="org-kpi-card">
                        <div class="org-kpi-icon" style="background:#EAF5EC; color:#2B8A3E; border:1px solid rgba(43,138,62,0.1);">
                            <span class="material-symbols-rounded">sensors</span>
                        </div>
                        <div class="org-kpi-info">
                            <p>Active Grid Health</p>
                            <h3>620 Sensors Connected</h3>
                            <span style="color:#2B8A3E; font-weight:700;">● 98.5% Uptime</span>
                        </div>
                    </div>

                    <div class="org-kpi-card">
                        <div class="org-kpi-icon" style="background:#FCE8E6; color:#E03131; border:1px solid rgba(224,49,49,0.1);">
                            <span class="material-symbols-rounded">report_problem</span>
                        </div>
                        <div class="org-kpi-info">
                            <p>Current Risk Status</p>
                            <h3 style="color:#E03131;">🚨 8 Blocks Breached</h3>
                            <span style="color:#E03131; font-weight:700;">Urgent Response Triggered</span>
                        </div>
                    </div>

                    <div class="org-kpi-card">
                        <div class="org-kpi-icon" style="background:rgba(43, 160, 130, 0.05); color:#2BA082; border:1px solid rgba(43,160,130,0.1);">
                            <span class="material-symbols-rounded">assignment</span>
                        </div>
                        <div class="org-kpi-info">
                            <p>Active Field Logistics</p>
                            <h3>12 Scouting Pending</h3>
                            <span>3 Work Orders Approved</span>
                        </div>
                    </div>
                </section>

                {/* SPLIT BODY */}
                <div class="org-split-body">
                    {/* Left Canvas */}
                    <div class="org-left-canvas">
                        {/* SVG Chart Box */}
                        <div class="org-card-box" style="display:flex; flex-direction:column;">
                            <div style="display:flex; align-items:center; justify-content:between; margin-bottom:14px;">
                                <div>
                                    <h2 style="font-size:14px; font-weight:800; margin:0; color:#111815;">30-Day Multi-Site Pest Pressure Trajectory</h2>
                                    <p style="font-size:11px; color:#4A5B53; margin:2px 0 0 0;">Daily count aggregated at ranch scale. Multi-track comparison.</p>
                                </div>
                                <div style="display:flex; align-items:center; gap:12px; margin-left:auto;">
                                    ${RANCH_LIST.map(r => `
                                        <button class="org-legend-btn ${r.id === selectedRanchId ? 'active' : ''}" data-ranch-id="${r.id}">
                                            <span style="width:9px; height:9px; border-radius:50%; background-color:${r.color}; display:inline-block;"></span>
                                            ${r.name.split(' ').slice(0,2).join(' ')}
                                        </button>
                                    `).join('')}
                                </div>
                            </div>
                            
                            <div style="position:relative; width:100%; display:flex; justify-content:center;">
                                <svg viewBox="0 0 700 220" style="width:100%; height:auto; overflow:visible;" id="org-svg-chart">
                                    ${gridlinesHtml}
                                    ${xAxisHtml}
                                    ${pathsHtml}
                                    <line id="org-chart-vertical-line" x1="0" y1="${paddingTop}" x2="0" y2="${chartHeight - paddingBottom}" stroke="#0F5A47" stroke-width="1.5" stroke-dasharray="3 3" display="none" />
                                    ${anchorDotsHtml}
                                </svg>
                                
                                <div id="org-chart-tooltip" style="position:absolute; display:none; flex-direction:column; gap:4px; background:rgba(255,255,255,0.96); border:1px solid rgba(0,0,0,0.1); border-radius:10px; padding:10px; box-shadow:0 4px 12px rgba(0,0,0,0.08); pointer-events:none; font-size:11px; z-index:20; min-width:140px;">
                                    {/* Tooltip Content */}
                                </div>
                            </div>
                        </div>

                        {/* Systemic Risk Matrix */}
                        <div style="display:flex; flex-direction:column; gap:6px;">
                            <h2 style="font-size:14px; font-weight:800; margin:0; color:#111815;">Systemic Portfolio Risk Matrix (By Crop Type)</h2>
                            <p style="font-size:11px; color:#4A5B53; margin:0;">Crop-level distribution summary and response metrics.</p>
                            
                            <div class="org-crop-grid">
                                {/* Almonds */}
                                <div class="org-crop-card" style="border-left:4px solid #2B8A3E;">
                                    <div>
                                        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
                                            <span class="org-badge" style="background:#EAF5EC; color:#2B8A3E; border-color:rgba(43,138,62,0.15);">STABLE</span>
                                            <span class="material-symbols-rounded" style="font-size:16px; color:#2B8A3E;">eco</span>
                                        </div>
                                        <h4 style="font-size:13px; font-weight:800; margin:0; color:#111815;">Almonds Portfolio</h4>
                                        <p style="font-size:11px; color:#4A5B53; margin:6px 0 0 0; line-height:1.4;">Stable across 2,200 acres. Pressure index is 12% below historic average.</p>
                                    </div>
                                    <div style="margin-top:12px; padding-top:8px; border-top:1px solid rgba(0,0,0,0.05); display:flex; justify-content:space-between; font-size:10px; font-weight:700; color:#4A5B53;">
                                        <span>24 Active Traps</span>
                                        <span style="color:#2B8A3E;">12 Avg Count</span>
                                    </div>
                                </div>

                                {/* Walnuts */}
                                <div class="org-crop-card" style="border-left:4px solid #F08C00;">
                                    <div>
                                        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
                                            <span class="org-badge" style="background:#FEF3E6; color:#F08C00; border-color:rgba(240,140,0,0.15);">MONITOR</span>
                                            <span class="material-symbols-rounded" style="font-size:16px; color:#F08C00;">eco</span>
                                        </div>
                                        <h4 style="font-size:13px; font-weight:800; margin:0; color:#111815;">Walnuts Portfolio</h4>
                                        <p style="font-size:11px; color:#4A5B53; margin:6px 0 0 0; line-height:1.4;">Moderate variance detected in Sector B. Last night count: 48 (threshold: 70).</p>
                                    </div>
                                    <div style="margin-top:12px; padding-top:8px; border-top:1px solid rgba(0,0,0,0.05); display:flex; justify-content:space-between; font-size:10px; font-weight:700; color:#4A5B53;">
                                        <span>14 Active Traps</span>
                                        <span style="color:#F08C00;">42 Avg Count</span>
                                    </div>
                                </div>

                                {/* Citrus */}
                                <div class="org-crop-card animate-pulse-subtle" style="border-left:4px solid #E03131; border-right:1px solid rgba(224,49,49,0.15); border-top:1px solid rgba(224,49,49,0.15); border-bottom:1px solid rgba(224,49,49,0.15);">
                                    <div>
                                        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
                                            <span class="org-badge" style="background:#FCE8E6; color:#E03131; border-color:rgba(224,49,49,0.15);">CRITICAL</span>
                                            <span class="material-symbols-rounded" style="font-size:16px; color:#E03131;">report</span>
                                        </div>
                                        <h4 style="font-size:13px; font-weight:800; margin:0; color:#111815;">Citrus Portfolio</h4>
                                        <p style="font-size:11px; color:#E03131; margin:6px 0 0 0; line-height:1.4; font-weight:700;">CRITICAL: Citrus Gall Wasp surge across 3 properties. Immediate operational spraying advised.</p>
                                    </div>
                                    <div style="margin-top:12px; padding-top:8px; border-top:1px solid rgba(224,49,49,0.15); display:flex; justify-content:space-between; font-size:10px; font-weight:700; color:#E03131;">
                                        <span>10 Active Traps</span>
                                        <span style="font-weight:800;">98 Avg Count</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar */}
                    <div class="org-right-sidebar">
                        {/* Ranch Index */}
                        <div style="display:flex; flex-direction:column; gap:6px;">
                            <h2 style="font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:0.5px; color:#4A5B53; margin:0;">Ranch Urgency Index</h2>
                            <p style="font-size:10px; color:#4A5B53; opacity:0.85; margin:0;">Priority ranked properties overview.</p>
                            
                            <div style="display:flex; flex-direction:column; gap:10px; margin-top:4px;">
                                ${RANCH_LIST.map(r => {
                                    const isSel = r.id === selectedRanchId;
                                    return `
                                        <div class="org-ranch-item ${isSel ? 'active' : ''}" data-ranch-id="${r.id}">
                                            <div style="display:flex; align-items:center; justify-content:space-between;">
                                                <span style="font-size:12px; font-weight:800; color:#111815;">${r.name}</span>
                                                <span class="org-badge ${r.badgeClass}">${r.urgency}</span>
                                            </div>
                                            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px; font-size:11px; font-weight:600; color:#4A5B53;">
                                                <span>${r.blocks} Blocks • ${r.activeSensors} Sensors</span>
                                                <span>Count: <strong style="color:${r.color};">${r.count}</strong></span>
                                            </div>
                                            
                                            ${isSel ? `
                                                <div class="animate-fadeIn" style="margin-top:10px; padding-top:10px; border-top:1px solid rgba(0,0,0,0.05); font-size:11px; line-height:1.4;">
                                                    <p style="font-style:italic; margin:0 0 8px 0; color:#111815;">${r.desc}</p>
                                                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
                                                        <div style="background:#f4f7f6; padding:6px 10px; border-radius:6px;">
                                                            <p style="font-size:8px; font-weight:700; text-transform:uppercase; color:#4A5B53; margin:0;">Uptime</p>
                                                            <p style="font-size:11px; font-weight:800; color:#111815; margin:2px 0 0 0;">${r.uptime}</p>
                                                        </div>
                                                        <div style="background:#f4f7f6; padding:6px 10px; border-radius:6px;">
                                                            <p style="font-size:8px; font-weight:700; text-transform:uppercase; color:#4A5B53; margin:0;">30d Trend</p>
                                                            <p style="font-size:11px; font-weight:800; color:${r.trend.startsWith('+') ? '#E03131' : '#2B8A3E'}; margin:2px 0 0 0;">${r.trend}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ` : ''}
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>

                        {/* Live Task Pipeline */}
                        <div style="display:flex; flex-direction:column; gap:6px;">
                            <h2 style="font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:0.5px; color:#4A5B53; margin:0;">Live Task Pipeline</h2>
                            <p style="font-size:10px; color:#4A5B53; opacity:0.85; margin:0;">Active assignments and task workflows.</p>
                            
                            <div class="org-card-box" style="padding:16px; display:flex; flex-direction:column; gap:12px; margin-top:4px;">
                                <div>
                                    <div style="display:flex; justify-content:space-between; font-size:11px; font-weight:800; margin-bottom:6px;">
                                        <span style="display:flex; align-items:center; gap:6px;">
                                            <span style="width:6px; height:6px; border-radius:50%; background:#2B8A3E; display:inline-block;"></span>
                                            Scouting Assignments
                                        </span>
                                        <span style="color:#0F5A47;">65% Done</span>
                                    </div>
                                    <div class="org-progress-bar">
                                        <div class="org-progress-fill" style="width:65%;"></div>
                                    </div>
                                    <p style="font-size:9px; color:#4A5B53; margin:4px 0 0 0; font-weight:600;">12 Active Tasks, 8 Scouts Deployed in Field</p>
                                </div>
                                
                                <div style="padding-top:10px; border-top:1px solid rgba(0,0,0,0.05);">
                                    <div style="display:flex; justify-content:space-between; font-size:11px; font-weight:800; margin-bottom:4px;">
                                        <span style="display:flex; align-items:center; gap:6px;">
                                            <span style="width:6px; height:6px; border-radius:50%; background:#F08C00; display:inline-block;"></span>
                                            Spraying Work Orders
                                        </span>
                                        <span style="color:#F08C00;">3 Approved</span>
                                    </div>
                                    <p style="font-size:9px; color:#4A5B53; margin:0; font-weight:600;">1 In-Progress, 2 Scheduled for Next 48 Hours</p>
                                </div>

                                <div style="padding-top:10px; border-top:1px solid rgba(0,0,0,0.05);">
                                    <div style="display:flex; justify-content:space-between; font-size:11px; font-weight:800; margin-bottom:4px;">
                                        <span style="display:flex; align-items:center; gap:6px; color:#2B8A3E;">
                                            <span class="material-symbols-rounded" style="font-size:14px; vertical-align:middle;">check_circle</span>
                                            Resolved Incidents
                                        </span>
                                        <span style="color:#2B8A3E;">15 Resolved</span>
                                    </div>
                                    <p style="font-size:9px; color:#4A5B53; opacity:0.8; margin:0;">This week. Click to view historical scout logs.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Back button click listener
        document.getElementById('btn-back-to-ranch').addEventListener('click', () => {
            orgView.classList.add('hidden');
        });

        // Ranch list item click listeners
        orgView.querySelectorAll('.org-ranch-item').forEach(item => {
            item.addEventListener('click', () => {
                selectedRanchId = item.getAttribute('data-ranch-id');
                render();
            });
        });

        // Legend button click listeners
        orgView.querySelectorAll('.org-legend-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // Avoid triggering list item click
                selectedRanchId = btn.getAttribute('data-ranch-id');
                render();
            });
        });

        // SVG Tooltip & Interaction Logic
        const svg = document.getElementById('org-svg-chart');
        if (svg) {
            svg.addEventListener('mousemove', (e) => {
                const rect = svg.getBoundingClientRect();
                const xPos = e.clientX - rect.left - paddingLeft;
                const usableWidth = rect.width - paddingLeft - paddingRight;
                if (xPos >= 0 && xPos <= usableWidth) {
                    const dayPct = xPos / usableWidth;
                    const index = Math.min(29, Math.max(0, Math.round(dayPct * 29)));
                    
                    // Show vertical line
                    const verticalLine = document.getElementById('org-chart-vertical-line');
                    if (verticalLine) {
                        const lineX = paddingLeft + (index / 29) * (chartWidth - paddingLeft - paddingRight);
                        verticalLine.setAttribute('x1', lineX);
                        verticalLine.setAttribute('x2', lineX);
                        verticalLine.setAttribute('display', 'block');
                    }

                    // Show anchor dots
                    RANCH_LIST.forEach(r => {
                        const dot = document.getElementById(`org-chart-dot-${r.id}`);
                        if (dot) {
                            const pts = pointsForRanch(r.id);
                            const pt = pts[index];
                            dot.setAttribute('cx', pt.x);
                            dot.setAttribute('cy', pt.y);
                            dot.setAttribute('display', 'block');
                        }
                    });

                    // Show/update tooltip
                    const tooltip = document.getElementById('org-chart-tooltip');
                    if (tooltip) {
                        tooltip.style.display = 'flex';
                        tooltip.style.left = `${(index / 29) * 80 + 8}%`;
                        tooltip.style.top = `20px`;
                        
                        let itemsHtml = `<div style="font-weight:bold; border-bottom:1px solid rgba(0,0,0,0.05); padding-bottom:4px; margin-bottom:4px;">Day ${index + 1} Status</div>`;
                        RANCH_LIST.forEach(r => {
                            const val = TRAJECTORY_DATA[r.id][index];
                            const isSel = r.id === selectedRanchId;
                            itemsHtml += `
                                <div style="display:flex; justify-content:space-between; align-items:center; gap:16px; font-weight:${isSel?'bold':'normal'}; color:${isSel?'#111815':'#4A5B53'}">
                                    <span style="display:flex; align-items:center; gap:6px;">
                                        <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background-color:${r.color};"></span>
                                        ${r.name.split(' ').slice(0,2).join(' ')}
                                    </span>
                                    <span>${val} pests</span>
                                </div>
                            `;
                        });
                        tooltip.innerHTML = itemsHtml;
                    }
                }
            });

            svg.addEventListener('mouseleave', () => {
                const verticalLine = document.getElementById('org-chart-vertical-line');
                if (verticalLine) verticalLine.setAttribute('display', 'none');
                
                RANCH_LIST.forEach(r => {
                    const dot = document.getElementById(`org-chart-dot-${r.id}`);
                    if (dot) dot.setAttribute('display', 'none');
                });

                const tooltip = document.getElementById('org-chart-tooltip');
                if (tooltip) tooltip.style.display = 'none';
            });
        }
    }

    render();
}
