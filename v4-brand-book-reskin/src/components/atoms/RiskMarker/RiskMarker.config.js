export const markerConfig = {
  high: {
    shape: 'M8 1.5h8L21.5 7v8L16 20.5H8L2.5 15V7L8 1.5Z',
    icon: 'M12 6.4v6.2M12 15.8v.1',
    fill: 'var(--color-status-red)',
  },
  medium: {
    shape: 'M12 1.9L22 20.5H2L12 1.9Z',
    icon: 'M12 9v4.2M12 16.1v.1',
    fill: 'var(--color-status-amber)',
  },
  low: {
    shape: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z',
    icon: 'M7.8 12.2l2.7 2.7 5.7-6',
    fill: 'var(--color-status-green)',
  },
  offline: {
    shape: 'M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z',
    icon: 'M8 12h8',
    fill: '#64748b',
  },
};

export const getRiskMarkerSvgMarkup = (severity = 'low', selected = false) => {
  const marker = markerConfig[severity] || markerConfig.low;
  const strokeWidth = selected ? 2.3 : 1.45;

  return `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="${marker.shape}" fill="${marker.fill}" stroke="#fff" stroke-width="${strokeWidth}" stroke-linejoin="round"></path>
      <path d="${marker.icon}" fill="none" stroke="#fff" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"></path>
    </svg>
  `;
};
