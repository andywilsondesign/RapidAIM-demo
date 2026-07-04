import { generateMockData } from './mockData.js';

// Application State
const state = {
    data: null,
    pestType: 'female-now', // 'female-now' or 'male-now'
    threshold: 70,
    activeFarmId: 'all',
    selectedItem: null, // { type: 'block' | 'sensor', id: string }
    chartOffset: 0,
    layers: {
        heatmap: true,
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
    initBottomSheet();
    initScoutingInteractivity();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

function initMap() {
    map = L.map('m-map', {
        zoomControl: false
    }).setView([36.625, -119.80], 12);
    
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Using Esri World Imagery for satellite view
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri'
    }).addTo(map);

    blockLayerGroup = L.featureGroup().addTo(map);
    sensorLayerGroup = L.featureGroup().addTo(map);
}

function initUI() {
    // Populate Ranch selector list
    const ranchContainer = document.getElementById('m-ranch-list');
    state.data.ranches.forEach(ranch => {
        const btn = document.createElement('button');
        btn.className = 'ranch-item';
        btn.setAttribute('data-ranch', ranch.id);
        btn.textContent = ranch.name;
        ranchContainer.appendChild(btn);
    });

    // Event listeners for right floating panel selector popups
    setupFABPopup('fab-layers', 'dropdown-layers');
    setupFABPopup('fab-pest', 'dropdown-pest');
    setupFABPopup('fab-ranch', 'dropdown-ranch');

    // Layers check toggles
    document.getElementById('m-layer-heatmap').addEventListener('change', e => {
        state.layers.heatmap = e.target.checked;
        updateMapVisuals();
    });
    document.getElementById('m-layer-sensors').addEventListener('change', e => {
        state.layers.sensors = e.target.checked;
        updateMapVisuals();
    });

    // Pest Type radio triggers
    document.querySelectorAll('input[name="m-pest-type"]').forEach(radio => {
        radio.addEventListener('change', e => {
            state.pestType = e.target.value;
            renderRankingList();
            updateMapVisuals();
            if(state.selectedItem) renderDetailView(state.selectedItem);
            closeAllFABDropdowns();
        });
    });

    // Ranch item selector buttons click
    ranchContainer.addEventListener('click', e => {
        const btn = e.target.closest('.ranch-item');
        if (!btn) return;
        
        document.querySelectorAll('.ranch-item').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        state.activeFarmId = btn.getAttribute('data-ranch');
        renderRankingList();
        updateMapVisuals();
        closeAllFABDropdowns();
        
        // Re-center map to ranch base
        if (state.activeFarmId === 'all') {
            map.flyTo([36.625, -119.80], 12);
        } else {
            const firstBlock = state.data.blocks.find(b => b.ranchId === state.activeFarmId);
            if(firstBlock) map.flyTo(firstBlock.center, 13);
        }
    });

    // Recenter GPS fab
    document.getElementById('fab-gps').addEventListener('click', () => {
        map.flyTo([36.625, -119.80], 12);
    });

    // Back Panel Navigation inside details bottom sheet
    document.getElementById('m-btn-back').addEventListener('click', () => {
        if (state.selectedItem && state.selectedItem.type === 'ranch') {
            selectBlock(state.selectedItem.fromBlockId);
        } else if (state.selectedItem && state.selectedItem.type === 'sensor') {
            selectBlock(state.selectedItem.parentId);
        } else {
            state.selectedItem = null;
            document.getElementById('m-state-list').classList.remove('hidden');
            document.getElementById('m-state-detail').classList.add('hidden');
            updateMapVisuals();
            setBottomSheetPosition('medium');
        }
    });

    // Charts navigation
    document.getElementById('m-btn-chart-prev').addEventListener('click', () => {
        state.chartOffset = Math.min(state.chartOffset + 1, 16);
        if (state.selectedItem) renderDetailView(state.selectedItem);
    });
    document.getElementById('m-btn-chart-next').addEventListener('click', () => {
        state.chartOffset = Math.max(state.chartOffset - 1, 0);
        if (state.selectedItem) renderDetailView(state.selectedItem);
    });
}

