// @AI-HINT: Route page for new message wizard
'use client';

import { useAuth } from '@/hooks/useAuth';
import MessagingWizard from '@/src/components/wizards/MessagingWizard';
import commonStyles from './NewMessage.common.module.css';

export default function NewMessagePage() {
  const { user } = useAuth();

  const userId = user?.id ? String(user.id) : '';
  const userType = (user?.user_type === 'freelancer' ? 'freelancer' : 'client') as 'client' | 'freelancer';

  if (!userId) return null;

  return (
    <div className={commonStyles.pageContainer}>
      <MessagingWizard
        userId={userId}
        userType={userType}
      />
    </div>
  );
}
