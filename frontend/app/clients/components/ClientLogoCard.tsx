// @AI-HINT: Reusable client logo card with hover effect and accessible labeling.
'use client';
import React from 'react';
import Image from 'next/image';
import styles from '../Clients.common.module.css';

export interface ClientLogoCardProps {
  name: string;
  src: string;
  industry: string;
}

const ClientLogoCard: React.FC<ClientLogoCardProps> = ({ name, src, industry }) => {
  return (
    <figure className={styles.logoCard} aria-labelledby={`logo-${name}`} data-industry={industry}>
      <Image src={src} alt={name} width={140} height={100} className={styles.logo} />
      <figcaption id={`logo-${name}`} className={styles.srOnly}>{name} – {industry}</figcaption>
    </figure>
  );
};

export default ClientLogoCard;
