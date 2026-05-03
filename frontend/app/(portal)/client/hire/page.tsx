// @AI-HINT: Portal route for Client Hire flow under the (portal) layout.
'use client';

import React, { Suspense } from 'react';
import Hire from './Hire';

const HirePage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Hire />
    </Suspense>
  );
};

export default HirePage;
