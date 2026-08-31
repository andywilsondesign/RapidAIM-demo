import React, { useMemo, useState } from 'react';
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
import { InfoDisclosure } from '../../molecules/InfoDisclosure/InfoDisclosure';

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
  series,
  labels = [],
  type = 'bar', // 'bar' or 'line'
  title = 'Chart',
  threshold = 25,
  colorScale,
  statusColor,
  infoTitle,
  infoDescription,
  className = '',
}) => {
  const [hiddenSeries, setHiddenSeries] = useState([]);
  const visibleSeries = useMemo(() => (
    series?.filter((item) => !hiddenSeries.includes(item.label))
  ), [hiddenSeries, series]);

  const chartData = useMemo(() => {
    // Colors mapping (based on atomic tokens)
    // High risk: #E53935 (Red)
    // Medium risk: #FB8C00 (Amber)
    // Low risk: #43A047 (Green)
    const getColorForValue = (val) => {
      if (val >= threshold * 2) return '#E53935';
      if (val >= threshold) return '#FB8C00';
      return '#43A047';
    };
    const getRsrpColor = (val) => {
      if (val >= -95) return '#2E7D32';
      if (val >= -105) return '#FB8C00';
      return '#D32F2F';
    };
    const getLineColor = (val, fallback) => (
      statusColor || (colorScale === 'rsrp' ? getRsrpColor(val) : fallback)
    );
    const getRsrpGradient = (context, fallback) => {
      const { chart } = context;
      const { chartArea, ctx } = chart;
      if (!chartArea) return fallback;

      const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
      gradient.addColorStop(0, '#0F7A4F');
      gradient.addColorStop(0.52, '#8A5A00');
      gradient.addColorStop(1, '#C1121F');
      return gradient;
    };

    if (type === 'bar') {
      return {
        labels,
        datasets: [
          {
            label: 'Detections',
            data,
            backgroundColor: data.map((val) => getColorForValue(val)),
            borderRadius: 4,
          },
        ],
      };
    } else if (type === 'line') {
      if (series?.length) {
        return {
          labels,
          datasets: visibleSeries.map((item, index) => {
            const fallbackColor = item.color || (index === 0 ? '#2563EB' : '#C2410C');
            const resolvedColor = statusColor || fallbackColor;

            return {
              label: item.label,
              data: item.data,
              borderColor: statusColor
                ? statusColor
                : colorScale === 'rsrp'
                ? (context) => getRsrpGradient(context, fallbackColor)
                : resolvedColor,
              backgroundColor: resolvedColor,
              borderWidth: index === 0 ? 3 : 2,
              borderDash: item.dashed ? [6, 4] : [],
              pointBackgroundColor: item.data.map((val) => getLineColor(val, resolvedColor)),
              pointBorderColor: '#FFFFFF',
              pointBorderWidth: 1,
              pointRadius: 3,
              segment: undefined,
              fill: false,
              tension: 0.4,
            };
          }),
        };
      }

      return {
        labels,
        datasets: [
          {
            label: '7-Day Rolling Avg',
            data,
            borderColor: '#C2410C',
            borderWidth: 3,
            tension: 0.4, // smooth curve
            pointBackgroundColor: data.map((val) => getColorForValue(val)),
            pointRadius: 4,
          },
        ],
      };
    }

    return { labels, datasets: [] };
  }, [colorScale, data, labels, series, statusColor, type, threshold, visibleSeries]);

  const hasMultipleSeries = type === 'line' && Boolean(series?.length);
  const chartValues = series?.length ? series.flatMap((item) => item.data) : data;
  const hasNegativeValues = chartValues.some((value) => value < 0);
  const toggleSeries = (label) => {
    setHiddenSeries((current) => (
      current.includes(label)
        ? current.filter((item) => item !== label)
        : [...current, label]
    ));
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
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
        beginAtZero: !hasNegativeValues,
        suggestedMin: colorScale === 'rsrp' ? -125 : undefined,
        suggestedMax: colorScale === 'rsrp' ? -65 : undefined,
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
        <Typography variant="h6" className="ra-section-title">{title}</Typography>
        {infoTitle && infoDescription && (
          <InfoDisclosure
            title={infoTitle}
            description={infoDescription}
          />
        )}
      </div>
      {hasMultipleSeries && (
        <div className={styles.legendList} aria-label={`${title} legend`}>
          {series.map((item) => {
            const isHidden = hiddenSeries.includes(item.label);

            return (
            <button
              className={`${styles.legendItem} ${isHidden ? styles.legendItemHidden : ''}`}
              key={item.label}
              type="button"
              aria-pressed={!isHidden}
              onClick={() => toggleSeries(item.label)}
            >
              <span className={styles.legendSwatch} style={{ '--series-color': item.color }} aria-hidden="true" />
              <Typography variant="caption" weight="semibold">{item.label}</Typography>
            </button>
            );
          })}
        </div>
      )}
      <div className={styles.chartWrapper}>
        {type === 'bar' ? (
          <Bar data={chartData} options={options} aria-label={title} />
        ) : (
          <Line data={chartData} options={options} aria-label={title} />
        )}
      </div>
    </div>
  );
};

TrendChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.number),
  series: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    data: PropTypes.arrayOf(PropTypes.number).isRequired,
    color: PropTypes.string,
    dashed: PropTypes.bool,
  })),
  labels: PropTypes.arrayOf(PropTypes.string),
  type: PropTypes.oneOf(['bar', 'line']),
  title: PropTypes.string,
  threshold: PropTypes.number,
  colorScale: PropTypes.oneOf(['rsrp']),
  statusColor: PropTypes.string,
  infoTitle: PropTypes.string,
  infoDescription: PropTypes.string,
  className: PropTypes.string,
};
