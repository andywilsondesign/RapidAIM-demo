import { generateMockData } from './mockData.js';

// Application State
const state = {
    data: null,
    pestType: 'female-now', // 'female-now' or 'male-now'
    threshold: 70,
    activeFarmId: 'all',
    selectedItem: null, // { type: 'block' | 'sensor', id: string }
    mapZoom: 13,
    layers: {
        heatmap: true,
        boundaries: true,
        sensors: true
    }
};

let map;
let blockLayerGroup;
let sensorLayerGroup;
let trendChartInstance = null;
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
    farmFilter.addEventListener('change', (e) => {
        state.activeFarmId = e.target.value;
        renderRankingList();
        updateMapVisuals();
    });

    // Layers Checkboxes
    document.getElementById('layer-heatmap').addEventListener('change', e => { state.layers.heatmap = e.target.checked; updateMapVisuals(); });
    document.getElementById('layer-boundaries').addEventListener('change', e => { state.layers.boundaries = e.target.checked; updateMapVisuals(); });
    document.getElementById('layer-sensors').addEventListener('change', e => { state.layers.sensors = e.target.checked; updateMapVisuals(); });

    // Back Panel Navigation
    document.getElementById('btn-back-panel').addEventListener('click', () => {
        if (state.selectedItem && state.selectedItem.type === 'ranch') {
            selectBlock(state.selectedItem.fromBlockId);
        } else if (state.selectedItem && state.selectedItem.type === 'sensor') {
            selectBlock(state.selectedItem.parentId);
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

        item.innerHTML = `
            <div class="ranking-item-info">
                <h3>${block.name}</h3>
                <p>${block.ranchName}</p>
                <p style="margin-top:4px;">Count: ${count} | Sensors: ${block.sensors.length}</p>
            </div>
            <div class="status-badge ${statusClass}" style="display:flex; align-items:center; gap:2px;">
                ${statusText}
                <span class="material-symbols-rounded" style="font-size:14px;">${arrowIcon}</span>
            </div>
        `;
        item.addEventListener('click', () => {
            selectBlock(block.id);
        });
        listEl.appendChild(item);
    });
}