// FAB Floating panels triggers helpers
function setupFABPopup(btnId, dropdownId) {
    const btn = document.getElementById(btnId);
    const dropdown = document.getElementById(dropdownId);
    
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const wasHidden = dropdown.classList.contains('hidden');
        closeAllFABDropdowns();
        if (wasHidden) dropdown.classList.remove('hidden');
    });

    // Stop propagation inside dropdown clicks
    dropdown.addEventListener('click', e => e.stopPropagation());

    // Click outside dropdown closes it
    document.addEventListener('click', () => {
        dropdown.classList.add('hidden');
    });
}

function closeAllFABDropdowns() {
    document.querySelectorAll('.fab-dropdown').forEach(d => d.classList.add('hidden'));
}

// sliding Bottom Sheet Gestures & Heights toggling (Apple Maps experience)
let sheetState = 'medium'; // 'collapsed', 'medium', 'expanded'

function initBottomSheet() {
    const sheet = document.getElementById('bottom-sheet');
    const dragArea = document.getElementById('sheet-drag-handle');
    
    // Tap on handle area cycles between states
    dragArea.addEventListener('click', () => {
        if (sheetState === 'collapsed') {
            setBottomSheetPosition('medium');
        } else if (sheetState === 'medium') {
            setBottomSheetPosition('expanded');
        } else {
            setBottomSheetPosition('collapsed');
        }
    });

    // Touch events for drag & swipe gestures
    let startY = 0;
    let startTranslateY = 0;
    
    const getTranslateY = () => {
        if (sheetState === 'collapsed') return 320;
        if (sheetState === 'medium') return 120;
        return 0;
    };

    dragArea.addEventListener('touchstart', e => {
        startY = e.touches[0].clientY;
        startTranslateY = getTranslateY();
        sheet.style.transition = 'none';
    });

    dragArea.addEventListener('touchmove', e => {
        const currentY = e.touches[0].clientY;
        const diffY = currentY - startY;
        const newTranslateY = Math.max(0, Math.min(320, startTranslateY + diffY));
        sheet.style.transform = `translateY(${newTranslateY}px)`;
    });

    dragArea.addEventListener('touchend', e => {
        sheet.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)';
        const endY = e.changedTouches[0].clientY;
        const diffY = endY - startY;
        
        if (Math.abs(diffY) > 40) {
            if (diffY > 0) { // Dragged down
                if (sheetState === 'expanded') setBottomSheetPosition('medium');
                else setBottomSheetPosition('collapsed');
            } else { // Dragged up
                if (sheetState === 'collapsed') setBottomSheetPosition('medium');
                else setBottomSheetPosition('expanded');
            }
        } else {
            // Revert back
            setBottomSheetPosition(sheetState);
        }
    });
}

function setBottomSheetPosition(position) {
    sheetState = position;
    const sheet = document.getElementById('bottom-sheet');
    
    let translateY = 120; // default medium
    if (position === 'collapsed') translateY = 320;
    if (position === 'expanded') translateY = 0;
    
    sheet.style.transform = `translateY(${translateY}px)`;
}

// Pest Pressure dynamic ranking items list
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
    const th = state.threshold / 10;
    if (count >= th * 1.5) return 'sensor-high';
    if (count >= th) return 'sensor-med';
    return 'sensor-low';
}

