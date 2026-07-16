import React from 'react';
import { Outlet } from 'react-router-dom';
import { TopBar } from './TopBar';
import { AICompanion } from '../ai/AICompanion';

export const AppShell: React.FC = () => {
  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <TopBar />
      <main className="flex-1 w-full max-w-screen-xl mx-auto px-6 py-8">
        <Outlet />
      </main>
      <AICompanion />
    </div>
  );
};
