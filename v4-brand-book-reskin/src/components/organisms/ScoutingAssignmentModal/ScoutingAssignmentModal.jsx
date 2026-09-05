import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Badge } from '../../atoms/Badge/Badge';
import { Button } from '../../atoms/Button/Button';
import { Select } from '../../atoms/Select/Select';
import { Typography } from '../../atoms/Typography/Typography';
import { FormField } from '../../molecules/FormField/FormField';
import { SegmentedControl } from '../../molecules/SegmentedControl/SegmentedControl';
import styles from './ScoutingAssignmentModal.module.css';

export const ScoutingAssignmentModal = ({
  entityName,
  riskLevel = 'high',
  pestName,
  compact = false,
  className = '',
}) => {
  const entityParts = entityName.split('/').map((part) => part.trim()).filter(Boolean);
  const [assignmentType, setAssignmentType] = useState('pest');
  const [priority, setPriority] = useState('urgent');

  return (
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
          {(entityParts.length ? entityParts : [entityName]).map((part) => (
            <Badge variant="neutral" key={part}>{part}</Badge>
          ))}
          <Badge variant={riskLevel}>{riskLevel} Risk</Badge>
          <Badge variant="neutral">{pestName}</Badge>
        </div>

        <FormField label="Assignment Type">
          <SegmentedControl
            value={assignmentType}
            onChange={setAssignmentType}
            options={[
              { label: compact ? 'Pest' : 'Pest Scouting', value: 'pest' },
              { label: compact ? 'Trap' : 'Trap Maintenance', value: 'trap' },
              { label: compact ? 'Repair' : 'Sensor Repair', value: 'repair' },
            ]}
          />
        </FormField>

        <div className={styles.row}>
          <FormField label="Assignee">
            <Select options={[
              { label: 'John Doe (Field Lead)', value: 'john' },
              { label: 'Jane Smith (Technician)', value: 'jane' },
              { label: 'Marcus Vance (Scout)', value: 'marcus' },
            ]} />
          </FormField>
          <FormField label="Priority">
            <SegmentedControl
              value={priority}
              onChange={setPriority}
              options={[
                { label: 'Low', value: 'low' },
                { label: 'Medium', value: 'medium' },
                { label: 'Urgent', value: 'urgent' },
              ]}
            />
          </FormField>
        </div>

        <FormField label="Field Notes">
          <textarea className={styles.textarea} defaultValue="Inspect northeast perimeter and verify trap thresholds." />
        </FormField>
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
};

ScoutingAssignmentModal.propTypes = {
  entityName: PropTypes.string.isRequired,
  riskLevel: PropTypes.oneOf(['high', 'medium', 'low']),
  pestName: PropTypes.string.isRequired,
  compact: PropTypes.bool,
  className: PropTypes.string,
};
