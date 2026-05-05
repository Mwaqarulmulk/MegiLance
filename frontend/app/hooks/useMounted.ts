import { useEffect, useState } from 'react';

// Module-level flag: stays true after first hydration, never resets across navigations.
// This prevents the theme flash that occurs when components remount during client-side navigation.
let _hydrated = false;

export function useMounted(): boolean {
  const [mounted, setMounted] = useState(_hydrated);

  useEffect(() => {
    _hydrated = true;
    setMounted(true);
  }, []);

  return mounted;
}
