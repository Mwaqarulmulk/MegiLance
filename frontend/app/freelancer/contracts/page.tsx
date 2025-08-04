// @AI-HINT: This page allows freelancers to view their smart contracts for ongoing and completed jobs.
'use client';

import React from 'react';
import { useTheme } from '@/app/contexts/ThemeContext';
import Badge from '@/app/components/Badge/Badge';
import './ContractsPage.common.css';
import './ContractsPage.light.css';
import './ContractsPage.dark.css';

// @AI-HINT: Mock data for contracts.
const mockContracts = [
  {
    id: 'contract_abc123',
    projectTitle: 'Build a Decentralized Exchange',
    clientName: 'DeFi Innovators Inc.',
    value: 5000, // USDC
    status: 'Active',
    contractAddress: '0x123...def',
  },
  {
    id: 'contract_def456',
    projectTitle: 'Create 3D NFT Avatars',
    clientName: 'Metaverse Creations',
    value: 2500,
    status: 'Completed',
    contractAddress: '0x456...abc',
  },
  {
    id: 'contract_ghi789',
    projectTitle: 'Audit a Smart Contract',
    clientName: 'SecureChain Labs',
    value: 1500,
    status: 'Disputed',
    contractAddress: '0x789...ghi',
  },
  {
    id: 'contract_jkl012',
    projectTitle: 'Develop a Web3 Wallet',
    clientName: 'Crypto Wallet Co.',
    value: 7500,
    status: 'Completed',
    contractAddress: '0x012...jkl',
  },
];

const getStatusBadgeVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active': return 'info';
    case 'completed': return 'success';
    case 'disputed': return 'danger';
    default: return 'secondary';
  }
};

const ContractsPage: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className={`ContractsPage-container ContractsPage-container--${theme}`}>
      <header className="ContractsPage-header">
        <h1 className="ContractsPage-title">Your Contracts</h1>
        <p className="ContractsPage-subtitle">View and manage all your smart contracts.</p>
      </header>

      <main className="ContractsPage-main">
        <div className={`ContractsPage-card ContractsPage-card--${theme}`}>
          <div className="ContractsPage-table">
            <div className="ContractsPage-table-header">
              <span>Project</span>
              <span>Client</span>
              <span>Value</span>
              <span>Status</span>
              <span>Actions</span>
            </div>
            <div className="ContractsPage-table-body">
              {mockContracts.map(contract => (
                <div key={contract.id} className="ContractsPage-table-row">
                  <span className="ContractsPage-project-title">{contract.projectTitle}</span>
                  <span>{contract.clientName}</span>
                  <span>{contract.value} USDC</span>
                  <span><Badge theme={theme} variant={getStatusBadgeVariant(contract.status)}>{contract.status}</Badge></span>
                  <a href={`https://etherscan.io/address/${contract.contractAddress}`} target="_blank" rel="noopener noreferrer" className={`ContractsPage-link ContractsPage-link--${theme}`}>View on Etherscan</a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ContractsPage;
