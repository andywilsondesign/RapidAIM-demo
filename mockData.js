// mockData.js

const RANCHES = [
    { id: 'R1', name: 'Sierra Orchards' },
    { id: 'R2', name: 'Sunshine Valley Ranch' },
    { id: 'R3', name: 'Golden Harvest Farms' }
];

// Base coordinates in California Central Valley (strictly farmland areas south of Fresno)
const RANCH_LOCATIONS = {
    'R1': { lat: 36.6500, lng: -119.8000 },
    'R2': { lat: 36.6200, lng: -119.8300 },
    'R3': { lat: 36.6000, lng: -119.7800 }
};

function generateTrendData(days = 30) {
    const data = [];
    let current = Math.floor(Math.random() * 50);
    for (let i = 0; i < days; i++) {
        current = Math.max(0, current + Math.floor(Math.random() * 20 - 10));
        data.push(current);
    }
    return data;
}

function generateHourlyData() {
    const data = [];
    for (let i = 0; i < 24; i++) {
        let val = Math.random() * 5;
        if (i < 6 || i > 18) val += Math.random() * 15;
        data.push(Math.floor(val));
    }
    return data;
}

export function generateMockData() {
    const blocks = [];
    let blockIdCounter = 1;

    RANCHES.forEach((ranch) => {
        const baseLocation = RANCH_LOCATIONS[ranch.id];
        const numBlocks = 7 + Math.floor(Math.random() * 2); // 7-8 blocks
        
        for (let b = 0; b < numBlocks; b++) {
            // Create a strict grid layout to simulate actual ranch plots and avoid buildings
            const gridX = b % 3;
            const gridY = Math.floor(b / 3);
            
            // Standard California farm block size approx 0.005 degrees
            const blockWidth = 0.005 + (Math.random() * 0.002);
            const blockHeight = 0.004 + (Math.random() * 0.002);
            
            // Spacing between blocks (roads/paths)
            const gap = 0.001; 
            
            const topLeftLat = baseLocation.lat - (gridY * (blockHeight + gap));
            const topLeftLng = baseLocation.lng + (gridX * (blockWidth + gap));
            
            const polygon = [
                [topLeftLat, topLeftLng],
                [topLeftLat, topLeftLng + blockWidth],
                [topLeftLat - blockHeight, topLeftLng + blockWidth],
                [topLeftLat - blockHeight, topLeftLng]
            ];
            
            const centerLat = topLeftLat - (blockHeight / 2);
            const centerLng = topLeftLng + (blockWidth / 2);
            
            const blockId = `B${blockIdCounter++}`;
            const numSensors = 10 + Math.floor(Math.random() * 5); // 10-14 sensors
            const sensors = [];
            
            let totalFemale = 0;
            let totalMale = 0;

            for (let s = 0; s < numSensors; s++) {
                // Ensure sensor is STRICTLY inside the block polygon bounds
                const sLat = (topLeftLat - Math.random() * blockHeight);
                const sLng = (topLeftLng + Math.random() * blockWidth);
                
                const fCount = Math.floor(Math.random() * 12);
                const mCount = Math.floor(Math.random() * 12);
                const isOffline = Math.random() < 0.1; // 10% offline
                
                if (!isOffline) {
                    totalFemale += fCount;
                    totalMale += mCount;
                }

                const batteryLevel = isOffline ? 0 : 50 + Math.floor(Math.random() * 50);
                const qualities = ['Good', 'Excellent', 'Fair'];
                const quality = qualities[Math.floor(Math.random() * qualities.length)];

                sensors.push({
                    id: `${blockId}-S${s+1}`,
                    active: !isOffline,
                    battery: batteryLevel,
                    quality: isOffline ? 'Poor' : quality,
                    lat: sLat,
                    lng: sLng,
                    female_count: isOffline ? 0 : fCount,
                    male_count: isOffline ? 0 : mCount,
                    trend_female: isOffline ? [] : generateTrendData(30),
                    trend_male: isOffline ? [] : generateTrendData(30),
                    hourly_female: isOffline ? [] : generateHourlyData(),
                    hourly_male: isOffline ? [] : generateHourlyData()
                });
            }

            blocks.push({
                id: blockId,
                name: `${ranch.name.split(' ').map(w=>w[0]).join('')} Block ${b+1}`,
                ranchId: ranch.id,
                ranchName: ranch.name,
                polygon: polygon,
                center: [centerLat, centerLng],
                sensors: sensors,
                female_count: totalFemale,
                male_count: totalMale,
                trend_female: generateTrendData(30),
                trend_male: generateTrendData(30),
                hourly_female: generateHourlyData(),
                hourly_male: generateHourlyData()
            });
        }
    });

    return {
        ranches: RANCHES,
        blocks: blocks
    };
}
