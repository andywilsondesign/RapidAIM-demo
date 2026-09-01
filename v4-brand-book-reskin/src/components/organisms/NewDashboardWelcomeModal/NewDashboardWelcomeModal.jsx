import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '../../atoms/Button/Button';
import { Typography } from '../../atoms/Typography/Typography';
import { Alert } from '../../molecules/Alert/Alert';
import styles from './NewDashboardWelcomeModal.module.css';

const modalContent = {
  betaPrompt: {
    icon: 'rocket_launch',
    title: 'Try the new RapidAIM dashboard',
    message: '[The new dashboard is available for beta users. Turn it on when you are ready to explore the updated map, tasks, and account tools.]',
    supportAlert: 'You can return to the old dashboard from account settings while the beta is available.',
    secondaryAction: 'Not now',
    primaryAction: 'Turn on new dashboard',
  },
  welcome: {
    icon: 'dashboard_customize',
    title: 'Welcome to the new RapidAIM dashboard',
    message: 'We have updated the dashboard to make map work, tasks, and account tools easier to find.',
    changes: [
      '[What changed: map navigation]',
      '[What changed: tasks and reports]',
      '[What changed: account and support]',
    ],
    supportMessage: 'If anything feels unfamiliar, our support community is available for questions while you get settled.',
    secondaryAction: 'Visit support community',
    primaryAction: 'Go to dashboard',
  },
};

export const NewDashboardWelcomeModal = ({
  variant = 'welcome',
  className = '',
}) => {
  const content = modalContent[variant] || modalContent.welcome;

  return (
    <div className={`${styles.backdrop} ${className}`} role="presentation">
      <section
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`new-dashboard-${variant}-title`}
      >
        <header className={styles.header}>
          <span className="material-symbols-rounded" aria-hidden="true">{content.icon}</span>
        </header>

        <div className={styles.body}>
          <div className={styles.titleGroup}>
            <Typography variant="h3" id={`new-dashboard-${variant}-title`}>{content.title}</Typography>
            <Typography variant="body-sm" color="secondary">
              {content.message}
            </Typography>
          </div>

          {content.changes && (
            <div className={styles.changeList} aria-label="What has changed">
              {content.changes.map((change) => (
                <div className={styles.changeItem} key={change}>
                  <span className="material-symbols-rounded" aria-hidden="true">check</span>
                  <Typography variant="body-sm">{change}</Typography>
                </div>
              ))}
            </div>
          )}

          {content.supportAlert ? (
            <Alert
              type="inline"
              variant="info"
              message={content.supportAlert}
              className={styles.supportAlert}
            />
          ) : (
            <Typography variant="body-sm" color="secondary">
              {content.supportMessage}
            </Typography>
          )}
        </div>

        <footer className={styles.footer}>
          <Button variant="secondary" type="button">
            {content.secondaryAction}
          </Button>
          <Button variant="primary" type="button">
            {content.primaryAction}
          </Button>
        </footer>
      </section>
    </div>
  );
};

NewDashboardWelcomeModal.propTypes = {
  variant: PropTypes.oneOf(Object.keys(modalContent)),
  className: PropTypes.string,
};