function renderRankingList() {
    const listEl = document.getElementById('m-ranking-list');
    listEl.innerHTML = '';

    let blocks = state.data.blocks;
    if (state.activeFarmId !== 'all') {
        blocks = blocks.filter(b => b.ranchId === state.activeFarmId);
    }
    
    document.getElementById('m-list-count-badge').textContent = `${blocks.length} Blocks`;

    blocks.sort((a, b) => getPestCount(b) - getPestCount(a));

    blocks.forEach(block => {
        const count = getPestCount(block);
        const statusClass = getStatusClass(count);
        let statusText = 'Low';
        if (statusClass === 'status-high') statusText = 'High';
        if (statusClass === 'status-med') statusText = 'Med';

        const isPending = state.verificationPending[block.id];
        let statusBadgeHtml = '';
        if (isPending) {
            statusBadgeHtml = `
                <div class="status-badge amber" style="background:#FFF3CD; color:#856404; border:1px solid #FFEEBA; font-size:10px; font-weight:600; display:flex; align-items:center; gap:2px; padding:3px 6px; border-radius:4px;">
                    🟡 Pending
                </div>
            `;
        } else {
            statusBadgeHtml = `
                <div class="status-badge ${statusClass}" style="font-size:10px; font-weight:600; padding:3px 6px; border-radius:4px; text-transform:uppercase;">
                    ${statusText} Risk
                </div>
            `;
        }

        const item = document.createElement('div');
        item.className = 'm-ranking-item';
        item.innerHTML = `
            <div class="m-ranking-info">
                <h4>${block.name}</h4>
                <p>Count: <strong>${count}</strong> | Sensors: ${block.sensors.length}</p>
            </div>
            ${statusBadgeHtml}
        `;
        item.addEventListener('click', () => {
            selectBlock(block.id);
        });
        listEl.appendChild(item);
    });
}

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

