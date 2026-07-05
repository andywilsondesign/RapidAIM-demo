import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '../../atoms/Button/Button';
import { Typography } from '../../atoms/Typography/Typography';
import styles from './ReportModal.module.css';

export const ReportModal = ({ report, loading = false, className = '' }) => (
  <section className={`${styles.modal} ${className}`} aria-label="AI insights report">
    <header className={styles.header}>
      <Typography variant="h3">{report.title}</Typography>
      <Button variant="ghost" size="sm" aria-label="Close">
        <span className="material-symbols-rounded">close</span>
      </Button>
    </header>
    <div className={styles.body}>
      {loading ? (
        <div className={styles.loading}>
          <span className="material-symbols-rounded">sync</span>
          <Typography variant="body-sm" color="secondary">Synthesizing data...</Typography>
        </div>
      ) : (
        <>
          <div className={styles.summary}>
            <Typography variant="caption" color="secondary">{report.context} / {report.generatedAt}</Typography>
            <Typography variant="body" weight="semibold">{report.summary}</Typography>
          </div>
          <ReportSection title="Observations" items={report.observations} />
          <ReportSection title="Recommendations" items={report.recommendations} />
        </>
      )}
    </div>
    <footer className={styles.footer}>
      <Button variant="black">Export as PDF</Button>
    </footer>
  </section>
);

const ReportSection = ({ title, items }) => (
  <div className={styles.section}>
    <Typography variant="h5">{title}</Typography>
    <ul>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  </div>
);

ReportSection.propTypes = {
  title: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(PropTypes.string).isRequired,
};

ReportModal.propTypes = {
  report: PropTypes.shape({
    title: PropTypes.string.isRequired,
    context: PropTypes.string.isRequired,
    generatedAt: PropTypes.string.isRequired,
    summary: PropTypes.string.isRequired,
    observations: PropTypes.arrayOf(PropTypes.string).isRequired,
    recommendations: PropTypes.arrayOf(PropTypes.string).isRequired,
  }).isRequired,
  loading: PropTypes.bool,
  className: PropTypes.string,
};
