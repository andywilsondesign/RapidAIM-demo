import React from 'react';
import { TopNavigationBar } from '../../organisms/TopNavigationBar/TopNavigationBar';
import { AccountForm } from '../../organisms/AccountForm/AccountForm';
import { Alert } from '../../molecules/Alert/Alert';
import { Typography } from '../../atoms/Typography/Typography';
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
          <aside className={styles.sideNav} aria-label="Account settings sections">
            <Typography variant="h5">Settings</Typography>
            <nav className={styles.navLinks}>
              <button className={styles.activeNavLink} type="button">Account</button>
              <button type="button">Team</button>
              <button type="button">Billing</button>
              <button type="button">Notifications</button>
              <button type="button">Integrations</button>
            </nav>
          </aside>

          <div className={styles.contentColumn}>
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
        </div>
      </main>
    </div>
  );
};
