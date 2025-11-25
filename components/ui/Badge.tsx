import React from 'react';
import { ConsultationStatus } from '../../types';

interface BadgeProps {
  status?: string;
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, children, className = '' }) => {
  let variantStyles = "bg-neutral-100 text-neutral-500";

  if (status) {
    switch (status.toLowerCase()) {
      case 'paid':
      case 'success':
        variantStyles = "bg-success/10 text-success border border-success/20";
        break;
      case 'pending':
      case 'warning':
        variantStyles = "bg-yellow-50 text-yellow-600 border border-yellow-200";
        break;
      case 'cancelled':
      case 'error':
        variantStyles = "bg-danger/10 text-danger border border-danger/20";
        break;
      case 'primary':
        variantStyles = "bg-primary/10 text-primary border border-primary/20";
        break;
    }
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantStyles} ${className}`}>
      {children}
    </span>
  );
};