function updateMapVisuals() {
    blockLayerGroup.clearLayers();
    sensorLayerGroup.clearLayers();

    const isZoomedIn = map.getZoom() >= 14;

    const counts = state.data.blocks.map(b => getPestCount(b));
    const maxCount = Math.max(...counts, 1);
    
    const sensorCounts = state.data.blocks.map(b => b.sensors.length);
    const maxSensors = Math.max(...sensorCounts, 1);

    state.data.blocks.forEach(block => {
        if (state.activeFarmId !== 'all' && block.ranchId !== state.activeFarmId) return;

        const count = getPestCount(block);
        const ratioCount = count / maxCount;
        const ratioSensors = block.sensors.length / maxSensors;
        
        const factor = (ratioCount * 0.6) + (ratioSensors * 0.4);
        
        let fillColor;
        if (factor <= 0.33) {
            fillColor = interpolateColor('#24A148', '#F1C21B', factor / 0.33);
        } else if (factor <= 0.66) {
            fillColor = interpolateColor('#F1C21B', '#FF8303', (factor - 0.33) / 0.33);
        } else {
            fillColor = interpolateColor('#FF8303', '#FA4D56', (factor - 0.66) / 0.34);
        }

        const opacity = state.layers.heatmap ? 0.6 : 0.0;
        const isSelected = state.selectedItem && state.selectedItem.type === 'block' && state.selectedItem.id === block.id;
        const strokeColor = isSelected ? '#1FFFE1' : 'rgba(255, 255, 255, 0.4)';

        const polygon = L.polygon(block.polygon, {
            color: strokeColor,
            weight: isSelected ? 3 : 2,
            fillColor: fillColor,
            fillOpacity: opacity
        });

        polygon.bindTooltip(block.name, { permanent: true, direction: "center", className: "block-label-mobile", interactive: false });
        polygon.on('click', () => { selectBlock(block.id); });
        
        blockLayerGroup.addLayer(polygon);

        // Render Sensors
        if (state.layers.sensors) {
            if (isZoomedIn || isSelected) {
                block.sensors.forEach(sensor => {
                    const sClass = getSensorClass(sensor);
                    const isSSelected = state.selectedItem && state.selectedItem.type === 'sensor' && state.selectedItem.id === sensor.id;
                    
                    const iconMarker = L.divIcon({
                        className: `sensor-marker ${sClass} ${isSSelected ? 'pulse' : ''}`,
                        iconSize: [12, 12]
                    });

                    const marker = L.marker([sensor.lat, sensor.lng], { icon: iconMarker });
                    
                    // No reaction when hovering sensor
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
    
    const block = state.data.blocks.find(b => b.id === blockId);
    if(block) {
        map.flyTo(block.center, 15, { duration: 1.2 });
    }

    document.getElementById('m-state-list').classList.add('hidden');
    document.getElementById('m-state-detail').classList.remove('hidden');
    updateMapVisuals();
    renderDetailView(state.selectedItem);
    setBottomSheetPosition('expanded'); // Swipe up bottom sheet on click
}

function selectSensor(blockId, sensorId) {
    state.chartOffset = 0;
    state.selectedItem = { type: 'sensor', id: sensorId, parentId: blockId };
    
    const block = state.data.blocks.find(b => b.id === blockId);
    const sensor = block.sensors.find(s => s.id === sensorId);
    
    if(sensor) {
        map.flyTo([sensor.lat, sensor.lng], 16, { duration: 1.2 });
    }

    document.getElementById('m-state-list').classList.add('hidden');
    document.getElementById('m-state-detail').classList.remove('hidden');
    updateMapVisuals();
    renderDetailView(state.selectedItem);
    setBottomSheetPosition('expanded');
}

function selectRanch(ranchId, fromBlockId) {
    state.chartOffset = 0;
    state.selectedItem = { type: 'ranch', id: ranchId, fromBlockId: fromBlockId };
    
    const firstBlock = state.data.blocks.find(b => b.ranchId === ranchId);
    if(firstBlock) {
        map.flyTo(firstBlock.center, 13, { duration: 1.2 });
    }

    document.getElementById('m-state-list').classList.add('hidden');
    document.getElementById('m-state-detail').classList.remove('hidden');
    updateMapVisuals();
    renderDetailView(state.selectedItem);
    setBottomSheetPosition('expanded');
}

const hexToRgba = (hex, alpha) => {
    const r = parseInt(hex.slice(1, 3), 16),
          g = parseInt(hex.slice(3, 5), 16),
          b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

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

function getDetectionsCellBg(count) {
    if (count === 0) return '#24A148';
    if (count <= 2) return '#4BAF50';
    if (count <= 4) return '#A3E635';
    if (count <= 8) return '#F1C21B';
    return '#E03131';
}

function getDetectionsCellColor(count) {
    if (count > 2 && count <= 8) return '#111815';
    return '#ffffff';
}

function renderDetailView(selection) {
    let title, subtitle, name, count, trendData, hourlyData;
    const pestNameLabel = state.pestType === 'female-now' ? 'Female Navel Orangeworm' : 'Male Navel Orangeworm';
    
    const dynamicActions = document.getElementById('m-dynamic-actions');
    const hourlyContainer = document.getElementById('m-hourly-container');
    const avgRollingContainer = document.getElementById('m-avg-rolling-container');
    const backBtnText = document.getElementById('m-back-text');
    
    let chartHoverType = 'line';

    // Show/Hide Average & Rolling Chart Container
    if (avgRollingContainer) {
        if (selection.type === 'block' || selection.type === 'ranch' || selection.type === 'sensor') {
            avgRollingContainer.classList.remove('hidden');
        } else {
            avgRollingContainer.classList.add('hidden');
        }
    }

    // Dynamic 7-Day Detections Table
    const gridContainer = document.getElementById('m-detections-grid-container');
    if (selection.type === 'ranch' || selection.type === 'block') {
        if (gridContainer) {
            gridContainer.classList.remove('hidden');
            
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
                    
                    const bCount = getPestCount(b);
                    const bStatus = getStatusClass(bCount);
                    let dotColor = '#24A148';
                    if (bStatus === 'status-high') dotColor = '#E03131';
                    else if (bStatus === 'status-med') dotColor = '#F08C00';

                    rowsHtml += `
                        <tr class="detections-block-row" style="cursor:pointer;" onclick="selectBlock('${b.id}')">
                            <td style="width: 14px;"><span class="status-indicator-dot" style="background-color: ${dotColor};"></span></td>
                            <td class="text-left" style="color: var(--brand-primary);">${b.name}</td>
                            ${cellsHtml}
                        </tr>
                    `;
                });
            } else { // Block selection (individual sensors)
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
                    
                    const sClass = getSensorClass(s);
                    let dotColor = '#24A148';
                    if (sClass === 'sensor-high') dotColor = '#E03131';
                    else if (sClass === 'sensor-med') dotColor = '#F08C00';
                    else if (sClass === 'sensor-offline') dotColor = '#555555';

                    rowsHtml += `
                        <tr class="detections-block-row" style="cursor:pointer;" onclick="selectSensor('${block.id}', '${s.id}')">
                            <td style="width: 14px;"><span class="status-indicator-dot" style="background-color: ${dotColor};"></span></td>
                            <td class="text-left" style="color: var(--brand-primary);">Sensor ${s.id.split('-').pop()}</td>
                            ${cellsHtml}
                        </tr>
                    `;
                });
            }
            
            gridContainer.innerHTML = `
                <h3>Last 7 Day Detections</h3>
                <div class="m-detections-table-wrapper">
                    <table class="m-detections-table">
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
        hourlyContainer.classList.remove('hidden');
        chartHoverType = 'line';
        
        dynamicActions.innerHTML = `
            <button class="btn btn-black" id="m-btn-assign-scouting">
                <span class="material-symbols-rounded">person_search</span> Assign Scouting
            </button>
            <div class="btn-group">
                <button class="btn btn-secondary" id="m-btn-view-ranch"><span class="material-symbols-rounded">visibility</span> View Ranch</button>
            </div>
        `;
        document.getElementById('m-btn-view-ranch').addEventListener('click', () => selectRanch(block.ranchId, block.id));

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
        hourlyContainer.classList.remove('hidden');
        chartHoverType = 'line';

        dynamicActions.innerHTML = `
            <button class="btn btn-black" id="m-btn-assign-scouting">
                <span class="material-symbols-rounded">person_search</span> Assign Scouting
            </button>
        `;

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
        hourlyContainer.classList.remove('hidden');
        chartHoverType = 'bar';
        
        dynamicActions.innerHTML = `
            <button class="btn btn-black" id="m-btn-assign-scouting">
                <span class="material-symbols-rounded">person_search</span> Assign Scouting
            </button>
            <div class="btn-group">
                <button class="btn btn-secondary" id="m-btn-view-block"><span class="material-symbols-rounded">grid_view</span> View Block</button>
            </div>
        `;
        document.getElementById('m-btn-view-block').addEventListener('click', () => selectBlock(block.id));
    }

    document.getElementById('m-detail-title').textContent = title;
    document.getElementById('m-detail-subtitle').textContent = subtitle;
    document.getElementById('m-detail-pest-name').textContent = name;
    document.getElementById('m-detail-count').textContent = count;

    const statusPill = document.getElementById('m-detail-status-pill');
    const trendIndicator = document.getElementById('m-stat-trend');
    const benchmarkElement = document.getElementById('m-stat-benchmark');

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
        
        const isPending = state.verificationPending[selection.id];
        
        if (isPending) {
            statusPill.textContent = 'PENDING';
            statusPill.classList.add('amber');
            statusPill.classList.remove('hidden');
        } else if (count === 'OFFLINE') {
            statusPill.textContent = 'OFFLINE';
            statusPill.classList.add('red');
        } else {
            statusPill.classList.remove('hidden');
            if (isHighRisk) {
                statusPill.textContent = 'ACTION REQUIRED';
                statusPill.classList.add('red');
            } else if (isMedRisk) {
                statusPill.textContent = 'MONITOR';
                statusPill.classList.add('amber');
            } else {
                statusPill.textContent = 'STABLE';
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

    const statCard = document.getElementById('m-stat-card');
    if (statCard) {
        statCard.style.background = `linear-gradient(135deg, ${hexToRgba(chartColor, 0.12)}, ${hexToRgba(chartColor, 0.06)})`;
        statCard.style.borderColor = hexToRgba(chartColor, 0.25);
        const statValue = document.getElementById('m-detail-count');
        if (statValue) statValue.style.color = chartColor;
    }

    // Chart Date Range Navigation update
    const btnPrev = document.getElementById('m-btn-chart-prev');
    const btnNext = document.getElementById('m-btn-chart-next');
    const navLabel = document.getElementById('m-chart-nav-label');
    
    if (navLabel) {
        if (state.chartOffset === 0) {
            navLabel.textContent = "Most Recent";
        } else {
            navLabel.textContent = `${state.chartOffset}d Ago`;
        }
    }
    if (btnPrev) btnPrev.disabled = (state.chartOffset >= 16);
    if (btnNext) btnNext.disabled = (state.chartOffset <= 0);

    const fullTrendData = trendData;
    const startIndex = 16 - state.chartOffset;
    const endIndex = startIndex + 14;
    
    const visibleTrend = fullTrendData.slice(startIndex, endIndex);
    const visible3DayAvg = get3DayAverageArray(fullTrendData).slice(startIndex, endIndex);
    const visible7DayRolling = get7DayRollingArray(fullTrendData).slice(startIndex, endIndex);

    renderCharts(visibleTrend, visible3DayAvg, visible7DayRolling, hourlyData, chartHoverType, chartColor, startIndex);
}

Chart.defaults.color = '#9AAEA6';
Chart.defaults.font.family = 'Inter';

function renderCharts(trendData, avg3DayData, rolling7DayData, hourlyData, chartType = 'line', primaryColor = '#2BA082', startIndex = 16) {
    const trendCtx = document.getElementById('m-trendChart').getContext('2d');
    const avgRollingCtx = document.getElementById('m-avgRollingChart').getContext('2d');
    const hourlyCtx = document.getElementById('m-hourlyChart').getContext('2d');

    if (trendChartInstance) trendChartInstance.destroy();
    if (avgRollingChartInstance) avgRollingChartInstance.destroy();
    if (hourlyChartInstance) hourlyChartInstance.destroy();

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
                y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.04)' } },
                x: { grid: { display: false }, ticks: { maxTicksLimit: 5 } }
            }
        }
    });

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
                        font: { size: 9, family: 'Inter' }
                    }
                } 
            },
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.04)' } },
                x: { grid: { display: false }, ticks: { maxTicksLimit: 5 } }
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
                borderRadius: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.04)' } },
                x: { grid: { display: false }, ticks: { maxTicksLimit: 6 } }
            }
        }
    });
}

// Assign Scouting Modal & tasks list dropdown controls
let currentAssignmentType = 'Pest Scouting';
let currentPriority = 'Urgent';

function initScoutingInteractivity() {
    // Dynamic assign button click trigger
    document.getElementById('m-dynamic-actions').addEventListener('click', (e) => {
        const btn = e.target.closest('#m-btn-assign-scouting');
        if (btn) openScoutingModal();
    });

    // Segmented toggles
    const typeButtons = document.querySelectorAll('#m-scouting-type-segmented .segmented-btn');
    typeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            typeButtons.forEach(b => {
                b.classList.remove('active');
                b.style.background = 'transparent';
                b.style.color = '#4A5B53';
                b.style.fontWeight = '500';
            });
            btn.classList.add('active');
            btn.style.background = '#FFF';
            btn.style.color = '#1e3f20';
            btn.style.fontWeight = '600';
            currentAssignmentType = btn.getAttribute('data-type');
        });
    });

    const priorityButtons = document.querySelectorAll('#m-scouting-priority-segmented .priority-btn');
    priorityButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            priorityButtons.forEach(b => {
                b.classList.remove('active');
                b.style.background = 'transparent';
                b.style.color = '#4A5B53';
                b.style.fontWeight = '500';
                b.style.border = 'none';
            });
            
            btn.classList.add('active');
            btn.style.fontWeight = '600';
            
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

    // Close scouting modal triggers
    document.getElementById('m-btn-close-scouting-modal').addEventListener('click', closeScoutingModal);
    document.getElementById('m-btn-close-scouting-modal-footer').addEventListener('click', closeScoutingModal);

    // Dispatch assignment trigger
    document.getElementById('m-btn-dispatch-scouting').addEventListener('click', dispatchScoutingTask);

    // Slide up active tasks list overlay
    const btnTasks = document.getElementById('m-btn-tasks');
    const tasksOverlay = document.getElementById('m-tasks-overlay');
    const btnCloseTasks = document.getElementById('m-btn-close-tasks');
    
    if (btnTasks && tasksOverlay && btnCloseTasks) {
        btnTasks.addEventListener('click', (e) => {
            e.stopPropagation();
            tasksOverlay.classList.remove('hidden');
        });
        
        btnCloseTasks.addEventListener('click', () => {
            tasksOverlay.classList.add('hidden');
        });

        // Close on tap outside
        tasksOverlay.addEventListener('click', (e) => {
            if (e.target === tasksOverlay) {
                tasksOverlay.classList.add('hidden');
            }
        });
    }
}

function openScoutingModal() {
    if (!state.selectedItem) return;

    let entityName = '';
    let statusText = '';
    let statusColor = '#24A148';
    let pestCategory = state.pestType === 'female-now' ? 'Female NOW' : 'Male NOW';

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

    document.getElementById('m-scouting-badge-entity').textContent = `${state.selectedItem.type === 'sensor' ? '' : (state.selectedItem.type === 'block' ? 'Block: ' : 'Ranch: ')}${entityName}`;
    document.getElementById('m-scouting-badge-status').textContent = `Status: ${statusText}`;
    document.getElementById('m-scouting-badge-status').style.backgroundColor = statusColor;
    document.getElementById('m-scouting-badge-pest').textContent = `Pest Category: ${pestCategory}`;

    document.getElementById('m-scouting-notes').value = '';
    resetSegmentedControls();

    document.getElementById('m-scouting-modal').classList.remove('hidden');
}

function resetSegmentedControls() {
    currentAssignmentType = 'Pest Scouting';
    currentPriority = 'Urgent';

    const typeButtons = document.querySelectorAll('#m-scouting-type-segmented .segmented-btn');
    typeButtons.forEach((btn, idx) => {
        if (idx === 0) {
            btn.classList.add('active');
            btn.style.background = '#FFF';
            btn.style.color = '#1e3f20';
            btn.style.fontWeight = '600';
        } else {
            btn.classList.remove('active');
            btn.style.background = 'transparent';
            btn.style.color = '#4A5B53';
            btn.style.fontWeight = '500';
        }
    });

    const priorityButtons = document.querySelectorAll('#m-scouting-priority-segmented .priority-btn');
    priorityButtons.forEach(btn => {
        if (btn.getAttribute('data-priority') === 'Urgent') {
            btn.classList.add('active');
            btn.style.background = '#F8D7DA';
            btn.style.color = '#721C24';
            btn.style.border = '1px solid #F5C6CB';
            btn.style.fontWeight = '600';
        } else {
            btn.classList.remove('active');
            btn.style.background = 'transparent';
            btn.style.color = '#4A5B53';
            btn.style.fontWeight = '500';
            btn.style.border = 'none';
        }
    });
}

function closeScoutingModal() {
    document.getElementById('m-scouting-modal').classList.add('hidden');
}

function dispatchScoutingTask() {
    if (!state.selectedItem) return;

    const assignee = document.getElementById('m-scouting-assignee').value;
    const notes = document.getElementById('m-scouting-notes').value.trim();
    
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

    state.scoutingAssignments.unshift(newTask);
    state.verificationPending[state.selectedItem.id] = true;

    // Fly animation to top bar tasks icon
    playDispatchAnimation();

    // Re-render
    renderDetailView(state.selectedItem);
    renderRankingList();
    updateTasksDropdownUI();
    closeScoutingModal();
}

function playDispatchAnimation() {
    const btn = document.getElementById('m-btn-dispatch-scouting');
    const target = document.getElementById('m-btn-tasks');
    
    if (!btn || !target) return;
    
    const btnRect = btn.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    
    const flyer = document.createElement('div');
    flyer.style.position = 'fixed';
    flyer.style.left = `${btnRect.left + btnRect.width / 2}px`;
    flyer.style.top = `${btnRect.top + btnRect.height / 2}px`;
    flyer.style.width = '16px';
    flyer.style.height = '16px';
    flyer.style.borderRadius = '50%';
    flyer.style.backgroundColor = '#1e3f20';
    flyer.style.zIndex = '100000';
    flyer.style.transition = 'all 0.8s cubic-bezier(0.25, 0.8, 0.25, 1)';
    flyer.style.display = 'flex';
    flyer.style.alignItems = 'center';
    flyer.style.justifyContent = 'center';
    flyer.style.color = '#FFF';
    flyer.innerHTML = '<span class="material-symbols-rounded" style="font-size:10px;">assignment</span>';
    
    document.body.appendChild(flyer);
    
    // Force reflow
    flyer.offsetWidth;
    
    flyer.style.left = `${targetRect.left + targetRect.width / 2}px`;
    flyer.style.top = `${targetRect.top + targetRect.height / 2}px`;
    flyer.style.transform = 'scale(0.3)';
    flyer.style.opacity = '0.5';
    
    setTimeout(() => {
        flyer.remove();
        target.style.transform = 'scale(1.25)';
        setTimeout(() => target.style.transform = 'none', 300);
        
        const checkBadge = document.createElement('div');
        checkBadge.style.position = 'fixed';
        checkBadge.style.left = `${targetRect.left - 20}px`;
        checkBadge.style.top = `${targetRect.top + 32}px`;
        checkBadge.style.background = '#2BA082';
        checkBadge.style.color = '#FFF';
        checkBadge.style.padding = '4px 8px';
        checkBadge.style.borderRadius = '4px';
        checkBadge.style.fontSize = '9px';
        checkBadge.style.fontWeight = '600';
        checkBadge.textContent = '🚀 Sent!';
        checkBadge.style.zIndex = '100000';
        checkBadge.style.animation = 'fadeOut 1.5s forwards';
        document.body.appendChild(checkBadge);
        setTimeout(() => checkBadge.remove(), 1500);
    }, 800);
}

function updateTasksDropdownUI() {
    const badge = document.getElementById('m-tasks-badge-dot');
    const container = document.getElementById('m-tasks-list-container');
    const noTasks = document.getElementById('m-no-tasks-state');
    
    const count = state.scoutingAssignments.length;
    
    if (count > 0) {
        badge.classList.remove('hidden');
        if (noTasks) noTasks.style.display = 'none';
        
        container.innerHTML = state.scoutingAssignments.map(task => `
            <div class="tasks-item" style="padding:10px; border-radius:8px; background:#F4F7F6; border:1px solid rgba(0,0,0,0.03); display:flex; flex-direction:column; gap:4px;">
                <div class="tasks-item-header" style="display:flex; justify-content:space-between; align-items:center;">
                    <span class="tasks-item-title" style="font-size:11px; font-weight:700; color:var(--brand-primary);">${task.entityName}</span>
                    <span class="tasks-item-priority ${task.priority}" style="font-size:8px; font-weight:700; padding:2px 5px; border-radius:3px;">${task.priority}</span>
                </div>
                <div style="font-size: 10px; font-weight: 600; color: #1e3f20; margin-top:2px;">
                    ${task.type}
                </div>
                ${task.notes ? `<div class="tasks-item-notes" style="font-size:9px; padding:3px 6px; background:rgba(0,0,0,0.02); border-left:2px solid #1e3f20; font-style:italic; margin-top:2px;">${task.notes}</div>` : ''}
                <div class="tasks-item-meta" style="font-size:9px; color:var(--text-secondary); display:flex; justify-content:space-between; margin-top:4px;">
                    <span>Scout: <strong>${task.assignee}</strong></span>
                    <span>${task.date.split(',')[0]}</span>
                </div>
            </div>
        `).join('');
    } else {
        badge.classList.add('hidden');
        if (noTasks) noTasks.style.display = 'block';
    }
}

// Expose selection callbacks globally for Leaflet/HTML events
window.selectBlock = selectBlock;
window.selectSensor = selectSensor;
window.selectRanch = selectRanch;
