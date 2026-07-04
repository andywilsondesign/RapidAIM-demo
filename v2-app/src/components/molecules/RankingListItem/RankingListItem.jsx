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
  onClick,
  className = '',
}) => {
  return (
    <button className={`${styles.item} ${className}`} onClick={onClick}>
      <div className={styles.rankBadge}>{rank}</div>
      <div className={styles.content}>
        <Typography variant="body-sm" weight="semibold">{title}</Typography>
        <Typography variant="caption" color="secondary">{subtitle}</Typography>
      </div>
      <Badge variant={riskLevel}>{riskLevel} Risk</Badge>
    </button>
  );
};

RankingListItem.propTypes = {
  rank: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  riskLevel: PropTypes.oneOf(['high', 'medium', 'low']).isRequired,
  onClick: PropTypes.func,
  className: PropTypes.string,
};
