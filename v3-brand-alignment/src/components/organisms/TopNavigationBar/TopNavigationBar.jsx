import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { SearchBar } from '../../molecules/SearchBar/SearchBar';
import { Button } from '../../atoms/Button/Button';
import styles from './TopNavigationBar.module.css';
import logo from '../../../assets/rapidaim_logo.svg';

export const TopNavigationBar = ({
  organizationName = 'RapidAIM',
  onSearch,
  onMenuClick,
  onTasksClick,
  onProfileClick,
  className = '',
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <header className={`${styles.header} ${isSearchOpen ? styles.searchActive : ''} ${className}`}>
      {isSearchOpen ? (
        <div className={styles.searchMode}>
          <SearchBar
            placeholder="Search ranches, blocks, or sensors..."
            onChange={onSearch}
            className={styles.searchBar}
          />
          <Button variant="ghost" size="sm" onClick={() => setIsSearchOpen(false)} aria-label="Close search">
            <span className="material-symbols-rounded">close</span>
          </Button>
        </div>
      ) : (
        <>
          <div className={styles.leftSection}>
            {onMenuClick && (
              <Button variant="ghost" size="sm" onClick={onMenuClick} className={styles.mobileMenuBtn} aria-label="Menu">
                <span className="material-symbols-rounded">menu</span>
              </Button>
            )}
            <div className={styles.logo}>
              <img src={logo} alt={organizationName} />
            </div>
          </div>

          <div className={styles.rightSection}>
            <Button variant="ghost" size="sm" onClick={() => setIsSearchOpen(true)} aria-label="Search">
              <span className="material-symbols-rounded">search</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={onTasksClick} aria-label="Tasks">
              <span className="material-symbols-rounded">assignment</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={onProfileClick} aria-label="User Profile">
              <span className="material-symbols-rounded">account_circle</span>
            </Button>
          </div>
        </>
      )}
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
