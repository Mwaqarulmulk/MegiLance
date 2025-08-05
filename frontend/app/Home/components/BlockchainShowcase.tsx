// @AI-HINT: Blockchain and crypto payment features showcase section

'use client';

import React from 'react';
import { FaBitcoin, FaShieldAlt, FaLock, FaGlobe, FaExchangeAlt, FaChartLine } from 'react-icons/fa';
import './BlockchainShowcase.common.css';
import './BlockchainShowcase.light.css';
import './BlockchainShowcase.dark.css';

interface BlockchainShowcaseProps { theme?: "light" | "dark"; }
const BlockchainShowcase: React.FC<BlockchainShowcaseProps> = ({ theme = "light" }) => {
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

  return (
    <section className={`BlockchainShowcase theme-${theme}`}>
      <div className="BlockchainShowcase-container">
        <div className="BlockchainShowcase-header">
          <div className="BlockchainShowcase-badge">
            <FaBitcoin className="BlockchainShowcase-badge-icon" />
            <span>Blockchain-Powered Platform</span>
          </div>
          <h2 className="BlockchainShowcase-title">
            The Future of <span className="BlockchainShowcase-title-highlight">Secure Payments</span>
          </h2>
          <p className="BlockchainShowcase-subtitle">
            Experience the power of blockchain technology with instant USDC payments, smart contract escrow, 
            and transparent reputation systems. Built for the modern freelancer who demands security and speed.
          </p>
        </div>

        <div className="BlockchainShowcase-content">
          <div className="BlockchainShowcase-visual">
            <div className="BlockchainShowcase-blockchain">
              <div className="BlockchainShowcase-block BlockchainShowcase-block--genesis">
                <div className="BlockchainShowcase-block-header">Genesis</div>
                <div className="BlockchainShowcase-block-content">Platform Launch</div>
              </div>
              <div className="BlockchainShowcase-connector"></div>
              <div className="BlockchainShowcase-block BlockchainShowcase-block--transaction">
                <div className="BlockchainShowcase-block-header">Block #1</div>
                <div className="BlockchainShowcase-block-content">Project Created</div>
              </div>
              <div className="BlockchainShowcase-connector"></div>
              <div className="BlockchainShowcase-block BlockchainShowcase-block--escrow">
                <div className="BlockchainShowcase-block-header">Block #2</div>
                <div className="BlockchainShowcase-block-content">Funds Escrowed</div>
              </div>
              <div className="BlockchainShowcase-connector"></div>
              <div className="BlockchainShowcase-block BlockchainShowcase-block--completion">
                <div className="BlockchainShowcase-block-header">Block #3</div>
                <div className="BlockchainShowcase-block-content">Payment Released</div>
              </div>
            </div>
          </div>

          <div className="BlockchainShowcase-features">
            {blockchainFeatures.map((feature, index) => (
              <div key={index} className="BlockchainShowcase-feature">
                <div className="BlockchainShowcase-feature-icon">
                  <feature.icon />
                </div>
                <div className="BlockchainShowcase-feature-content">
                  <h3 className="BlockchainShowcase-feature-title">{feature.title}</h3>
                  <p className="BlockchainShowcase-feature-description">{feature.description}</p>
                  <div className="BlockchainShowcase-feature-benefit">{feature.benefit}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="BlockchainShowcase-stats">
          <div className="BlockchainShowcase-stat">
            <div className="BlockchainShowcase-stat-number">$2.5M+</div>
            <div className="BlockchainShowcase-stat-label">Processed in USDC</div>
          </div>
          <div className="BlockchainShowcase-stat">
            <div className="BlockchainShowcase-stat-number">99.99%</div>
            <div className="BlockchainShowcase-stat-label">Transaction Success Rate</div>
          </div>
          <div className="BlockchainShowcase-stat">
            <div className="BlockchainShowcase-stat-number">{"< 30s"}</div>
            <div className="BlockchainShowcase-stat-label">Average Settlement Time</div>
          </div>
          <div className="BlockchainShowcase-stat">
            <div className="BlockchainShowcase-stat-number">0.5%</div>
            <div className="BlockchainShowcase-stat-label">Transaction Fee</div>
          </div>
        </div>

        <div className="BlockchainShowcase-supported-chains">
          <h3 className="BlockchainShowcase-chains-title">Supported Blockchain Networks</h3>
          <div className="BlockchainShowcase-chains">
            <div className="BlockchainShowcase-chain">Ethereum</div>
            <div className="BlockchainShowcase-chain">Polygon</div>
            <div className="BlockchainShowcase-chain">Arbitrum</div>
            <div className="BlockchainShowcase-chain">Optimism</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BlockchainShowcase;
