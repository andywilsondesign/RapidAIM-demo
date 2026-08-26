import React, { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { Typography } from '../../atoms/Typography/Typography';
import styles from './InfoDisclosure.module.css';

export const InfoDisclosure = ({
  title,
  description,
  align = 'end',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState(null);
  const panelId = useId();
  const triggerRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !triggerRef.current) return undefined;

    const updatePosition = () => {
      const rect = triggerRef.current.getBoundingClientRect();
      const panelWidth = Math.min(280, window.innerWidth - 32);
      const preferredLeft = align === 'start' ? rect.left : rect.right - panelWidth;
      const left = Math.min(Math.max(16, preferredLeft), window.innerWidth - panelWidth - 16);

      setPosition({
        left,
        top: rect.bottom + 8,
        width: panelWidth,
      });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [align, isOpen]);

  return (
    <span className={`${styles.wrapper} ${className}`}>
      <button
        ref={triggerRef}
        className={styles.trigger}
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-label={title}
        onClick={() => setIsOpen((current) => !current)}
      >
        <span className="material-symbols-rounded" aria-hidden="true">info</span>
      </button>
      {isOpen && position && createPortal(
        <span
          className={styles.panel}
          id={panelId}
          role="status"
          style={{ left: position.left, top: position.top, width: position.width }}
        >
          <span className={styles.panelHeader}>
            <Typography variant="body-sm" weight="bold">{title}</Typography>
            <button
              className={styles.closeButton}
              type="button"
              aria-label={`Close ${title}`}
              onClick={() => setIsOpen(false)}
            >
              <span className="material-symbols-rounded" aria-hidden="true">close</span>
            </button>
          </span>
          <Typography variant="caption" color="secondary">{description}</Typography>
        </span>,
        document.body
      )}
    </span>
  );
};

InfoDisclosure.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  align: PropTypes.oneOf(['start', 'end']),
  className: PropTypes.string,
};
