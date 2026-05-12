import React, { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: ReactNode;
  className?: string;
  placeholder?: string;
  required?: boolean;
  type?: string;
  autoFocus?: boolean;
  value?: string | number | readonly string[];
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
}

export function InputField({ label, icon, className, ...props }: InputFieldProps) {
  return (
    <div className="space-y-1.5 w-full">
      <label className="text-sm font-bold text-text-primary ml-1">{label}</label>
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
            {icon}
          </div>
        )}
        <input
          className={cn(
            "w-full bg-surface border border-border rounded-2xl px-5 py-4 font-medium text-text-primary",
            "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all",
            "dark:bg-surface dark:border-border dark:focus:ring-primary/40 text-base",
            icon && "pl-12",
            className
          )}
          {...props}
        />
      </div>
    </div>
  );
}
