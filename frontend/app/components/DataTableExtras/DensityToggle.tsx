// @AI-HINT: Density toggle for table row spacing (comfortable/compact).
'use client';

import React, { useMemo } from 'react';
import { useTheme } from 'next-themes';
import commonStyles from './DensityToggle.common.module.css';
import lightStyles from './DensityToggle.light.module.css';
import darkStyles from './DensityToggle.dark.module.css';

export type Density = 'comfortable' | 'compact';

interface DensityToggleProps {
  value: Density;
  onChange: (d: Density) => void;
}

const DensityToggle: React.FC<DensityToggleProps> = ({ value, onChange }) => {
  const { theme } = useTheme();
  const styles = useMemo(() => (theme === 'dark' ? { ...commonStyles, ...darkStyles } : { ...commonStyles, ...lightStyles }), [theme]);
  return (
    <div className={styles.group} role="group" aria-label="Row density">
      <button
        type="button"
        className={styles.button}
        aria-pressed={value === 'comfortable'}
        onClick={() => onChange('comfortable')}
      >Comfortable</button>
      <button
        type="button"
        className={styles.button}
        aria-pressed={value === 'compact'}
        onClick={() => onChange('compact')}
      >Compact</button>
    </div>
  );
};

export default DensityToggle;
