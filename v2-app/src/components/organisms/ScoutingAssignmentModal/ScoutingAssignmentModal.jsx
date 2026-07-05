import React from 'react';
import PropTypes from 'prop-types';
import { Badge } from '../../atoms/Badge/Badge';
import { Button } from '../../atoms/Button/Button';
import { Select } from '../../atoms/Select/Select';
import { Typography } from '../../atoms/Typography/Typography';
import { SegmentedControl } from '../../molecules/SegmentedControl/SegmentedControl';
import styles from './ScoutingAssignmentModal.module.css';

export const ScoutingAssignmentModal = ({
  entityName,
  riskLevel = 'high',
  pestName,
  compact = false,
  className = '',
}) => (
  <section className={`${styles.modal} ${compact ? styles.compact : ''} ${className}`} aria-label="Create scouting assignment">
    <header className={styles.header}>
      <div className={styles.title}>
        <span className="material-symbols-rounded">assignment_add</span>
        <Typography variant="h4">Create Scouting Assignment</Typography>
      </div>
      <Button variant="ghost" size="sm" aria-label="Close">
        <span className="material-symbols-rounded">close</span>
      </Button>
    </header>

    <div className={styles.body}>
      <div className={styles.context}>
        <Badge variant="entity">{entityName}</Badge>
        <Badge variant={riskLevel}>{riskLevel} Risk</Badge>
        <Badge variant="neutral">{pestName}</Badge>
      </div>

      <label className={styles.field}>
        <Typography variant="caption" weight="bold" color="brand">Assignment Type</Typography>
        <SegmentedControl
          ariaLabel="Assignment type"
          value="pest"
          options={[
            { label: compact ? 'Pest' : 'Pest Scouting', value: 'pest' },
            { label: compact ? 'Trap' : 'Trap Maintenance', value: 'trap' },
            { label: compact ? 'Repair' : 'Sensor Repair', value: 'repair' },
          ]}
        />
      </label>

      <div className={styles.row}>
        <label className={styles.field}>
          <Typography variant="caption" weight="bold" color="brand">Assignee</Typography>
          <Select options={[
            { label: 'John Doe (Field Lead)', value: 'john' },
            { label: 'Jane Smith (Technician)', value: 'jane' },
            { label: 'Marcus Vance (Scout)', value: 'marcus' },
          ]} />
        </label>
        <label className={styles.field}>
          <Typography variant="caption" weight="bold" color="brand">Priority</Typography>
          <SegmentedControl
            ariaLabel="Priority"
            value="urgent"
            options={[
              { label: 'Low', value: 'low' },
              { label: 'Medium', value: 'medium' },
              { label: 'Urgent', value: 'urgent' },
            ]}
          />
        </label>
      </div>

      <label className={styles.field}>
        <Typography variant="caption" weight="bold" color="brand">Field Notes</Typography>
        <textarea className={styles.textarea} defaultValue="Inspect northeast perimeter and verify trap thresholds." />
      </label>
    </div>

    <footer className={styles.footer}>
      <Button variant="ghost">Cancel</Button>
      <Button variant="primary">
        <span className="material-symbols-rounded">send</span>
        Dispatch Task
      </Button>
    </footer>
  </section>
);

ScoutingAssignmentModal.propTypes = {
  entityName: PropTypes.string.isRequired,
  riskLevel: PropTypes.oneOf(['high', 'medium', 'low']),
  pestName: PropTypes.string.isRequired,
  compact: PropTypes.bool,
  className: PropTypes.string,
};
