import React, { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'motion/react';
import { AlertOctagon, RotateCcw } from 'lucide-react';
import { CustomButton } from './ui/CustomButton';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center p-6 h-full w-full bg-background"
        >
          <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-full mb-6">
            <AlertOctagon className="w-16 h-16 text-red-500" />
          </div>
          <h1 className="text-2xl font-black text-text-primary mb-3 text-center">Oops! Something went wrong</h1>
          <p className="text-text-secondary text-center mb-8 font-medium">
            We encountered an unexpected error. Don't worry, you can try again or go back to home.
          </p>
          <CustomButton 
            onClick={() => {
              this.setState({ hasError: false });
              window.location.href = '/';
            }}
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            Reload App
          </CustomButton>
        </motion.div>
      );
    }

    return this.props.children;
  }
}
