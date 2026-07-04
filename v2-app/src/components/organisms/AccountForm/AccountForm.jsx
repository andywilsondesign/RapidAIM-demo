import React from 'react';
import PropTypes from 'prop-types';
import { FormField } from '../../molecules/FormField/FormField';
import { Input } from '../../atoms/Input/Input';
import { Select } from '../../atoms/Select/Select';
import { Button } from '../../atoms/Button/Button';
import { Typography } from '../../atoms/Typography/Typography';
import { Alert } from '../../molecules/Alert/Alert';
import styles from './AccountForm.module.css';

export const AccountForm = ({
  onSubmit,
  isSaving = false,
  globalError = null,
  successMessage = null,
  className = '',
}) => {
  return (
    <form 
      className={`${styles.form} ${className}`} 
      onSubmit={(e) => { e.preventDefault(); onSubmit && onSubmit(); }}
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
