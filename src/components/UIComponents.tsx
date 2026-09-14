import React from 'react';

// === PANEL ===
export interface PanelProps {
  title: string;
  children: React.ReactNode;
  headerActions?: React.ReactNode;
}

export const Panel: React.FC<PanelProps> = ({ title, children, headerActions }) => {
  return (
    <div className="panel">
      <div className="panel-header">
        <h3 className="panel-title">{title}</h3>
        {headerActions && <div className="panel-actions">{headerActions}</div>}
      </div>
      <div className="panel-body">{children}</div>
    </div>
  );
};

// === METRIC CARD ===
export interface MetricCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  statusColor?: 'accent' | 'success' | 'warning' | 'danger';
}

export const MetricCard: React.FC<MetricCardProps> = ({ label, value, subtext, statusColor = 'accent' }) => {
  const colorMap = {
    accent: 'var(--color-accent)',
    success: 'var(--color-success)',
    warning: 'var(--color-warning)',
    danger: 'var(--color-danger)'
  };

  return (
    <div className="metric-card">
      <span className="text-xs text-secondary">{label}</span>
      <span className="metric-val" style={{ color: colorMap[statusColor] }}>{value}</span>
      {subtext && <span className="text-xs text-muted" style={{ textTransform: 'none' }}>{subtext}</span>}
    </div>
  );
};

// === BUTTON ===
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ variant = 'default', icon, children, className = '', ...props }) => {
  const btnClass = variant === 'primary' ? 'btn btn-primary' : 'btn';
  return (
    <button className={`${btnClass} ${className}`} {...props}>
      {icon && <span className="btn-icon">{icon}</span>}
      {children}
    </button>
  );
};

// === TOOLTIP ===
export interface TooltipProps {
  text: string;
  children: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({ text, children }) => {
  return (
    <div className="tooltip-container">
      {children}
      <div className="tooltip-box">{text}</div>
    </div>
  );
};

// === STATUS INDICATOR ===
export interface StatusIndicatorProps {
  label: string;
  status: 'active' | 'success' | 'idle';
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ label, status }) => {
  return (
    <div className="status-indicator">
      <div className={`status-dot ${status}`} />
      <span>{label}</span>
    </div>
  );
};

// === MODAL ===
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="text-sm font-semibold" style={{ letterSpacing: '0.05em', textTransform: 'uppercase' }}>{title}</span>
          <button onClick={onClose} className="text-secondary" style={{ fontSize: '18px', padding: '4px' }} aria-label="Close modal">×</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
};
