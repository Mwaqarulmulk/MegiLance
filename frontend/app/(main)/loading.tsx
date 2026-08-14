// Minimal non-blocking top progress bar for public marketing routes
export default function MainLoading() {
  return (
    <div 
      className="fixed top-0 left-0 right-0 z-50 h-0.5 bg-transparent overflow-hidden pointer-events-none"
      role="status"
      aria-label="Loading content"
    >
      <div className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 w-full animate-pulse opacity-80" />
    </div>
  );
}
