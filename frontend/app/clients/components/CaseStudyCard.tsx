// @AI-HINT: Case study card component with media and descriptive content.
'use client';
import React from 'react';
import Image from 'next/image';
import styles from '../Clients.common.module.css';

export interface CaseStudyCardProps {
  title: string;
  description: string;
  media: string;
}

const CaseStudyCard: React.FC<CaseStudyCardProps> = ({ title, description, media }) => {
  return (
    <article className={styles.caseCard} aria-labelledby={`case-${title}`}>
      <div className={styles.caseMedia}>
        <Image src={media} alt={title} fill sizes="(max-width: 1100px) 100vw, 33vw" className={styles.caseMediaImg} />
      </div>
      <div className={styles.caseBody}>
        <h3 id={`case-${title}`} className={styles.caseTitle}>{title}</h3>
        <p className={styles.caseDesc}>{description}</p>
      </div>
    </article>
  );
};

export default CaseStudyCard;