function updateMapVisuals() {
    blockLayerGroup.clearLayers();
    sensorLayerGroup.clearLayers();

    const isZoomedIn = state.mapZoom >= 14;

    state.data.blocks.forEach(block => {
        if (state.activeFarmId !== 'all' && block.ranchId !== state.activeFarmId) return;

        const count = getPestCount(block);
        let fillColor = '#24A148'; // Low
        if (count >= state.threshold * 1.5) fillColor = '#FA4D56'; // High
        else if (count >= state.threshold) fillColor = '#F1C21B'; // Med

        const opacity = state.layers.heatmap ? 0.6 : 0.2;
        const weight = state.layers.boundaries ? 2 : 0;
        
        // Highlight stroke if selected
        const isSelected = state.selectedItem && state.selectedItem.type === 'block' && state.selectedItem.id === block.id;

        const polygon = L.polygon(block.polygon, {
            color: isSelected ? '#1FFFE1' : '#F1C21B',
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
                    
                    marker.bindTooltip(`Sensor ${sensor.id}<br>Count: ${getPestCount(sensor)}`, { className: 'custom-tooltip' });
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

function renderDetailView(selection) {
    let title, subtitle, name, count, trendData, hourlyData;
    const pestNameLabel = state.pestType === 'female-now' ? 'Female Navel Orangeworm' : 'Male Navel Orangeworm';
    
    const metaContainer = document.getElementById('sensor-meta');
    const dynamicActions = document.getElementById('dynamic-actions');
    const hourlyContainer = document.getElementById('hourly-chart-container');
    const trendTitle = document.getElementById('trend-chart-title');
    const backBtnText = document.getElementById('back-btn-text');
    
    let chartHoverType = 'line';

    if (selection.type === 'block') {
        const block = state.data.blocks.find(b => b.id === selection.id);
        title = block.name;
        const activeSensors = block.sensors.filter(s => s.active).length;
        subtitle = `${block.sensors.length} sensors • ${activeSensors} active`;
        name = pestNameLabel;
        count = getPestCount(block);
        trendData = state.pestType === 'female-now' ? block.trend_female : block.trend_male;
        hourlyData = state.pestType === 'female-now' ? block.hourly_female : block.hourly_male;
        
        // Compute Risk Color
        let blockRiskColor = '#2B8A3E'; // Green (Low)
        if (count >= state.threshold * 1.5) blockRiskColor = '#E03131'; // Red (High)
        else if (count >= state.threshold) blockRiskColor = '#F08C00'; // Amber (Med)
        
        // Block UI config
        backBtnText.textContent = "Back to Ranking";
        metaContainer.classList.add('hidden');
        hourlyContainer.classList.remove('hidden');
        trendTitle.textContent = '14-Day Trend';
        chartHoverType = 'line';
        
        dynamicActions.innerHTML = `
            <button class="btn btn-black" style="margin-bottom:8px; font-size:15px; padding:14px;">
                <span class="material-symbols-rounded">person_search</span> Assign Scouting
            </button>
            <div class="btn-group" style="margin-bottom:12px;">
                <button class="btn btn-secondary"><span class="material-symbols-rounded">build_circle</span> Create Work Order</button>
                <button class="btn btn-secondary" id="btn-generate-report"><span class="material-symbols-rounded">summarize</span> AI Report</button>
            </div>
            
            <button class="btn btn-ghost"><span class="material-symbols-rounded" style="font-size:18px;">edit</span> Edit Block</button>
            <button class="btn btn-ghost" id="btn-view-ranch"><span class="material-symbols-rounded" style="font-size:18px;">visibility</span> View Ranch Details</button>
        `;
        document.getElementById('btn-generate-report').addEventListener('click', window.promptReportModal);
        document.getElementById('btn-view-ranch').addEventListener('click', () => selectRanch(block.ranchId, block.id));

    } else if (selection.type === 'ranch') {
        const block = state.data.blocks.find(b => b.id === selection.fromBlockId);
        const ranchId = selection.id;
        
        // Compute combined counts
        const ranchBlocks = state.data.blocks.filter(b => b.ranchId === ranchId);
        let activeSensors = 0;
        let totalSensors = 0;
        let tF = Array(14).fill(0), tM = Array(14).fill(0);
        let hF = Array(24).fill(0), hM = Array(24).fill(0);
        let totalVal = 0;

        ranchBlocks.forEach(b => {
             totalSensors += b.sensors.length;
             activeSensors += b.sensors.filter(s => s.active).length;
             totalVal += getPestCount(b);
             for(let i=0;i<14;i++) { tF[i] += b.trend_female[i]; tM[i] += b.trend_male[i]; }
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
        trendTitle.textContent = '14-Day Trend';
        chartHoverType = 'line';

        dynamicActions.innerHTML = `
            <button class="btn btn-black" style="margin-bottom:8px; font-size:15px; padding:14px;">
                <span class="material-symbols-rounded">person_search</span> Assign Scouting
            </button>
            <div class="btn-group" style="margin-bottom:12px;">
                <button class="btn btn-secondary"><span class="material-symbols-rounded">build_circle</span> Create Work Order</button>
                <button class="btn btn-secondary" id="btn-generate-report"><span class="material-symbols-rounded">summarize</span> AI Report</button>
            </div>
            
            <button class="btn btn-ghost"><span class="material-symbols-rounded" style="font-size:18px;">edit_square</span> Edit Ranch</button>
        `;
        document.getElementById('btn-generate-report').addEventListener('click', window.promptReportModal);

    } else { // Sensor
        const block = state.data.blocks.find(b => b.id === selection.parentId);
        const sensor = block.sensors.find(s => s.id === selection.id);
        title = sensor.id;
        subtitle = `Located in ${block.name}`;
        name = pestNameLabel;
        
        if (!sensor.active) {
            count = 'OFFLINE';
            trendData = Array(14).fill(0);
            hourlyData = Array(24).fill(0);
        } else {
            count = getPestCount(sensor);
            trendData = state.pestType === 'female-now' ? sensor.trend_female : sensor.trend_male;
            hourlyData = state.pestType === 'female-now' ? sensor.hourly_female : sensor.hourly_male;
        }

        // Sensor UI Config
        backBtnText.textContent = `Back to ${block.name}`;
        metaContainer.classList.remove('hidden');
        hourlyContainer.classList.remove('hidden'); // Ensure hourly is visible
        trendTitle.textContent = '14-Day Trap Counts';
        chartHoverType = 'bar'; // Use bar chart for sensor trends
        
        metaContainer.innerHTML = `
            <div class="meta-item"><span class="meta-label">Status</span><span class="meta-value">${sensor.active ? '<span style="color:var(--status-green)">Active</span>' : '<span style="color:var(--status-red)">Offline</span>'}</span></div>
            <div class="meta-item"><span class="meta-label">Battery Level</span><span class="meta-value">${sensor.battery}%</span></div>
            <div class="meta-item"><span class="meta-label">Signal Quality</span><span class="meta-value">${sensor.quality}</span></div>
            <div class="meta-item"><span class="meta-label">Sensor Number</span><span class="meta-value">${sensor.id.split('-').pop()}</span></div>
        `;

        dynamicActions.innerHTML = `
            <button class="btn btn-black" style="margin-bottom:8px; font-size:15px; padding:14px;">
                <span class="material-symbols-rounded">person_search</span> Assign Scouting
            </button>
            <button class="btn btn-secondary" style="margin-bottom:12px;">
                <span class="material-symbols-rounded">build_circle</span> Create Work Order
            </button>
            
            <button class="btn btn-ghost"><span class="material-symbols-rounded" style="font-size:18px;">build</span> Edit Sensor</button>
        `;
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

    if (statusPill) {
        statusPill.className = 'status-pill hidden';
        if (count !== 'OFFLINE') {
            statusPill.classList.remove('hidden');
            let isHighRisk = false;
            let isLowRisk = false;

            if (count > 70) {
                statusPill.textContent = 'STATUS: URGENT ACTION';
                statusPill.classList.add('red');
                isHighRisk = true;
            } else if (count >= 40) {
                statusPill.textContent = 'STATUS: MONITOR';
                statusPill.classList.add('amber');
            } else {
                statusPill.textContent = 'STATUS: STABLE';
                statusPill.classList.add('green');
                isLowRisk = true;
            }

            if (trendIndicator && (selection.type === 'block' || selection.type === 'ranch')) {
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

                if (benchmarkElement && selection.type === 'block') {
                    benchmarkElement.classList.remove('hidden');
                    benchmarkElement.textContent = 'Farm Average: 45';
                }
            }
        }
    }

    let chartColor = '#2BA082'; // Default brand color for sensors
    // Distinguish risk color for block vs ranch
    if (selection.type === 'block' || selection.type === 'ranch') {
        const threshold = selection.type === 'block' ? state.threshold : state.threshold * 7; 
        if (count >= threshold * 1.5) chartColor = '#E03131';
        else if (count >= threshold) chartColor = '#F08C00';
        else chartColor = '#2B8A3E';
    }

    const statCard = document.querySelector('.stat-card.primary');
    if (statCard) {
        statCard.style.background = `linear-gradient(135deg, ${hexToRgba(chartColor, 0.1)}, ${hexToRgba(chartColor, 0.05)})`;
        statCard.style.borderColor = hexToRgba(chartColor, 0.3);
        const statValue = document.getElementById('detail-count');
        if (statValue) statValue.style.color = chartColor;
    }

    renderCharts(trendData, hourlyData, chartHoverType, chartColor);
}

// Chart.js global defaults
Chart.defaults.color = '#9AAEA6';
Chart.defaults.font.family = 'Inter';

function renderCharts(trendData, hourlyData, chartType = 'line', primaryColor = '#2BA082') {
    const trendCtx = document.getElementById('trendChart').getContext('2d');
    const hourlyCtx = document.getElementById('hourlyChart').getContext('2d');

    if (trendChartInstance) trendChartInstance.destroy();
    if (hourlyChartInstance) hourlyChartInstance.destroy();

    // Past 14 days labels
    const trendLabels = Array.from({length: 14}, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (13 - i));
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
