import React from 'react';
import PropTypes from 'prop-types';
import styles from './MobileBottomSheet.module.css';

export const MobileBottomSheet = ({
  state = 'docked',
  label,
  dockedSummary,
  children,
  onToggle,
  className = '',
  dismissMode = false,
}) => {
  const isFull = state === 'full';
  const isDocked = state === 'docked';
  const actionLabel = dismissMode && isFull
    ? 'Close bottom sheet'
    : isFull ? 'Reduce bottom sheet' : 'Expand bottom sheet';

  return (
    <section
      className={`${styles.sheet} ${styles[state]} ${dismissMode ? styles.dismissMode : ''} ${className}`}
      aria-label={label}
    >
      <div className={styles.controls}>
        <button
          className={styles.handleButton}
          type="button"
          aria-label={actionLabel}
          onClick={onToggle}
        >
          <span className={styles.handle} />
        </button>
        <button
          className={styles.stateButton}
          type="button"
          aria-label={actionLabel}
          onClick={onToggle}
        >
          <span className="material-symbols-rounded" aria-hidden="true">
            {dismissMode && isFull ? 'close' : isFull ? 'keyboard_arrow_down' : 'keyboard_arrow_up'}
          </span>
        </button>
      </div>
      {isDocked ? dockedSummary : children}
    </section>
  );
};

MobileBottomSheet.propTypes = {
  state: PropTypes.oneOf(['docked', 'half', 'full']),
  label: PropTypes.string.isRequired,
  dockedSummary: PropTypes.node.isRequired,
  children: PropTypes.node.isRequired,
  onToggle: PropTypes.func.isRequired,
  className: PropTypes.string,
  dismissMode: PropTypes.bool,
};
