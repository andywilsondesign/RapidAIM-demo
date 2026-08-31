import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from '../../atoms/Button/Button';
import { Typography } from '../../atoms/Typography/Typography';
import styles from './NewDashboardWelcomeModal.module.css';

const defaultChanges = [
  '[What changed: map navigation]',
  '[What changed: tasks and reports]',
  '[What changed: account and support]',
];

export const NewDashboardWelcomeModal = ({
  defaultOpen = true,
  changes = defaultChanges,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (!isOpen) {
    return (
      <section className={`${styles.closedPreview} ${className}`} aria-label="New dashboard welcome dismissed">
        <Typography variant="h3">Dashboard</Typography>
        <Button variant="secondary" type="button" onClick={() => setIsOpen(true)}>
          Show welcome message
        </Button>
      </section>
    );
  }

  return (
    <div className={`${styles.backdrop} ${className}`} role="presentation">
      <section
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-dashboard-welcome-title"
      >
        <header className={styles.header}>
          <span className="material-symbols-rounded" aria-hidden="true">dashboard_customize</span>
          <Button variant="ghost" size="sm" type="button" aria-label="Close welcome message" onClick={() => setIsOpen(false)}>
            <span className="material-symbols-rounded" aria-hidden="true">close</span>
          </Button>
        </header>

        <div className={styles.body}>
          <div className={styles.titleGroup}>
            <Typography variant="h3" id="new-dashboard-welcome-title">
              Welcome to the new RapidAIM dashboard
            </Typography>
            <Typography variant="body" color="secondary">
              We have updated the dashboard to make map work, tasks, and account tools easier to find.
            </Typography>
          </div>

          <div className={styles.changeList} aria-label="What has changed">
            {changes.map((change) => (
              <div className={styles.changeItem} key={change}>
                <span className="material-symbols-rounded" aria-hidden="true">check</span>
                <Typography variant="body-sm">{change}</Typography>
              </div>
            ))}
          </div>

          <Typography variant="body-sm" color="secondary">
            If anything feels unfamiliar, our support community is available for questions while you get settled.
          </Typography>
        </div>

        <footer className={styles.footer}>
          <Button variant="secondary" type="button">
            Visit support community
          </Button>
          <Button variant="primary" type="button" onClick={() => setIsOpen(false)}>
            Go to dashboard
          </Button>
        </footer>
      </section>
    </div>
  );
};

NewDashboardWelcomeModal.propTypes = {
  defaultOpen: PropTypes.bool,
  changes: PropTypes.arrayOf(PropTypes.string),
  className: PropTypes.string,
};
