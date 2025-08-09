// @AI-HINT: Feature flags and environment-driven switches for runtime behavior.
export const isPreviewMode = (): boolean => {
  try {
    // NEXT_PUBLIC_ vars are available on client and server
    return process.env.NEXT_PUBLIC_PREVIEW_MODE === '1';
  } catch {
    return false;
  }
};
