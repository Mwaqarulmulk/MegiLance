// @AI-HINT: Portal route for Messages, reusing the premium Messages component under the (portal) layout.
'use client';

// Styles are imported in this route's layout.tsx to comply with Next.js global CSS rules.

import React from 'react';
import Messages from '@/app/messages/Messages';

const PortalMessagesPage = () => {
  return <Messages />;
};

export default PortalMessagesPage;
