import React from 'react';
import PropTypes from 'prop-types';
import { SearchBar } from '../../molecules/SearchBar/SearchBar';
import { Button } from '../../atoms/Button/Button';
import { Typography } from '../../atoms/Typography/Typography';
import styles from './TopNavigationBar.module.css';

export const TopNavigationBar = ({
  organizationName = 'RapidAIM',
  onSearch,
  onMenuClick,
  onTasksClick,
  onProfileClick,
  className = '',
}) => {
  return (
    <header className={`${styles.header} ${className}`}>
      <div className={styles.leftSection}>
        {onMenuClick && (
          <Button variant="ghost" size="sm" onClick={onMenuClick} className={styles.mobileMenuBtn} aria-label="Menu">
            <span className="material-symbols-rounded">menu</span>
          </Button>
        )}
        <div className={styles.logo}>
          <span className={`material-symbols-rounded ${styles.logoIcon}`}>pest_control</span>
          <Typography variant="h4" color="brand">{organizationName}</Typography>
        </div>
      </div>
      
      <div className={styles.centerSection}>
        <SearchBar placeholder="Search ranches, blocks, or sensors..." onChange={onSearch} className={styles.searchBar} />
      </div>

      <div className={styles.rightSection}>
        <Button variant="ghost" size="sm" onClick={onTasksClick} aria-label="Tasks">
          <span className="material-symbols-rounded">assignment</span>
        </Button>
        <Button variant="ghost" size="sm" onClick={onProfileClick} aria-label="User Profile">
          <span className="material-symbols-rounded">account_circle</span>
        </Button>
      </div>
    </header>
  );
};

TopNavigationBar.propTypes = {
  organizationName: PropTypes.string,
  onSearch: PropTypes.func,
  onMenuClick: PropTypes.func,
  onTasksClick: PropTypes.func,
  onProfileClick: PropTypes.func,
  className: PropTypes.string,
};
