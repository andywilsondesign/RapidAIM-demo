import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
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

const dialogIconMap = {
  info: 'info',
  success: 'check_circle',
  warning: 'warning',
  error: 'error',
};

export const MapUnavailableState = ({
  variant = 'connection',
  className = '',
  onPrimaryAction,
  onSecondaryAction,
}) => {
  const [isMessageOpen, setIsMessageOpen] = useState(true);
  const content = mapUnavailableContent[variant];
  const resumeAction = content.resumeAction || 'More information';

  useEffect(() => {
    setIsMessageOpen(true);
  }, [variant]);

  const bannerMessage = (
    <>
      {content.message}
      {' '}
      <button className={styles.bannerLink} type="button" onClick={() => setIsMessageOpen(true)}>
        {resumeAction}
      </button>
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
      </div>

      {isMessageOpen && (
        <MapStateDialog
          content={content}
          idPrefix={`${variant}-map-message`}
          onClose={content.dismissAction ? () => setIsMessageOpen(false) : undefined}
          onDismiss={content.dismissAction ? () => setIsMessageOpen(false) : undefined}
          onPrimaryAction={() => onPrimaryAction?.(variant)}
          onSecondaryAction={() => onSecondaryAction?.(variant)}
        />
      )}
    </section>
  );
};

export const MapStateDialog = ({
  content,
  idPrefix,
  onClose,
  onDismiss,
  onPrimaryAction,
  onSecondaryAction,
}) => {
  const dialogTitleId = `${idPrefix}-title`;
  const iconName = content.modalIcon || dialogIconMap[content.alertVariant];

  return (
    <div className={styles.messageBackdrop} role="presentation">
      <section className={styles.messagePanel} role="dialog" aria-modal="true" aria-labelledby={dialogTitleId}>
        <header className={styles.messageHeader}>
          <div className={styles.messageTitleGroup}>
            {iconName && (
              <span
                className={`material-symbols-rounded ${styles.messageTitleIcon}`}
                aria-hidden="true"
              >
                {iconName}
              </span>
            )}
            <Typography variant="h4" id={dialogTitleId}>{content.modalTitle || content.title}</Typography>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" type="button" aria-label="Close message" onClick={onClose}>
              <span className="material-symbols-rounded" aria-hidden="true">close</span>
            </Button>
          )}
        </header>
        <div className={styles.copy}>
          <Typography variant="body" color="secondary">{content.detail}</Typography>
        </div>
        <footer className={styles.actions}>
          {content.primaryAction && (
            <Button variant="primary" type="button" onClick={onPrimaryAction}>
              {content.primaryAction}
            </Button>
          )}
          {content.dismissAction && (
            <Button variant="secondary" type="button" onClick={onDismiss}>
              {content.dismissAction}
            </Button>
          )}
          {content.secondaryAction && (
            <Button variant="secondary" type="button" onClick={onSecondaryAction}>
              {content.secondaryAction}
            </Button>
          )}
        </footer>
      </section>
    </div>
  );
};

MapUnavailableState.propTypes = {
  variant: PropTypes.oneOf(Object.keys(mapUnavailableContent)),
  className: PropTypes.string,
  onPrimaryAction: PropTypes.func,
  onSecondaryAction: PropTypes.func,
};

MapStateDialog.propTypes = {
  content: PropTypes.shape({
    title: PropTypes.string.isRequired,
    modalTitle: PropTypes.string,
    modalIcon: PropTypes.string,
    alertVariant: PropTypes.oneOf(['info', 'success', 'warning', 'error']).isRequired,
    detail: PropTypes.string.isRequired,
    primaryAction: PropTypes.string,
    dismissAction: PropTypes.string,
    secondaryAction: PropTypes.string,
  }).isRequired,
  idPrefix: PropTypes.string.isRequired,
  onClose: PropTypes.func,
  onDismiss: PropTypes.func,
  onPrimaryAction: PropTypes.func,
  onSecondaryAction: PropTypes.func,
};
