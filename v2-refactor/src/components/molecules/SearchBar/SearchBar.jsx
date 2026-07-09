import React from 'react';
import PropTypes from 'prop-types';
import { Input } from '../../atoms/Input/Input';
import styles from './SearchBar.module.css';

export const SearchBar = ({
  placeholder = 'Search...',
  value,
  onChange,
  className = '',
}) => {
  return (
    <div className={`${styles.searchBar} ${className}`}>
      <span className={`material-symbols-rounded ${styles.icon}`}>search</span>
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={styles.input}
        fullWidth
      />
    </div>
  );
};

SearchBar.propTypes = {
  placeholder: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  className: PropTypes.string,
};
