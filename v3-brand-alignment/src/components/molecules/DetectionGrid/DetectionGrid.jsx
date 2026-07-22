import React from 'react';
import PropTypes from 'prop-types';
import { Typography } from '../../atoms/Typography/Typography';
import { InfoDisclosure } from '../InfoDisclosure/InfoDisclosure';
import styles from './DetectionGrid.module.css';

const getCellClass = (count) => {
  if (count >= 50) return styles.high;
  if (count >= 25) return styles.medium;
  return styles.low;
};

const defaultDayLabels = ['W', 'T', 'F', 'S', 'S', 'M', 'Last Night'];

export const DetectionGrid = ({
  rows,
  title = 'Last 7 Day Detections',
  firstColumnLabel = 'Block',
  dayLabels = defaultDayLabels,
  showStatus = false,
  timezone,
  description,
  className = '',
}) => (
  <div className={`${styles.wrapper} ${showStatus ? styles.withStatus : ''} ${className}`}>
    <div className={styles.header}>
      <Typography variant="h6" className="ra-section-title">{title}</Typography>
      {timezone && (
        <InfoDisclosure
          title={title}
          description={description || `Sensor data from the last seven days shown in ${timezone} time.`}
          className={styles.infoButton}
        />
      )}
    </div>
    <div className={styles.tableViewport}>
      <table className={styles.table}>
        <thead>
          <tr>
            {showStatus && <th className={styles.statusColumn} aria-label="Status" />}
            <th className={styles.nameColumn}>{firstColumnLabel}</th>
            {dayLabels.map((day, index) => (
              <th className={styles.dayColumn} key={`${day}-${index}`}>{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.block}>
              {showStatus && (
                <td className={styles.statusColumn}>
                  <span className={`${styles.statusDot} ${styles[`statusDot--${row.status || 'low'}`]}`} />
                </td>
              )}
              <td className={styles.nameColumn}>{row.block}</td>
              {row.days.map((count, index) => (
                <td className={`${styles.dayColumn} ${getCellClass(count)}`} key={`${row.block}-${index}`}>{count}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

DetectionGrid.propTypes = {
  rows: PropTypes.arrayOf(PropTypes.shape({
    block: PropTypes.string.isRequired,
    status: PropTypes.oneOf(['high', 'medium', 'low']),
    days: PropTypes.arrayOf(PropTypes.number).isRequired,
  })).isRequired,
  title: PropTypes.string,
  firstColumnLabel: PropTypes.string,
  dayLabels: PropTypes.arrayOf(PropTypes.string),
  showStatus: PropTypes.bool,
  timezone: PropTypes.string,
  description: PropTypes.string,
  className: PropTypes.string,
};
