import React from 'react';
import { TopNavigationBar } from '../../organisms/TopNavigationBar/TopNavigationBar';
import { Button } from '../../atoms/Button/Button';
import { Typography } from '../../atoms/Typography/Typography';
import { RankingListItem } from '../../molecules/RankingListItem/RankingListItem';
import { InteractiveMap } from '../../organisms/InteractiveMap/InteractiveMap';
import styles from './MobileMapDashboard.module.css';

export const MobileMapDashboard = () => {
  return (
    <div className={styles.layout}>
      <TopNavigationBar className={styles.topbar} />
      
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
        
        {/* Floating Action Buttons */}
        <div className={styles.fabs}>
          <Button variant="secondary" className={styles.fab} aria-label="Layers">
            <span className="material-symbols-rounded">layers</span>
          </Button>
          <Button variant="secondary" className={styles.fab} aria-label="Recenter GPS">
            <span className="material-symbols-rounded">my_location</span>
          </Button>
        </div>
      </div>

      {/* Bottom Sheet */}
      <div className={styles.bottomSheet}>
        <div className={styles.sheetHandle} />
        <div className={styles.sheetHeader}>
          <Typography variant="h5">Pest Pressure Ranking</Typography>
        </div>
        <div className={styles.sheetContent}>
          <RankingListItem rank={1} title="Block 4" subtitle="124 Detections" riskLevel="high" />
          <RankingListItem rank={2} title="Block 2" subtitle="45 Detections" riskLevel="medium" />
          <RankingListItem rank={3} title="Block 1" subtitle="12 Detections" riskLevel="low" />
        </div>
      </div>
    </div>
  );
};
