import React from 'react';
import { TopNavigationBar } from '../../organisms/TopNavigationBar/TopNavigationBar';
import { ControlCenter } from '../../organisms/ControlCenter/ControlCenter';
import { DetailPanel } from '../../organisms/DetailPanel/DetailPanel';
import { InteractiveMap } from '../../organisms/InteractiveMap/InteractiveMap';
import styles from './DesktopMapDashboard.module.css';

export const DesktopMapDashboard = () => {
  return (
    <div className={styles.layout}>
      <TopNavigationBar className={styles.topbar} />
      
      <div className={styles.main}>
        <DetailPanel 
          title="Block 4" 
          subtitle="Sunshine Valley Ranch" 
          className={styles.leftPanel} 
        />
        
        <div className={styles.mapContainer}>
          <InteractiveMap
            center={[36.7378, -119.7871]}
            zoom={14}
            blockPolygon={[
              [36.740, -119.790],
              [36.740, -119.780],
              [36.730, -119.780],
              [36.730, -119.790],
            ]}
            sensors={[
              { id: 's1', lat: 36.738, lng: -119.788, name: 'Sensor 1', count: 45, severity: 'high' },
              { id: 's2', lat: 36.732, lng: -119.785, name: 'Sensor 2', count: 12, severity: 'medium' },
            ]}
            blockSeverity="high"
          />
        </div>
        
        <ControlCenter className={styles.rightPanel} />
      </div>
    </div>
  );
};
