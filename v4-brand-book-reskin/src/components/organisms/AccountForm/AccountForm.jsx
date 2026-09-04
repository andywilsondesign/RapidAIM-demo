import React from 'react';
import PropTypes from 'prop-types';
import { FormField } from '../../molecules/FormField/FormField';
import { Input } from '../../atoms/Input/Input';
import { Select } from '../../atoms/Select/Select';
import { Button } from '../../atoms/Button/Button';
import { Typography } from '../../atoms/Typography/Typography';
import { Alert } from '../../molecules/Alert/Alert';
import { SegmentedControl } from '../../molecules/SegmentedControl/SegmentedControl';
import styles from './AccountForm.module.css';

export const AccountForm = ({
  onSubmit,
  isSaving = false,
  globalError = null,
  successMessage = null,
  className = '',
}) => {
  const [useNewDashboard, setUseNewDashboard] = React.useState(true);
  const [isDashboardPromptOpen, setIsDashboardPromptOpen] = React.useState(false);
  const [themePreference, setThemePreference] = React.useState('system');

  const handleDashboardToggle = () => {
    if (!useNewDashboard) {
      setUseNewDashboard(true);
      return;
    }

    setIsDashboardPromptOpen(true);
  };

  const confirmOldDashboard = () => {
    setUseNewDashboard(false);
    setIsDashboardPromptOpen(false);
  };

  return (
    <form 
      className={`${styles.form} ${className}`} 
      onSubmit={(e) => {
        e.preventDefault();
        if (onSubmit) onSubmit();
      }}
    >
      <div className={styles.header}>
        <Typography variant="h3">Account Settings</Typography>
        <Typography variant="body-sm" color="secondary">
          Manage your personal details and organization preferences.
        </Typography>
      </div>

      {globalError && (
        <Alert type="inline" variant="error" title="Error" message={globalError} className={styles.alert} />
      )}

      {successMessage && (
        <Alert type="inline" variant="success" message={successMessage} className={styles.alert} />
      )}

      <div className={styles.section}>
        <Typography variant="h5" className={styles.sectionTitle}>Personal Information</Typography>
        <div className={styles.grid}>
          <FormField label="First Name">
            <Input placeholder="Jane" />
          </FormField>
          <FormField label="Last Name">
            <Input placeholder="Doe" />
          </FormField>
          <FormField label="Email Address" className={styles.fullWidth}>
            <Input type="email" placeholder="jane.doe@example.com" />
          </FormField>
        </div>
      </div>

      <div className={styles.section}>
        <Typography variant="h5" className={styles.sectionTitle}>Preferences</Typography>
        <div className={styles.grid}>
          <FormField label="Timezone">
            <Select options={[
              { label: 'Pacific Time (PT)', value: 'pt' },
              { label: 'Eastern Time (ET)', value: 'et' },
              { label: 'Central European Time (CET)', value: 'cet' },
            ]} />
          </FormField>
          <FormField label="Notification Level">
            <Select options={[
              { label: 'All Alerts', value: 'all' },
              { label: 'Critical Only', value: 'critical' },
              { label: 'None', value: 'none' },
            ]} />
          </FormField>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <Typography variant="h5" className={styles.sectionTitle}>Appearance</Typography>
          <Typography variant="body-sm" color="secondary">
            Choose how the dashboard should appear on this device.
          </Typography>
        </div>
        <div className={styles.preferencePanel}>
          <div className={styles.preferenceCopy}>
            <Typography variant="body-sm" weight="bold">Theme preference</Typography>
            <Typography variant="body-sm" color="secondary" id="theme-preference-help">
              Use light mode, dark mode, or follow your browser and operating system setting automatically.
            </Typography>
          </div>
          <SegmentedControl
            ariaLabel="Theme preference"
            value={themePreference}
            onChange={setThemePreference}
            options={[
              { label: 'Light', value: 'light' },
              { label: 'Dark', value: 'dark' },
              { label: 'Automatic', value: 'system' },
            ]}
            className={styles.themePreferenceControl}
          />
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <Typography variant="h5" className={styles.sectionTitle}>Dashboard Experience</Typography>
          <Typography variant="body-sm" color="secondary">
            The new dashboard is planned to become the standard RapidAIM experience by the end of 2026.
          </Typography>
        </div>
        <div className={styles.betaPanel}>
          <div className={styles.betaCopy}>
            <Typography variant="h6">New dashboard beta</Typography>
            <Typography variant="body-sm" color="secondary">
              Use the redesigned dashboard for this account while the beta is available.
            </Typography>
            <Typography variant="body-sm" color="secondary" id="dashboard-experience-help">
              You can return to the old dashboard for now. This changes the dashboard view only and does not affect sensors, billing, saved data, or team access.
            </Typography>
          </div>
          <button
            className={styles.switchField}
            type="button"
            role="switch"
            aria-checked={useNewDashboard}
            aria-describedby="dashboard-experience-help"
            onClick={handleDashboardToggle}
          >
            <span className={styles.switchText}>Use new dashboard</span>
            <span className={`${styles.switchTrack} ${useNewDashboard ? styles.switchTrackOn : ''}`} aria-hidden="true">
              <span className={styles.switchThumb} />
            </span>
          </button>
        </div>
        {!useNewDashboard && (
          <Alert
            type="inline"
            variant="info"
            message="Old dashboard selected. You can turn the new dashboard back on from this setting while the beta is available."
          />
        )}
      </div>

      {isDashboardPromptOpen && (
        <div className={styles.dialogBackdrop} role="presentation">
          <section
            className={styles.dialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="return-old-dashboard-title"
          >
            <header className={styles.dialogHeader}>
              <Typography variant="h4" id="return-old-dashboard-title">Return to the old dashboard?</Typography>
              <Button variant="ghost" size="sm" type="button" aria-label="Close confirmation" onClick={() => setIsDashboardPromptOpen(false)}>
                <span className="material-symbols-rounded" aria-hidden="true">close</span>
              </Button>
            </header>
            <div className={styles.dialogBody}>
              <Typography variant="body" color="secondary">
                You can keep using the old dashboard while the beta is available. The new dashboard is planned to become the standard RapidAIM experience by the end of 2026.
              </Typography>
              <Typography variant="body" color="secondary">
                Your sensors, billing, saved data, and team access will stay the same.
              </Typography>
            </div>
            <footer className={styles.dialogFooter}>
              <Button variant="secondary" type="button" onClick={() => setIsDashboardPromptOpen(false)}>
                Keep new dashboard
              </Button>
              <Button variant="primary" type="button" onClick={confirmOldDashboard}>
                Return to old dashboard
              </Button>
            </footer>
          </section>
        </div>
      )}

      <div className={styles.actions}>
        <Button variant="ghost" type="button">Cancel</Button>
        <Button variant="primary" type="submit" disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
};

AccountForm.propTypes = {
  onSubmit: PropTypes.func,
  isSaving: PropTypes.bool,
  globalError: PropTypes.string,
  successMessage: PropTypes.string,
  className: PropTypes.string,
};
