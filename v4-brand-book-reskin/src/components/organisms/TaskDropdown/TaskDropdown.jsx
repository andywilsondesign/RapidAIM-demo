import React from 'react';
import PropTypes from 'prop-types';
import { Typography } from '../../atoms/Typography/Typography';
import { TaskListItem } from '../../molecules/TaskListItem/TaskListItem';
import styles from './TaskDropdown.module.css';

export const TaskDropdown = ({ tasks = [], className = '' }) => (
  <section className={`${styles.panel} ${className}`} aria-label="Active scouting tasks">
    <div className={styles.header}>
      <Typography variant="body-sm" weight="bold">Active Scouting Tasks</Typography>
      <span className={styles.count}>{tasks.length} Tasks</span>
    </div>
    {tasks.length > 0 ? (
      <div className={styles.list}>
        {tasks.map((task) => (
          <TaskListItem task={task} key={task.id} />
        ))}
      </div>
    ) : (
      <div className={styles.empty}>
        <span className="material-symbols-rounded">task_alt</span>
        <Typography variant="caption" color="secondary">No active field assignments</Typography>
      </div>
    )}
  </section>
);

TaskDropdown.propTypes = {
  tasks: PropTypes.array,
  className: PropTypes.string,
};
