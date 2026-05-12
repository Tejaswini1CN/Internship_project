import React from 'react';

export function MobileFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 sm:p-8 font-sans text-secondary">
      {/* Mobile Device Container */}
      <div className="w-full max-w-[400px] h-full sm:h-[800px] bg-background rounded-none sm:rounded-[40px] shadow-2xl overflow-hidden relative flex flex-col border-[8px] border-gray-900 border-opacity-10 sm:border-opacity-100 sm:border-gray-800">
        
        {/* Notch simulation (Only on larger screens where border is visible) */}
        <div className="hidden sm:block absolute top-0 inset-x-0 h-6 w-40 mx-auto bg-gray-800 rounded-b-3xl z-[100]"></div>

        {/* Content area */}
        <div className="flex-1 overflow-hidden relative">
           {children}
        </div>

      </div>
    </div>
  );
}
