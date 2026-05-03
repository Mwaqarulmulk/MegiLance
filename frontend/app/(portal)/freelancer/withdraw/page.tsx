// @AI-HINT: Freelancer withdrawal page - route for withdrawing funds from MegiLance wallet
'use client';

import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import PaymentWizard from '@/src/components/wizards/PaymentWizard';
import { useFreelancerData } from '@/hooks/useFreelancer';
import { useAuth } from '@/hooks/useAuth';
import { PageTransition } from '@/app/components/Animations';

import common from './Withdraw.common.module.css';
import light from './Withdraw.light.module.css';
import dark from './Withdraw.dark.module.css';

export default function WithdrawPage() {
  const { resolvedTheme } = useTheme();
  const themed = resolvedTheme === 'dark' ? dark : light;
  const { analytics, loading } = useFreelancerData();
  const { user } = useAuth();
  
  // Parse balance from analytics
  const availableBalance = parseFloat(
    analytics?.walletBalance?.replace(/[$,]/g, '') || '0'
  );

  const userId = user?.id ? String(user.id) : '';

  if (!resolvedTheme || !userId) return null;

  return (
    <PageTransition>
      <div className={cn(common.container, themed.container)}>
        <PaymentWizard 
          flowType="withdrawal"
          availableBalance={availableBalance}
          userId={userId}
        />
      </div>
    </PageTransition>
  );
}
