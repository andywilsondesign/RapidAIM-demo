import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { SearchBar } from '../../molecules/SearchBar/SearchBar';
import { Button } from '../../atoms/Button/Button';
import styles from './TopNavigationBar.module.css';
import logo from '../../../assets/rapidaim_logo.svg';

export const TopNavigationBar = ({
  organizationName = 'RapidAIM',
  modeLabel,
  modeOptions = [],
  defaultProfileMenuOpen = false,
  profileMenuItems = [],
  onSearch,
  onMenuClick,
  onTasksClick,
  onProfileClick,
  className = '',
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(defaultProfileMenuOpen);

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
            {modeOptions.length > 0 ? (
              <label className={styles.modeSelectWrap}>
                <select aria-label="Product mode" className={styles.modeSelect} defaultValue={modeLabel || modeOptions[0].value}>
                  {modeOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                <span className="material-symbols-rounded" aria-hidden="true">expand_more</span>
              </label>
            ) : modeLabel ? (
              <span className={styles.modeChip}>{modeLabel}</span>
            ) : null}
          </div>

          <div className={styles.rightSection}>
            <Button variant="ghost" size="sm" onClick={() => setIsSearchOpen(true)} aria-label="Search">
              <span className="material-symbols-rounded">search</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={onTasksClick} aria-label="Tasks">
              <span className="material-symbols-rounded">assignment</span>
            </Button>
            <div className={styles.profileMenuWrap}>
              <Button
                variant="ghost"
                size="sm"
                onClick={(event) => {
                  onProfileClick?.(event);
                  if (profileMenuItems.length > 0) {
                    setIsProfileMenuOpen((current) => !current);
                  }
                }}
                aria-label="User Profile"
                aria-expanded={profileMenuItems.length > 0 ? isProfileMenuOpen : undefined}
              >
                <span className="material-symbols-rounded">account_circle</span>
              </Button>
              {profileMenuItems.length > 0 && isProfileMenuOpen && (
                <div className={styles.profileMenu} role="menu">
                  {profileMenuItems.map((item) => (
                    <button
                      className={item.active ? styles.activeProfileMenuItem : ''}
                      key={item.label}
                      onClick={() => {
                        item.onClick?.();
                        setIsProfileMenuOpen(false);
                      }}
                      role="menuitem"
                      type="button"
                    >
                      <span className="material-symbols-rounded" aria-hidden="true">{item.icon || 'settings'}</span>
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  );
};

TopNavigationBar.propTypes = {
  organizationName: PropTypes.string,
  modeLabel: PropTypes.string,
  modeOptions: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
  })),
  defaultProfileMenuOpen: PropTypes.bool,
  profileMenuItems: PropTypes.arrayOf(PropTypes.shape({
    active: PropTypes.bool,
    icon: PropTypes.string,
    label: PropTypes.string.isRequired,
    onClick: PropTypes.func,
  })),
  onSearch: PropTypes.func,
  onMenuClick: PropTypes.func,
  onTasksClick: PropTypes.func,
  onProfileClick: PropTypes.func,
  className: PropTypes.string,
};
