"use client";

import * as React from "react";
import { X } from "lucide-react";

interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => onOpenChange?.(false)}
      />
      {/* Dialog Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

interface DialogTriggerProps {
  asChild?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

export function DialogTrigger({ asChild, children, onClick }: DialogTriggerProps) {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<{ onClick?: () => void }>, {
      onClick,
    });
  }
  return <span onClick={onClick}>{children}</span>;
}

interface DialogContentProps {
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export function DialogContent({ children, onClose, className = "" }: DialogContentProps) {
  // Check if className contains max-w to avoid conflict
  const hasMaxWidth = className.includes("max-w-");
  const baseMaxWidth = hasMaxWidth ? "" : "max-w-md";
  
  return (
    <div
      className={`relative glass-card rounded-3xl p-8 ${baseMaxWidth} w-full mx-4 shadow-2xl border border-white/20 overflow-auto ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors z-10"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>
      )}
      {children}
    </div>
  );
}

interface DialogHeaderProps {
  children: React.ReactNode;
}

export function DialogHeader({ children }: DialogHeaderProps) {
  return <div className="mb-6">{children}</div>;
}

interface DialogTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function DialogTitle({ children, className = "" }: DialogTitleProps) {
  return <h2 className={`text-2xl font-bold mb-2 ${className}`}>{children}</h2>;
}

interface DialogDescriptionProps {
  children: React.ReactNode;
}

export function DialogDescription({ children }: DialogDescriptionProps) {
  return <p className="text-muted-foreground">{children}</p>;
}

interface DialogFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function DialogFooter({ children, className = "" }: DialogFooterProps) {
  return (
    <div className={`flex justify-end gap-3 mt-6 pt-4 border-t border-white/10 ${className}`}>
      {children}
    </div>
  );
}
