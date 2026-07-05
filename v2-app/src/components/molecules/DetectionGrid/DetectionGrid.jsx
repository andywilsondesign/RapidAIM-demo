import React from 'react';
import PropTypes from 'prop-types';
import { Typography } from '../../atoms/Typography/Typography';
import styles from './DetectionGrid.module.css';

const getCellClass = (count) => {
  if (count >= 50) return styles.high;
  if (count >= 25) return styles.medium;
  return styles.low;
};

export const DetectionGrid = ({
  rows,
  title = 'Last 7 Day Detections',
  firstColumnLabel = 'Block',
  className = '',
}) => (
  <div className={`${styles.wrapper} ${className}`}>
    <div className={styles.header}>
      <Typography variant="body-sm" weight="semibold">{title}</Typography>
    </div>
    <table className={styles.table}>
      <thead>
        <tr>
          <th>{firstColumnLabel}</th>
          {['D-6', 'D-5', 'D-4', 'D-3', 'D-2', 'D-1', 'Today'].map((day) => (
            <th key={day}>{day}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.block}>
            <td>{row.block}</td>
            {row.days.map((count, index) => (
              <td className={getCellClass(count)} key={`${row.block}-${index}`}>{count}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

DetectionGrid.propTypes = {
  rows: PropTypes.arrayOf(PropTypes.shape({
    block: PropTypes.string.isRequired,
    days: PropTypes.arrayOf(PropTypes.number).isRequired,
  })).isRequired,
  title: PropTypes.string,
  firstColumnLabel: PropTypes.string,
  className: PropTypes.string,
};
