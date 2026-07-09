import React from 'react';
import PropTypes from 'prop-types';
import { Typography } from '../../atoms/Typography/Typography';
import styles from './WeatherWidget.module.css';

export const WeatherWidget = ({ weather, className = '' }) => (
  <aside className={`${styles.widget} ${className}`} aria-label="Weather">
    <span className={`material-symbols-rounded ${styles.icon}`}>partly_cloudy_day</span>
    <Typography variant="caption" weight="semibold">{weather.location}</Typography>
    <span className={styles.dot} />
    <Typography variant="caption" color="secondary">{weather.condition}</Typography>
    <span className={styles.dot} />
    <Typography variant="caption" weight="bold">{weather.temperature}</Typography>
  </aside>
);

WeatherWidget.propTypes = {
  weather: PropTypes.shape({
    location: PropTypes.string.isRequired,
    condition: PropTypes.string.isRequired,
    temperature: PropTypes.string.isRequired,
  }).isRequired,
  className: PropTypes.string,
};
