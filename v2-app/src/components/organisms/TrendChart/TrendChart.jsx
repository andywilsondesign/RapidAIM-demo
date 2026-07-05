import React, { useRef, useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import styles from './TrendChart.module.css';
import { Typography } from '../../atoms/Typography/Typography';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const TrendChart = ({
  data = [],
  labels = [],
  type = 'bar', // 'bar' or 'line'
  title = 'Chart',
  threshold = 25,
  className = '',
}) => {
  const chartRef = useRef(null);
  const [chartData, setChartData] = useState({
    datasets: [],
  });

  // Colors mapping (based on atomic tokens)
  // High risk: #E53935 (Red)
  // Medium risk: #FB8C00 (Amber)
  // Low risk: #43A047 (Green)
  const getColorForValue = useCallback((val) => {
    if (val >= threshold * 2) return '#E53935';
    if (val >= threshold) return '#FB8C00';
    return '#43A047';
  }, [threshold]);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    if (type === 'bar') {
      const backgroundColors = data.map((val) => getColorForValue(val));
      setChartData({
        labels,
        datasets: [
          {
            label: 'Detections',
            data,
            backgroundColor: backgroundColors,
            borderRadius: 4,
          },
        ],
      });
    } else if (type === 'line') {
      // For line charts, use a linear gradient from top to bottom
      const ctx = chart.ctx;
      const gradient = ctx.createLinearGradient(0, 0, 0, 400);
      gradient.addColorStop(0, '#E53935'); // High values
      gradient.addColorStop(0.5, '#FB8C00');
      gradient.addColorStop(1, '#43A047'); // Low values

      setChartData({
        labels,
        datasets: [
          {
            label: '7-Day Rolling Avg',
            data,
            borderColor: gradient,
            borderWidth: 3,
            tension: 0.4, // smooth curve
            pointBackgroundColor: data.map((val) => getColorForValue(val)),
            pointRadius: 4,
          },
        ],
      });
    }
  }, [data, labels, type, threshold, getColorForValue]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1E293B',
        padding: 12,
        titleFont: { size: 14, family: '"Inter", sans-serif' },
        bodyFont: { size: 13, family: '"Inter", sans-serif' },
        displayColors: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: '#E2E8F0', drawBorder: false },
        ticks: { color: '#64748B', font: { family: '"Inter", sans-serif' } },
      },
      x: {
        grid: { display: false, drawBorder: false },
        ticks: { color: '#64748B', font: { family: '"Inter", sans-serif' } },
      },
    },
  };

  return (
    <div className={`${styles.container} ${className}`}>
      <div className={styles.header}>
        <Typography variant="body" weight="semibold">{title}</Typography>
      </div>
      <div className={styles.chartWrapper}>
        {type === 'bar' ? (
          <Bar ref={chartRef} data={chartData} options={options} />
        ) : (
          <Line ref={chartRef} data={chartData} options={options} />
        )}
      </div>
    </div>
  );
};

TrendChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.number),
  labels: PropTypes.arrayOf(PropTypes.string),
  type: PropTypes.oneOf(['bar', 'line']),
  title: PropTypes.string,
  threshold: PropTypes.number,
  className: PropTypes.string,
};
