// @AI-HINT: Logout page - handles user logout and redirects to home
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    // Clear auth tokens
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      sessionStorage.clear();
    }

    // Redirect to home
    router.push('/');
  }, [router]);

  return (
    <div className="logout-container">
      <p>Logging out...</p>
      <style jsx>{`
        .logout-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
        }
      `}</style>
    </div>
  );
}
