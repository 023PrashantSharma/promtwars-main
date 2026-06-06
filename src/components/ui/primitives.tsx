'use client';

import React from 'react';
import { ChevronRight } from 'lucide-react';

// 1. PageContainer component
interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}
export function PageContainer({ children, className = '' }: PageContainerProps) {
  return (
    <div className={`max-w-[1440px] mx-auto px-4 py-4 flex flex-col gap-2 ${className}`}>
      {children}
    </div>
  );
}

// 2. PageHeader component
interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}
export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 pb-6 border-b border-border">
      <div className="space-y-1">
        <h1 className="text-display text-text">{title}</h1>
        {description && <p className="text-body text-muted">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
    </div>
  );
}

// 3. DashboardCard component
interface DashboardCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}
export function DashboardCard({ children, className = '', onClick, hoverable = false }: DashboardCardProps) {
  const isInteractive = !!onClick || hoverable;
  return (
    <div
      onClick={onClick}
      className={`bg-surface border border-border rounded-lg p-5 transition-all duration-150 ${
        isInteractive ? 'cursor-pointer hover:border-border-hover hover:bg-card-hover' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}

// 4. StatCard component
interface StatCardProps {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  trend?: string;
  icon?: React.ReactNode;
}
export function StatCard({ label, value, sub, trend, icon }: StatCardProps) {
  return (
    <DashboardCard>
      <div className="flex items-center justify-between mb-2">
        <span className="text-caption font-medium text-muted uppercase tracking-wider">{label}</span>
        {icon && <div className="text-muted shrink-0">{icon}</div>}
      </div>
      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-heading font-semibold text-text">{value}</span>
        {trend && (
          <span className="text-caption font-medium text-primary">
            {trend}
          </span>
        )}
      </div>
      {sub && <div className="text-caption text-muted">{sub}</div>}
    </DashboardCard>
  );
}

// 5. EmptyState component
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}
export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-6 bg-surface border border-border rounded-lg max-h-[240px] py-12">
      {icon && <div className="text-muted opacity-60 mb-2 shrink-0">{icon}</div>}
      <h3 className="text-title text-text mb-1">{title}</h3>
      <p className="text-body text-muted mb-4 max-w-sm">{description}</p>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

// 6. SectionHeader component
interface SectionHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}
export function SectionHeader({ title, description, actions }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
      <div>
        <h2 className="text-title font-medium text-text">{title}</h2>
        {description && <p className="text-caption text-muted">{description}</p>}
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </div>
  );
}

// 7. DataList component
interface DataListProps {
  children: React.ReactNode;
  className?: string;
}
export function DataList({ children, className = '' }: DataListProps) {
  return <div className={`divide-y divide-border border-y border-border ${className}`}>{children}</div>;
}

// 8. CommandAction component
interface CommandActionProps {
  label: string;
  description?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  href?: string;
}
export function CommandAction({ label, description, icon, onClick, href }: CommandActionProps) {
  const content = (
    <div className="flex items-center justify-between w-full h-[40px] px-3 transition-colors duration-150 hover:bg-card-hover cursor-pointer group text-left">
      <div className="flex items-center gap-3 min-w-0">
        {icon && <div className="text-muted shrink-0 w-4 h-4 flex items-center justify-center">{icon}</div>}
        <span className="text-body font-medium text-text truncate">{label}</span>
        {description && <span className="text-caption text-muted truncate hidden sm:inline">— {description}</span>}
      </div>
      <ChevronRight className="w-4 h-4 text-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
    </div>
  );

  if (href) {
    return (
      <a href={href} className="block no-underline">
        {content}
      </a>
    );
  }

  return (
    <button onClick={onClick} className="w-full block bg-transparent border-none p-0 cursor-pointer">
      {content}
    </button>
  );
}

// 9. SidebarSection component
interface SidebarSectionProps {
  title: string;
  children: React.ReactNode;
}
export function SidebarSection({ title, children }: SidebarSectionProps) {
  return (
    <div className="py-2">
      <span className="text-[10px] font-semibold text-muted tracking-wider uppercase px-3 mb-1.5 block">
        {title}
      </span>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}
