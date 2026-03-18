import React from 'react';
import { SectionCard } from './SectionCard';
import { Heading } from '../ui/Heading';

interface PageCardProps {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const PageCard: React.FC<PageCardProps> = ({ title, action, children, className = '' }) => (
  <SectionCard className={className}>
    <div className="flex items-center justify-between mb-6">
      <Heading level={2}>{title}</Heading>
      {action && <div>{action}</div>}
    </div>
    {children}
  </SectionCard>
);
