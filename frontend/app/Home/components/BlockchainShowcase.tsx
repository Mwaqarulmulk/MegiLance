// @AI-HINT: Blockchain and crypto payment features showcase section

'use client';

import React, { useRef } from 'react';
import useAnimatedCounter from '@/hooks/useAnimatedCounter';
import { FaBitcoin, FaShieldAlt, FaLock, FaGlobe, FaExchangeAlt, FaChartLine } from 'react-icons/fa';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

import commonStyles from './BlockchainShowcase.common.module.css';
import lightStyles from './BlockchainShowcase.light.module.css';
import darkStyles from './BlockchainShowcase.dark.module.css';

const blockchainFeatures = [
  {
    icon: FaBitcoin,
    title: "USDC Payments",
    description: "Get paid instantly in stable cryptocurrency. No more waiting for bank transfers or dealing with currency conversion fees.",
    benefit: "Instant Settlement"
  },
  {
    icon: FaLock,
    title: "Smart Contract Escrow",
    description: "Automated escrow system ensures payments are released only when project milestones are completed and verified.",
    benefit: "100% Secure"
  },
  {
    icon: FaShieldAlt,
    title: "Blockchain Security",
    description: "All transactions are recorded on the blockchain, providing immutable proof of payments and project completion.",
    benefit: "Tamper-Proof"
  },
  {
    icon: FaGlobe,
    title: "Global Accessibility",
    description: "Work with clients worldwide without banking restrictions. Perfect for Pakistani freelancers accessing global markets.",
    benefit: "No Borders"
  },
  {
    icon: FaExchangeAlt,
    title: "Low Transaction Fees",
    description: "Blockchain technology eliminates intermediaries, reducing transaction costs to less than 1% compared to traditional platforms.",
    benefit: "Save 90% on Fees"
  },
  {
    icon: FaChartLine,
    title: "Transparent Reputation",
    description: "Your reputation and work history are permanently stored on-chain, building an immutable professional profile.",
    benefit: "Verifiable History"
  }
];

const AnimatedStat: React.FC<{ rawValue: string; duration?: number }> = ({ rawValue, duration = 2000 }) => {
  const ref = useRef<HTMLDivElement>(null);
  const match = rawValue.match(/([<$>]*)?\s*([\d.]+)\s*([M+%s]*)?/);
  const prefix = match?.[1] || '';
  const target = match ? parseFloat(match[2]) : 0;
  const suffix = match?.[3] || '';
  const decimals = (match?.[2].split('.')[1] || '').length;

  const count = useAnimatedCounter(target, duration, decimals, ref);

  return (
    <div ref={ref} className={commonStyles.statNumber}>
      {prefix}{count}{suffix}
    </div>
  );
};

const BlockchainShowcase: React.FC = () => {
  const { theme } = useTheme();
  const themeStyles = theme === 'dark' ? darkStyles : lightStyles;

  return (
    <section className={cn(commonStyles.blockchainShowcase, themeStyles.blockchainShowcase)}>
      <div className={commonStyles.container}>
        <div className={commonStyles.header}>
          <div className={commonStyles.badge}>
            <FaBitcoin className={commonStyles.badgeIcon} />
            <span>Blockchain-Powered Platform</span>
          </div>
          <h2 className={commonStyles.title}>
            The Future of <span className={commonStyles.titleHighlight}>Secure Payments</span>
          </h2>
          <p className={commonStyles.subtitle}>
            Experience the power of blockchain technology with instant USDC payments, smart contract escrow, 
            and transparent reputation systems. Built for the modern freelancer who demands security and speed.
          </p>
        </div>

        <div className={commonStyles.content}>
          <div className={commonStyles.visual}>
            <div className={commonStyles.blockchain}>
              <div className={cn(commonStyles.block, commonStyles['block--genesis'])}>
                <div className={commonStyles.blockHeader}>Genesis</div>
                <div className={commonStyles.blockContent}>Platform Launch</div>
              </div>
              <div className={commonStyles.connector}></div>
              <div className={cn(commonStyles.block, commonStyles['block--transaction'])}>
                <div className={commonStyles.blockHeader}>Block #1</div>
                <div className={commonStyles.blockContent}>Project Created</div>
              </div>
              <div className={commonStyles.connector}></div>
              <div className={cn(commonStyles.block, commonStyles['block--escrow'])}>
                <div className={commonStyles.blockHeader}>Block #2</div>
                <div className={commonStyles.blockContent}>Funds Escrowed</div>
              </div>
              <div className={commonStyles.connector}></div>
              <div className={cn(commonStyles.block, commonStyles['block--completion'])}>
                <div className={commonStyles.blockHeader}>Block #3</div>
                <div className={commonStyles.blockContent}>Payment Released</div>
              </div>
            </div>
          </div>

          <div className={commonStyles.features}>
            {blockchainFeatures.map((feature, index) => (
              <div key={feature.title} className={commonStyles.feature} style={{ transitionDelay: `${index * 0.1}s` }}>
                <div className={commonStyles.featureIcon} aria-hidden="true">
                  <feature.icon />
                </div>
                <div className={commonStyles.featureContent}>
                  <h3 className={commonStyles.featureTitle}>{feature.title}</h3>
                  <p className={commonStyles.featureDescription}>{feature.description}</p>
                  <div className={commonStyles.featureBenefit}>{feature.benefit}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={commonStyles.stats}>
          <div className={commonStyles.stat}>
            <AnimatedStat rawValue="$2.5M+" />
            <div className={commonStyles.statLabel}>Processed in USDC</div>
          </div>
          <div className={commonStyles.stat}>
            <AnimatedStat rawValue="99.99%" />
            <div className={commonStyles.statLabel}>Transaction Success Rate</div>
          </div>
          <div className={commonStyles.stat}>
            <AnimatedStat rawValue="<30s" />
            <div className={commonStyles.statLabel}>Average Settlement Time</div>
          </div>
          <div className={commonStyles.stat}>
            <AnimatedStat rawValue="0.5%" />
            <div className={commonStyles.statLabel}>Transaction Fee</div>
          </div>
        </div>

        <div className={commonStyles.supportedChains}>
          <h3 className={commonStyles.chainsTitle}>Supported Blockchain Networks</h3>
          <div className={commonStyles.chains}>
            <div className={commonStyles.chain}>Ethereum</div>
            <div className={commonStyles.chain}>Polygon</div>
            <div className={commonStyles.chain}>Arbitrum</div>
            <div className={commonStyles.chain}>Optimism</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BlockchainShowcase;