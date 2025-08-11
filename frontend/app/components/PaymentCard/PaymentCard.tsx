// @AI-HINT: This is a new data-rich card for displaying individual payment transactions in the client portal.
'use client';

import React from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { MoreHorizontal, FileText, AlertTriangle } from 'lucide-react';
import UserAvatar from '@/app/components/UserAvatar/UserAvatar';
import Badge, { BadgeProps } from '@/app/components/Badge/Badge';
import ActionMenu from '@/app/components/ActionMenu/ActionMenu';
import common from './PaymentCard.common.module.css';
import light from './PaymentCard.light.module.css';
import dark from './PaymentCard.dark.module.css';

export interface PaymentCardProps {
  id: string;
  date: string;
  project: string;
  projectId: string;
  freelancerName: string;
  freelancerAvatarUrl?: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Failed';
}

const statusVariantMap: Record<PaymentCardProps['status'], NonNullable<BadgeProps['variant']>> = {
  'Paid': 'success',
  'Pending': 'warning',
  'Failed': 'danger',
};

const PaymentCard: React.FC<PaymentCardProps> = (props) => {
  const { id, date, project, projectId, freelancerName, freelancerAvatarUrl, amount, status } = props;
  const { theme } = useTheme();
  const themed = theme === 'dark' ? dark : light;

  const menuItems = [
    { label: 'Download Receipt', icon: FileText, onClick: () => console.log('Download receipt for', id) },
    { label: 'Report Issue', icon: AlertTriangle, onClick: () => console.log('Report issue for', id) },
  ];

  return (
    <div className={cn(common.card, themed.theme)}>
      <div className={common.cardHeader}>
        <div className={common.projectInfo}>
          <UserAvatar name={freelancerName} src={freelancerAvatarUrl} size={40} />
          <div>
            <h3 className={common.freelancerName}>{freelancerName}</h3>
            <Link href={`/client/projects/${projectId}`} className={common.projectLink}>
              {project}
            </Link>
          </div>
        </div>
        <ActionMenu items={menuItems} trigger={<MoreHorizontal size={20} />} />
      </div>

      <div className={common.cardBody}>
        <div className={common.amountContainer}>
          <span className={common.amount}>${amount.toLocaleString()}</span>
          <Badge variant={statusVariantMap[status] as BadgeProps['variant']} size="small">{status}</Badge>
        </div>
        <div className={common.date}>{new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
      </div>
    </div>
  );
};

export default PaymentCard;
