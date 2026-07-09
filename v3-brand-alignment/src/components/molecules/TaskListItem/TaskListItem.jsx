import React from 'react';
import PropTypes from 'prop-types';
import { Badge } from '../../atoms/Badge/Badge';
import { Typography } from '../../atoms/Typography/Typography';
import styles from './TaskListItem.module.css';

const priorityToVariant = {
  Urgent: 'high',
  Medium: 'medium',
  Low: 'low',
};

export const TaskListItem = ({ task, className = '' }) => (
  <article className={`${styles.item} ${className}`}>
    <div className={styles.header}>
      <Typography variant="body-sm" weight="semibold">{task.entityName}</Typography>
      <Badge variant={priorityToVariant[task.priority] || 'neutral'}>{task.priority}</Badge>
    </div>
    <Typography variant="caption" color="secondary">{task.type} / {task.assignee}</Typography>
    {task.notes && (
      <Typography variant="caption" className={styles.notes}>{task.notes}</Typography>
    )}
    <div className={styles.footer}>
      <span className="material-symbols-rounded">assignment</span>
      <Typography variant="caption" color="secondary">{task.status}</Typography>
    </div>
  </article>
);

TaskListItem.propTypes = {
  task: PropTypes.shape({
    entityName: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    assignee: PropTypes.string.isRequired,
    priority: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    notes: PropTypes.string,
  }).isRequired,
  className: PropTypes.string,
};
