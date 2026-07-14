import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import styles from './ScopeNavigation.module.css';

export const ScopeNavigation = ({
  segments,
  className = '',
  ariaLabel = 'Location scope navigation',
  showHome = false,
  homeLabel = 'Pest pressure ranking',
  onHomeClick,
  activeHome = false,
  activeIndex = -1,
}) => {
  const rootRef = useRef(null);
  const menuRef = useRef(null);
  const trackRef = useRef(null);
  const buttonRefs = useRef([]);
  const [openMenu, setOpenMenu] = useState(null);
  const segmentSignature = segments.map((segment) => segment.label).join('|');

  useEffect(() => {
    if (activeIndex < 0) return;

    let secondFrame = 0;
    const firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => {
        const track = trackRef.current;
        const activeButton = buttonRefs.current[activeIndex];
        if (!track || !activeButton) return;

        const activeItem = activeButton.parentElement;
        const activeLeftInTrack = activeItem?.offsetLeft ?? 0;
        const targetScrollLeft = activeLeftInTrack - ((track.clientWidth - activeButton.offsetWidth) / 2);
        const maxScrollLeft = track.scrollWidth - track.clientWidth;
        track.scrollLeft = Math.min(Math.max(0, targetScrollLeft), maxScrollLeft);
      });
    });
    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
    };
  }, [activeIndex, segmentSignature]);

  useEffect(() => {
    if (!openMenu) return undefined;

    const closeMenu = (event) => {
      if (rootRef.current?.contains(event.target) || menuRef.current?.contains(event.target)) return;
      setOpenMenu(null);
    };
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setOpenMenu(null);
    };

    document.addEventListener('mousedown', closeMenu);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeMenu);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [openMenu]);

  if (!segments?.length) return null;

  const openSegmentMenu = (segment, index, trigger) => {
    const rect = trigger.getBoundingClientRect();
    const menuWidth = 224;
    setOpenMenu({
      id: `${segment.label}-${index}`,
      label: segment.label,
      options: segment.options,
      top: rect.bottom + 8,
      left: Math.min(Math.max(rect.left, 16), window.innerWidth - menuWidth - 16),
    });
  };

  return (
    <nav ref={rootRef} className={`${styles.root} ${className}`} aria-label={ariaLabel}>
      {showHome && (
        <button
          className={`${styles.homeButton} ${activeHome ? styles.activeHomeButton : ''}`}
          type="button"
          aria-label={homeLabel}
          aria-current={activeHome ? 'page' : undefined}
          onClick={onHomeClick}
        >
          <span className="material-symbols-rounded" aria-hidden="true">home</span>
        </button>
      )}
      <div className={styles.locationScope} aria-label="Location breadcrumb selectors">
        <div ref={trackRef} className={styles.scopeTrack}>
          {segments.map((segment, index) => (
            <ScopeDropdown
              key={`${segment.label}-${index}`}
              label={segment.label}
              options={segment.options}
              active={index === activeIndex}
              isOpen={openMenu?.id === `${segment.label}-${index}`}
              buttonRef={(element) => {
                buttonRefs.current[index] = element;
              }}
              onOpen={(event) => openSegmentMenu(segment, index, event.currentTarget)}
            />
          ))}
        </div>
      </div>
      {openMenu && (
        <div
          ref={menuRef}
          className={`${styles.scopeMenu} ${styles.openScopeMenu}`}
          role="listbox"
          aria-label={`${openMenu.label} options`}
          style={{
            top: `${openMenu.top}px`,
            left: `${openMenu.left}px`,
          }}
          onMouseLeave={() => setOpenMenu(null)}
        >
          {openMenu.options.map((option) => (
            <button
              className={styles.scopeOption}
              key={option.label}
              type="button"
              role="option"
              aria-selected={option.label === openMenu.label}
              onClick={() => setOpenMenu(null)}
            >
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      )}
    </nav>
  );
};

function ScopeDropdown({ label, active = false, isOpen = false, buttonRef, onOpen }) {
  return (
    <div className={styles.scopeDropdown}>
      <button
        ref={buttonRef}
        className={`${styles.scopeButton} ${active ? styles.activeScopeButton : ''}`}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-current={active ? 'page' : undefined}
        onFocus={onOpen}
        onMouseEnter={onOpen}
        onClick={onOpen}
      >
        <span className={styles.scopeLabel}>{label}</span>
        <span className="material-symbols-rounded" aria-hidden="true">expand_more</span>
      </button>
    </div>
  );
}

ScopeDropdown.propTypes = {
  label: PropTypes.string.isRequired,
  active: PropTypes.bool,
  isOpen: PropTypes.bool,
  buttonRef: PropTypes.func.isRequired,
  onOpen: PropTypes.func.isRequired,
};

ScopeNavigation.propTypes = {
  segments: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    options: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.string.isRequired,
    })).isRequired,
  })).isRequired,
  className: PropTypes.string,
  ariaLabel: PropTypes.string,
  showHome: PropTypes.bool,
  homeLabel: PropTypes.string,
  onHomeClick: PropTypes.func,
  activeHome: PropTypes.bool,
  activeIndex: PropTypes.number,
};
