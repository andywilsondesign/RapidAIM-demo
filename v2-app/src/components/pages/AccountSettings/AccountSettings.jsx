import React from 'react';
import { TopNavigationBar } from '../../organisms/TopNavigationBar/TopNavigationBar';
import { AccountForm } from '../../organisms/AccountForm/AccountForm';
import { Alert } from '../../molecules/Alert/Alert';
import styles from './AccountSettings.module.css';

export const AccountSettings = () => {
  const [success, setSuccess] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const handleSubmit = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSuccess(true);
    }, 1000);
  };

  return (
    <div className={styles.page}>
      <TopNavigationBar />
      
      <main className={styles.main}>
        <div className={styles.container}>
          <Alert 
            type="global" 
            variant="info" 
            message="Your organization is currently on the Pro tier. You have access to all premium features."
            className={styles.globalAlert}
          />
          
          <div className={styles.content}>
            <AccountForm 
              onSubmit={handleSubmit} 
              isSaving={saving} 
              successMessage={success ? 'Settings successfully updated.' : null} 
            />
          </div>
        </div>
      </main>
    </div>
  );
};
