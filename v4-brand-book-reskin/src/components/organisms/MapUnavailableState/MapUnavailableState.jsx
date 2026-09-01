import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Badge } from '../../atoms/Badge/Badge';
import { Button } from '../../atoms/Button/Button';
import { Typography } from '../../atoms/Typography/Typography';
import { Alert } from '../../molecules/Alert/Alert';
import { mapUnavailableContent } from './MapUnavailableState.content';
import styles from './MapUnavailableState.module.css';

const decorativeBlocks = [
  { className: styles.blockNorth, label: 'North block placeholder' },
  { className: styles.blockEast, label: 'East block placeholder' },
  { className: styles.blockSouth, label: 'South block placeholder' },
];

export const MapUnavailableState = ({
  variant = 'connection',
  className = '',
  onPrimaryAction,
  onSecondaryAction,
}) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isMessageOpen, setIsMessageOpen] = useState(true);
  const content = mapUnavailableContent[variant];
  const canDismissMessage = Boolean(content.dismissAction);

  useEffect(() => {
    setIsMessageOpen(true);
    setIsDetailsOpen(false);
  }, [variant]);

  const handleSecondaryAction = () => {
    if (onSecondaryAction) {
      onSecondaryAction(variant);
      return;
    }
    setIsDetailsOpen(true);
  };

  const bannerMessage = (
    <>
      {content.message}
      {canDismissMessage && !isMessageOpen && (
        <>
          {' '}
          <button className={styles.bannerLink} type="button" onClick={() => setIsMessageOpen(true)}>
            {content.resumeAction || 'Review message'}
          </button>
        </>
      )}
    </>
  );

  return (
    <section className={`${styles.shell} ${className}`} aria-label={`${content.title} map state`}>
      <Alert
        type="global"
        variant={content.alertVariant}
        title={content.badge}
        message={bannerMessage}
        className={styles.globalBanner}
      />
      <div className={styles.mapFrame} role="status" aria-live="polite">
        <div className={styles.frozenMap} aria-hidden="true">
          <div className={styles.mapGrid} />
          {decorativeBlocks.map((block) => (
            <span className={`${styles.mapBlock} ${block.className}`} key={block.label} />
          ))}
          <span className={`${styles.sensorDot} ${styles.sensorDotOne}`} />
          <span className={`${styles.sensorDot} ${styles.sensorDotTwo}`} />
          <span className={`${styles.sensorDot} ${styles.sensorDotThree}`} />
        </div>
        {isMessageOpen && (
          <div className={styles.messagePanel}>
            <Badge variant={content.badgeVariant}>{content.badge}</Badge>
            <div className={styles.copy}>
              <Typography variant="h3">{content.title}</Typography>
              <Typography variant="body" color="secondary">{content.detail}</Typography>
            </div>
            <div className={styles.actions}>
              {content.primaryAction && (
                <Button variant="primary" type="button" onClick={() => onPrimaryAction?.(variant)}>
                  {content.primaryAction}
                </Button>
              )}
              {content.dismissAction && (
                <Button variant="secondary" type="button" onClick={() => setIsMessageOpen(false)}>
                  {content.dismissAction}
                </Button>
              )}
              <Button variant="secondary" type="button" onClick={handleSecondaryAction}>
                {content.secondaryAction}
              </Button>
            </div>
          </div>
        )}
      </div>

      {isDetailsOpen && (
        <div className={styles.dialogBackdrop} role="presentation">
          <section
            className={styles.dialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${variant}-map-details-title`}
          >
            <header className={styles.dialogHeader}>
              <div>
                <Badge variant={content.badgeVariant}>{content.badge}</Badge>
                <Typography variant="h4" id={`${variant}-map-details-title`}>{content.detailsTitle}</Typography>
              </div>
              <Button variant="ghost" size="sm" type="button" aria-label="Close details" onClick={() => setIsDetailsOpen(false)}>
                <span className="material-symbols-rounded" aria-hidden="true">close</span>
              </Button>
            </header>
            <div className={styles.dialogBody}>
              {content.details.map((paragraph) => (
                <Typography variant="body" color="secondary" key={paragraph}>{paragraph}</Typography>
              ))}
            </div>
            <footer className={styles.dialogFooter}>
              <Button variant="secondary" type="button" onClick={() => setIsDetailsOpen(false)}>Close</Button>
              {content.primaryAction && (
                <Button variant="primary" type="button">{content.primaryAction}</Button>
              )}
            </footer>
          </section>
        </div>
      )}
    </section>
  );
};

MapUnavailableState.propTypes = {
  variant: PropTypes.oneOf(Object.keys(mapUnavailableContent)),
  className: PropTypes.string,
  onPrimaryAction: PropTypes.func,
  onSecondaryAction: PropTypes.func,
};
