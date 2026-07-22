import React from 'react';
import PropTypes from 'prop-types';
import { Typography } from '../../atoms/Typography/Typography';
import { Badge } from '../../atoms/Badge/Badge';
import styles from './RankingListItem.module.css';

export const RankingListItem = ({
  rank,
  title,
  subtitle,
  riskLevel, // 'high', 'medium', 'low'
  riskLabelOverride,
  statusLabel,
  disabled = false,
  onClick,
  onFocus,
  onBlur,
  onMouseEnter,
  onMouseLeave,
  className = '',
}) => {
  const riskLabels = {
    high: 'High Risk',
    medium: 'Medium Risk',
    low: 'Low Risk',
    offline: 'Offline',
  };
  const riskLabel = riskLabelOverride || riskLabels[riskLevel];

  return (
    <button
      className={`${styles.item} ${disabled ? styles.disabled : ''} ${className}`}
      disabled={disabled}
      onBlur={onBlur}
      onClick={onClick}
      onFocus={onFocus}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      type="button"
    >
      <div className={styles.rankBadge}>{rank}</div>
      <div className={styles.content}>
        <Typography variant="body-sm" weight="semibold">{title}</Typography>
        <Typography variant="caption" color="secondary">{subtitle}</Typography>
        {statusLabel && (
          <span className={styles.statusTag}>{statusLabel}</span>
        )}
      </div>
      <Badge variant={riskLevel} className={styles.riskBadge}>{riskLabel}</Badge>
    </button>
  );
};

RankingListItem.propTypes = {
  rank: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  riskLevel: PropTypes.oneOf(['high', 'medium', 'low', 'offline']).isRequired,
  riskLabelOverride: PropTypes.string,
  statusLabel: PropTypes.string,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  onMouseEnter: PropTypes.func,
  onMouseLeave: PropTypes.func,
  className: PropTypes.string,
};
