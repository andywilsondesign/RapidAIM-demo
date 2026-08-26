import React from 'react';
import PropTypes from 'prop-types';
import { Badge } from '../../atoms/Badge/Badge';
import { Button } from '../../atoms/Button/Button';
import { Select } from '../../atoms/Select/Select';
import { Typography } from '../../atoms/Typography/Typography';
import { FormField } from '../../molecules/FormField/FormField';
import styles from './MaintenanceNoteModal.module.css';

export const MaintenanceNoteModal = ({
  compact = false,
  className = '',
  entityLabels = ['Sierra Orchards', 'Block 4', 'Sensor S4-D'],
}) => (
  <div className={`${styles.modal} ${compact ? styles.compact : ''} ${className}`}>
    <div className={styles.header}>
      <div className={styles.title}>
        <span className="material-symbols-rounded" aria-hidden="true">edit_note</span>
        <Typography variant="h4">Add maintenance note</Typography>
      </div>
      <Button variant="ghost" size="sm" aria-label="Close maintenance note modal">
        <span className="material-symbols-rounded">close</span>
      </Button>
    </div>
    <div className={styles.body}>
      <div className={styles.context}>
        {entityLabels.map((label, index) => (
          <Badge key={label} variant={index === entityLabels.length - 1 ? 'offline' : 'neutral'}>{label}</Badge>
        ))}
      </div>
      <FormField label="Category">
        <Select options={[
          { label: 'Battery change', value: 'battery' },
          { label: 'Lure change', value: 'lure' },
          { label: 'Device moved', value: 'moved' },
          { label: 'Device replaced', value: 'replaced' },
          { label: 'General visit note', value: 'note' },
        ]} />
      </FormField>
      <label className={styles.textareaLabel}>
        <Typography variant="caption" color="secondary">Note</Typography>
        <textarea rows={compact ? 5 : 6} placeholder="Add field note or maintenance outcome" />
      </label>
    </div>
    <div className={styles.footer}>
      <Button variant="secondary">Cancel</Button>
      <Button variant="primary">Save note</Button>
    </div>
  </div>
);

MaintenanceNoteModal.propTypes = {
  compact: PropTypes.bool,
  className: PropTypes.string,
  entityLabels: PropTypes.arrayOf(PropTypes.string),
};
