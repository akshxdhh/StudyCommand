import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { CommandPalette } from './components/CommandPalette';
import { Dashboard } from './pages/Dashboard';
import { StudyPlanner } from './pages/StudyPlanner';
import { ExamCountdown } from './pages/ExamCountdown';
import { FocusMode } from './pages/FocusMode';
import { SessionHistory } from './pages/SessionHistory';
import { Settings } from './pages/Settings';
import { Timer } from 'lucide-react';

const AppContent: React.FC = () => {
  const { activeTab, loading } = useApp();

  if (loading) {
    return (
      <div className="h-screen w-screen bg-app-bg text-app-ink flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-app-accent/15 border border-app-accent/40 flex items-center justify-center shadow-panel animate-pulse">
          <Timer className="w-6 h-6 text-app-accent" />
        </div>
        <div className="text-sm font-mono tracking-widest text-app-accent">
          INITIALIZING STUDY COMMAND...
        </div>
      </div>
    );
  }

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'planner':
        return <StudyPlanner />;
      case 'countdown':
        return <ExamCountdown />;
      case 'focus':
        return <FocusMode />;
      case 'history':
        return <SessionHistory />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-app-bg text-app-ink overflow-hidden font-sans select-none">
      {/* Top draggable titlebar */}
      <Header />

      {/* Main layout with sidebar and page content */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-hidden bg-app-bg">
          {renderActivePage()}
        </main>
      </div>

      {/* Global Command Palette (Ctrl+K) */}
      <CommandPalette />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
