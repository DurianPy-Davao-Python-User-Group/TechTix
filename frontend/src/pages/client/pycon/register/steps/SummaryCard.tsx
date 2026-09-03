import { FC, ReactNode } from 'react';
import { cn } from '@/utils/classes';

interface SummaryCardProps {
  title: string;
  children?: ReactNode;
  className?: string;
}

export const SummaryCard: FC<SummaryCardProps> = ({ title, children, className }) => {
  return (
    <div className={cn('flex flex-col gap-5 w-full', className)}>
      <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-neutral-400 px-1 text-left">{title}</p>
      {/* <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#04B1A4]! px-1 text-left">
        {title}
      </p> */}
      <div className="rounded-2xl bg-[#fffef8] shadow-xs overflow-hidden border border-[#faedd6]/60">{children}</div>
    </div>
  );
};

interface SummaryRowProps {
  label: string;
  value: ReactNode;
  isAlt?: boolean;
  className?: string;
}

export const SummaryRow: FC<SummaryRowProps> = ({ label, value, isAlt = false, className }) => {
  return (
    <div
      className={cn(
        'grid grid-cols-[150px_1fr] sm:grid-cols-[180px_1fr] md:grid-cols-[200px_1fr] items-center px-5 py-2.5 sm:px-6 sm:py-3 text-left transition-colors',
        isAlt ? 'bg-[#FFFFFF4D]' : 'bg-[#FFF9F299]',
        className
      )}
    >
      <span className="text-[11px] sm:text-xs font-bold tracking-wider text-[#F99508] uppercase select-none mr-5">{label}</span>
      <span className="text-xs sm:text-sm font-medium text-[#1e293b] break-words text-left">{value}</span>
    </div>
  );
};
