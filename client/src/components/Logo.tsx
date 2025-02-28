
import React from 'react';

export const Logo: React.FC = () => {
  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-xl">
        E
      </div>
      <span className="font-bold text-xl tracking-tight">EduNote</span>
    </div>
  );
};
