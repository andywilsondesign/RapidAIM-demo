import React from 'react';
import { TopNavigationBar } from '../../organisms/TopNavigationBar/TopNavigationBar';
import { HeroMetricsRow } from '../../organisms/HeroMetricsRow/HeroMetricsRow';
import { TrendChart } from '../../organisms/TrendChart/TrendChart';
import { Typography } from '../../atoms/Typography/Typography';
import styles from './OrganizationDashboard.module.css';

export const OrganizationDashboard = () => {
  const metrics = [
    { label: 'Group Asset Scale', value: '4 Ranches' },
    { label: 'Active Grid Health', value: '98%', trend: 2 },
    { label: 'Current Risk Status', value: 'Elevated' },
    { label: 'Active Field Logistics', value: '12 Tasks' },
  ];

  return (
    <div className={styles.layout}>
      <TopNavigationBar organizationName="RapidAIM Corporate" className={styles.topbar} />
      
      <main className={styles.main}>
        <div className={styles.container}>
          <Typography variant="h2" className={styles.pageTitle}>Organization Overview</Typography>
          
          <HeroMetricsRow metrics={metrics} className={styles.metrics} />

          <div className={styles.grid}>
            <div className={styles.chartPanel}>
              <TrendChart 
                type="line" 
                title="30-Day Multi-Site Trajectory"
                labels={Array.from({ length: 30 }, (_, i) => `Day ${i+1}`)}
                data={Array.from({ length: 30 }, () => Math.floor(Math.random() * 80))}
                threshold={25}
              />
            </div>
            
            <div className={styles.sidePanel}>
              <TrendChart 
                type="bar" 
                title="24-Hour Network Detections"
                labels={Array.from({ length: 24 }, (_, i) => `${i}:00`)}
                data={Array.from({ length: 24 }, (_, i) => (i > 8 && i < 18 ? Math.floor(Math.random() * 40) : Math.floor(Math.random() * 10)))}
                threshold={25}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
