import React from 'react';
import PropTypes from 'prop-types';
import { Typography } from '../../atoms/Typography/Typography';
import { Button } from '../../atoms/Button/Button';
import { Badge } from '../../atoms/Badge/Badge';
import { StatCard } from '../../molecules/StatCard/StatCard';
import { Alert } from '../../molecules/Alert/Alert';
import { TrendChart } from '../TrendChart/TrendChart';
import styles from './DetailPanel.module.css';

export const DetailPanel = ({
  title,
  subtitle,
  riskLevel = 'high',
  onClose,
  onAssignTask,
  className = '',
}) => {
  return (
    <aside className={`${styles.panel} ${className}`}>
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <div className={styles.titleArea}>
            <Typography variant="h3">{title}</Typography>
            <Badge variant={riskLevel}>{riskLevel} Risk</Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close panel">
            <span className="material-symbols-rounded">close</span>
          </Button>
        </div>
        <Typography variant="body-sm" color="secondary">{subtitle}</Typography>
      </div>

      <div className={styles.content}>
        <Alert
          type="inline"
          variant="warning"
          title="AI Insight"
          message="Pest pressure is rising rapidly compared to historical averages for this time of year."
          className={styles.alert}
        />

        <div className={styles.statsGrid}>
          <StatCard label="Current Count" value="124" trend={24} />
          <StatCard label="Daily Avg" value="45" trend={12} />
        </div>

        <TrendChart 
          type="line" 
          title="7-Day Trend"
          labels={Array.from({ length: 7 }, (_, i) => `Day ${i+1}`)}
          data={[12, 19, 15, 25, 42, 55, 60]}
          threshold={25}
          className={styles.chart}
        />

        <div className={styles.actions}>
          <Button variant="primary" fullWidth onClick={onAssignTask}>
            Assign Task
          </Button>
          <Button variant="secondary" fullWidth>
            View Full Report
          </Button>
        </div>
      </div>
    </aside>
  );
};

DetailPanel.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  riskLevel: PropTypes.oneOf(['high', 'medium', 'low']),
  onClose: PropTypes.func,
  onAssignTask: PropTypes.func,
  className: PropTypes.string,
};
