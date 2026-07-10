import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { Typography } from '../../atoms/Typography/Typography';
import { Badge } from '../../atoms/Badge/Badge';
import styles from './DetailPanel.module.css';

export const DetailPanel = ({ 
  title, 
  eyebrow, 
  badge, 
  backLabel, 
  backAriaLabel,
  onBackClick,
  sections = [], 
  actions, 
  children,
  className = ''
}) => {
  const [activeSection, setActiveSection] = useState('overview');
  const overviewRef = useRef(null);
  const sectionRefs = useRef({});
  const hasSections = sections.length > 0;

  const scrollToSection = (section) => {
    const target = section === 'overview' ? overviewRef.current : sectionRefs.current[section];
    target?.scrollIntoView({ block: 'start', behavior: 'smooth' });
    setActiveSection(section);
  };

  const handlePanelScroll = (event) => {
    if (!hasSections) return;
    const bodyTop = event.currentTarget.getBoundingClientRect().top;
    const visibleSection = sections.reduce((current, section) => {
      const node = sectionRefs.current[section.label];
      if (!node) return current;
      const sectionTop = node.getBoundingClientRect().top - bodyTop;
      return sectionTop <= 128 ? section.label : current;
    }, 'overview');
    setActiveSection(visibleSection);
  };

  return (
    <section className={`${styles.panel} ${className}`}>
      <div className={styles.panelHeader}>
        <div className={styles.panelTitleGroup}>
          <div className={styles.panelTitleRow}>
            <div className={styles.panelTitleCluster}>
              {backLabel && (
                <button 
                  className={styles.backButton} 
                  type="button" 
                  aria-label={backAriaLabel || `Back to ${backLabel}`}
                  onClick={onBackClick}
                >
                  <span className="material-symbols-rounded">arrow_back</span>
                </button>
              )}
              <Typography variant="h3">{title}</Typography>
            </div>
            {badge && <Badge variant={badge} className={styles.panelBadge}>{badge} Risk</Badge>}
          </div>
          <div className={styles.panelMetaRow}>
            {eyebrow && <Typography variant="caption" color="secondary" className={`${styles.panelSubtitle} font-eyebrow`}>{eyebrow}</Typography>}
          </div>
        </div>
      </div>
      {hasSections && (
        <nav className={styles.anchorTabs} aria-label={`${title} panel sections`} style={{ '--tab-count': sections.length + 1 }}>
          <button
            className={activeSection === 'overview' ? styles.activeAnchorTab : ''}
            type="button"
            onClick={() => scrollToSection('overview')}
          >
            Overview
          </button>
          {sections.map((section) => (
            <button
              className={activeSection === section.label ? styles.activeAnchorTab : ''}
              key={section.label}
              type="button"
              onClick={() => scrollToSection(section.label)}
            >
              {section.label}
            </button>
          ))}
        </nav>
      )}
      <div className={styles.panelBody} onScroll={handlePanelScroll}>
        <section className={styles.panelSection} ref={overviewRef}>
          {children}
        </section>
        {sections.map((section) => (
          <section
            className={styles.panelSection}
            key={section.label}
            ref={(node) => {
              sectionRefs.current[section.label] = node;
            }}
          >
            {section.content}
          </section>
        ))}
      </div>
      {actions && (
        <>
          <div className={`${styles.panelBottomFade} ${styles.panelBottomFadeActions}`} />
          <div className={styles.panelActions}>
            {actions}
          </div>
        </>
      )}
    </section>
  );
};

DetailPanel.propTypes = {
  title: PropTypes.string.isRequired,
  eyebrow: PropTypes.string,
  badge: PropTypes.string,
  backLabel: PropTypes.string,
  backAriaLabel: PropTypes.string,
  onBackClick: PropTypes.func,
  sections: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      content: PropTypes.node.isRequired,
    })
  ),
  actions: PropTypes.node,
  children: PropTypes.node,
  className: PropTypes.string,
};
